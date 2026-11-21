export function normalizePgTarget(
  rawUrl: string,
  settingName: 'TEST_DATABASE_URL' | 'DATABASE_URL' = 'TEST_DATABASE_URL'
): {
  host: string;
  port: string;
  database: string;
  schema: string;
} {
  let parsed: URL;
  try {
    parsed = new URL(rawUrl);
  } catch {
    throw new Error(
      `Invalid PostgreSQL connection configuration in ${settingName}: malformed URL syntax.`
    );
  }

  if (parsed.protocol !== 'postgresql:' && parsed.protocol !== 'postgres:') {
    throw new Error(
      `Invalid PostgreSQL connection configuration in ${settingName}: unsupported protocol (expected postgresql:// or postgres://).`
    );
  }

  let database = '';
  try {
    database = decodeURIComponent(parsed.pathname.replace(/^\/+/, '')).trim();
  } catch {
    throw new Error(
      `Invalid PostgreSQL connection configuration in ${settingName}: malformed database path.`
    );
  }

  if (!database) {
    throw new Error(
      `Invalid PostgreSQL connection configuration in ${settingName}: missing database name in path.`
    );
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
 * 2. Never echoes raw connection strings or credentials in validation errors.
 * 3. Rejects any target that uses the same database as `DATABASE_URL` (same host, port, and database),
 *    even when the schema query parameter differs.
 * 4. Requires the database name itself to end with `_test` or `-test` (a `*_test` schema on a non-test
 *    database is rejected).
 */
export function resolveAndValidateTestDatabaseUrl(
  env: Record<string, string | undefined> = process.env
): string {
  const rawTestUrl = env.TEST_DATABASE_URL?.trim();
  if (!rawTestUrl) {
    throw new Error(
      'Invalid test database configuration in TEST_DATABASE_URL: setting is required before running destructive test reset or seed (refusing to fall back to DATABASE_URL).'
    );
  }

  const testTarget = normalizePgTarget(rawTestUrl, 'TEST_DATABASE_URL');

  const rawAppUrl = env.DATABASE_URL?.trim();
  if (rawAppUrl && !rawAppUrl.startsWith('file:')) {
    const appTarget = normalizePgTarget(rawAppUrl, 'DATABASE_URL');
    const isSameDatabase =
      testTarget.host === appTarget.host &&
      testTarget.port === appTarget.port &&
      testTarget.database === appTarget.database;

    if (isSameDatabase) {
      throw new Error(
        'Refusing to reset or seed: TEST_DATABASE_URL targets the same database as application DATABASE_URL (a separate test database is required even if the schema differs).'
      );
    }
  }

  const hasDedicatedTestDbName = /(?:_test|-test)$/i.test(testTarget.database);

  if (!hasDedicatedTestDbName) {
    throw new Error(
      'Refusing to reset or seed: TEST_DATABASE_URL database name must end with _test or -test (e.g., equipflow_test).'
    );
  }

  return rawTestUrl;
}
