import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { TenantBaseEntity } from '@/database/entities/base.entity';
import { Tenant } from '@/modules/tenant/entities/tenant.entity';
import { Enrollment } from './enrollment.entity';

export enum PaymentType {
  PAYMENT = 'payment',
  REFUND = 'refund',
  ADJUSTMENT = 'adjustment',
}

export enum PaymentMethod {
  CASH = 'cash',
  CARD = 'card',
  BANK_TRANSFER = 'bank_transfer',
  ONLINE = 'online',
  OTHER = 'other',
}

@Entity('payment')
export class Payment extends TenantBaseEntity {
  @Column({ name: 'enrollment_id', type: 'uuid' })
  enrollmentId: string;

  @Column({
    name: 'payment_type',
    type: 'enum',
    enum: PaymentType,
    default: PaymentType.PAYMENT,
  })
  paymentType: PaymentType;

  @Column({ name: 'amount', type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({ name: 'currency', type: 'varchar', length: 3, default: 'PLN' })
  currency: string;

  @Column({
    name: 'payment_method',
    type: 'enum',
    enum: PaymentMethod,
    default: PaymentMethod.CASH,
  })
  paymentMethod: PaymentMethod;

  @Column({ name: 'payment_date', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  paymentDate: Date;

  @Column({ name: 'reference_number', type: 'varchar', length: 255, nullable: true })
  referenceNumber: string;

  @Column({ name: 'description', type: 'text', nullable: true })
  description: string;

  @Column({ name: 'notes', type: 'text', nullable: true })
  notes: string;

  @Column({ name: 'processed_by', type: 'uuid', nullable: true })
  processedBy: string;

  // Relationships
  @ManyToOne(() => Tenant)
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant;

  @ManyToOne(() => Enrollment, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'enrollment_id' })
  enrollment: Enrollment;

  // Helper methods
  isRefund(): boolean {
    return this.paymentType === PaymentType.REFUND;
  }

  getFormattedAmount(): string {
    const prefix = this.paymentType === PaymentType.REFUND ? '-' : '';
    return `${prefix}${this.amount} ${this.currency}`;
  }
}
