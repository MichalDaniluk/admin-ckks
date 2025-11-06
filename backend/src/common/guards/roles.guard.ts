import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '@/common/decorators/roles.decorator';
import { IS_PUBLIC_KEY } from '@/common/decorators/public.decorator';

/**
 * Guard that checks if the authenticated user has the required roles
 *
 * Usage:
 * 1. Apply globally in AppModule (recommended)
 * 2. Apply to specific controllers/routes with @UseGuards(RolesGuard)
 *
 * Note: This guard requires JwtAuthGuard to run first to populate request.user
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Check if route is public
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    // Get required roles from decorator
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // If no roles specified, allow access
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // If no user (shouldn't happen after JwtAuthGuard), deny access
    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    // Get user's roles - can be either string array (from JWT payload) or Role objects (from database)
    const userRoles: string[] = user.roles
      ? user.roles.map((role: any) => (typeof role === 'string' ? role : role.code))
      : [];

    // Check if user has at least one of the required roles
    const hasRole = requiredRoles.some((role) => userRoles.includes(role));

    if (!hasRole) {
      throw new ForbiddenException(
        `User does not have required role(s): ${requiredRoles.join(', ')}. User has: ${userRoles.join(', ')}`,
      );
    }

    return true;
  }
}
