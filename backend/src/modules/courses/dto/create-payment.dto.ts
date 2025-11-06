import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsNumber,
  IsUUID,
  IsDateString,
  Min,
  MaxLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PaymentType, PaymentMethod } from '../entities/payment.entity';

export class CreatePaymentDto {
  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'Enrollment ID',
  })
  @IsUUID()
  @IsNotEmpty()
  enrollmentId: string;

  @ApiProperty({
    enum: PaymentType,
    example: PaymentType.PAYMENT,
    description: 'Type of payment (payment, refund, or adjustment)',
    default: PaymentType.PAYMENT,
  })
  @IsEnum(PaymentType)
  @IsOptional()
  paymentType?: PaymentType;

  @ApiProperty({
    example: 150.00,
    description: 'Payment amount',
  })
  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  amount: number;

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
    enum: PaymentMethod,
    example: PaymentMethod.BANK_TRANSFER,
    description: 'Payment method',
    default: PaymentMethod.CASH,
  })
  @IsEnum(PaymentMethod)
  @IsOptional()
  paymentMethod?: PaymentMethod;

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
  referenceNumber?: string;

  @ApiProperty({
    example: 'Partial payment for course enrollment',
    description: 'Payment description',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    example: 'Payment received via bank transfer',
    description: 'Additional notes about the payment',
    required: false,
  })
  @IsString()
  @IsOptional()
  notes?: string;
}
