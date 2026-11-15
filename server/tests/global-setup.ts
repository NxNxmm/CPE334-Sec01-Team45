import dotenv from 'dotenv';
import { execSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { resolveAndValidateTestDatabaseUrl } from '../src/config/test-db.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '../..');

dotenv.config({ path: path.resolve(repoRoot, '.env') });
dotenv.config();

export async function setup() {
  const testDatabaseUrl = resolveAndValidateTestDatabaseUrl(process.env);
  const jwtSecret = process.env.JWT_SECRET ?? 'equipflow-test-jwt-secret';

  const env = {
    ...process.env,
    DATABASE_URL: testDatabaseUrl,
    TEST_DATABASE_URL: testDatabaseUrl,
    JWT_SECRET: jwtSecret,
  };

  execSync('npx prisma migrate reset --force --skip-seed --skip-generate', {
    cwd: repoRoot,
    stdio: 'inherit',
    env,
  });
  execSync('npx prisma db seed', {
    cwd: repoRoot,
    stdio: 'inherit',
    env,
  });
}

export async function teardown() {
  // Disposable test schema in equipflow_test is reset cleanly before each suite run
}
