import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import {
  PERMISSIONS_KEY,
  REQUIRE_ANY_PERMISSION_KEY,
} from '@/common/decorators/permissions.decorator';
import { IS_PUBLIC_KEY } from '@/common/decorators/public.decorator';

/**
 * Guard that checks if the authenticated user has the required permissions
 *
 * Supports two modes:
 * 1. @Permissions() - User must have ALL specified permissions (AND logic)
 * 2. @RequireAnyPermission() - User must have ANY of the specified permissions (OR logic)
 *
 * Usage:
 * 1. Apply globally in AppModule (recommended)
 * 2. Apply to specific controllers/routes with @UseGuards(PermissionsGuard)
 *
 * Note: This guard requires JwtAuthGuard to run first to populate request.user
 */
@Injectable()
export class PermissionsGuard implements CanActivate {
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

    // Get required permissions from decorators
    const requiredAllPermissions = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    const requiredAnyPermissions = this.reflector.getAllAndOverride<string[]>(
      REQUIRE_ANY_PERMISSION_KEY,
      [context.getHandler(), context.getClass()],
    );

    // If no permissions specified, allow access
    if (
      (!requiredAllPermissions || requiredAllPermissions.length === 0) &&
      (!requiredAnyPermissions || requiredAnyPermissions.length === 0)
    ) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // If no user (shouldn't happen after JwtAuthGuard), deny access
    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    // Get user's permissions - extract from roles if user object has full relations loaded
    const userPermissions: string[] = user.permissions
      ? Array.isArray(user.permissions) && typeof user.permissions[0] === 'string'
        ? user.permissions
        : []
      : user.roles
        ? [
            ...new Set(
              user.roles.flatMap((role: any) =>
                role.permissions ? role.permissions.map((p: any) => p.code) : [],
              ),
            ),
          ]
        : [];

    // Check @Permissions() decorator (ALL required - AND logic)
    if (requiredAllPermissions && requiredAllPermissions.length > 0) {
      const hasAllPermissions = requiredAllPermissions.every((permission) =>
        userPermissions.includes(permission),
      );

      if (!hasAllPermissions) {
        const missingPermissions = requiredAllPermissions.filter(
          (permission) => !userPermissions.includes(permission),
        );

        throw new ForbiddenException(
          `User missing required permission(s): ${missingPermissions.join(', ')}. ` +
            `User has: ${userPermissions.length > 0 ? userPermissions.join(', ') : 'none'}`,
        );
      }
    }

    // Check @RequireAnyPermission() decorator (ANY required - OR logic)
    if (requiredAnyPermissions && requiredAnyPermissions.length > 0) {
      const hasAnyPermission = requiredAnyPermissions.some((permission) =>
        userPermissions.includes(permission),
      );

      if (!hasAnyPermission) {
        throw new ForbiddenException(
          `User needs at least one of: ${requiredAnyPermissions.join(', ')}. ` +
            `User has: ${userPermissions.length > 0 ? userPermissions.join(', ') : 'none'}`,
        );
      }
    }

    return true;
  }
}
