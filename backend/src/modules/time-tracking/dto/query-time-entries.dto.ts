import { IsOptional, IsEnum, IsDateString, IsString, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { TimeEntryStatus, TimeEntryType } from '../entities/time-entry.entity';

export class QueryTimeEntriesDto {
  @ApiProperty({ required: false, default: 1 })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  page?: number;

  @ApiProperty({ required: false, default: 10 })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  limit?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  userId?: string;

  @ApiProperty({ required: false, enum: TimeEntryStatus })
  @IsOptional()
  @IsEnum(TimeEntryStatus)
  status?: TimeEntryStatus;

  @ApiProperty({ required: false, enum: TimeEntryType })
  @IsOptional()
  @IsEnum(TimeEntryType)
  entryType?: TimeEntryType;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  dateFrom?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  dateTo?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  isBillable?: boolean;

  @ApiProperty({ required: false, default: 'entryDate' })
  @IsOptional()
  @IsString()
  sortBy?: string;

  @ApiProperty({ required: false, default: 'DESC', enum: ['ASC', 'DESC'] })
  @IsOptional()
  @IsEnum(['ASC', 'DESC'])
  sortOrder?: 'ASC' | 'DESC';
}
