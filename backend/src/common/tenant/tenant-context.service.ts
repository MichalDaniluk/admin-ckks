import { Injectable } from '@nestjs/common';
import { AsyncLocalStorage } from 'async_hooks';

export interface TenantContext {
  tenantId: string;
  userId: string;
  roles?: string[];
}

@Injectable()
export class TenantContextService {
  private readonly asyncLocalStorage = new AsyncLocalStorage<TenantContext>();

  /**
   * Run a function within a tenant context
   */
  run<T>(context: TenantContext, callback: () => T): T {
    return this.asyncLocalStorage.run(context, callback);
  }

  /**
   * Get the current tenant ID from the async context
   */
  getTenantId(): string | undefined {
    const store = this.asyncLocalStorage.getStore();
    return store?.tenantId;
  }

  /**
   * Get the current user ID from the async context
   */
  getUserId(): string | undefined {
    const store = this.asyncLocalStorage.getStore();
    return store?.userId;
  }

  /**
   * Get the full context
   */
  getContext(): TenantContext | undefined {
    return this.asyncLocalStorage.getStore();
  }

  /**
   * Check if we're currently in a tenant context
   */
  hasContext(): boolean {
    return this.asyncLocalStorage.getStore() !== undefined;
  }

  /**
   * Get the user roles from the async context
   */
  getUserRoles(): string[] | undefined {
    const store = this.asyncLocalStorage.getStore();
    return store?.roles;
  }

  /**
   * Check if the current user has a specific role
   */
  hasRole(role: string): boolean {
    const roles = this.getUserRoles();
    return roles ? roles.includes(role) : false;
  }
}
