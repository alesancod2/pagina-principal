import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { INestApplication } from '@nestjs/common';
import express, { Request, Response } from 'express';
import { AppModule } from '../src/app.module';

const expressApp = express();
let app: INestApplication;

async function bootstrap() {
  if (!app) {
    app = await NestFactory.create(AppModule, new ExpressAdapter(expressApp));
    app.setGlobalPrefix('api');
    app.enableCors({ origin: '*' });
    await app.init();
  }
  return expressApp;
}

export default async function handler(req: Request, res: Response) {
  const server = await bootstrap();
  server(req, res);
}
