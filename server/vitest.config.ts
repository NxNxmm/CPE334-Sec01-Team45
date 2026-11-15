import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';
import { resolveAndValidateTestDatabaseUrl } from './src/config/test-db.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config();

const validatedTestDbUrl = process.env.TEST_DATABASE_URL
  ? resolveAndValidateTestDatabaseUrl(process.env)
  : '';

export default defineConfig({
  test: {
    globalSetup: ['./tests/global-setup.ts'],
    env: {
      DATABASE_URL: validatedTestDbUrl,
      TEST_DATABASE_URL: validatedTestDbUrl,
      JWT_SECRET: process.env.JWT_SECRET ?? 'equipflow-test-jwt-secret',
    },
  },
});
