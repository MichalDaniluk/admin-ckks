import { Module, Global } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { TenantContextService } from './tenant-context.service';
import { TenantIsolationInterceptor } from './tenant-isolation.interceptor';
import { TenantIsolationSubscriber } from './tenant-isolation.subscriber';

/**
 * Global module that provides tenant isolation functionality
 * This module is imported once in AppModule and makes tenant
 * isolation available throughout the application
 */
@Global()
@Module({
  providers: [
    TenantContextService,
    TenantIsolationSubscriber,
    {
      provide: APP_INTERCEPTOR,
      useClass: TenantIsolationInterceptor,
    },
  ],
  exports: [TenantContextService],
})
export class TenantModule {}
