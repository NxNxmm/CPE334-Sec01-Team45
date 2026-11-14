import { defineConfig, devices } from '@playwright/test';

process.env.DATABASE_URL = process.env.DATABASE_URL ?? 'file:./test.db';

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
      DATABASE_URL: 'file:./test.db',
    },
  },
});
