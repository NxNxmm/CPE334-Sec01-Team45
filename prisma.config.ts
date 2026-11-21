import dotenv from 'dotenv';
import { defineConfig } from 'prisma/config';

dotenv.config();

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
    seed: 'node --import tsx prisma/seed.ts',
  },
  datasource: {
    url:
      process.env.DATABASE_URL && !process.env.DATABASE_URL.startsWith('file:')
        ? process.env.DATABASE_URL
        : 'postgresql://appuser:localdevpassword@localhost:5432/equipflow?schema=public',
  },
});
