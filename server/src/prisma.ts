import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { PrismaClient } from '@prisma/client';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config();

const databaseUrl =
  process.env.DATABASE_URL && !process.env.DATABASE_URL.startsWith('file:')
    ? process.env.DATABASE_URL
    : 'postgresql://appuser:localdevpassword@localhost:5432/equipflow?schema=public';

export const prisma = new PrismaClient({
  datasources: {
    db: { url: databaseUrl },
  },
});
