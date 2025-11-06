import { Entity, Column, Index, ManyToOne, ManyToMany, JoinColumn, JoinTable } from 'typeorm';
import { BaseEntity } from '@/database/entities/base.entity';
import { Tenant } from '@/modules/tenant/entities/tenant.entity';
import { User } from './user.entity';
import { Permission } from './permission.entity';

@Entity('role')
@Index('idx_role_tenant', ['tenantId'])
@Index('idx_role_code', ['code'])
export class Role extends BaseEntity {
  // tenant_id can be NULL for system roles (e.g., SUPER_ADMIN)
  @Column({ name: 'tenant_id', type: 'uuid', nullable: true })
  tenantId: string | null;

  @Column({ name: 'role_name', type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'varchar', length: 50 })
  code: string; // SUPER_ADMIN, TENANT_ADMIN, MANAGER, etc.

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ name: 'is_system_role', type: 'boolean', default: false })
  isSystemRole: boolean; // true for roles like SUPER_ADMIN

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  // Relations
  @ManyToOne(() => Tenant, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant | null;

  @ManyToMany(() => User, user => user.roles)
  users: User[];

  @ManyToMany(() => Permission, permission => permission.roles, { eager: true })
  @JoinTable({
    name: 'role_permission',
    joinColumn: { name: 'role_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'permission_id', referencedColumnName: 'id' },
  })
  permissions: Permission[];
}
