import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { TenantContextService } from './tenant-context.service';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '@/common/decorators/public.decorator';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

/**
 * Interceptor that extracts tenant context from authenticated user
 * and sets it in AsyncLocalStorage + PostgreSQL session variable
 */
@Injectable()
export class TenantIsolationInterceptor implements NestInterceptor {
  constructor(
    private readonly tenantContext: TenantContextService,
    private readonly reflector: Reflector,
    @InjectDataSource() private readonly dataSource: DataSource,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();

    // Check if route is public
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // If public route or no user authenticated, proceed without setting tenant context
    if (isPublic || !request.user) {
      return next.handle();
    }

    // Extract tenant and user from authenticated request
    // Support both JWT payload format (sub, tenantId) and User entity format (id, tenantId)
    const tenantId = request.user.tenantId;
    const userId = request.user.sub || request.user.id;
    // Extract role codes from Role entities or use role strings directly
    const roles = request.user.roles
      ? request.user.roles.map(role => typeof role === 'string' ? role : role.code)
      : [];

    if (!tenantId || !userId) {
      return next.handle();
    }

    // Run the request handler within the tenant context
    return new Observable((subscriber) => {
      this.tenantContext.run(
        { tenantId, userId, roles },
        async () => {
          // Set PostgreSQL session variable for RLS
          try {
            await this.dataSource.query(
              `SELECT set_config('app.current_tenant', $1, false)`,
              [tenantId],
            );
          } catch (error) {
            // If RLS functions don't exist yet, continue without error
            // This allows the app to work before RLS migration is run
            console.warn('Could not set tenant context in PostgreSQL:', error.message);
          }

          next.handle().subscribe({
            next: (value) => subscriber.next(value),
            error: (error) => subscriber.error(error),
            complete: () => subscriber.complete(),
          });
        },
      );
    });
  }
}
