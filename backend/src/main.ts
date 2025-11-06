import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);

  // Global prefix for all routes
  const apiPrefix = configService.get<string>('API_PREFIX', 'api/v1');
  app.setGlobalPrefix(apiPrefix);

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // CORS
  const corsOrigins = configService.get<string>('CORS_ORIGINS', 'http://localhost:4200');
  app.enableCors({
    origin: corsOrigins.split(','),
    credentials: true,
  });

  // Swagger API Documentation
  const config = new DocumentBuilder()
    .setTitle('CKKS SaaS Multi-Tenant API')
    .setDescription('API documentation for CKKS Training Management Platform')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('auth', 'Authentication endpoints')
    .addTag('tenants', 'Tenant management')
    .addTag('users', 'User management')
    .addTag('courses', 'Course management')
    .addTag('students', 'Student management')
    .addTag('instructors', 'Instructor management')
    .addTag('enrollments', 'Enrollment management')
    .addTag('payments', 'Payment management')
    .addTag('invoices', 'Invoice management')
    .addTag('documents', 'Document generation')
    .addTag('reports', 'Reports and analytics')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup(`${apiPrefix}/docs`, app, document);

  const port = configService.get<number>('PORT', 3000);
  await app.listen(port);

  console.log(`
🚀 CKKS SaaS Backend is running!
📍 API: http://localhost:${port}/${apiPrefix}
📚 Swagger Docs: http://localhost:${port}/${apiPrefix}/docs
🌍 Environment: ${configService.get<string>('NODE_ENV', 'development')}
  `);
}

bootstrap();
