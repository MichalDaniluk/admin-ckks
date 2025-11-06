import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHealth() {
    return {
      status: 'ok',
      message: 'CKKS SaaS API is running',
      timestamp: new Date().toISOString(),
    };
  }

  getDetailedHealth() {
    return {
      status: 'ok',
      message: 'CKKS SaaS API is running',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      version: '1.0.0',
      uptime: process.uptime(),
      memory: {
        usage: process.memoryUsage(),
        total: process.memoryUsage().heapTotal,
        used: process.memoryUsage().heapUsed,
      },
    };
  }
}
