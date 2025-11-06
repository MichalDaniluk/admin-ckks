import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TimeTrackingService } from './services/time-tracking.service';
import { TimeTrackingController } from './controllers/time-tracking.controller';
import { TimeEntry } from './entities/time-entry.entity';
import { User } from '@/modules/users/entities/user.entity';
import { TenantModule } from '@/common/tenant/tenant.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([TimeEntry, User]),
    TenantModule,
  ],
  controllers: [TimeTrackingController],
  providers: [TimeTrackingService],
  exports: [TimeTrackingService],
})
export class TimeTrackingModule {}
