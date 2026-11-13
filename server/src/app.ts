import express from 'express';
import cors from 'cors';
import { authRouter } from './routes/auth.routes.js';
import { custodianRouter } from './routes/custodian.routes.js';
import { catalogRouter } from './routes/catalog.routes.js';

export const app = express();

app.use(cors({ origin: process.env.CLIENT_ORIGIN ?? 'http://localhost:5173' }));
app.use(express.json());

// Smoke-test health endpoint
app.get('/api/health', (_request, response) => {
  response.status(200).json({ status: 'ok', service: 'equipflow-api' });
});

// Sprint 1 REST API Endpoints under /api/v1
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/items', catalogRouter);
app.use('/api/v1/custodian', custodianRouter);
