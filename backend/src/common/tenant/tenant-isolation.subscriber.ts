import {
  EventSubscriber,
  EntitySubscriberInterface,
  InsertEvent,
  UpdateEvent,
  RemoveEvent,
  LoadEvent,
} from 'typeorm';
import { TenantContextService } from './tenant-context.service';
import { TenantBaseEntity } from '@/database/entities/base.entity';
import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

/**
 * TypeORM Subscriber that automatically enforces tenant isolation
 * for all entities extending TenantBaseEntity
 */
@Injectable()
@EventSubscriber()
export class TenantIsolationSubscriber implements EntitySubscriberInterface {
  constructor(
    @InjectDataSource() private dataSource: DataSource,
    private tenantContext: TenantContextService,
  ) {
    dataSource.subscribers.push(this);
  }

  /**
   * Before INSERT: automatically set tenantId from context
   */
  beforeInsert(event: InsertEvent<any>): void {
    if (this.isTenantEntity(event.entity)) {
      const tenantId = this.tenantContext.getTenantId();

      if (tenantId && !event.entity.tenantId) {
        event.entity.tenantId = tenantId;
      }
    }
  }

  /**
   * Before UPDATE: verify tenant ownership
   */
  beforeUpdate(event: UpdateEvent<any>): void {
    if (this.isTenantEntity(event.entity)) {
      const tenantId = this.tenantContext.getTenantId();

      // If we have a tenant context, ensure we can only update our own tenant's data
      if (tenantId && event.entity.tenantId && event.entity.tenantId !== tenantId) {
        throw new Error(
          `Tenant isolation violation: Cannot update entity from different tenant`,
        );
      }
    }
  }

  /**
   * Before REMOVE: verify tenant ownership
   */
  beforeRemove(event: RemoveEvent<any>): void {
    if (this.isTenantEntity(event.entity)) {
      const tenantId = this.tenantContext.getTenantId();

      // If we have a tenant context, ensure we can only remove our own tenant's data
      if (tenantId && event.entity.tenantId && event.entity.tenantId !== tenantId) {
        throw new Error(
          `Tenant isolation violation: Cannot remove entity from different tenant`,
        );
      }
    }
  }

  /**
   * After LOAD: verify the loaded entity belongs to current tenant
   */
  afterLoad(entity: any, event?: LoadEvent<any>): void {
    if (this.isTenantEntity(entity)) {
      const tenantId = this.tenantContext.getTenantId();
      const isSuperAdmin = this.tenantContext.hasRole('SUPER_ADMIN');

      // Super admins can access entities from any tenant
      if (isSuperAdmin) {
        return;
      }

      // If we have a tenant context and entity has different tenant, this is a security issue
      if (tenantId && entity.tenantId && entity.tenantId !== tenantId) {
        throw new Error(
          `Tenant isolation violation: Loaded entity from different tenant`,
        );
      }
    }
  }

  /**
   * Check if entity is a tenant-isolated entity
   */
  private isTenantEntity(entity: any): entity is TenantBaseEntity {
    return entity instanceof TenantBaseEntity;
  }
}
