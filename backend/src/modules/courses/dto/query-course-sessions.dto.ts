import {
  IsString,
  IsOptional,
  IsEnum,
  IsNumber,
  IsBoolean,
  IsDateString,
  IsUUID,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { SessionStatus, SessionType } from '../entities/course-session.entity';

export enum SessionSortField {
  CREATED_AT = 'createdAt',
  UPDATED_AT = 'updatedAt',
  START_DATE = 'startDate',
  END_DATE = 'endDate',
  SESSION_CODE = 'sessionCode',
  SESSION_NAME = 'sessionName',
  CURRENT_PARTICIPANTS = 'currentParticipants',
}

export enum SortOrder {
  ASC = 'ASC',
  DESC = 'DESC',
}

export class QueryCourseSessionsDto {
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
    description: 'Search in session name, code, and description',
  })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'Filter by course ID',
  })
  @IsUUID()
  @IsOptional()
  courseId?: string;

  @ApiPropertyOptional({
    enum: SessionStatus,
    example: SessionStatus.SCHEDULED,
    description: 'Filter by session status',
  })
  @IsEnum(SessionStatus)
  @IsOptional()
  status?: SessionStatus;

  @ApiPropertyOptional({
    enum: SessionType,
    example: SessionType.IN_PERSON,
    description: 'Filter by session type',
  })
  @IsEnum(SessionType)
  @IsOptional()
  sessionType?: SessionType;

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
    description: 'Filter by registration open status',
  })
  @Type(() => Boolean)
  @IsBoolean()
  @IsOptional()
  isRegistrationOpen?: boolean;

  @ApiPropertyOptional({
    example: '2024-01-01T00:00:00Z',
    description: 'Filter sessions starting from this date',
  })
  @IsDateString()
  @IsOptional()
  startDateFrom?: string;

  @ApiPropertyOptional({
    example: '2024-12-31T23:59:59Z',
    description: 'Filter sessions starting until this date',
  })
  @IsDateString()
  @IsOptional()
  startDateTo?: string;

  @ApiPropertyOptional({
    example: true,
    description: 'Filter only upcoming sessions (start date in future)',
  })
  @Type(() => Boolean)
  @IsBoolean()
  @IsOptional()
  upcomingOnly?: boolean;

  @ApiPropertyOptional({
    example: true,
    description: 'Filter only past sessions (end date in past)',
  })
  @Type(() => Boolean)
  @IsBoolean()
  @IsOptional()
  pastOnly?: boolean;

  @ApiPropertyOptional({
    example: 'Warszawa',
    description: 'Filter by city',
  })
  @IsString()
  @IsOptional()
  city?: string;

  @ApiPropertyOptional({
    enum: SessionSortField,
    example: SessionSortField.START_DATE,
    description: 'Field to sort by',
  })
  @IsEnum(SessionSortField)
  @IsOptional()
  sortBy?: SessionSortField = SessionSortField.START_DATE;

  @ApiPropertyOptional({
    enum: SortOrder,
    example: SortOrder.ASC,
    description: 'Sort order',
  })
  @IsEnum(SortOrder)
  @IsOptional()
  sortOrder?: SortOrder = SortOrder.ASC;
}
