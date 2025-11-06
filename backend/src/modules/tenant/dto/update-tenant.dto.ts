import { PartialType } from '@nestjs/swagger';
import { CreateTenantDto } from './create-tenant.dto';
import { IsEnum, IsBoolean, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { SubscriptionStatus, SubscriptionPlan } from '../entities/tenant.entity';

export class UpdateTenantDto extends PartialType(CreateTenantDto) {
  @ApiPropertyOptional({
    description: 'Subscription status',
    enum: SubscriptionStatus,
  })
  @IsOptional()
  @IsEnum(SubscriptionStatus)
  subscriptionStatus?: SubscriptionStatus;

  @ApiPropertyOptional({
    description: 'Is tenant active',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
