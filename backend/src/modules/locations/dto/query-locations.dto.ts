import { IsOptional, IsEnum, IsString, IsBoolean, IsNumber, Min, Max } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { LocationType } from '../entities/location.entity';

export enum LocationSortField {
  CREATED_AT = 'createdAt',
  UPDATED_AT = 'updatedAt',
  NAME = 'name',
  CITY = 'city',
  TYPE = 'type',
}

export enum SortOrder {
  ASC = 'ASC',
  DESC = 'DESC',
}

export class QueryLocationsDto {
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
    description: 'Search by name, address, or city',
    example: 'Sala',
  })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({
    enum: LocationType,
    description: 'Filter by location type',
  })
  @IsEnum(LocationType)
  @IsOptional()
  type?: LocationType;

  @ApiPropertyOptional({
    description: 'Filter by city',
    example: 'Warszawa',
  })
  @IsString()
  @IsOptional()
  city?: string;

  @ApiPropertyOptional({
    description: 'Filter by active status',
    example: true,
  })
  @IsBoolean()
  @Type(() => Boolean)
  @IsOptional()
  isActive?: boolean;

  @ApiPropertyOptional({
    enum: LocationSortField,
    example: LocationSortField.CREATED_AT,
    description: 'Field to sort by',
  })
  @IsEnum(LocationSortField)
  @IsOptional()
  sortBy?: LocationSortField = LocationSortField.CREATED_AT;

  @ApiPropertyOptional({
    enum: SortOrder,
    example: SortOrder.DESC,
    description: 'Sort order',
  })
  @IsEnum(SortOrder)
  @IsOptional()
  sortOrder?: SortOrder = SortOrder.DESC;
}
