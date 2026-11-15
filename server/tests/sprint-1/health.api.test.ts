import { describe, it, expect, vi, afterEach } from 'vitest';
import request from 'supertest';
import { app } from '../../src/app.js';
import { prisma } from '../../src/prisma.js';

describe('Lab 5 - Cloud-Readiness Health & Readiness Probes (L5-1)', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('GET /api/health returns HTTP 200 for liveness check', async () => {
    const response = await request(app).get('/api/health');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      status: 'ok',
      service: 'equipflow-api',
    });
  });

  it('GET /api/ready returns HTTP 200 when PostgreSQL is reachable', async () => {
    const response = await request(app).get('/api/ready');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      status: 'ready',
      service: 'equipflow-api',
      db: 'connected',
    });
  });

  it('GET /api/ready returns HTTP 503 when PostgreSQL is unavailable', async () => {
    vi.spyOn(prisma, '$queryRaw').mockRejectedValueOnce(new Error('Database connection refused'));

    const response = await request(app).get('/api/ready');

    expect(response.status).toBe(503);
    expect(response.body).toEqual({
      status: 'not_ready',
      service: 'equipflow-api',
      db: 'disconnected',
    });
  });
});

