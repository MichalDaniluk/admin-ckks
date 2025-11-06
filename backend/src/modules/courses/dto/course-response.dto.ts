import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose, Type } from 'class-transformer';
import { CourseStatus, CourseLevel } from '../entities/course.entity';

@Exclude()
export class CourseResponseDto {
  @Expose()
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  id: string;

  @Expose()
  @ApiProperty({ example: '9bfea941-587d-4441-895d-4589b1ef574f' })
  tenantId: string;

  @Expose()
  @ApiProperty({ example: 'BHP-2024-001' })
  code: string;

  @Expose()
  @ApiProperty({ example: 'Szkolenie BHP dla pracowników biurowych' })
  title: string;

  @Expose()
  @ApiProperty({ example: 'Comprehensive course description...', required: false })
  description?: string;

  @Expose()
  @ApiProperty({ example: 'Short description for listing', required: false })
  shortDescription?: string;

  @Expose()
  @ApiProperty({ enum: CourseStatus, example: CourseStatus.PUBLISHED })
  status: CourseStatus;

  @Expose()
  @ApiProperty({ enum: CourseLevel, example: CourseLevel.BEGINNER })
  level: CourseLevel;

  @Expose()
  @ApiProperty({ example: 'Health & Safety', required: false })
  category?: string;

  @Expose()
  @ApiProperty({ example: ['BHP', 'safety', 'workplace'], type: [String], required: false })
  tags?: string[];

  @Expose()
  @ApiProperty({ example: 299.99 })
  price: number;

  @Expose()
  @ApiProperty({ example: 'PLN' })
  currency: string;

  @Expose()
  @ApiProperty({ example: 8, required: false })
  durationHours?: number;

  @Expose()
  @ApiProperty({ example: 2, required: false })
  durationDays?: number;

  @Expose()
  @ApiProperty({ example: 20, required: false })
  maxParticipants?: number;

  @Expose()
  @ApiProperty({ example: 5, required: false })
  minParticipants?: number;

  @Expose()
  @ApiProperty({ example: 'https://example.com/images/course.jpg', required: false })
  imageUrl?: string;

  @Expose()
  @ApiProperty({ example: 'https://example.com/images/thumb.jpg', required: false })
  thumbnailUrl?: string;

  @Expose()
  @ApiProperty({ example: 'Course syllabus content...', required: false })
  syllabus?: string;

  @Expose()
  @ApiProperty({ example: 'No prerequisites required', required: false })
  prerequisites?: string;

  @Expose()
  @ApiProperty({
    example: ['Learn basic safety rules', 'Understand workplace hazards'],
    type: [String],
    required: false,
  })
  learningObjectives?: string[];

  @Expose()
  @ApiProperty({ example: true })
  isActive: boolean;

  @Expose()
  @ApiProperty({ example: false })
  isFeatured: boolean;

  @Expose()
  @ApiProperty({ example: false })
  certificationProvided: boolean;

  @Expose()
  @ApiProperty({ example: 'standard-certificate', required: false })
  certificateTemplate?: string;

  @Expose()
  @ApiProperty({ example: '2024-01-15T10:00:00Z', required: false })
  publishedAt?: Date;

  @Expose()
  @ApiProperty({ example: '2024-01-01T10:00:00Z' })
  createdAt: Date;

  @Expose()
  @ApiProperty({ example: '2024-01-10T15:30:00Z' })
  updatedAt: Date;
}

export class PaginatedCoursesResponseDto {
  @ApiProperty({ type: [CourseResponseDto] })
  @Type(() => CourseResponseDto)
  data: CourseResponseDto[];

  @ApiProperty({ example: 50 })
  total: number;

  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 10 })
  limit: number;

  @ApiProperty({ example: 5 })
  totalPages: number;
}
