import { IsOptional, IsString, IsInt, Min, Max, IsBoolean, IsEnum, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum UserSortField {
  CREATED_AT = 'createdAt',
  EMAIL = 'email',
  FIRST_NAME = 'firstName',
  LAST_NAME = 'lastName',
  LAST_LOGIN = 'lastLoginAt',
}

export enum SortOrder {
  ASC = 'ASC',
  DESC = 'DESC',
}

export class QueryUsersDto {
  @ApiProperty({
    example: 1,
    description: 'Page number (starts at 1)',
    required: false,
    default: 1,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  page?: number = 1;

  @ApiProperty({
    example: 10,
    description: 'Number of items per page',
    required: false,
    default: 10,
    minimum: 1,
    maximum: 100,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  @IsOptional()
  limit?: number = 10;

  @ApiProperty({
    example: 'john',
    description: 'Search by email, first name, or last name',
    required: false,
  })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiProperty({
    example: true,
    description: 'Filter by active status',
    required: false,
  })
  @Type(() => Boolean)
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiProperty({
    example: true,
    description: 'Filter by verified status',
    required: false,
  })
  @Type(() => Boolean)
  @IsBoolean()
  @IsOptional()
  isVerified?: boolean;

  @ApiProperty({
    example: 'TENANT_ADMIN',
    description: 'Filter by role code',
    required: false,
  })
  @IsString()
  @IsOptional()
  roleCode?: string;

  @ApiProperty({
    enum: UserSortField,
    example: UserSortField.CREATED_AT,
    description: 'Field to sort by',
    required: false,
    default: UserSortField.CREATED_AT,
  })
  @IsEnum(UserSortField)
  @IsOptional()
  sortBy?: UserSortField = UserSortField.CREATED_AT;

  @ApiProperty({
    enum: SortOrder,
    example: SortOrder.DESC,
    description: 'Sort order',
    required: false,
    default: SortOrder.DESC,
  })
  @IsEnum(SortOrder)
  @IsOptional()
  sortOrder?: SortOrder = SortOrder.DESC;

  @ApiPropertyOptional({
    example: '9bfea941-587d-4441-895d-4589b1ef574f',
    description: 'Filter by tenant ID (SUPER_ADMIN only)',
  })
  @IsUUID()
  @IsOptional()
  tenantId?: string;
}
