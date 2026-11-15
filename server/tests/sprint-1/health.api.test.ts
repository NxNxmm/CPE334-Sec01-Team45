import { describe, it, expect, vi, afterEach } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
import request from 'supertest';
import { app } from '../../src/app.js';
import { prisma } from '../../src/prisma.js';
import { resolveAndValidateTestDatabaseUrl } from '../../src/config/test-db.js';
import { setup as vitestGlobalSetup } from '../global-setup.js';
import playwrightGlobalSetup from '../../../e2e/sprint-1/global-setup.js';
import { resolveSeedPassword } from '../../../prisma/seed.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '../../..');

describe('Lab 5 - Cloud-Readiness Probes, Test DB Reset Guard & Seed Reproducibility (L5-1)', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Health & PostgreSQL Readiness Endpoints', () => {
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

  describe('Test Database Reset Guard (missing & shared target rejection)', () => {
    const originalTestUrl = process.env.TEST_DATABASE_URL;
    const originalAppUrl = process.env.DATABASE_URL;
    const originalCi = process.env.CI;

    afterEach(() => {
      if (originalTestUrl === undefined) delete process.env.TEST_DATABASE_URL;
      else process.env.TEST_DATABASE_URL = originalTestUrl;

      if (originalAppUrl === undefined) delete process.env.DATABASE_URL;
      else process.env.DATABASE_URL = originalAppUrl;

      if (originalCi === undefined) delete process.env.CI;
      else process.env.CI = originalCi;
    });

    it('rejects missing or blank TEST_DATABASE_URL even when CI=true and DATABASE_URL is set', async () => {
      expect(() =>
        resolveAndValidateTestDatabaseUrl({
          CI: 'true',
          DATABASE_URL: 'postgresql://appuser:localdevpassword@localhost:5432/equipflow?schema=public',
          TEST_DATABASE_URL: '',
        })
      ).toThrow(/TEST_DATABASE_URL is required/i);

      delete process.env.TEST_DATABASE_URL;
      process.env.CI = 'true';
      process.env.DATABASE_URL =
        'postgresql://appuser:localdevpassword@localhost:5432/equipflow?schema=public';

      await expect(vitestGlobalSetup()).rejects.toThrow(/TEST_DATABASE_URL is required/i);
      await expect(playwrightGlobalSetup()).rejects.toThrow(/TEST_DATABASE_URL is required/i);
    });

    it('rejects shared target when TEST_DATABASE_URL matches application DATABASE_URL', async () => {
      const sharedUrl =
        'postgresql://appuser:localdevpassword@localhost:5432/equipflow_test?schema=public';

      expect(() =>
        resolveAndValidateTestDatabaseUrl({
          DATABASE_URL: sharedUrl,
          TEST_DATABASE_URL: sharedUrl,
        })
      ).toThrow(/points to the same target as application DATABASE_URL/i);

      process.env.DATABASE_URL = sharedUrl;
      process.env.TEST_DATABASE_URL = sharedUrl;

      await expect(vitestGlobalSetup()).rejects.toThrow(
        /points to the same target as application DATABASE_URL/i
      );
      await expect(playwrightGlobalSetup()).rejects.toThrow(
        /points to the same target as application DATABASE_URL/i
      );
    });

    it('rejects non-test database names that do not end with _test or -test', () => {
      expect(() =>
        resolveAndValidateTestDatabaseUrl({
          DATABASE_URL: 'postgresql://appuser:localdevpassword@localhost:5432/other_db?schema=public',
          TEST_DATABASE_URL:
            'postgresql://appuser:localdevpassword@localhost:5432/equipflow?schema=public',
        })
      ).toThrow(/must target a dedicated \*_test database/i);
    });

    it('accepts a dedicated *_test database target distinct from DATABASE_URL', () => {
      const validTestUrl =
        'postgresql://appuser:localdevpassword@localhost:5432/equipflow_test?schema=public';
      const result = resolveAndValidateTestDatabaseUrl({
        DATABASE_URL: 'postgresql://appuser:localdevpassword@localhost:5432/equipflow?schema=public',
        TEST_DATABASE_URL: validTestUrl,
      });

      expect(result).toBe(validTestUrl);
    });
  });

  describe('Reproducible Clean Setup (.env.example & seed password alignment)', () => {
    it('aligns .env.example with isolated test DB validation and local fixture password', () => {
      const envExampleRaw = fs.readFileSync(path.join(repoRoot, '.env.example'), 'utf8');
      const parsedEnvExample = dotenv.parse(envExampleRaw);

      expect(resolveAndValidateTestDatabaseUrl(parsedEnvExample)).toBe(
        parsedEnvExample.TEST_DATABASE_URL
      );
      expect(resolveSeedPassword(parsedEnvExample)).toBe('Password123!');
    });

    it('ignores placeholder DEMO_USER_PASSWORD in development/test and requires a real password in production', () => {
      expect(
        resolveSeedPassword({
          NODE_ENV: 'development',
          DEMO_USER_PASSWORD: 'replace-with-a-seed-password',
        })
      ).toBe('Password123!');

      expect(() =>
        resolveSeedPassword({
          NODE_ENV: 'production',
          DEMO_USER_PASSWORD: '',
        })
      ).toThrow(/DEMO_USER_PASSWORD must be explicitly set/i);

      expect(() =>
        resolveSeedPassword({
          NODE_ENV: 'production',
          DEMO_USER_PASSWORD: 'replace-with-a-seed-password',
        })
      ).toThrow(/DEMO_USER_PASSWORD must be explicitly set/i);

      expect(
        resolveSeedPassword({
          NODE_ENV: 'production',
          DEMO_USER_PASSWORD: 'ProdSecretPassword!2026',
        })
      ).toBe('ProdSecretPassword!2026');
    });
  });
});
