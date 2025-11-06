import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose, Type } from 'class-transformer';
import {
  EnrollmentStatus,
  PaymentStatus,
  AttendanceStatus,
} from '../entities/enrollment.entity';
import { CourseResponseDto } from './course-response.dto';
import { CourseSessionResponseDto } from './course-session-response.dto';
import { UserResponseDto } from '@/modules/users/dto/user-response.dto';

@Exclude()
export class EnrollmentResponseDto {
  @Expose()
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  id: string;

  @Expose()
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  studentId: string;

  @Expose()
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  courseId: string;

  @Expose()
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  sessionId: string;

  @Expose()
  @ApiProperty({ example: 'ENR-2024-001' })
  enrollmentCode: string;

  @Expose()
  @ApiProperty({ enum: EnrollmentStatus, example: EnrollmentStatus.CONFIRMED })
  status: EnrollmentStatus;

  @Expose()
  @ApiProperty({ enum: PaymentStatus, example: PaymentStatus.PAID })
  paymentStatus: PaymentStatus;

  @Expose()
  @ApiProperty({ enum: AttendanceStatus, example: AttendanceStatus.PRESENT })
  attendanceStatus: AttendanceStatus;

  @Expose()
  @ApiProperty({ example: '2024-01-01T10:00:00Z' })
  enrolledAt: Date;

  @Expose()
  @ApiProperty({ example: '2024-01-02T10:00:00Z', required: false })
  confirmedAt?: Date;

  @Expose()
  @ApiProperty({ example: '2024-01-20T10:00:00Z', required: false })
  completedAt?: Date;

  @Expose()
  @ApiProperty({ example: 299.99, required: false })
  price?: number;

  @Expose()
  @ApiProperty({ example: 'PLN' })
  currency: string;

  @Expose()
  @ApiProperty({ example: 299.99 })
  amountPaid: number;

  @Expose()
  @ApiProperty({ example: '2024-01-05T10:00:00Z', required: false })
  paymentDate?: Date;

  @Expose()
  @ApiProperty({ example: 'PAY-123456', required: false })
  paymentReference?: string;

  @Expose()
  @ApiProperty({ example: 95 })
  attendancePercentage: number;

  @Expose()
  @ApiProperty({ example: 100 })
  completionPercentage: number;

  @Expose()
  @ApiProperty({ example: 85.5, required: false })
  finalGrade?: number;

  @Expose()
  @ApiProperty({ example: true, required: false })
  passed?: boolean;

  @Expose()
  @ApiProperty({ example: false })
  certificateIssued: boolean;

  @Expose()
  @ApiProperty({ example: '2024-01-21T10:00:00Z', required: false })
  certificateIssuedAt?: Date;

  @Expose()
  @ApiProperty({ example: 'CERT-2024-001', required: false })
  certificateNumber?: string;

  @Expose()
  @ApiProperty({ example: 'https://example.com/certificates/123', required: false })
  certificateUrl?: string;

  @Expose()
  @ApiProperty({ example: 'Student notes', required: false })
  notes?: string;

  // internalNotes excluded from response for privacy

  @Expose()
  @ApiProperty({ example: true })
  sendNotifications: boolean;

  @Expose()
  @ApiProperty({ example: false })
  isWaitlist: boolean;

  @Expose()
  @ApiProperty({ example: 1, required: false })
  waitlistPosition?: number;

  @Expose()
  @ApiProperty({ example: '2024-01-01T10:00:00Z' })
  createdAt: Date;

  @Expose()
  @ApiProperty({ example: '2024-01-10T15:30:00Z' })
  updatedAt: Date;

  // Optional: Include related entities if loaded
  @Expose()
  @ApiProperty({ type: () => CourseResponseDto, required: false })
  @Type(() => CourseResponseDto)
  course?: CourseResponseDto;

  @Expose()
  @ApiProperty({ type: () => CourseSessionResponseDto, required: false })
  @Type(() => CourseSessionResponseDto)
  session?: CourseSessionResponseDto;

  @Expose()
  @ApiProperty({ type: () => UserResponseDto, required: false })
  @Type(() => UserResponseDto)
  student?: UserResponseDto;
}

export class PaginatedEnrollmentsResponseDto {
  @ApiProperty({ type: [EnrollmentResponseDto] })
  @Type(() => EnrollmentResponseDto)
  data: EnrollmentResponseDto[];

  @ApiProperty({ example: 50 })
  total: number;

  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 10 })
  limit: number;

  @ApiProperty({ example: 5 })
  totalPages: number;
}
