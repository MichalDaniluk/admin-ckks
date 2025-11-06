import { PartialType } from '@nestjs/swagger';
import { CreatePaymentDto } from './create-payment.dto';
import { IsOptional, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdatePaymentDto extends PartialType(CreatePaymentDto) {
  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'Enrollment ID',
    required: false,
  })
  @IsUUID()
  @IsOptional()
  enrollmentId?: string;
}
