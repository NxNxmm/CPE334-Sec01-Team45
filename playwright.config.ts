import 'dotenv/config';
import { defineConfig, devices } from '@playwright/test';
import { resolveAndValidateTestDatabaseUrl } from './server/src/config/test-db.js';

const validatedTestDbUrl = process.env.TEST_DATABASE_URL
  ? resolveAndValidateTestDatabaseUrl(process.env)
  : '';

process.env.JWT_SECRET = process.env.JWT_SECRET ?? 'equipflow-test-jwt-secret';

export default defineConfig({
  testDir: './e2e/sprint-1',
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: [['list']],
  globalSetup: './e2e/sprint-1/global-setup.ts',
  globalTeardown: './e2e/sprint-1/global-teardown.ts',
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: false,
    timeout: 60000,
    env: {
      ...process.env,
      DATABASE_URL: validatedTestDbUrl,
      TEST_DATABASE_URL: validatedTestDbUrl,
      JWT_SECRET: process.env.JWT_SECRET,
    },
  },
});
