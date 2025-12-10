import {
  ClassSerializerInterceptor,
  INestApplication,
  ValidationPipe,
} from '@nestjs/common';
import { NestFactory, Reflector } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { apiReference } from '@scalar/nestjs-api-reference';
import * as dotenv from 'dotenv';
import { json } from 'express';
import { AppModule } from './app.module';

dotenv.config();

/**
 * Shared application configuration
 */
function configureApp(app: INestApplication) {
  // --- CORS ---
  const allowedOrigins = [
    'http://localhost:3000',
    process.env.FRONTEND_URL,
  ].filter(Boolean);

  app.enableCors({
    origin: allowedOrigins.length ? allowedOrigins : '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: [
      'Origin',
      'X-Requested-With',
      'Content-Type',
      'Accept',
      'Authorization',
    ],
    credentials: true,
  });

  // --- GLOBAL VALIDATION PIPE ---
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      enableDebugMessages: true,
    }),
  );

  // --- GLOBAL INTERCEPTORS ---
  app.useGlobalInterceptors(
    new ClassSerializerInterceptor(app.get(Reflector), {
      excludeExtraneousValues: false,
      enableImplicitConversion: true,
    }),
  );

  // --- SWAGGER / SCALAR DOCS ---
  const config = new DocumentBuilder()
    .addServer('/api')
    .setTitle('AI Monitoring MVP API')
    .setDescription(
      'API for recording, transcribing, and summarizing meetings.',
    )
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('swagger', app, document, {
    swaggerOptions: { persistAuthorization: true },
  });

  app.use(
    '/reference',
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    apiReference({
      content: document,
    }),
  );

  // --- BODY PARSER (LARGE AUDIO FILES) ---
  app.use(json({ limit: '50mb' }));

  // --- GLOBAL PREFIX ---
  app.setGlobalPrefix('api');
}

/**
 * Local development bootstrap
 */
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  configureApp(app);

  const port = process.env.PORT || 8000;
  await app.listen(port);

  console.log(`🚀 Server running at http://localhost:${port}`);
  console.log(`📚 Swagger at http://localhost:${port}/swagger`);
  console.log(`📚 Scalar Docs at http://localhost:${port}/reference`);
}

bootstrap();
