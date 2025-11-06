import {
  IsString,
  IsOptional,
  IsEnum,
  IsNumber,
  IsBoolean,
  IsUUID,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { CourseStatus, CourseLevel } from '../entities/course.entity';

export enum CourseSortField {
  CREATED_AT = 'createdAt',
  UPDATED_AT = 'updatedAt',
  TITLE = 'title',
  CODE = 'code',
  PRICE = 'price',
  PUBLISHED_AT = 'publishedAt',
}

export enum SortOrder {
  ASC = 'ASC',
  DESC = 'DESC',
}

export class QueryCoursesDto {
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
    example: 'BHP',
    description: 'Search in course title, description, and code',
  })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({
    enum: CourseStatus,
    example: CourseStatus.PUBLISHED,
    description: 'Filter by course status',
  })
  @IsEnum(CourseStatus)
  @IsOptional()
  status?: CourseStatus;

  @ApiPropertyOptional({
    enum: CourseLevel,
    example: CourseLevel.BEGINNER,
    description: 'Filter by course level',
  })
  @IsEnum(CourseLevel)
  @IsOptional()
  level?: CourseLevel;

  @ApiPropertyOptional({
    example: 'Health & Safety',
    description: 'Filter by category',
  })
  @IsString()
  @IsOptional()
  category?: string;

  @ApiPropertyOptional({
    example: true,
    description: 'Filter by active status',
  })
  @Type(() => Boolean)
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiPropertyOptional({
    example: true,
    description: 'Filter by featured status',
  })
  @Type(() => Boolean)
  @IsBoolean()
  @IsOptional()
  isFeatured?: boolean;

  @ApiPropertyOptional({
    example: '9bfea941-587d-4441-895d-4589b1ef574f',
    description: 'Filter by tenant ID (SUPER_ADMIN only)',
  })
  @IsUUID()
  @IsOptional()
  tenantId?: string;

  @ApiPropertyOptional({
    enum: CourseSortField,
    example: CourseSortField.CREATED_AT,
    description: 'Field to sort by',
  })
  @IsEnum(CourseSortField)
  @IsOptional()
  sortBy?: CourseSortField = CourseSortField.CREATED_AT;

  @ApiPropertyOptional({
    enum: SortOrder,
    example: SortOrder.DESC,
    description: 'Sort order',
  })
  @IsEnum(SortOrder)
  @IsOptional()
  sortOrder?: SortOrder = SortOrder.DESC;
}
