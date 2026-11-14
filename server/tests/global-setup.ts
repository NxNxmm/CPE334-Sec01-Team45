import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '../..');

export async function setup() {
  const testDbPath = path.resolve(repoRoot, 'prisma/test.db');
  const testDbJournalPath = path.resolve(repoRoot, 'prisma/test.db-journal');

  for (const file of [testDbPath, testDbJournalPath]) {
    if (fs.existsSync(file)) {
      fs.rmSync(file, { force: true });
    }
  }

  const env = {
    ...process.env,
    DATABASE_URL: 'file:./test.db',
  };

  execSync('npx prisma migrate deploy', { cwd: repoRoot, stdio: 'inherit', env });
  execSync('npx prisma db seed', { cwd: repoRoot, stdio: 'inherit', env });
}

export async function teardown() {
  const testDbPath = path.resolve(repoRoot, 'prisma/test.db');
  const testDbJournalPath = path.resolve(repoRoot, 'prisma/test.db-journal');

  for (const file of [testDbPath, testDbJournalPath]) {
    if (fs.existsSync(file)) {
      try {
        fs.rmSync(file, { force: true });
      } catch {
        // Ignore Windows file lock race on exit
      }
    }
  }
}

