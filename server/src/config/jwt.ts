import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

// Ensure .env is loaded from workspace root if not already populated in process.env
if (!process.env.JWT_SECRET) {
  try {
    dotenv.config({ path: fileURLToPath(new URL('../../../.env', import.meta.url)) });
  } catch (_e) {
    // Ignore error if file doesn't exist; getJwtSecret will fail closed
  }
  dotenv.config();
}

/**
 * Retrieves the JWT signing/verification secret from the environment.
 * Fails closed by throwing an Error if JWT_SECRET is absent, empty, or whitespace-only.
 * No hardcoded fallback secret is permitted to prevent source-controlled key forgery.
 */
export function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.trim() === '') {
    throw new Error('JWT_SECRET environment variable is missing or empty. Application cannot sign or verify tokens securely.');
  }
  return secret.trim();
}

