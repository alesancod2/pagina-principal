import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { ValidationPipe } from '@nestjs/common';
import serverlessExpress from '@vendia/serverless-express';
import express from 'express';
import { AppModule } from '../backend/src/app.module';

let cachedHandler: any;

async function bootstrap() {
  if (cachedHandler) return cachedHandler;
  const expressApp = express();
  const app = await NestFactory.create(AppModule, new ExpressAdapter(expressApp), { logger: ['error', 'warn'] });
  app.setGlobalPrefix('api');
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.enableCors({ origin: '*', methods: 'GET,POST,PUT,PATCH,DELETE,OPTIONS', allowedHeaders: 'Content-Type,Authorization' });
  await app.init();
  cachedHandler = serverlessExpress({ app: expressApp });
  return cachedHandler;
}

export default async function handler(req: any, res: any) {
  const h = await bootstrap();
  return h(req, res);
}
