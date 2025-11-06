import { Entity, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { TenantBaseEntity } from '@/database/entities/base.entity';
import { Tenant } from '@/modules/tenant/entities/tenant.entity';

export enum CourseStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ARCHIVED = 'archived',
}

export enum CourseLevel {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
  ALL_LEVELS = 'all_levels',
}

@Entity('course')
export class Course extends TenantBaseEntity {
  @Column({ name: 'course_code', type: 'varchar', length: 50, unique: true })
  code: string;

  @Column({ name: 'course_title', type: 'varchar', length: 255 })
  title: string;

  @Column({ name: 'course_description', type: 'text', nullable: true })
  description: string;

  @Column({ name: 'short_description', type: 'varchar', length: 500, nullable: true })
  shortDescription: string;

  @Column({
    name: 'course_status',
    type: 'enum',
    enum: CourseStatus,
    default: CourseStatus.DRAFT,
  })
  status: CourseStatus;

  @Column({
    name: 'course_level',
    type: 'enum',
    enum: CourseLevel,
    default: CourseLevel.ALL_LEVELS,
  })
  level: CourseLevel;

  @Column({ name: 'category', type: 'varchar', length: 100, nullable: true })
  category: string;

  @Column({ name: 'tags', type: 'simple-array', nullable: true })
  tags: string[];

  @Column({ name: 'price', type: 'decimal', precision: 10, scale: 2, default: 0 })
  price: number;

  @Column({ name: 'currency', type: 'varchar', length: 3, default: 'PLN' })
  currency: string;

  @Column({ name: 'duration_hours', type: 'int', nullable: true })
  durationHours: number;

  @Column({ name: 'duration_days', type: 'int', nullable: true })
  durationDays: number;

  @Column({ name: 'max_participants', type: 'int', nullable: true })
  maxParticipants: number;

  @Column({ name: 'min_participants', type: 'int', nullable: true, default: 1 })
  minParticipants: number;

  @Column({ name: 'image_url', type: 'varchar', length: 500, nullable: true })
  imageUrl: string;

  @Column({ name: 'thumbnail_url', type: 'varchar', length: 500, nullable: true })
  thumbnailUrl: string;

  @Column({ name: 'syllabus', type: 'text', nullable: true })
  syllabus: string;

  @Column({ name: 'prerequisites', type: 'text', nullable: true })
  prerequisites: string;

  @Column({ name: 'learning_objectives', type: 'simple-array', nullable: true })
  learningObjectives: string[];

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @Column({ name: 'is_featured', type: 'boolean', default: false })
  isFeatured: boolean;

  @Column({ name: 'certification_provided', type: 'boolean', default: false })
  certificationProvided: boolean;

  @Column({ name: 'certificate_template', type: 'varchar', length: 100, nullable: true })
  certificateTemplate: string;

  @Column({ name: 'published_at', type: 'timestamp', nullable: true })
  publishedAt: Date;

  // Relationships
  @ManyToOne(() => Tenant)
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant;

  // Helper methods
  isPublished(): boolean {
    return this.status === CourseStatus.PUBLISHED && this.isActive;
  }

  canEnroll(): boolean {
    return this.isPublished();
  }

  getFormattedPrice(): string {
    return `${this.price} ${this.currency}`;
  }
}
