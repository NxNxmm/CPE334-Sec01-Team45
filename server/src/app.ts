import express from 'express';
import cors from 'cors';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { prisma } from './prisma.js';
import { authRouter } from './routes/auth.routes.js';
import { custodianRouter } from './routes/custodian.routes.js';
import { catalogRouter } from './routes/catalog.routes.js';
import { requestRouter } from './routes/request.routes.js';

export const app = express();

app.use(cors({ origin: process.env.CLIENT_ORIGIN ?? 'http://localhost:5173' }));
app.use(express.json());

// Liveness probe endpoint
app.get('/api/health', (_request, response) => {
  response.status(200).json({ status: 'ok', service: 'equipflow-api' });
});

// Readiness probe endpoint checking PostgreSQL connectivity
app.get('/api/ready', async (_request, response) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    response.status(200).json({ status: 'ready', service: 'equipflow-api', db: 'connected' });
  } catch (_error) {
    response.status(503).json({ status: 'not_ready', service: 'equipflow-api', db: 'disconnected' });
  }
});

// Sprint 1 REST API Endpoints under /api/v1
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/items', catalogRouter);
app.use('/api/v1/requests', requestRouter);
app.use('/api/v1/custodian', custodianRouter);

// Serve built production frontend assets when running in production mode
const clientDistPath = path.resolve(fileURLToPath(new URL('../../client/dist', import.meta.url)));
const clientIndexHtml = path.join(clientDistPath, 'index.html');

if (process.env.NODE_ENV === 'production' && fs.existsSync(clientIndexHtml)) {
  app.use(express.static(clientDistPath));
  app.get(/^(?!\/api(?:\/|$)).*/, (_request, response) => {
    response.sendFile(clientIndexHtml);
  });
}
