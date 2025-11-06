import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { getDatabaseConfig } from './config/database.config';
import { TenantModule as TenantBusinessModule } from './modules/tenant/tenant.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { CoursesModule } from './modules/courses/courses.module';
import { LocationsModule } from './modules/locations/locations.module';
import { TimeTrackingModule } from './modules/time-tracking/time-tracking.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { BlogPostsModule } from './modules/blog-posts/blog-posts.module';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { RolesGuard } from './common/guards/roles.guard';
import { PermissionsGuard } from './common/guards/permissions.guard';
import { TenantModule } from './common/tenant/tenant.module';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // Database
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => getDatabaseConfig(configService),
      inject: [ConfigService],
    }),

    // Event Emitter for Domain Events
    EventEmitterModule.forRoot(),

    // Tenant Isolation (Global)
    TenantModule,

    // Business Modules
    AuthModule,
    TenantBusinessModule,
    UsersModule,
    CoursesModule,
    LocationsModule,
    TimeTrackingModule,
    DashboardModule,
    BlogPostsModule,
    // etc.
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // Global guards (order matters - they execute in the order they're defined)
    // 1. JWT Auth Guard - authenticates user and populates request.user
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    // 2. Roles Guard - checks if user has required roles
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
    // 3. Permissions Guard - checks if user has required permissions
    {
      provide: APP_GUARD,
      useClass: PermissionsGuard,
    },
  ],
})
export class AppModule {}
