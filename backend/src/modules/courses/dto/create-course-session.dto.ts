import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsNumber,
  IsBoolean,
  IsDateString,
  IsUUID,
  Min,
  MaxLength,
  MinLength,
  IsUrl,
  IsEmail,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { SessionStatus, SessionType } from '../entities/course-session.entity';

export class CreateCourseSessionDto {
  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'Course ID',
  })
  @IsUUID()
  @IsNotEmpty()
  courseId: string;

  @ApiProperty({
    example: 'BHP-2024-001-S01',
    description: 'Unique session code',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(50)
  sessionCode: string;

  @ApiProperty({
    example: 'BHP - Styczeń 2024 - Warszawa',
    description: 'Session name',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  sessionName: string;

  @ApiProperty({
    example: 'Szkolenie BHP dla pracowników biurowych - sesja styczniowa',
    description: 'Session description',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    enum: SessionStatus,
    example: SessionStatus.SCHEDULED,
    description: 'Session status',
    default: SessionStatus.SCHEDULED,
  })
  @IsEnum(SessionStatus)
  @IsOptional()
  status?: SessionStatus;

  @ApiProperty({
    enum: SessionType,
    example: SessionType.IN_PERSON,
    description: 'Session type',
    default: SessionType.IN_PERSON,
  })
  @IsEnum(SessionType)
  @IsOptional()
  sessionType?: SessionType;

  @ApiProperty({
    example: '2024-01-15T09:00:00Z',
    description: 'Session start date and time',
  })
  @IsDateString()
  @IsNotEmpty()
  startDate: string;

  @ApiProperty({
    example: '2024-01-15T17:00:00Z',
    description: 'Session end date and time',
  })
  @IsDateString()
  @IsNotEmpty()
  endDate: string;

  @ApiProperty({
    example: '2024-01-10T23:59:59Z',
    description: 'Registration deadline',
    required: false,
  })
  @IsDateString()
  @IsOptional()
  registrationDeadline?: string;

  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174001',
    description: 'Location ID (reference to Location entity)',
    required: false,
  })
  @IsUUID()
  @IsOptional()
  locationId?: string;

  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174002',
    description: 'Instructor ID (reference to User entity)',
    required: false,
  })
  @IsUUID()
  @IsOptional()
  instructorId?: string;

  @ApiProperty({
    example: 'Conference Room A',
    description: 'Session location name',
    required: false,
  })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  location?: string;

  @ApiProperty({
    example: 'ul. Marszałkowska 123',
    description: 'Physical address',
    required: false,
  })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiProperty({
    example: 'Warszawa',
    description: 'City',
    required: false,
  })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  city?: string;

  @ApiProperty({
    example: '00-001',
    description: 'Postal code',
    required: false,
  })
  @IsString()
  @IsOptional()
  @MaxLength(20)
  postalCode?: string;

  @ApiProperty({
    example: 'https://zoom.us/j/123456789',
    description: 'Online meeting URL',
    required: false,
  })
  @IsUrl()
  @IsOptional()
  @MaxLength(500)
  onlineMeetingUrl?: string;

  @ApiProperty({
    example: '123 456 789',
    description: 'Online meeting ID',
    required: false,
  })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  onlineMeetingId?: string;

  @ApiProperty({
    example: 'SecretPass123',
    description: 'Online meeting password',
    required: false,
  })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  onlineMeetingPassword?: string;

  @ApiProperty({
    example: 'Jan Kowalski',
    description: 'Instructor name',
    required: false,
  })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  instructorName?: string;

  @ApiProperty({
    example: 'jan.kowalski@example.com',
    description: 'Instructor email',
    required: false,
  })
  @IsEmail()
  @IsOptional()
  @MaxLength(255)
  instructorEmail?: string;

  @ApiProperty({
    example: '+48 123 456 789',
    description: 'Instructor phone',
    required: false,
  })
  @IsString()
  @IsOptional()
  @MaxLength(50)
  instructorPhone?: string;

  @ApiProperty({
    example: 20,
    description: 'Maximum number of participants',
    required: false,
  })
  @IsNumber()
  @IsOptional()
  @Min(1)
  maxParticipants?: number;

  @ApiProperty({
    example: 5,
    description: 'Minimum number of participants',
    default: 1,
  })
  @IsNumber()
  @IsOptional()
  @Min(1)
  minParticipants?: number;

  @ApiProperty({
    example: 299.99,
    description: 'Session price (overrides course price if set)',
    required: false,
  })
  @IsNumber()
  @IsOptional()
  @Min(0)
  price?: number;

  @ApiProperty({
    example: 'PLN',
    description: 'Currency code (ISO 4217)',
    default: 'PLN',
  })
  @IsString()
  @IsOptional()
  @MaxLength(3)
  currency?: string;

  @ApiProperty({
    example: 'Bring your own laptop. Lunch provided.',
    description: 'Additional notes',
    required: false,
  })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiProperty({
    example: true,
    description: 'Whether session is active',
    default: true,
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiProperty({
    example: true,
    description: 'Whether registration is open',
    default: true,
  })
  @IsBoolean()
  @IsOptional()
  isRegistrationOpen?: boolean;

  @ApiProperty({
    example: true,
    description: 'Whether to send reminders',
    default: true,
  })
  @IsBoolean()
  @IsOptional()
  sendReminders?: boolean;

  @ApiProperty({
    example: 7,
    description: 'Number of days before to send reminder',
    default: 7,
  })
  @IsNumber()
  @IsOptional()
  @Min(1)
  reminderDaysBefore?: number;
}
