import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsNumber,
  IsBoolean,
  Min,
  Max,
  IsArray,
  MaxLength,
  MinLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { CourseStatus, CourseLevel } from '../entities/course.entity';

export class CreateCourseDto {
  @ApiProperty({
    example: 'BHP-2024-001',
    description: 'Unique course code',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(50)
  code: string;

  @ApiProperty({
    example: 'Szkolenie BHP dla pracowników biurowych',
    description: 'Course title',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title: string;

  @ApiProperty({
    example: 'Comprehensive description of the course...',
    description: 'Full course description',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    example: 'Short description for listing',
    description: 'Short description for course listings',
    required: false,
  })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  shortDescription?: string;

  @ApiProperty({
    enum: CourseStatus,
    example: CourseStatus.DRAFT,
    description: 'Course status',
    default: CourseStatus.DRAFT,
  })
  @IsEnum(CourseStatus)
  @IsOptional()
  status?: CourseStatus;

  @ApiProperty({
    enum: CourseLevel,
    example: CourseLevel.BEGINNER,
    description: 'Course difficulty level',
    default: CourseLevel.ALL_LEVELS,
  })
  @IsEnum(CourseLevel)
  @IsOptional()
  level?: CourseLevel;

  @ApiProperty({
    example: 'Health & Safety',
    description: 'Course category',
    required: false,
  })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  category?: string;

  @ApiProperty({
    example: ['BHP', 'safety', 'workplace'],
    description: 'Course tags',
    required: false,
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];

  @ApiProperty({
    example: 299.99,
    description: 'Course price',
    default: 0,
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
    example: 8,
    description: 'Course duration in hours',
    required: false,
  })
  @IsNumber()
  @IsOptional()
  @Min(0)
  durationHours?: number;

  @ApiProperty({
    example: 2,
    description: 'Course duration in days',
    required: false,
  })
  @IsNumber()
  @IsOptional()
  @Min(0)
  durationDays?: number;

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
    example: 'https://example.com/images/course.jpg',
    description: 'Course image URL',
    required: false,
  })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  imageUrl?: string;

  @ApiProperty({
    example: 'Course syllabus content...',
    description: 'Detailed course syllabus',
    required: false,
  })
  @IsString()
  @IsOptional()
  syllabus?: string;

  @ApiProperty({
    example: 'No prerequisites required',
    description: 'Course prerequisites',
    required: false,
  })
  @IsString()
  @IsOptional()
  prerequisites?: string;

  @ApiProperty({
    example: ['Learn basic safety rules', 'Understand workplace hazards'],
    description: 'Learning objectives',
    required: false,
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  learningObjectives?: string[];

  @ApiProperty({
    example: true,
    description: 'Whether course is active',
    default: true,
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiProperty({
    example: false,
    description: 'Whether course is featured',
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  isFeatured?: boolean;

  @ApiProperty({
    example: true,
    description: 'Whether certification is provided',
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  certificationProvided?: boolean;

  @ApiProperty({
    example: 'standard-certificate',
    description: 'Certificate template identifier',
    required: false,
  })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  certificateTemplate?: string;
}
