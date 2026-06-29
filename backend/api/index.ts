import express from 'express';
import type { Request, Response } from 'express';

const app = express();
app.use(express.json());

// CORS
app.use((req: Request, res: Response, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,PATCH,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') { res.status(200).end(); return; }
  next();
});

// Health Check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    service: 'AutoVale API',
    environment: process.env.NODE_ENV || 'development',
  });
});

// Root
app.get('/api', (req: Request, res: Response) => {
  res.json({
    name: 'Clube de Benefícios Auto Vale - API',
    version: '1.0.0',
    endpoints: ['/api/health', '/api/partners', '/api/status'],
    status: 'running',
  });
});

// Status (info do projeto)
app.get('/api/status', (req: Request, res: Response) => {
  res.json({
    database: 'Supabase (PostgreSQL)',
    frontend: 'https://pagina-principal-eight.vercel.app',
    backend: 'https://alesanco-project.vercel.app',
    tables: 16,
    uptime: process.uptime(),
  });
});

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: 'Route not found', path: req.path });
});

export default app;
