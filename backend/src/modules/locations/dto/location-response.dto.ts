import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';
import { LocationType } from '../entities/location.entity';

@Exclude()
export class LocationResponseDto {
  @Expose()
  @ApiProperty()
  id: string;

  @Expose()
  @ApiProperty()
  name: string;

  @Expose()
  @ApiProperty({ enum: LocationType })
  type: LocationType;

  @Expose()
  @ApiProperty({ required: false })
  description?: string;

  @Expose()
  @ApiProperty({ required: false })
  address?: string;

  @Expose()
  @ApiProperty({ required: false })
  city?: string;

  @Expose()
  @ApiProperty({ required: false })
  postalCode?: string;

  @Expose()
  @ApiProperty({ required: false })
  country?: string;

  @Expose()
  @ApiProperty({ required: false })
  capacity?: number;

  @Expose()
  @ApiProperty()
  hasProjector: boolean;

  @Expose()
  @ApiProperty()
  hasWhiteboard: boolean;

  @Expose()
  @ApiProperty()
  hasComputers: boolean;

  @Expose()
  @ApiProperty()
  hasWifi: boolean;

  @Expose()
  @ApiProperty({ required: false })
  accessibility?: string;

  @Expose()
  @ApiProperty()
  parkingAvailable: boolean;

  @Expose()
  @ApiProperty({ required: false })
  publicTransport?: string;

  @Expose()
  @ApiProperty({ required: false })
  contactPerson?: string;

  @Expose()
  @ApiProperty({ required: false })
  contactPhone?: string;

  @Expose()
  @ApiProperty({ required: false })
  contactEmail?: string;

  @Expose()
  @ApiProperty({ required: false })
  notes?: string;

  @Expose()
  @ApiProperty()
  isActive: boolean;

  @Expose()
  @ApiProperty()
  tenantId: string;

  @Expose()
  @ApiProperty()
  createdAt: Date;

  @Expose()
  @ApiProperty()
  updatedAt: Date;
}

export class PaginatedLocationsResponseDto {
  @ApiProperty({ type: [LocationResponseDto] })
  data: LocationResponseDto[];

  @ApiProperty()
  total: number;

  @ApiProperty()
  page: number;

  @ApiProperty()
  limit: number;

  @ApiProperty()
  totalPages: number;
}
