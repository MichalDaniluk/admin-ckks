import { Entity, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { TenantBaseEntity } from '@/database/entities/base.entity';
import { Tenant } from '@/modules/tenant/entities/tenant.entity';
import { Course } from './course.entity';
import { Location } from '@/modules/locations/entities/location.entity';
import { User } from '@/modules/users/entities/user.entity';

export enum SessionStatus {
  SCHEDULED = 'scheduled',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export enum SessionType {
  ONLINE = 'online',
  IN_PERSON = 'in_person',
  HYBRID = 'hybrid',
}

@Entity('course_session')
export class CourseSession extends TenantBaseEntity {
  @Column({ name: 'course_id', type: 'uuid' })
  courseId: string;

  @Column({ name: 'session_code', type: 'varchar', length: 50, unique: true })
  sessionCode: string;

  @Column({ name: 'session_name', type: 'varchar', length: 255 })
  sessionName: string;

  @Column({ name: 'session_description', type: 'text', nullable: true })
  description: string;

  @Column({
    name: 'session_status',
    type: 'enum',
    enum: SessionStatus,
    default: SessionStatus.SCHEDULED,
  })
  status: SessionStatus;

  @Column({
    name: 'session_type',
    type: 'enum',
    enum: SessionType,
    default: SessionType.IN_PERSON,
  })
  sessionType: SessionType;

  @Column({ name: 'start_date', type: 'timestamp' })
  startDate: Date;

  @Column({ name: 'end_date', type: 'timestamp' })
  endDate: Date;

  @Column({ name: 'registration_deadline', type: 'timestamp', nullable: true })
  registrationDeadline: Date;

  @Column({ name: 'location_id', type: 'uuid', nullable: true })
  locationId: string;

  @Column({ name: 'instructor_id', type: 'uuid', nullable: true })
  instructorId: string;

  @Column({ name: 'location', type: 'varchar', length: 255, nullable: true })
  location: string;

  @Column({ name: 'address', type: 'text', nullable: true })
  address: string;

  @Column({ name: 'city', type: 'varchar', length: 100, nullable: true })
  city: string;

  @Column({ name: 'postal_code', type: 'varchar', length: 20, nullable: true })
  postalCode: string;

  @Column({ name: 'online_meeting_url', type: 'varchar', length: 500, nullable: true })
  onlineMeetingUrl: string;

  @Column({ name: 'online_meeting_id', type: 'varchar', length: 100, nullable: true })
  onlineMeetingId: string;

  @Column({ name: 'online_meeting_password', type: 'varchar', length: 100, nullable: true })
  onlineMeetingPassword: string;

  @Column({ name: 'instructor_name', type: 'varchar', length: 255, nullable: true })
  instructorName: string;

  @Column({ name: 'instructor_email', type: 'varchar', length: 255, nullable: true })
  instructorEmail: string;

  @Column({ name: 'instructor_phone', type: 'varchar', length: 50, nullable: true })
  instructorPhone: string;

  @Column({ name: 'max_participants', type: 'int', nullable: true })
  maxParticipants: number;

  @Column({ name: 'min_participants', type: 'int', default: 1 })
  minParticipants: number;

  @Column({ name: 'current_participants', type: 'int', default: 0 })
  currentParticipants: number;

  @Column({ name: 'session_price', type: 'decimal', precision: 10, scale: 2, nullable: true })
  price: number;

  @Column({ name: 'currency', type: 'varchar', length: 3, default: 'PLN' })
  currency: string;

  @Column({ name: 'notes', type: 'text', nullable: true })
  notes: string;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @Column({ name: 'is_registration_open', type: 'boolean', default: true })
  isRegistrationOpen: boolean;

  @Column({ name: 'send_reminders', type: 'boolean', default: true })
  sendReminders: boolean;

  @Column({ name: 'reminder_days_before', type: 'int', default: 7 })
  reminderDaysBefore: number;

  // Relationships
  @ManyToOne(() => Tenant)
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant;

  @ManyToOne(() => Course, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'course_id' })
  course: Course;

  @ManyToOne(() => Location, { nullable: true })
  @JoinColumn({ name: 'location_id' })
  location_rel: Location;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'instructor_id' })
  instructor: User;

  // Helper methods
  isUpcoming(): boolean {
    return this.status === SessionStatus.SCHEDULED && this.startDate > new Date();
  }

  isOngoing(): boolean {
    const now = new Date();
    return (
      this.status === SessionStatus.IN_PROGRESS ||
      (this.status === SessionStatus.SCHEDULED &&
        this.startDate <= now &&
        this.endDate >= now)
    );
  }

  isPast(): boolean {
    return this.status === SessionStatus.COMPLETED || this.endDate < new Date();
  }

  canRegister(): boolean {
    if (!this.isActive || !this.isRegistrationOpen) {
      return false;
    }

    if (this.status !== SessionStatus.SCHEDULED) {
      return false;
    }

    if (this.registrationDeadline && this.registrationDeadline < new Date()) {
      return false;
    }

    if (this.maxParticipants && this.currentParticipants >= this.maxParticipants) {
      return false;
    }

    return true;
  }

  isFull(): boolean {
    return this.maxParticipants !== null && this.currentParticipants >= this.maxParticipants;
  }

  hasMinimumParticipants(): boolean {
    return this.currentParticipants >= this.minParticipants;
  }

  getAvailableSeats(): number | null {
    if (this.maxParticipants === null) {
      return null;
    }
    return Math.max(0, this.maxParticipants - this.currentParticipants);
  }

  getDurationInHours(): number {
    const diffMs = this.endDate.getTime() - this.startDate.getTime();
    return diffMs / (1000 * 60 * 60);
  }

  getFormattedPrice(): string {
    if (this.price === null) {
      return 'Free';
    }
    return `${this.price} ${this.currency}`;
  }
}
