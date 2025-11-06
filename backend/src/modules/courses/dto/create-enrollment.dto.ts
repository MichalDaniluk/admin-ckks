import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsNumber,
  IsBoolean,
  IsUUID,
  IsDateString,
  Min,
  MaxLength,
  MinLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { EnrollmentStatus, PaymentStatus } from '../entities/enrollment.entity';

export class CreateEnrollmentDto {
  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'Student user ID',
  })
  @IsUUID()
  @IsNotEmpty()
  studentId: string;

  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'Course session ID',
  })
  @IsUUID()
  @IsNotEmpty()
  sessionId: string;

  @ApiProperty({
    example: 'ENR-2024-001',
    description: 'Unique enrollment code (auto-generated if not provided)',
    required: false,
  })
  @IsString()
  @IsOptional()
  @MinLength(3)
  @MaxLength(50)
  enrollmentCode?: string;

  @ApiProperty({
    enum: EnrollmentStatus,
    example: EnrollmentStatus.PENDING,
    description: 'Enrollment status',
    default: EnrollmentStatus.PENDING,
  })
  @IsEnum(EnrollmentStatus)
  @IsOptional()
  status?: EnrollmentStatus;

  @ApiProperty({
    enum: PaymentStatus,
    example: PaymentStatus.UNPAID,
    description: 'Payment status',
    default: PaymentStatus.UNPAID,
  })
  @IsEnum(PaymentStatus)
  @IsOptional()
  paymentStatus?: PaymentStatus;

  @ApiProperty({
    example: 299.99,
    description: 'Enrollment price (defaults to session or course price)',
    required: false,
  })
  @IsNumber()
  @IsOptional()
  @Min(0)
  price?: number;

  @ApiProperty({
    example: 'PLN',
    description: 'Currency code',
    default: 'PLN',
  })
  @IsString()
  @IsOptional()
  @MaxLength(3)
  currency?: string;

  @ApiProperty({
    example: 'Student requested enrollment via email',
    description: 'Notes about the enrollment',
    required: false,
  })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiProperty({
    example: 'Internal note: Check payment status',
    description: 'Internal notes (not visible to student)',
    required: false,
  })
  @IsString()
  @IsOptional()
  internalNotes?: string;

  @ApiProperty({
    example: true,
    description: 'Whether to send notifications to student',
    default: true,
  })
  @IsBoolean()
  @IsOptional()
  sendNotifications?: boolean;

  @ApiProperty({
    example: false,
    description: 'Whether this is a waitlist enrollment',
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  isWaitlist?: boolean;

  @ApiProperty({
    example: 150.00,
    description: 'Amount paid by student',
    required: false,
    default: 0,
  })
  @IsNumber()
  @IsOptional()
  @Min(0)
  amountPaid?: number;

  @ApiProperty({
    example: '2024-01-15T10:00:00Z',
    description: 'Date of payment',
    required: false,
  })
  @IsDateString()
  @IsOptional()
  paymentDate?: string;

  @ApiProperty({
    example: 'TRF-2024-001',
    description: 'Payment reference number or transaction ID',
    required: false,
  })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  paymentReference?: string;
}
