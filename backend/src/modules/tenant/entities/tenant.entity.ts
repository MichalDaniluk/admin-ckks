import { Entity, Column, Index, OneToMany } from 'typeorm';
import { BaseEntity } from '@/database/entities/base.entity';

export enum SubscriptionStatus {
  TRIAL = 'trial',
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
  CANCELLED = 'cancelled',
  EXPIRED = 'expired',
}

export enum SubscriptionPlan {
  STARTER = 'starter',
  PROFESSIONAL = 'professional',
  ENTERPRISE = 'enterprise',
}

@Entity('tenant')
@Index('idx_tenant_slug', ['slug'], { unique: true })
@Index('idx_tenant_status', ['subscriptionStatus'])
export class Tenant extends BaseEntity {
  @Column({ type: 'varchar', length: 100, unique: true })
  slug: string; // Subdomain: acme.ckks.pl

  @Column({ name: 'company_name', type: 'varchar', length: 255 })
  companyName: string;

  @Column({
    name: 'subscription_plan',
    type: 'enum',
    enum: SubscriptionPlan,
    default: SubscriptionPlan.STARTER,
  })
  subscriptionPlan: SubscriptionPlan;

  @Column({
    name: 'subscription_status',
    type: 'enum',
    enum: SubscriptionStatus,
    default: SubscriptionStatus.TRIAL,
  })
  subscriptionStatus: SubscriptionStatus;

  @Column({ name: 'max_users', type: 'int', default: 10 })
  maxUsers: number;

  @Column({ name: 'max_courses', type: 'int', default: 50 })
  maxCourses: number;

  @Column({ name: 'max_students', type: 'int', default: 1000 })
  maxStudents: number;

  @Column({ name: 'trial_ends_at', type: 'timestamp', nullable: true })
  trialEndsAt: Date | null;

  @Column({ name: 'subscription_started_at', type: 'timestamp', nullable: true })
  subscriptionStartedAt: Date | null;

  @Column({ name: 'subscription_ends_at', type: 'timestamp', nullable: true })
  subscriptionEndsAt: Date | null;

  @Column({ type: 'jsonb', nullable: true, default: {} })
  settings: Record<string, any>;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  // Email and contact info
  @Column({ name: 'contact_email', type: 'varchar', length: 255, nullable: true })
  contactEmail: string;

  @Column({ name: 'contact_phone', type: 'varchar', length: 50, nullable: true })
  contactPhone: string;

  // Address
  @Column({ type: 'varchar', length: 500, nullable: true })
  address: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  city: string;

  @Column({ name: 'postal_code', type: 'varchar', length: 20, nullable: true })
  postalCode: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  country: string;

  // Tax information
  @Column({ name: 'tax_id', type: 'varchar', length: 50, nullable: true })
  taxId: string; // NIP in Poland

  // Relations will be added as we implement other modules
  // @OneToMany(() => User, user => user.tenant)
  // users: User[];
}
