import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CoursesService } from './courses.service';
import { CoursesController } from './courses.controller';
import { CourseSessionsService } from './course-sessions.service';
import { CourseSessionsController } from './course-sessions.controller';
import { EnrollmentsService } from './enrollments.service';
import { EnrollmentsController } from './enrollments.controller';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { Course } from './entities/course.entity';
import { CourseSession } from './entities/course-session.entity';
import { Enrollment } from './entities/enrollment.entity';
import { Payment } from './entities/payment.entity';
import { User } from '@/modules/users/entities/user.entity';
import { TenantModule } from '@/common/tenant/tenant.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Course, CourseSession, Enrollment, Payment, User]),
    TenantModule,
  ],
  controllers: [CoursesController, CourseSessionsController, EnrollmentsController, PaymentsController],
  providers: [CoursesService, CourseSessionsService, EnrollmentsService, PaymentsService],
  exports: [CoursesService, CourseSessionsService, EnrollmentsService, PaymentsService],
})
export class CoursesModule {}
