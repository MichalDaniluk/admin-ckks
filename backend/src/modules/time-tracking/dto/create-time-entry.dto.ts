import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsBoolean,
  IsDateString,
  MaxLength,
  Matches,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { TimeEntryStatus, TimeEntryType } from '../entities/time-entry.entity';

export class CreateTimeEntryDto {
  @ApiProperty({
    example: '2024-01-15',
    description: 'Date of the time entry',
  })
  @IsDateString()
  @IsNotEmpty()
  entryDate: string;

  @ApiProperty({
    example: '09:00',
    description: 'Start time (HH:MM format)',
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'Start time must be in HH:MM format',
  })
  startTime: string;

  @ApiProperty({
    example: '17:00',
    description: 'End time (HH:MM format)',
    required: false,
  })
  @IsString()
  @IsOptional()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'End time must be in HH:MM format',
  })
  endTime?: string;

  @ApiProperty({
    enum: TimeEntryType,
    example: TimeEntryType.WORK,
    description: 'Type of time entry',
    default: TimeEntryType.WORK,
  })
  @IsEnum(TimeEntryType)
  @IsOptional()
  entryType?: TimeEntryType;

  @ApiProperty({
    enum: TimeEntryStatus,
    example: TimeEntryStatus.DRAFT,
    description: 'Status of time entry',
    default: TimeEntryStatus.DRAFT,
  })
  @IsEnum(TimeEntryStatus)
  @IsOptional()
  status?: TimeEntryStatus;

  @ApiProperty({
    example: 'Project Alpha',
    description: 'Project name',
    required: false,
  })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  projectName?: string;

  @ApiProperty({
    example: 'Developed new feature for user authentication',
    description: 'Task description',
    required: false,
  })
  @IsString()
  @IsOptional()
  taskDescription?: string;

  @ApiProperty({
    example: 'Worked from home',
    description: 'Additional notes',
    required: false,
  })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiProperty({
    example: true,
    description: 'Whether the time is billable',
    default: true,
  })
  @IsBoolean()
  @IsOptional()
  isBillable?: boolean;
}
