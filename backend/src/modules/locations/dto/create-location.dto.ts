import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsOptional,
  IsBoolean,
  IsInt,
  Min,
  MaxLength,
  IsEmail,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { LocationType } from '../entities/location.entity';

export class CreateLocationDto {
  @ApiProperty({
    example: 'Sala konferencyjna A1',
    description: 'Location name',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @ApiProperty({
    enum: LocationType,
    example: LocationType.TRAINING_ROOM,
    description: 'Type of location',
  })
  @IsEnum(LocationType)
  type: LocationType;

  @ApiProperty({
    example: 'Modern training room with all amenities',
    description: 'Location description',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    example: 'ul. Przykładowa 123',
    description: 'Street address',
    required: false,
  })
  @IsString()
  @IsOptional()
  @MaxLength(500)
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
    example: 'Polska',
    description: 'Country',
    required: false,
  })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  country?: string;

  @ApiProperty({
    example: 30,
    description: 'Capacity (number of people)',
    required: false,
  })
  @IsInt()
  @Min(1)
  @IsOptional()
  capacity?: number;

  @ApiProperty({
    example: true,
    description: 'Has projector',
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  hasProjector?: boolean;

  @ApiProperty({
    example: true,
    description: 'Has whiteboard',
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  hasWhiteboard?: boolean;

  @ApiProperty({
    example: false,
    description: 'Has computers',
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  hasComputers?: boolean;

  @ApiProperty({
    example: true,
    description: 'Has WiFi',
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  hasWifi?: boolean;

  @ApiProperty({
    example: 'Elevator, ramp',
    description: 'Accessibility information',
    required: false,
  })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  accessibility?: string;

  @ApiProperty({
    example: true,
    description: 'Parking available',
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  parkingAvailable?: boolean;

  @ApiProperty({
    example: 'Metro, bus lines 123, 456',
    description: 'Public transport information',
    required: false,
  })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  publicTransport?: string;

  @ApiProperty({
    example: 'Jan Kowalski',
    description: 'Contact person',
    required: false,
  })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  contactPerson?: string;

  @ApiProperty({
    example: '+48 123 456 789',
    description: 'Contact phone',
    required: false,
  })
  @IsString()
  @IsOptional()
  @MaxLength(50)
  contactPhone?: string;

  @ApiProperty({
    example: 'contact@example.com',
    description: 'Contact email',
    required: false,
  })
  @IsEmail()
  @IsOptional()
  @MaxLength(255)
  contactEmail?: string;

  @ApiProperty({
    example: 'Additional notes',
    description: 'Notes',
    required: false,
  })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiProperty({
    example: true,
    description: 'Is location active',
    default: true,
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
