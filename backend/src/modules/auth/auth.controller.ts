import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
  Req,
  Get,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import { Request } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { AuthResponse } from './interfaces/auth-response.interface';
import { LocalAuthGuard } from '@/common/guards/local-auth.guard';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { Public } from '@/common/decorators/public.decorator';
import { Roles } from '@/common/decorators/roles.decorator';
import { Permissions, RequireAnyPermission } from '@/common/decorators/permissions.decorator';
import { User } from '@/modules/users/entities/user.entity';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register new tenant with admin user (Self-service onboarding)' })
  @ApiResponse({
    status: 201,
    description: 'Registration successful',
    type: AuthResponse,
  })
  @ApiResponse({ status: 409, description: 'Email or slug already exists' })
  @ApiBody({ type: RegisterDto })
  async register(
    @Body() registerDto: RegisterDto,
    @Req() req: Request,
  ): Promise<AuthResponse> {
    const ipAddress = req.ip;
    const userAgent = req.headers['user-agent'];

    return this.authService.register(registerDto);
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login user' })
  @ApiResponse({
    status: 200,
    description: 'Login successful',
    type: AuthResponse,
  })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  @ApiBody({ type: LoginDto })
  async login(
    @Body() loginDto: LoginDto,
    @Req() req: Request,
  ): Promise<AuthResponse> {
    const ipAddress = req.ip;
    const userAgent = req.headers['user-agent'];

    return this.authService.login(loginDto, ipAddress, userAgent);
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh access token using refresh token' })
  @ApiResponse({
    status: 200,
    description: 'Token refreshed successfully',
    type: AuthResponse,
  })
  @ApiResponse({ status: 401, description: 'Invalid or expired refresh token' })
  @ApiBody({ type: RefreshTokenDto })
  async refresh(@Body() refreshTokenDto: RefreshTokenDto): Promise<AuthResponse> {
    return this.authService.refreshToken(refreshTokenDto.refreshToken);
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Logout user (revoke current session)' })
  @ApiResponse({ status: 204, description: 'Logout successful' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async logout(@CurrentUser() user: User, @Req() req: Request): Promise<void> {
    // Extract session ID from request if available
    // For now, we'll revoke all sessions
    await this.authService.logout(user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout-all')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Logout from all devices (revoke all sessions)' })
  @ApiResponse({ status: 204, description: 'All sessions revoked' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async logoutAll(@CurrentUser() user: User): Promise<void> {
    await this.authService.logout(user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('change-password')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Change user password' })
  @ApiResponse({ status: 200, description: 'Password changed successfully' })
  @ApiResponse({ status: 401, description: 'Invalid current password' })
  @ApiBody({ type: ChangePasswordDto })
  async changePassword(
    @CurrentUser() user: User,
    @Body() changePasswordDto: ChangePasswordDto,
  ): Promise<{ message: string }> {
    await this.authService.changePassword(
      user.id,
      changePasswordDto.currentPassword,
      changePasswordDto.newPassword,
    );

    return { message: 'Password changed successfully. Please login again.' };
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, description: 'Current user profile' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getProfile(@CurrentUser() user: User) {
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
      isActive: user.isActive,
      isVerified: user.isVerified,
      lastLoginAt: user.lastLoginAt,
      tenantId: user.tenantId,
      roles: user.roles?.map(r => ({
        id: r.id,
        code: r.code,
        name: r.name,
      })),
      permissions: [
        ...new Set(
          user.roles?.flatMap(role => role.permissions?.map(p => p.code) || []) || [],
        ),
      ],
      tenant: {
        id: user.tenant.id,
        slug: user.tenant.slug,
        companyName: user.tenant.companyName,
        subscriptionPlan: user.tenant.subscriptionPlan,
        subscriptionStatus: user.tenant.subscriptionStatus,
      },
    };
  }

  // ========================================================================
  // EXAMPLE ENDPOINTS - Demonstrating Role & Permission Guards
  // ========================================================================

  @Get('examples/admin-only')
  @Roles('TENANT_ADMIN', 'SUPER_ADMIN')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Example: Admin-only endpoint (requires TENANT_ADMIN or SUPER_ADMIN role)',
  })
  @ApiResponse({ status: 200, description: 'Access granted' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient role' })
  async adminOnlyExample(@CurrentUser() user: User) {
    return {
      message: 'This endpoint is only accessible to admins',
      userRole: user.roles?.map(r => r.code),
    };
  }

  @Get('examples/with-permissions')
  @Permissions('users:read', 'users:write')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Example: Endpoint requiring specific permissions (users:read AND users:write)',
  })
  @ApiResponse({ status: 200, description: 'Access granted' })
  @ApiResponse({ status: 403, description: 'Forbidden - missing permissions' })
  async withPermissionsExample(@CurrentUser() user: User) {
    return {
      message: 'This endpoint requires both users:read and users:write permissions',
      userPermissions: [
        ...new Set(
          user.roles?.flatMap(role => role.permissions?.map(p => p.code) || []) || [],
        ),
      ],
    };
  }

  @Get('examples/any-permission')
  @RequireAnyPermission('courses:read', 'courses:admin', 'courses:write')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Example: Endpoint requiring ANY of the specified permissions (OR logic)',
  })
  @ApiResponse({ status: 200, description: 'Access granted' })
  @ApiResponse({ status: 403, description: 'Forbidden - no matching permissions' })
  async anyPermissionExample(@CurrentUser() user: User) {
    return {
      message: 'This endpoint requires at least one course-related permission',
      userPermissions: [
        ...new Set(
          user.roles?.flatMap(role => role.permissions?.map(p => p.code) || []) || [],
        ),
      ],
    };
  }

  @Get('examples/combined')
  @Roles('TENANT_ADMIN')
  @Permissions('system:admin')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Example: Endpoint with both role AND permission requirements',
  })
  @ApiResponse({ status: 200, description: 'Access granted' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async combinedExample(@CurrentUser() user: User) {
    return {
      message: 'This endpoint requires TENANT_ADMIN role AND system:admin permission',
      userRole: user.roles?.map(r => r.code),
      userPermissions: [
        ...new Set(
          user.roles?.flatMap(role => role.permissions?.map(p => p.code) || []) || [],
        ),
      ],
    };
  }
}
