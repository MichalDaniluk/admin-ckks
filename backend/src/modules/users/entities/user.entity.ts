import { Entity, Column, Index, ManyToOne, OneToMany, JoinColumn, ManyToMany, JoinTable } from 'typeorm';
import { Exclude } from 'class-transformer';
import { TenantBaseEntity } from '@/database/entities/base.entity';
import { Tenant } from '@/modules/tenant/entities/tenant.entity';
import { Role } from './role.entity';

@Entity('user')
@Index('idx_user_tenant', ['tenantId'])
@Index('idx_user_email', ['email'])
@Index('idx_user_tenant_email', ['tenantId', 'email'], { unique: true })
export class User extends TenantBaseEntity {
  @Column({ type: 'varchar', length: 255 })
  email: string;

  @Column({ name: 'password_hash', type: 'varchar', length: 255 })
  @Exclude() // Exclude from JSON serialization
  passwordHash: string;

  @Column({ name: 'first_name', type: 'varchar', length: 100, nullable: true })
  firstName: string;

  @Column({ name: 'last_name', type: 'varchar', length: 100, nullable: true })
  lastName: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  phone: string;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @Column({ name: 'is_verified', type: 'boolean', default: false })
  isVerified: boolean;

  @Column({ name: 'last_login_at', type: 'timestamp', nullable: true })
  lastLoginAt: Date | null;

  @Column({ name: 'verification_token', type: 'varchar', length: 255, nullable: true })
  @Exclude()
  verificationToken: string | null;

  @Column({ name: 'reset_password_token', type: 'varchar', length: 255, nullable: true })
  @Exclude()
  resetPasswordToken: string | null;

  @Column({ name: 'reset_password_expires', type: 'timestamp', nullable: true })
  resetPasswordExpires: Date | null;

  // Relations
  @ManyToOne(() => Tenant, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant;

  @ManyToMany(() => Role, role => role.users, { eager: true })
  @JoinTable({
    name: 'user_role',
    joinColumn: { name: 'user_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'role_id', referencedColumnName: 'id' },
  })
  roles: Role[];

  // Helper method to get full name
  getFullName(): string {
    return `${this.firstName || ''} ${this.lastName || ''}`.trim() || this.email;
  }

  // Helper method to check if user has a specific role
  hasRole(roleCode: string): boolean {
    return this.roles?.some(role => role.code === roleCode) || false;
  }
}
