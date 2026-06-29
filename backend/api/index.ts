import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { Module, Controller, Get, INestApplication } from '@nestjs/common';
import express from 'express';
import type { Request, Response } from 'express';

// Health Controller
@Controller('health')
class HealthController {
  @Get()
  check() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      service: 'AutoVale API',
      environment: process.env.NODE_ENV || 'development',
    };
  }
}

// Info Controller
@Controller()
class RootController {
  @Get()
  root() {
    return {
      name: 'Clube de Benefícios Auto Vale - API',
      version: '1.0.0',
      docs: '/api/health',
      status: 'running',
    };
  }
}

// App Module (minimal)
@Module({
  controllers: [HealthController, RootController],
})
class AppModule {}

// Bootstrap
const server = express();
let app: INestApplication;

async function bootstrap() {
  if (!app) {
    app = await NestFactory.create(AppModule, new ExpressAdapter(server));
    app.setGlobalPrefix('api');
    app.enableCors({ origin: '*' });
    await app.init();
  }
  return server;
}

export default async function handler(req: Request, res: Response) {
  const instance = await bootstrap();
  instance(req, res);
}
