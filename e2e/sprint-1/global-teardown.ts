import fs from 'node:fs';
import path from 'node:path';

export default async function globalTeardown() {
  const testDbPath = path.resolve(process.cwd(), 'prisma/test.db');
  const testDbJournalPath = path.resolve(process.cwd(), 'prisma/test.db-journal');

  for (const file of [testDbPath, testDbJournalPath]) {
    if (fs.existsSync(file)) {
      try {
        fs.rmSync(file, { force: true });
      } catch {
        // Ignore Windows file lock race during process exit
      }
    }
  }
}

