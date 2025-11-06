import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { User } from '@/modules/users/entities/user.entity';

/**
 * Decorator to extract current user from request
 * The user is attached to request by JwtStrategy after token validation
 * Usage: @CurrentUser() user: User
 */
export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): User => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
