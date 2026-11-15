# Lab 5 — Containerized local deployment

This guide runs the production-built EquipFlow app with PostgreSQL 16 using Docker Compose. It is for local verification only. Do not use sample database credentials or a local JWT secret in a deployed environment.

## Start the stack

From the repository root, copy the example environment and replace the placeholder JWT secret with a random development-only value. Keep `.env` private; it is ignored by Git. Compose uses `POSTGRES_USER`, `POSTGRES_PASSWORD`, and `POSTGRES_DB` for PostgreSQL and builds the internal `DATABASE_URL`. Use URL-safe characters if changing the database password.

```sh
cp .env.example .env
# Edit .env and set JWT_SECRET to a non-placeholder local value.
docker compose config -q
docker compose up --build -d
docker compose ps
```

Compose waits for PostgreSQL health, runs the one-shot `migrate` service (`prisma migrate deploy` followed by the deterministic development seed), then starts the app. The app runs as the unprivileged `node` user and listens on port 8080 inside the container. Override the host ports with `APP_PORT` or `POSTGRES_PORT` if needed.

## Verify the container (C-03 evidence)

Record the date, final branch commit SHA, Docker/Compose versions, command, and observed result in the Lab 5 submission evidence.

```sh
docker compose ps
curl -i http://localhost:8080/api/health
curl -i http://localhost:8080/api/ready
docker compose exec app id -u
curl -sS -o /dev/null -w '%{http_code}\n' -H 'Content-Type: application/json' -d '{"email":"borrower@cpe.kmutt.ac.th","password":"Password123!"}' http://localhost:8080/api/v1/auth/login
docker compose logs --no-color migrate
```

The app and database readiness endpoints should return HTTP 200; the app container UID must not be 0; and the fixture login should return HTTP 200. Open http://localhost:8080 and verify the sign-in page loads. The sample borrower and `Password123!` password are for local development only; this password is seeded when `DEMO_USER_PASSWORD` is empty and the migration container runs with `NODE_ENV=development`. The curl command discards the response body so it does not print a JWT.

## Stop the stack

```sh
docker compose down
```

This keeps the local PostgreSQL volume. `docker compose down -v` deletes that data and should only be used when intentionally resetting the disposable local database.

## Verification status

- `docker compose config -q` checks Compose syntax only; it does not build or start containers.
- Container build, PostgreSQL migration/seed, readiness, non-root runtime, and browser sign-in are **pending Docker daemon access**. Record them as passed only after running the commands above and capturing results against the final commit SHA.
- The restricted review environment ran the application build, Prisma schema validation, and all 15 client tests. Docker engine access was denied, so these checks do not verify the container workflow.
