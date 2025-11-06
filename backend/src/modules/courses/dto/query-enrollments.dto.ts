import {
  IsString,
  IsOptional,
  IsEnum,
  IsNumber,
  IsBoolean,
  IsUUID,
  IsDateString,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  EnrollmentStatus,
  PaymentStatus,
  AttendanceStatus,
} from '../entities/enrollment.entity';

export enum EnrollmentSortField {
  CREATED_AT = 'createdAt',
  ENROLLED_AT = 'enrolledAt',
  CONFIRMED_AT = 'confirmedAt',
  COMPLETED_AT = 'completedAt',
  ENROLLMENT_CODE = 'enrollmentCode',
  FINAL_GRADE = 'finalGrade',
}

export enum SortOrder {
  ASC = 'ASC',
  DESC = 'DESC',
}

export class QueryEnrollmentsDto {
  @ApiPropertyOptional({
    example: 1,
    description: 'Page number (1-based)',
    minimum: 1,
  })
  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    example: 10,
    description: 'Number of items per page',
    minimum: 1,
    maximum: 100,
  })
  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @ApiPropertyOptional({
    example: 'ENR',
    description: 'Search in enrollment code',
  })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'Filter by student ID',
  })
  @IsUUID()
  @IsOptional()
  studentId?: string;

  @ApiPropertyOptional({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'Filter by course ID',
  })
  @IsUUID()
  @IsOptional()
  courseId?: string;

  @ApiPropertyOptional({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'Filter by session ID',
  })
  @IsUUID()
  @IsOptional()
  sessionId?: string;

  @ApiPropertyOptional({
    enum: EnrollmentStatus,
    example: EnrollmentStatus.CONFIRMED,
    description: 'Filter by enrollment status',
  })
  @IsEnum(EnrollmentStatus)
  @IsOptional()
  status?: EnrollmentStatus;

  @ApiPropertyOptional({
    enum: PaymentStatus,
    example: PaymentStatus.PAID,
    description: 'Filter by payment status',
  })
  @IsEnum(PaymentStatus)
  @IsOptional()
  paymentStatus?: PaymentStatus;

  @ApiPropertyOptional({
    enum: AttendanceStatus,
    example: AttendanceStatus.PRESENT,
    description: 'Filter by attendance status',
  })
  @IsEnum(AttendanceStatus)
  @IsOptional()
  attendanceStatus?: AttendanceStatus;

  @ApiPropertyOptional({
    example: true,
    description: 'Filter by passed status',
  })
  @Type(() => Boolean)
  @IsBoolean()
  @IsOptional()
  passed?: boolean;

  @ApiPropertyOptional({
    example: false,
    description: 'Filter by certificate issued status',
  })
  @Type(() => Boolean)
  @IsBoolean()
  @IsOptional()
  certificateIssued?: boolean;

  @ApiPropertyOptional({
    example: false,
    description: 'Filter by waitlist status',
  })
  @Type(() => Boolean)
  @IsBoolean()
  @IsOptional()
  isWaitlist?: boolean;

  @ApiPropertyOptional({
    example: '2025-01-01T00:00:00Z',
    description: 'Filter enrollments enrolled after this date (ISO 8601)',
  })
  @IsDateString()
  @IsOptional()
  enrolledAfter?: string;

  @ApiPropertyOptional({
    example: '2025-12-31T23:59:59Z',
    description: 'Filter enrollments enrolled before this date (ISO 8601)',
  })
  @IsDateString()
  @IsOptional()
  enrolledBefore?: string;

  @ApiPropertyOptional({
    example: '2025-01-01T00:00:00Z',
    description: 'Filter enrollments where session starts after this date (ISO 8601)',
  })
  @IsDateString()
  @IsOptional()
  sessionStartAfter?: string;

  @ApiPropertyOptional({
    example: '2025-12-31T23:59:59Z',
    description: 'Filter enrollments where session starts before this date (ISO 8601)',
  })
  @IsDateString()
  @IsOptional()
  sessionStartBefore?: string;

  @ApiPropertyOptional({
    enum: EnrollmentSortField,
    example: EnrollmentSortField.ENROLLED_AT,
    description: 'Field to sort by',
  })
  @IsEnum(EnrollmentSortField)
  @IsOptional()
  sortBy?: EnrollmentSortField = EnrollmentSortField.ENROLLED_AT;

  @ApiPropertyOptional({
    enum: SortOrder,
    example: SortOrder.DESC,
    description: 'Sort order',
  })
  @IsEnum(SortOrder)
  @IsOptional()
  sortOrder?: SortOrder = SortOrder.DESC;
}
