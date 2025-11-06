import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Payment, PaymentType } from './entities/payment.entity';
import { Enrollment, PaymentStatus } from './entities/enrollment.entity';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { TenantContextService } from '@/common/tenant/tenant-context.service';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
    @InjectRepository(Enrollment)
    private readonly enrollmentRepository: Repository<Enrollment>,
    private readonly tenantContext: TenantContextService,
    private readonly dataSource: DataSource,
  ) {}

  /**
   * Create a new payment and update enrollment totals
   */
  async create(
    createPaymentDto: CreatePaymentDto,
    processedBy?: string,
  ): Promise<Payment> {
    const tenantId = this.tenantContext.getTenantId();

    if (!tenantId) {
      throw new BadRequestException('Tenant context not found');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Verify enrollment exists and belongs to tenant
      const enrollment = await queryRunner.manager.findOne(Enrollment, {
        where: { id: createPaymentDto.enrollmentId, tenantId },
      });

      if (!enrollment) {
        throw new NotFoundException(
          `Enrollment with ID '${createPaymentDto.enrollmentId}' not found`,
        );
      }

      // Create payment record
      const payment = queryRunner.manager.create(Payment, {
        ...createPaymentDto,
        tenantId,
        processedBy,
        currency: createPaymentDto.currency || enrollment.currency || 'PLN',
        paymentType: createPaymentDto.paymentType || PaymentType.PAYMENT,
        paymentDate: createPaymentDto.paymentDate
          ? new Date(createPaymentDto.paymentDate)
          : new Date(),
      });

      const savedPayment = await queryRunner.manager.save(Payment, payment);

      // Update enrollment totals
      await this.recalculateEnrollmentPayment(enrollment.id, queryRunner.manager);

      await queryRunner.commitTransaction();

      return this.findOne(savedPayment.id);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Find all payments for an enrollment
   */
  async findByEnrollment(enrollmentId: string): Promise<Payment[]> {
    const tenantId = this.tenantContext.getTenantId();

    if (!tenantId) {
      throw new BadRequestException('Tenant context not found');
    }

    return this.paymentRepository.find({
      where: { enrollmentId, tenantId },
      order: { paymentDate: 'DESC', createdAt: 'DESC' },
    });
  }

  /**
   * Find payment by ID
   */
  async findOne(id: string): Promise<Payment> {
    const tenantId = this.tenantContext.getTenantId();

    if (!tenantId) {
      throw new BadRequestException('Tenant context not found');
    }

    const payment = await this.paymentRepository.findOne({
      where: { id, tenantId },
      relations: ['enrollment'],
    });

    if (!payment) {
      throw new NotFoundException(`Payment with ID '${id}' not found`);
    }

    return payment;
  }

  /**
   * Update payment
   */
  async update(id: string, updatePaymentDto: UpdatePaymentDto): Promise<Payment> {
    const tenantId = this.tenantContext.getTenantId();

    if (!tenantId) {
      throw new BadRequestException('Tenant context not found');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const payment = await queryRunner.manager.findOne(Payment, {
        where: { id, tenantId },
        relations: ['enrollment'],
      });

      if (!payment) {
        throw new NotFoundException(`Payment with ID '${id}' not found`);
      }

      // Update payment fields
      Object.assign(payment, updatePaymentDto);

      if (updatePaymentDto.paymentDate) {
        payment.paymentDate = new Date(updatePaymentDto.paymentDate);
      }

      const updatedPayment = await queryRunner.manager.save(Payment, payment);

      // Recalculate enrollment totals
      await this.recalculateEnrollmentPayment(payment.enrollmentId, queryRunner.manager);

      await queryRunner.commitTransaction();

      return this.findOne(updatedPayment.id);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Delete payment
   */
  async remove(id: string): Promise<void> {
    const tenantId = this.tenantContext.getTenantId();

    if (!tenantId) {
      throw new BadRequestException('Tenant context not found');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const payment = await queryRunner.manager.findOne(Payment, {
        where: { id, tenantId },
      });

      if (!payment) {
        throw new NotFoundException(`Payment with ID '${id}' not found`);
      }

      const enrollmentId = payment.enrollmentId;

      await queryRunner.manager.remove(Payment, payment);

      // Recalculate enrollment totals
      await this.recalculateEnrollmentPayment(enrollmentId, queryRunner.manager);

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Recalculate enrollment payment totals based on all payment records
   */
  private async recalculateEnrollmentPayment(
    enrollmentId: string,
    manager: any,
  ): Promise<void> {
    const tenantId = this.tenantContext.getTenantId();

    // Get all payments for this enrollment
    const payments = await manager.find(Payment, {
      where: { enrollmentId, tenantId },
    });

    // Calculate total paid (payments - refunds)
    let totalPaid = 0;
    let lastPaymentDate: Date | null = null;
    let lastPaymentReference: string | null = null;

    for (const payment of payments) {
      if (payment.paymentType === PaymentType.REFUND) {
        totalPaid -= payment.amount;
      } else {
        totalPaid += payment.amount;
      }

      // Keep track of the most recent payment details
      if (!lastPaymentDate || payment.paymentDate > lastPaymentDate) {
        lastPaymentDate = payment.paymentDate;
        lastPaymentReference = payment.referenceNumber;
      }
    }

    // Update enrollment
    const enrollment = await manager.findOne(Enrollment, {
      where: { id: enrollmentId, tenantId },
    });

    if (enrollment) {
      enrollment.amountPaid = totalPaid;
      enrollment.paymentDate = lastPaymentDate;
      enrollment.paymentReference = lastPaymentReference;

      // Update payment status based on amount paid
      if (totalPaid <= 0) {
        enrollment.paymentStatus = PaymentStatus.UNPAID;
      } else if (enrollment.price && totalPaid >= enrollment.price) {
        enrollment.paymentStatus = PaymentStatus.PAID;
      } else {
        enrollment.paymentStatus = PaymentStatus.PARTIAL;
      }

      await manager.save(Enrollment, enrollment);
    }
  }

  /**
   * Get payment summary for enrollment
   */
  async getPaymentSummary(enrollmentId: string): Promise<{
    totalPaid: number;
    totalRefunded: number;
    netAmount: number;
    paymentsCount: number;
    refundsCount: number;
    lastPaymentDate: Date | null;
  }> {
    const payments = await this.findByEnrollment(enrollmentId);

    let totalPaid = 0;
    let totalRefunded = 0;
    let paymentsCount = 0;
    let refundsCount = 0;
    let lastPaymentDate: Date | null = null;

    for (const payment of payments) {
      if (payment.paymentType === PaymentType.REFUND) {
        totalRefunded += payment.amount;
        refundsCount++;
      } else {
        totalPaid += payment.amount;
        paymentsCount++;
      }

      if (!lastPaymentDate || payment.paymentDate > lastPaymentDate) {
        lastPaymentDate = payment.paymentDate;
      }
    }

    return {
      totalPaid,
      totalRefunded,
      netAmount: totalPaid - totalRefunded,
      paymentsCount,
      refundsCount,
      lastPaymentDate,
    };
  }
}
