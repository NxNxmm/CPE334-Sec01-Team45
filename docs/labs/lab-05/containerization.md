# Lab 5 — Containerized local deployment

This guide runs the production-built EquipFlow app with PostgreSQL 16 using Docker Compose. It is for local verification only. Do not use sample database credentials or a local JWT secret in a deployed environment.

## Start the stack

From the repository root, copy the example environment and replace the placeholder JWT secret with a random development-only value. Keep .env private; it is ignored by Git. Compose uses POSTGRES_USER, POSTGRES_PASSWORD, and POSTGRES_DB for PostgreSQL and builds the internal DATABASE_URL. Use URL-safe characters if changing the database password.

```sh
cp .env.example .env
# Edit .env and set JWT_SECRET to a non-placeholder local value.
docker compose config -q
docker compose up --build -d
docker compose ps
```

Compose waits for PostgreSQL health, runs the one-shot migrate service (Prisma migrate deploy followed by the deterministic development seed), then starts the app. The app runs as the unprivileged node user and listens on port 8080 inside the container. APP_PORT and POSTGRES_PORT set host ports. If host port 8080 is occupied, set APP_PORT=18080 in .env, recreate the stack, and use http://127.0.0.1:18080 for the checks below. The port inside the app container stays at 8080.

## Verify the container (C-03 evidence)

Run these commands after the final image has been rebuilt. Save the command output together with the date, branch SHA, and Docker/Compose versions in the Lab 5 submission evidence. The login command prints only the HTTP status so it does not expose a JWT.

```sh
docker compose ps
curl -i http://127.0.0.1:${APP_PORT:-8080}/api/health
curl -i http://127.0.0.1:${APP_PORT:-8080}/api/ready
docker compose exec app id -u
curl -sS -o /dev/null -w '%{http_code}\n' -H 'Content-Type: application/json' -d '{"email":"borrower@cpe.kmutt.ac.th","password":"Password123!"}' http://127.0.0.1:${APP_PORT:-8080}/api/v1/auth/login
docker compose logs --no-color migrate
```

Expected results are HTTP 200 from both API endpoints, a non-zero UID for the app container, HTTP 200 from the seeded borrower login, and successful migration/seed completion. Open http://127.0.0.1:${APP_PORT:-8080} and verify the sign-in page loads. The sample borrower and Password123! password are for local development only; the password is seeded when DEMO_USER_PASSWORD is empty and the migration container runs with NODE_ENV=development.

## Stop the stack

```sh
docker compose down
```

This keeps the local PostgreSQL volume. docker compose down -v deletes that data and should only be used when intentionally resetting the disposable local database.

## Verification status

The initial local run was performed on 2026-11-16 (ICT) at source SHA 223cacb821cd3be83917ca10e96d12b973fd4264 using Docker Desktop 28.4.0 on Apple Silicon and Compose v2.39.4-desktop.1:

- Compose built the app and migrate images and created the named PostgreSQL data volume. PostgreSQL 16 reached healthy status.
- Prisma applied migration 20261112205548_init, and the seed created 3 users and 6 equipment items.
- Host port 8080 was occupied by Adminer, so responses from that port were not evidence from EquipFlow.

A follow-up on 2026-11-17 (ICT), using that same image build on host port 18080, confirmed in the browser that /api/health returned {"status":"ok","service":"equipflow-api"}, /api/ready returned {"status":"ready","service":"equipflow-api","db":"connected"}, the Sign In page loaded, and signing in with the seeded borrower opened the Department Equipment Catalog.

The November 22 clean-clone rerun at staging commit `ee7306170b54736413086e2bd659f9a2b427a5ed` built the corrected runtime and migration images. The migration exited with code 0, PostgreSQL and the app were healthy, and the app ran as UID 1000. The app root, health, readiness and local borrower sign-in all returned HTTP 200. See the [C-03 command output](../../evidence/lab-05/c03-clean-clone.txt).
