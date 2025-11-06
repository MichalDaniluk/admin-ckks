import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';

/**
 * Decorator to specify required roles for a route
 *
 * @example
 * @Roles('TENANT_ADMIN', 'SUPER_ADMIN')
 * @Get('admin-only')
 * async adminOnlyEndpoint() {
 *   return { message: 'Admin access' };
 * }
 */
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
