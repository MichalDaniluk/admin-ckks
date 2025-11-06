import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, In } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';
import { Role } from './entities/role.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { QueryUsersDto } from './dto/query-users.dto';
import { AssignRolesDto } from './dto/assign-roles.dto';
import { UserResponseDto, PaginatedUsersResponseDto } from './dto/user-response.dto';
import { TenantContextService } from '@/common/tenant/tenant-context.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
    private tenantContext: TenantContextService,
  ) {}

  /**
   * Create a new user within the current tenant
   */
  async create(createUserDto: CreateUserDto): Promise<UserResponseDto> {
    const tenantId = this.tenantContext.getTenantId();

    if (!tenantId) {
      throw new BadRequestException('Tenant context not found');
    }

    // Check if email already exists in tenant
    const existingUser = await this.userRepository.findOne({
      where: { email: createUserDto.email, tenantId },
    });

    if (existingUser) {
      throw new ConflictException('Email already exists in this organization');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(createUserDto.password, 12);

    // Create user entity
    const user = this.userRepository.create({
      ...createUserDto,
      passwordHash,
      tenantId,
      isActive: createUserDto.isActive ?? true,
      isVerified: createUserDto.isVerified ?? false,
    });

    // Assign roles if provided
    if (createUserDto.roleIds && createUserDto.roleIds.length > 0) {
      const roles = await this.roleRepository.find({
        where: {
          id: In(createUserDto.roleIds),
          tenantId, // Ensure roles belong to same tenant
        },
      });

      if (roles.length !== createUserDto.roleIds.length) {
        throw new BadRequestException('One or more role IDs are invalid');
      }

      user.roles = roles;
    }

    const savedUser = await this.userRepository.save(user);

    // Load full user with relations
    return this.findOne(savedUser.id);
  }

  /**
   * Get all available roles for the current tenant
   */
  async getAllRoles(): Promise<Role[]> {
    const tenantId = this.tenantContext.getTenantId();

    if (!tenantId) {
      throw new BadRequestException('Tenant context not found');
    }

    return this.roleRepository.find({
      where: { tenantId, isActive: true },
      order: { name: 'ASC' },
    });
  }

  /**
   * Find all users with pagination and filtering
   * Automatically filtered by current tenant (unless SUPER_ADMIN)
   */
  async findAll(query: QueryUsersDto): Promise<PaginatedUsersResponseDto> {
    const isSuperAdmin = this.tenantContext.hasRole('SUPER_ADMIN');
    const contextTenantId = this.tenantContext.getTenantId();
    const userRoles = this.tenantContext.getUserRoles();

    // DEBUG LOGGING
    console.log('=== USERS FINDALL DEBUG ===');
    console.log('isSuperAdmin:', isSuperAdmin);
    console.log('contextTenantId:', contextTenantId);
    console.log('userRoles:', userRoles);
    console.log('query.tenantId:', query.tenantId);

    // For non-super admins, require tenant context
    if (!isSuperAdmin && !contextTenantId) {
      throw new BadRequestException('Tenant context not found');
    }

    const { page = 1, limit = 10, search, isActive, isVerified, roleCode, sortBy, sortOrder, tenantId } = query;

    const queryBuilder = this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.roles', 'role')
      .leftJoinAndSelect('user.tenant', 'tenant')
      .where('user.deletedAt IS NULL');

    // Apply tenant filter
    if (isSuperAdmin) {
      console.log('DEBUG: Super admin path - applying conditional tenant filter');
      // Super admin can see all users or filter by specific tenant
      if (tenantId) {
        console.log('DEBUG: Filtering by specific tenant:', tenantId);
        queryBuilder.andWhere('user.tenantId = :tenantId', { tenantId });
      } else {
        console.log('DEBUG: No tenant filter - should see ALL users');
      }
      // If no tenantId specified, show all users (no additional filter)
    } else {
      console.log('DEBUG: Regular user path - filtering by tenant:', contextTenantId);
      // Regular users only see their own tenant's users
      queryBuilder.andWhere('user.tenantId = :tenantId', { tenantId: contextTenantId });
    }

    // Apply search filter
    if (search) {
      queryBuilder.andWhere(
        '(user.email LIKE :search OR user.firstName LIKE :search OR user.lastName LIKE :search)',
        { search: `%${search}%` },
      );
    }

    // Apply status filters
    if (isActive !== undefined) {
      queryBuilder.andWhere('user.isActive = :isActive', { isActive });
    }

    if (isVerified !== undefined) {
      queryBuilder.andWhere('user.isVerified = :isVerified', { isVerified });
    }

    // Apply role filter
    if (roleCode) {
      queryBuilder.andWhere('role.code = :roleCode', { roleCode });
    }

    // Apply sorting
    const sortField = `user.${sortBy}`;
    queryBuilder.orderBy(sortField, sortOrder);

    // Apply pagination
    const skip = (page - 1) * limit;
    queryBuilder.skip(skip).take(limit);

    // Execute query
    const [users, total] = await queryBuilder.getManyAndCount();

    // Transform to response DTOs
    const data = users.map(user => this.transformToResponseDto(user));

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Find one user by ID
   * Automatically filtered by current tenant
   */
  async findOne(id: string): Promise<UserResponseDto> {
    const tenantId = this.tenantContext.getTenantId();

    const user = await this.userRepository.findOne({
      where: { id, tenantId },
      relations: ['roles'],
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return this.transformToResponseDto(user);
  }

  /**
   * Update user
   * Automatically filtered by current tenant
   */
  async update(id: string, updateUserDto: UpdateUserDto): Promise<UserResponseDto> {
    const tenantId = this.tenantContext.getTenantId();

    const user = await this.userRepository.findOne({
      where: { id, tenantId },
      relations: ['roles'],
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    // Check email uniqueness if changed
    if (updateUserDto.email && updateUserDto.email !== user.email) {
      const existingUser = await this.userRepository.findOne({
        where: { email: updateUserDto.email, tenantId },
      });

      if (existingUser) {
        throw new ConflictException('Email already exists in this organization');
      }
    }

    // Update user fields
    Object.assign(user, updateUserDto);

    await this.userRepository.save(user);

    return this.findOne(id);
  }

  /**
   * Soft delete user
   * Automatically filtered by current tenant
   */
  async remove(id: string): Promise<void> {
    const tenantId = this.tenantContext.getTenantId();

    const user = await this.userRepository.findOne({
      where: { id, tenantId },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    await this.userRepository.softDelete(id);
  }

  /**
   * Assign roles to user
   * Automatically filtered by current tenant
   */
  async assignRoles(id: string, assignRolesDto: AssignRolesDto): Promise<UserResponseDto> {
    const tenantId = this.tenantContext.getTenantId();

    const user = await this.userRepository.findOne({
      where: { id, tenantId },
      relations: ['roles'],
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    // Find roles - must belong to same tenant
    const roles = await this.roleRepository.find({
      where: {
        id: In(assignRolesDto.roleIds),
        tenantId,
      },
    });

    if (roles.length !== assignRolesDto.roleIds.length) {
      throw new BadRequestException('One or more role IDs are invalid or do not belong to this tenant');
    }

    user.roles = roles;
    await this.userRepository.save(user);

    return this.findOne(id);
  }

  /**
   * Remove specific role from user
   */
  async removeRole(id: string, roleId: string): Promise<UserResponseDto> {
    const tenantId = this.tenantContext.getTenantId();

    const user = await this.userRepository.findOne({
      where: { id, tenantId },
      relations: ['roles'],
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    // Filter out the role
    user.roles = user.roles.filter(role => role.id !== roleId);

    if (user.roles.length === 0) {
      throw new BadRequestException('User must have at least one role');
    }

    await this.userRepository.save(user);

    return this.findOne(id);
  }

  /**
   * Activate user account
   */
  async activate(id: string): Promise<UserResponseDto> {
    return this.update(id, { isActive: true });
  }

  /**
   * Deactivate user account
   */
  async deactivate(id: string): Promise<UserResponseDto> {
    return this.update(id, { isActive: false });
  }

  /**
   * Transform User entity to UserResponseDto
   */
  private transformToResponseDto(user: User): UserResponseDto {
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
      isActive: user.isActive,
      isVerified: user.isVerified,
      tenantId: user.tenantId,
      tenant: user.tenant ? {
        id: user.tenant.id,
        slug: user.tenant.slug,
        companyName: user.tenant.companyName,
      } : undefined,
      roles: user.roles?.map(role => ({
        id: role.id,
        code: role.code,
        name: role.name,
      })) || [],
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      lastLoginAt: user.lastLoginAt,
    };
  }
}
