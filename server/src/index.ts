import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { app } from './app.js';

try {
  dotenv.config({ path: fileURLToPath(new URL('../../.env', import.meta.url)) });
} catch (_e) {
  // Ignore error if file doesn't exist
}
dotenv.config();

const port = Number(process.env.PORT ?? 3000);

app.listen(port, () => {
  console.log(`EquipFlow API listening on http://localhost:${port}`);
});
