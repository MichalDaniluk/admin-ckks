import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TenantService } from './tenant.service';
import { TenantController } from './tenant.controller';
import { Tenant } from './entities/tenant.entity';
import { SubscriptionPlan } from './entities/subscription-plan.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Tenant, SubscriptionPlan])],
  controllers: [TenantController],
  providers: [TenantService],
  exports: [TenantService], // Export for use in other modules
})
export class TenantModule {}
