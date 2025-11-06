import { IsString, IsEmail, IsEnum, IsOptional, IsNumber, IsObject, Length, Matches } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { SubscriptionPlan } from '../entities/tenant.entity';

export class CreateTenantDto {
  @ApiProperty({
    description: 'Tenant slug (subdomain)',
    example: 'acme',
    minLength: 3,
    maxLength: 50,
  })
  @IsString()
  @Length(3, 50)
  @Matches(/^[a-z0-9-]+$/, {
    message: 'Slug can only contain lowercase letters, numbers and hyphens',
  })
  slug: string;

  @ApiProperty({
    description: 'Company name',
    example: 'ACME Training Center',
  })
  @IsString()
  @Length(2, 255)
  companyName: string;

  @ApiProperty({
    description: 'Subscription plan',
    enum: SubscriptionPlan,
    default: SubscriptionPlan.STARTER,
  })
  @IsEnum(SubscriptionPlan)
  subscriptionPlan: SubscriptionPlan;

  @ApiProperty({
    description: 'Contact email',
    example: 'contact@acme.com',
  })
  @IsEmail()
  contactEmail: string;

  @ApiPropertyOptional({
    description: 'Contact phone',
    example: '+48 123 456 789',
  })
  @IsOptional()
  @IsString()
  contactPhone?: string;

  @ApiPropertyOptional({
    description: 'Address',
    example: 'ul. Warszawska 1',
  })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({
    description: 'City',
    example: 'Warszawa',
  })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional({
    description: 'Postal code',
    example: '00-001',
  })
  @IsOptional()
  @IsString()
  postalCode?: string;

  @ApiPropertyOptional({
    description: 'Country',
    example: 'Poland',
  })
  @IsOptional()
  @IsString()
  country?: string;

  @ApiPropertyOptional({
    description: 'Tax ID (NIP)',
    example: '1234567890',
  })
  @IsOptional()
  @IsString()
  taxId?: string;

  @ApiPropertyOptional({
    description: 'Max users allowed',
    example: 10,
  })
  @IsOptional()
  @IsNumber()
  maxUsers?: number;

  @ApiPropertyOptional({
    description: 'Max courses allowed',
    example: 50,
  })
  @IsOptional()
  @IsNumber()
  maxCourses?: number;

  @ApiPropertyOptional({
    description: 'Max students allowed',
    example: 1000,
  })
  @IsOptional()
  @IsNumber()
  maxStudents?: number;

  @ApiPropertyOptional({
    description: 'Custom settings (JSON)',
    example: { theme: 'dark', language: 'pl' },
  })
  @IsOptional()
  @IsObject()
  settings?: Record<string, any>;
}
