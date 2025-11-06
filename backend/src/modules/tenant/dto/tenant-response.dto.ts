import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';
import { SubscriptionStatus, SubscriptionPlan } from '../entities/tenant.entity';

@Exclude()
export class TenantResponseDto {
  @Expose()
  @ApiProperty({ description: 'Tenant ID' })
  id: string;

  @Expose()
  @ApiProperty({ description: 'Tenant slug (subdomain)' })
  slug: string;

  @Expose()
  @ApiProperty({ description: 'Company name' })
  companyName: string;

  @Expose()
  @ApiProperty({ description: 'Subscription plan', enum: SubscriptionPlan })
  subscriptionPlan: SubscriptionPlan;

  @Expose()
  @ApiProperty({ description: 'Subscription status', enum: SubscriptionStatus })
  subscriptionStatus: SubscriptionStatus;

  @Expose()
  @ApiProperty({ description: 'Max users allowed' })
  maxUsers: number;

  @Expose()
  @ApiProperty({ description: 'Max courses allowed' })
  maxCourses: number;

  @Expose()
  @ApiProperty({ description: 'Max students allowed' })
  maxStudents: number;

  @Expose()
  @ApiPropertyOptional({ description: 'Trial ends at' })
  trialEndsAt: Date | null;

  @Expose()
  @ApiPropertyOptional({ description: 'Subscription started at' })
  subscriptionStartedAt: Date | null;

  @Expose()
  @ApiPropertyOptional({ description: 'Subscription ends at' })
  subscriptionEndsAt: Date | null;

  @Expose()
  @ApiProperty({ description: 'Is tenant active' })
  isActive: boolean;

  @Expose()
  @ApiPropertyOptional({ description: 'Contact email' })
  contactEmail: string;

  @Expose()
  @ApiPropertyOptional({ description: 'Contact phone' })
  contactPhone: string;

  @Expose()
  @ApiProperty({ description: 'Created at' })
  createdAt: Date;

  @Expose()
  @ApiProperty({ description: 'Updated at' })
  updatedAt: Date;
}
