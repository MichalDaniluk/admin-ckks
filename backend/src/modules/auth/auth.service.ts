import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '@/modules/users/entities/user.entity';
import { UserSession } from '@/modules/users/entities/user-session.entity';
import { Tenant, SubscriptionStatus } from '@/modules/tenant/entities/tenant.entity';
import { Role } from '@/modules/users/entities/role.entity';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtPayload, JwtRefreshPayload } from './interfaces/jwt-payload.interface';
import { AuthResponse } from './interfaces/auth-response.interface';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(UserSession)
    private sessionRepository: Repository<UserSession>,
    @InjectRepository(Tenant)
    private tenantRepository: Repository<Tenant>,
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
    private jwtService: JwtService,
    private configService: ConfigService,
    private dataSource: DataSource,
  ) {}

  /**
   * Validate user credentials (used by LocalStrategy)
   */
  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.userRepository.findOne({
      where: { email },
      relations: ['tenant', 'roles', 'roles.permissions'],
    });

    if (!user) {
      return null;
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      return null;
    }

    return user;
  }

  /**
   * Login user and return tokens
   */
  async login(loginDto: LoginDto, ipAddress?: string, userAgent?: string): Promise<AuthResponse> {
    const user = await this.validateUser(loginDto.email, loginDto.password);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('User account is inactive');
    }

    if (!user.tenant.isActive) {
      throw new UnauthorizedException('Organization account is suspended');
    }

    // Update last login
    user.lastLoginAt = new Date();
    await this.userRepository.save(user);

    // Generate tokens
    return this.generateAuthResponse(user, ipAddress, userAgent);
  }

  /**
   * Register new tenant with admin user (Self-service onboarding)
   */
  async register(registerDto: RegisterDto): Promise<AuthResponse> {
    // Start transaction
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 1. Check if tenant slug already exists
      const existingTenant = await queryRunner.manager.findOne(Tenant, {
        where: { slug: registerDto.slug },
      });

      if (existingTenant) {
        throw new ConflictException(`Organization with slug '${registerDto.slug}' already exists`);
      }

      // 2. Check if email already exists (across all tenants)
      const existingUser = await queryRunner.manager.findOne(User, {
        where: { email: registerDto.email },
      });

      if (existingUser) {
        throw new ConflictException('Email already registered');
      }

      // 3. Create tenant
      const tenant = queryRunner.manager.create(Tenant, {
        slug: registerDto.slug,
        companyName: registerDto.companyName,
        contactEmail: registerDto.email,
        contactPhone: registerDto.phone,
        subscriptionStatus: SubscriptionStatus.TRIAL,
        trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days
      });

      const savedTenant = await queryRunner.manager.save(tenant);

      // 4. Create TENANT_ADMIN role for this tenant (if doesn't exist)
      let adminRole = await queryRunner.manager.findOne(Role, {
        where: { code: 'TENANT_ADMIN', tenantId: savedTenant.id },
      });

      if (!adminRole) {
        adminRole = queryRunner.manager.create(Role, {
          tenantId: savedTenant.id,
          name: 'Tenant Administrator',
          code: 'TENANT_ADMIN',
          description: 'Full access to tenant resources',
          isSystemRole: false,
          isActive: true,
        });
        adminRole = await queryRunner.manager.save(adminRole);
      }

      // 5. Hash password
      const passwordHash = await bcrypt.hash(registerDto.password, 12);

      // 6. Create admin user
      const user = queryRunner.manager.create(User, {
        tenantId: savedTenant.id,
        email: registerDto.email,
        passwordHash,
        firstName: registerDto.firstName,
        lastName: registerDto.lastName,
        phone: registerDto.phone,
        isActive: true,
        isVerified: true, // Auto-verify for now (can add email verification later)
      });

      const savedUser = await queryRunner.manager.save(user);

      // 7. Assign TENANT_ADMIN role to user
      await queryRunner.manager
        .createQueryBuilder()
        .insert()
        .into('user_role')
        .values({
          user_id: savedUser.id,
          role_id: adminRole.id,
        })
        .execute();

      // Commit transaction
      await queryRunner.commitTransaction();

      // 8. Load user with relations for token generation
      const userWithRelations = await this.userRepository.findOne({
        where: { id: savedUser.id },
        relations: ['tenant', 'roles', 'roles.permissions'],
      });

      // 9. Generate tokens
      return this.generateAuthResponse(userWithRelations);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshToken(refreshToken: string): Promise<AuthResponse> {
    try {
      // Verify refresh token
      const payload = this.jwtService.verify<JwtRefreshPayload>(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      });

      // Find session
      const session = await this.sessionRepository.findOne({
        where: { id: payload.sessionId },
        relations: ['user', 'user.tenant', 'user.roles', 'user.roles.permissions'],
      });

      if (!session || session.refreshToken !== refreshToken) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      if (session.isExpired()) {
        throw new UnauthorizedException('Refresh token expired');
      }

      // Revoke old session (token rotation)
      session.isRevoked = true;
      await this.sessionRepository.save(session);

      // Generate new tokens
      return this.generateAuthResponse(session.user);
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  /**
   * Logout user (revoke session)
   */
  async logout(userId: string, sessionId?: string): Promise<void> {
    if (sessionId) {
      // Revoke specific session
      await this.sessionRepository.update(
        { id: sessionId, userId },
        { isRevoked: true },
      );
    } else {
      // Revoke all user sessions
      await this.sessionRepository.update(
        { userId },
        { isRevoked: true },
      );
    }
  }

  /**
   * Change user password
   */
  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
  ): Promise<void> {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(currentPassword, user.passwordHash);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    // Hash new password
    user.passwordHash = await bcrypt.hash(newPassword, 12);
    await this.userRepository.save(user);

    // Revoke all sessions (force re-login)
    await this.logout(userId);
  }

  /**
   * Generate authentication response with tokens
   */
  private async generateAuthResponse(
    user: User,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<AuthResponse> {
    // Extract permissions from roles
    const permissions = [
      ...new Set(
        user.roles?.flatMap(role => role.permissions?.map(p => p.code) || []) || [],
      ),
    ];

    // Create access token payload
    const accessPayload: JwtPayload = {
      sub: user.id,
      email: user.email,
      tenantId: user.tenantId,
      roles: user.roles?.map(r => r.code) || [],
      permissions,
    };

    // Generate access token
    const accessToken = this.jwtService.sign(accessPayload);

    // Create user session with pre-generated UUID
    const { v4: uuidv4 } = require('uuid');
    const sessionId = uuidv4();

    // Create refresh token payload first (using pre-generated session ID)
    const refreshPayload: JwtRefreshPayload = {
      sub: user.id,
      sessionId: sessionId,
    };

    // Generate refresh token
    const refreshToken = this.jwtService.sign(refreshPayload, {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRATION', '7d'),
    });

    // Now create and save session with refresh token
    const session = this.sessionRepository.create({
      id: sessionId,
      userId: user.id,
      refreshToken: refreshToken,
      ipAddress,
      userAgent,
      expiresAt: new Date(
        Date.now() +
          this.parseExpirationToMs(
            this.configService.get<string>('JWT_REFRESH_EXPIRATION', '7d'),
          ),
      ),
    });

    await this.sessionRepository.save(session);

    // Parse expiration time
    const expiresIn = this.parseExpirationToSeconds(
      this.configService.get<string>('JWT_EXPIRATION', '15m'),
    );

    return {
      accessToken,
      refreshToken,
      tokenType: 'Bearer',
      expiresIn,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        tenantId: user.tenantId,
        roles: user.roles?.map(r => r.code) || [],
      },
      tenant: {
        id: user.tenant.id,
        slug: user.tenant.slug,
        companyName: user.tenant.companyName,
      },
    };
  }

  /**
   * Parse expiration string to seconds (e.g., "15m" -> 900)
   */
  private parseExpirationToSeconds(expiration: string): number {
    const match = expiration.match(/^(\d+)([smhd])$/);
    if (!match) return 900; // Default 15 minutes

    const value = parseInt(match[1], 10);
    const unit = match[2];

    switch (unit) {
      case 's':
        return value;
      case 'm':
        return value * 60;
      case 'h':
        return value * 60 * 60;
      case 'd':
        return value * 24 * 60 * 60;
      default:
        return 900;
    }
  }

  /**
   * Parse expiration string to milliseconds
   */
  private parseExpirationToMs(expiration: string): number {
    return this.parseExpirationToSeconds(expiration) * 1000;
  }
}
