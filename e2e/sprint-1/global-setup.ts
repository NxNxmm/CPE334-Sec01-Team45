import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

export default async function globalSetup() {
  const testDbPath = path.resolve(process.cwd(), 'prisma/test.db');
  const testDbJournalPath = path.resolve(process.cwd(), 'prisma/test.db-journal');

  // Remove any stale disposable test database files before starting
  for (const file of [testDbPath, testDbJournalPath]) {
    if (fs.existsSync(file)) {
      fs.rmSync(file, { force: true });
    }
  }

  const env = {
    ...process.env,
    DATABASE_URL: 'file:./test.db',
  };

  // Apply schema migrations and seed baseline fixtures into disposable prisma/test.db
  execSync('npx prisma migrate deploy', { stdio: 'inherit', env });
  execSync('npx prisma db seed', { stdio: 'inherit', env });
}

