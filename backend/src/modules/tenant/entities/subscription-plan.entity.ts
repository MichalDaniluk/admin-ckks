import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from '@/database/entities/base.entity';

@Entity('subscription_plan')
@Index('idx_plan_code', ['code'], { unique: true })
export class SubscriptionPlan extends BaseEntity {
  @Column({ name: 'plan_name', type: 'varchar', length: 100 })
  planName: string;

  @Column({ name: 'plan_code', type: 'varchar', length: 50, unique: true })
  code: string; // starter, professional, enterprise

  @Column({ name: 'max_users', type: 'int' })
  maxUsers: number;

  @Column({ name: 'max_courses', type: 'int' })
  maxCourses: number;

  @Column({ name: 'max_students', type: 'int' })
  maxStudents: number;

  @Column({ name: 'price_monthly', type: 'decimal', precision: 10, scale: 2 })
  priceMonthly: number;

  @Column({ name: 'price_yearly', type: 'decimal', precision: 10, scale: 2, nullable: true })
  priceYearly: number | null;

  @Column({ type: 'jsonb', nullable: true })
  features: string[]; // List of feature codes enabled for this plan

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'text', nullable: true })
  description: string;
}
