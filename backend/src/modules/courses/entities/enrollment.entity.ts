import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { TenantBaseEntity } from '@/database/entities/base.entity';
import { Tenant } from '@/modules/tenant/entities/tenant.entity';
import { User } from '@/modules/users/entities/user.entity';
import { CourseSession } from './course-session.entity';
import { Course } from './course.entity';

export enum EnrollmentStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  CANCELLED = 'cancelled',
  COMPLETED = 'completed',
  NO_SHOW = 'no_show',
}

export enum PaymentStatus {
  UNPAID = 'unpaid',
  PARTIAL = 'partial',
  PAID = 'paid',
  REFUNDED = 'refunded',
  WAIVED = 'waived',
}

export enum AttendanceStatus {
  NOT_STARTED = 'not_started',
  PRESENT = 'present',
  ABSENT = 'absent',
  PARTIAL = 'partial',
}

@Entity('enrollment')
export class Enrollment extends TenantBaseEntity {
  @Column({ name: 'student_id', type: 'uuid' })
  studentId: string;

  @Column({ name: 'course_id', type: 'uuid' })
  courseId: string;

  @Column({ name: 'session_id', type: 'uuid' })
  sessionId: string;

  @Column({ name: 'enrollment_code', type: 'varchar', length: 50, unique: true })
  enrollmentCode: string;

  @Column({
    name: 'enrollment_status',
    type: 'enum',
    enum: EnrollmentStatus,
    default: EnrollmentStatus.PENDING,
  })
  status: EnrollmentStatus;

  @Column({
    name: 'payment_status',
    type: 'enum',
    enum: PaymentStatus,
    default: PaymentStatus.UNPAID,
  })
  paymentStatus: PaymentStatus;

  @Column({
    name: 'attendance_status',
    type: 'enum',
    enum: AttendanceStatus,
    default: AttendanceStatus.NOT_STARTED,
  })
  attendanceStatus: AttendanceStatus;

  @Column({ name: 'enrolled_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  enrolledAt: Date;

  @Column({ name: 'confirmed_at', type: 'timestamp', nullable: true })
  confirmedAt: Date;

  @Column({ name: 'cancelled_at', type: 'timestamp', nullable: true })
  cancelledAt: Date;

  @Column({ name: 'completed_at', type: 'timestamp', nullable: true })
  completedAt: Date;

  @Column({ name: 'cancellation_reason', type: 'text', nullable: true })
  cancellationReason: string;

  @Column({ name: 'enrolled_by', type: 'uuid', nullable: true })
  enrolledBy: string;

  @Column({ name: 'enrollment_price', type: 'decimal', precision: 10, scale: 2, nullable: true })
  price: number;

  @Column({ name: 'currency', type: 'varchar', length: 3, default: 'PLN' })
  currency: string;

  @Column({ name: 'amount_paid', type: 'decimal', precision: 10, scale: 2, default: 0 })
  amountPaid: number;

  @Column({ name: 'payment_date', type: 'timestamp', nullable: true })
  paymentDate: Date;

  @Column({ name: 'payment_reference', type: 'varchar', length: 255, nullable: true })
  paymentReference: string;

  @Column({ name: 'attendance_percentage', type: 'int', default: 0 })
  attendancePercentage: number;

  @Column({ name: 'completion_percentage', type: 'int', default: 0 })
  completionPercentage: number;

  @Column({ name: 'final_grade', type: 'decimal', precision: 5, scale: 2, nullable: true })
  finalGrade: number;

  @Column({ name: 'passed', type: 'boolean', nullable: true })
  passed: boolean;

  @Column({ name: 'certificate_issued', type: 'boolean', default: false })
  certificateIssued: boolean;

  @Column({ name: 'certificate_issued_at', type: 'timestamp', nullable: true })
  certificateIssuedAt: Date;

  @Column({ name: 'certificate_number', type: 'varchar', length: 100, nullable: true })
  certificateNumber: string;

  @Column({ name: 'certificate_url', type: 'varchar', length: 500, nullable: true })
  certificateUrl: string;

  @Column({ name: 'notes', type: 'text', nullable: true })
  notes: string;

  @Column({ name: 'internal_notes', type: 'text', nullable: true })
  internalNotes: string;

  @Column({ name: 'send_notifications', type: 'boolean', default: true })
  sendNotifications: boolean;

  @Column({ name: 'waitlist_position', type: 'int', nullable: true })
  waitlistPosition: number;

  @Column({ name: 'is_waitlist', type: 'boolean', default: false })
  isWaitlist: boolean;

  // Relationships
  @ManyToOne(() => Tenant)
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'student_id' })
  student: User;

  @ManyToOne(() => Course)
  @JoinColumn({ name: 'course_id' })
  course: Course;

  @ManyToOne(() => CourseSession, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'session_id' })
  session: CourseSession;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'enrolled_by' })
  enrolledByUser: User;

  // Helper methods
  isActive(): boolean {
    return this.status === EnrollmentStatus.CONFIRMED || this.status === EnrollmentStatus.PENDING;
  }

  canCancel(): boolean {
    return (
      this.status === EnrollmentStatus.PENDING ||
      this.status === EnrollmentStatus.CONFIRMED
    );
  }

  canComplete(): boolean {
    return this.status === EnrollmentStatus.CONFIRMED;
  }

  isFullyPaid(): boolean {
    if (this.paymentStatus === PaymentStatus.WAIVED) {
      return true;
    }
    if (this.price === null || this.price === 0) {
      return true;
    }
    return this.amountPaid >= this.price;
  }

  getRemainingBalance(): number {
    if (this.price === null || this.paymentStatus === PaymentStatus.WAIVED) {
      return 0;
    }
    return Math.max(0, this.price - this.amountPaid);
  }

  hasPassed(): boolean {
    if (this.passed !== null) {
      return this.passed;
    }
    if (this.finalGrade !== null) {
      return this.finalGrade >= 50; // Default passing grade is 50%
    }
    return false;
  }

  canIssueCertificate(): boolean {
    return (
      this.status === EnrollmentStatus.COMPLETED &&
      !this.certificateIssued &&
      this.hasPassed() &&
      this.isFullyPaid()
    );
  }

  getFormattedPrice(): string {
    if (this.price === null) {
      return 'N/A';
    }
    return `${this.price} ${this.currency}`;
  }

  getPaymentStatusText(): string {
    if (this.paymentStatus === PaymentStatus.WAIVED) {
      return 'Waived';
    }
    if (this.price === null || this.price === 0) {
      return 'Free';
    }
    if (this.isFullyPaid()) {
      return 'Paid';
    }
    const remaining = this.getRemainingBalance();
    return `${this.amountPaid}/${this.price} ${this.currency} (${remaining} remaining)`;
  }
}
