import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { TenantBaseEntity } from '@/database/entities/base.entity';
import { Tenant } from '@/modules/tenant/entities/tenant.entity';
import { User } from '@/modules/users/entities/user.entity';

export enum TimeEntryStatus {
  DRAFT = 'draft',
  SUBMITTED = 'submitted',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

export enum TimeEntryType {
  WORK = 'work',
  OVERTIME = 'overtime',
  BREAK = 'break',
  MEETING = 'meeting',
  TRAINING = 'training',
  OTHER = 'other',
}

@Entity('time_entry')
export class TimeEntry extends TenantBaseEntity {
  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @Column({ name: 'entry_date', type: 'date' })
  entryDate: Date;

  @Column({ name: 'start_time', type: 'time' })
  startTime: string;

  @Column({ name: 'end_time', type: 'time', nullable: true })
  endTime: string;

  @Column({ name: 'duration_minutes', type: 'int', nullable: true })
  durationMinutes: number;

  @Column({
    name: 'entry_type',
    type: 'enum',
    enum: TimeEntryType,
    default: TimeEntryType.WORK,
  })
  entryType: TimeEntryType;

  @Column({
    name: 'entry_status',
    type: 'enum',
    enum: TimeEntryStatus,
    default: TimeEntryStatus.DRAFT,
  })
  status: TimeEntryStatus;

  @Column({ name: 'project_name', type: 'varchar', length: 255, nullable: true })
  projectName: string;

  @Column({ name: 'task_description', type: 'text', nullable: true })
  taskDescription: string;

  @Column({ name: 'notes', type: 'text', nullable: true })
  notes: string;

  @Column({ name: 'is_billable', type: 'boolean', default: true })
  isBillable: boolean;

  @Column({ name: 'approved_by', type: 'uuid', nullable: true })
  approvedBy: string;

  @Column({ name: 'approved_at', type: 'timestamp', nullable: true })
  approvedAt: Date;

  @Column({ name: 'rejection_reason', type: 'text', nullable: true })
  rejectionReason: string;

  // Relationships
  @ManyToOne(() => Tenant)
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'approved_by' })
  approver: User;

  // Helper methods
  calculateDuration(): void {
    if (this.startTime && this.endTime) {
      const start = this.parseTime(this.startTime);
      const end = this.parseTime(this.endTime);

      let minutes = (end.hours * 60 + end.minutes) - (start.hours * 60 + start.minutes);

      // Handle overnight shifts
      if (minutes < 0) {
        minutes += 24 * 60;
      }

      this.durationMinutes = minutes;
    }
  }

  private parseTime(time: string): { hours: number; minutes: number } {
    const [hours, minutes] = time.split(':').map(Number);
    return { hours, minutes };
  }

  getDurationFormatted(): string {
    if (!this.durationMinutes) return '0h 0m';

    const hours = Math.floor(this.durationMinutes / 60);
    const minutes = this.durationMinutes % 60;

    return `${hours}h ${minutes}m`;
  }

  isApproved(): boolean {
    return this.status === TimeEntryStatus.APPROVED;
  }

  isRejected(): boolean {
    return this.status === TimeEntryStatus.REJECTED;
  }

  canEdit(): boolean {
    return this.status === TimeEntryStatus.DRAFT;
  }

  canSubmit(): boolean {
    return this.status === TimeEntryStatus.DRAFT;
  }

  canApprove(): boolean {
    return this.status === TimeEntryStatus.SUBMITTED;
  }
}
