import {
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  BeforeInsert,
  BeforeUpdate,
} from 'typeorm';

/**
 * Base Entity for all tenant-scoped entities
 * All tables that need tenant isolation should extend this class
 */
export abstract class TenantBaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'tenant_id' })
  tenantId: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamp', nullable: true })
  deletedAt: Date | null;

  /**
   * Validation hook: Ensure tenant_id is set before insert/update
   * This is a safety measure to prevent data leakage
   */
  @BeforeInsert()
  @BeforeUpdate()
  validateTenantId() {
    if (!this.tenantId) {
      throw new Error(
        `Tenant ID must be set before saving entity ${this.constructor.name}. ` +
        'This is a critical security requirement for multi-tenant isolation.',
      );
    }
  }
}

/**
 * Base Entity for non-tenant entities (e.g., Tenant itself, SubscriptionPlan)
 */
export abstract class BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamp', nullable: true })
  deletedAt: Date | null;
}
