import dotenv from 'dotenv';
import { app } from './app.js';

dotenv.config({ path: '../.env' });

const port = Number(process.env.PORT ?? 3000);

app.listen(port, () => {
  console.log(`EquipFlow API listening on http://localhost:${port}`);
});
