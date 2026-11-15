import 'dotenv/config';
import { execSync } from 'node:child_process';

const testDatabaseUrl =
  process.env.TEST_DATABASE_URL ??
  (process.env.CI ? process.env.DATABASE_URL : undefined) ??
  'postgresql://appuser:localdevpassword@localhost:5432/equipflow_test?schema=public';

export default async function globalSetup() {
  process.env.DATABASE_URL = testDatabaseUrl;
  process.env.JWT_SECRET = process.env.JWT_SECRET ?? 'equipflow-test-jwt-secret';

  const env = {
    ...process.env,
    DATABASE_URL: testDatabaseUrl,
    TEST_DATABASE_URL: testDatabaseUrl,
    JWT_SECRET: process.env.JWT_SECRET,
  };

  execSync('npx prisma migrate reset --force --skip-seed --skip-generate', { stdio: 'inherit', env });
  execSync('npx prisma db seed', { stdio: 'inherit', env });
}
