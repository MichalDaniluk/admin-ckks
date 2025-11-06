import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { Course } from '../courses/entities/course.entity';
import { CourseSession } from '../courses/entities/course-session.entity';
import { Enrollment } from '../courses/entities/enrollment.entity';
import { User } from '../users/entities/user.entity';
import { Tenant } from '../tenant/entities/tenant.entity';
import { TenantModule } from '@/common/tenant/tenant.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Course, CourseSession, Enrollment, User, Tenant]),
    TenantModule,
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
  exports: [DashboardService],
})
export class DashboardModule {}
