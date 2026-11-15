import 'dotenv/config';
import { execSync } from 'node:child_process';
import { resolveAndValidateTestDatabaseUrl } from '../../server/src/config/test-db.js';

export default async function globalSetup() {
  const testDatabaseUrl = resolveAndValidateTestDatabaseUrl(process.env);
  const jwtSecret = process.env.JWT_SECRET ?? 'equipflow-test-jwt-secret';

  const env = {
    ...process.env,
    DATABASE_URL: testDatabaseUrl,
    TEST_DATABASE_URL: testDatabaseUrl,
    JWT_SECRET: jwtSecret,
  };

  execSync('npx prisma migrate reset --force --skip-seed --skip-generate', {
    stdio: 'inherit',
    env,
  });
  execSync('npx prisma db seed', { stdio: 'inherit', env });
}
