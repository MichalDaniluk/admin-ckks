import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tenant, SubscriptionStatus } from './entities/tenant.entity';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';

@Injectable()
export class TenantService {
  constructor(
    @InjectRepository(Tenant)
    private readonly tenantRepository: Repository<Tenant>,
  ) {}

  /**
   * Create a new tenant
   */
  async create(createTenantDto: CreateTenantDto): Promise<Tenant> {
    // Check if slug already exists
    const existingTenant = await this.tenantRepository.findOne({
      where: { slug: createTenantDto.slug },
    });

    if (existingTenant) {
      throw new ConflictException(
        `Tenant with slug '${createTenantDto.slug}' already exists`,
      );
    }

    // Set trial period (14 days from now)
    const trialEndsAt = new Date();
    trialEndsAt.setDate(trialEndsAt.getDate() + 14);

    // Create tenant
    const tenant = this.tenantRepository.create({
      ...createTenantDto,
      subscriptionStatus: SubscriptionStatus.TRIAL,
      trialEndsAt,
    });

    const savedTenant = await this.tenantRepository.save(tenant);

    // TODO: Emit TenantCreatedEvent for other modules to handle
    // - Create default roles & permissions
    // - Create initial admin user
    // - Send welcome email

    return savedTenant;
  }

  /**
   * Find all tenants with pagination and filters
   */
  async findAll(page = 1, limit = 20, filters?: any): Promise<{ data: Tenant[]; total: number }> {
    const query = this.tenantRepository.createQueryBuilder('tenant');

    // Apply filters
    if (filters?.subscriptionStatus) {
      query.andWhere('tenant.subscription_status = :status', {
        status: filters.subscriptionStatus,
      });
    }

    if (filters?.subscriptionPlan) {
      query.andWhere('tenant.subscription_plan = :plan', { plan: filters.subscriptionPlan });
    }

    if (filters?.isActive !== undefined) {
      query.andWhere('tenant.is_active = :isActive', { isActive: filters.isActive });
    }

    if (filters?.search) {
      query.andWhere(
        '(tenant.company_name ILIKE :search OR tenant.slug ILIKE :search)',
        { search: `%${filters.search}%` },
      );
    }

    // Pagination
    query.skip((page - 1) * limit).take(limit);

    // Sorting
    query.orderBy('tenant.created_at', 'DESC');

    const [data, total] = await query.getManyAndCount();

    return { data, total };
  }

  /**
   * Find one tenant by ID
   */
  async findOne(id: string): Promise<Tenant> {
    const tenant = await this.tenantRepository.findOne({ where: { id } });

    if (!tenant) {
      throw new NotFoundException(`Tenant with ID ${id} not found`);
    }

    return tenant;
  }

  /**
   * Find tenant by slug
   */
  async findBySlug(slug: string): Promise<Tenant | null> {
    return this.tenantRepository.findOne({ where: { slug } });
  }

  /**
   * Update tenant
   */
  async update(id: string, updateTenantDto: UpdateTenantDto): Promise<Tenant> {
    const tenant = await this.findOne(id);

    // If slug is being updated, check for conflicts
    if (updateTenantDto.slug && updateTenantDto.slug !== tenant.slug) {
      const existingTenant = await this.tenantRepository.findOne({
        where: { slug: updateTenantDto.slug },
      });

      if (existingTenant) {
        throw new ConflictException(
          `Tenant with slug '${updateTenantDto.slug}' already exists`,
        );
      }
    }

    Object.assign(tenant, updateTenantDto);

    return this.tenantRepository.save(tenant);
  }

  /**
   * Soft delete tenant
   */
  async remove(id: string): Promise<void> {
    const tenant = await this.findOne(id);
    await this.tenantRepository.softRemove(tenant);
  }

  /**
   * Activate tenant subscription
   */
  async activateSubscription(id: string): Promise<Tenant> {
    const tenant = await this.findOne(id);

    tenant.subscriptionStatus = SubscriptionStatus.ACTIVE;
    tenant.subscriptionStartedAt = new Date();

    // Set subscription end date (1 year from now)
    const subscriptionEndsAt = new Date();
    subscriptionEndsAt.setFullYear(subscriptionEndsAt.getFullYear() + 1);
    tenant.subscriptionEndsAt = subscriptionEndsAt;

    return this.tenantRepository.save(tenant);
  }

  /**
   * Suspend tenant
   */
  async suspendTenant(id: string): Promise<Tenant> {
    const tenant = await this.findOne(id);
    tenant.subscriptionStatus = SubscriptionStatus.SUSPENDED;
    tenant.isActive = false;

    return this.tenantRepository.save(tenant);
  }

  /**
   * Check if tenant is within usage limits
   */
  async checkUsageLimits(
    tenantId: string,
    type: 'users' | 'courses' | 'students',
  ): Promise<{ withinLimits: boolean; current: number; max: number }> {
    const tenant = await this.findOne(tenantId);

    // TODO: Query actual counts from database
    // For now, return placeholder data
    const current = 0; // TODO: Count actual usage

    let max: number;
    switch (type) {
      case 'users':
        max = tenant.maxUsers;
        break;
      case 'courses':
        max = tenant.maxCourses;
        break;
      case 'students':
        max = tenant.maxStudents;
        break;
    }

    return {
      withinLimits: current < max,
      current,
      max,
    };
  }
}
