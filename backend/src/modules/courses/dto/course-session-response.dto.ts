import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose, Type } from 'class-transformer';
import { SessionStatus, SessionType } from '../entities/course-session.entity';
import { CourseResponseDto } from './course-response.dto';

@Exclude()
export class CourseSessionResponseDto {
  @Expose()
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  id: string;

  @Expose()
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  courseId: string;

  @Expose()
  @ApiProperty({ example: 'BHP-2024-001-S01' })
  sessionCode: string;

  @Expose()
  @ApiProperty({ example: 'BHP - Styczeń 2024 - Warszawa' })
  sessionName: string;

  @Expose()
  @ApiProperty({ example: 'Szkolenie BHP - sesja styczniowa', required: false })
  description?: string;

  @Expose()
  @ApiProperty({ enum: SessionStatus, example: SessionStatus.SCHEDULED })
  status: SessionStatus;

  @Expose()
  @ApiProperty({ enum: SessionType, example: SessionType.IN_PERSON })
  sessionType: SessionType;

  @Expose()
  @ApiProperty({ example: '2024-01-15T09:00:00Z' })
  startDate: Date;

  @Expose()
  @ApiProperty({ example: '2024-01-15T17:00:00Z' })
  endDate: Date;

  @Expose()
  @ApiProperty({ example: '2024-01-10T23:59:59Z', required: false })
  registrationDeadline?: Date;

  @Expose()
  @ApiProperty({ example: 'Conference Room A', required: false })
  location?: string;

  @Expose()
  @ApiProperty({ example: 'ul. Marszałkowska 123', required: false })
  address?: string;

  @Expose()
  @ApiProperty({ example: 'Warszawa', required: false })
  city?: string;

  @Expose()
  @ApiProperty({ example: '00-001', required: false })
  postalCode?: string;

  @Expose()
  @ApiProperty({ example: 'https://zoom.us/j/123456789', required: false })
  onlineMeetingUrl?: string;

  @Expose()
  @ApiProperty({ example: '123 456 789', required: false })
  onlineMeetingId?: string;

  // Exclude password from response for security
  // onlineMeetingPassword is not exposed

  @Expose()
  @ApiProperty({ example: 'Jan Kowalski', required: false })
  instructorName?: string;

  @Expose()
  @ApiProperty({ example: 'jan.kowalski@example.com', required: false })
  instructorEmail?: string;

  @Expose()
  @ApiProperty({ example: '+48 123 456 789', required: false })
  instructorPhone?: string;

  @Expose()
  @ApiProperty({ example: 20, required: false })
  maxParticipants?: number;

  @Expose()
  @ApiProperty({ example: 5, required: false })
  minParticipants?: number;

  @Expose()
  @ApiProperty({ example: 0 })
  currentParticipants: number;

  @Expose()
  @ApiProperty({ example: 299.99, required: false })
  price?: number;

  @Expose()
  @ApiProperty({ example: 'PLN' })
  currency: string;

  @Expose()
  @ApiProperty({ example: 'Bring your own laptop', required: false })
  notes?: string;

  @Expose()
  @ApiProperty({ example: true })
  isActive: boolean;

  @Expose()
  @ApiProperty({ example: true })
  isRegistrationOpen: boolean;

  @Expose()
  @ApiProperty({ example: true })
  sendReminders: boolean;

  @Expose()
  @ApiProperty({ example: 7 })
  reminderDaysBefore: number;

  @Expose()
  @ApiProperty({ example: '2024-01-01T10:00:00Z' })
  createdAt: Date;

  @Expose()
  @ApiProperty({ example: '2024-01-10T15:30:00Z' })
  updatedAt: Date;

  // Optional: Include course details if loaded
  @Expose()
  @ApiProperty({ type: () => CourseResponseDto, required: false })
  @Type(() => CourseResponseDto)
  course?: CourseResponseDto;
}

export class PaginatedCourseSessionsResponseDto {
  @ApiProperty({ type: [CourseSessionResponseDto] })
  @Type(() => CourseSessionResponseDto)
  data: CourseSessionResponseDto[];

  @ApiProperty({ example: 50 })
  total: number;

  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 10 })
  limit: number;

  @ApiProperty({ example: 5 })
  totalPages: number;
}
