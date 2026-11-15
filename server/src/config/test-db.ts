export function normalizePgTarget(rawUrl: string): {
  host: string;
  port: string;
  database: string;
  schema: string;
} {
  let parsed: URL;
  try {
    parsed = new URL(rawUrl);
  } catch {
    throw new Error(`Invalid PostgreSQL connection URL: "${rawUrl}"`);
  }

  if (parsed.protocol !== 'postgresql:' && parsed.protocol !== 'postgres:') {
    throw new Error(
      `Unsupported database protocol "${parsed.protocol}". Expected postgresql:// or postgres://.`
    );
  }

  const database = decodeURIComponent(parsed.pathname.replace(/^\/+/, '')).trim();
  if (!database) {
    throw new Error('Database URL must include a database name in the path.');
  }

  const host = (parsed.hostname || 'localhost').toLowerCase();
  const port = parsed.port || '5432';
  const schema = (parsed.searchParams.get('schema') || 'public').trim().toLowerCase();

  return { host, port, database: database.toLowerCase(), schema };
}

/**
 * Validates and returns the dedicated PostgreSQL test database URL.
 *
 * Fail-closed rules:
 * 1. Requires `TEST_DATABASE_URL` to be explicitly provided; never falls back to `DATABASE_URL`.
 * 2. Rejects any target that matches `DATABASE_URL` (same host, port, database, and schema).
 * 3. Requires the target database name (or schema) to be an explicit `*_test` / `*-test` target,
 *    never the primary `equipflow` database on `public`.
 */
export function resolveAndValidateTestDatabaseUrl(
  env: Record<string, string | undefined> = process.env
): string {
  const rawTestUrl = env.TEST_DATABASE_URL?.trim();
  if (!rawTestUrl) {
    throw new Error(
      'TEST_DATABASE_URL is required before running destructive test database reset or seed. Refusing to fall back to DATABASE_URL.'
    );
  }

  const testTarget = normalizePgTarget(rawTestUrl);

  const rawAppUrl = env.DATABASE_URL?.trim();
  if (rawAppUrl && !rawAppUrl.startsWith('file:')) {
    const appTarget = normalizePgTarget(rawAppUrl);
    const isSameTarget =
      testTarget.host === appTarget.host &&
      testTarget.port === appTarget.port &&
      testTarget.database === appTarget.database &&
      testTarget.schema === appTarget.schema;

    if (isSameTarget) {
      throw new Error(
        `Refusing to reset or seed: TEST_DATABASE_URL points to the same target as application DATABASE_URL (${appTarget.host}:${appTarget.port}/${appTarget.database}?schema=${appTarget.schema}).`
      );
    }
  }

  const isDedicatedTestTarget =
    /(?:_test|-test)$/i.test(testTarget.database) || /(?:_test|-test)$/i.test(testTarget.schema);

  if (!isDedicatedTestTarget) {
    throw new Error(
      `Refusing to reset or seed non-test database target "${testTarget.database}" (schema "${testTarget.schema}"). TEST_DATABASE_URL must target a dedicated *_test database (e.g., equipflow_test).`
    );
  }

  return rawTestUrl;
}

