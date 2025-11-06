import { SetMetadata } from '@nestjs/common';

export const PERMISSIONS_KEY = 'permissions';

/**
 * Decorator to specify required permissions for a route
 * User must have ALL specified permissions (AND logic)
 *
 * @example
 * @Permissions('courses:read', 'courses:write')
 * @Post('courses')
 * async createCourse() {
 *   return { message: 'Course created' };
 * }
 */
export const Permissions = (...permissions: string[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);

/**
 * Decorator to specify that user needs ANY of the specified permissions (OR logic)
 *
 * @example
 * @RequireAnyPermission('courses:read', 'courses:admin')
 * @Get('courses')
 * async getCourses() {
 *   return { message: 'Courses list' };
 * }
 */
export const REQUIRE_ANY_PERMISSION_KEY = 'require_any_permission';
export const RequireAnyPermission = (...permissions: string[]) =>
  SetMetadata(REQUIRE_ANY_PERMISSION_KEY, permissions);
