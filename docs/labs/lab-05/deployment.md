# EquipFlow — Cloud Deployment & CI/CD Documentation (Lab 5)

**Team:** `TH-045_P2` (Section 1) — Theme 2: Inventory & Borrowing System (**EquipFlow**)  
**Repository:** `https://github.com/NxNxmm/CPE334-Sec01-Team45`  
**GCP Project ID:** `cpe334-team45`  

---

## 1. Cloud-Readiness Baseline & PostgreSQL 16 Architecture (`L5-1`)

EquipFlow is structured as a cloud-ready full-stack TypeScript application prepared for single-container execution on **Google Cloud Run** backed by **Cloud SQL for PostgreSQL 16**:

1. **Stateless Application Tier (`server/src/app.ts`, `server/src/index.ts`):**
   - Binds to `HOST` (default `0.0.0.0`) and `PORT` (default `3000` locally, `8080` in Cloud Run).
   - Serves compiled frontend assets from `client/dist` with SPA route fallback when `NODE_ENV=production`.
   - Enforces stateless JWT Bearer authentication (`JWT_SECRET` required at runtime; fails closed if missing) with database-persisted token revocation (`RevokedToken` table in PostgreSQL).
2. **Health & Readiness Probes (`server/src/app.ts`):**
   - `GET /api/health` — Liveness probe returning HTTP `200 OK` (`{ "status": "ok", "service": "equipflow-api" }`).
   - `GET /api/ready` — Readiness probe executing `SELECT 1` against PostgreSQL via Prisma (`prisma.$queryRaw`). Returns HTTP `200 OK` (`{ "status": "ready", "service": "equipflow-api", "db": "connected" }`) when the database is reachable, or HTTP `503 Service Unavailable` (`{ "status": "not_ready", "service": "equipflow-api", "db": "disconnected" }`) when unavailable.
3. **Database & Migration Layer (`prisma/schema.prisma`, `prisma/migrations/`):**
   - Uses Prisma ORM with the `postgresql` provider targeting **PostgreSQL 16**.
   - Schema changes are tracked via deterministic SQL migrations (`npx prisma migrate deploy`).
4. **Credential Hygiene & Production-Safe Seeding (`prisma/seed.ts`, `client/src/components/Login.tsx`):**
   - `prisma/seed.ts` is idempotent (`upsert`) and reads `DEMO_USER_PASSWORD` from the environment. In `production` mode, seeding fails fast if `DEMO_USER_PASSWORD` is not explicitly provided.
   - The Login UI (`client/src/components/Login.tsx`) hides local development demo passwords and quick-fill controls in production builds (`import.meta.env.PROD`).

---

## 2. Environment Variables & Secret Management (`R-02`, `R-12`)

No secrets, passwords, or private keys are committed to the repository. Refer to `.env.example` for local setup placeholders.

| Variable Name | Required | Purpose | Local Development | GitHub Actions CI/CD | GCP Cloud Run / Cloud SQL |
| :--- | :---: | :--- | :--- | :--- | :--- |
| `DATABASE_URL` | Yes | Primary PostgreSQL 16 connection string for Prisma ORM | Local `.env` (untracked) | Ephemeral `postgres:16` service env | **GCP Secret Manager** (`DATABASE_URL`) |
| `TEST_DATABASE_URL` | Test only | Dedicated `*_test` PostgreSQL 16 database URL required before running destructive test resets (`server/src/config/test-db.ts`); never falls back to `DATABASE_URL` and rejects shared targets | Local `.env` (`equipflow_test`) | CI service container (`equipflow_test`) | N/A (not used in production runtime) |
| `JWT_SECRET` | Yes | HMAC signing secret for JWT Bearer tokens (fails closed if omitted) | Local `.env` (untracked) | CI job env var | **GCP Secret Manager** (`JWT_SECRET`) |
| `DEMO_USER_PASSWORD` | Prod seed | Password hashed by `prisma/seed.ts` for initial demo accounts in production; left empty (`""`) in `.env.example` so local dev, Login quick-fill, and test fixtures deterministically use the local fixture password | Optional (`""` uses local fixture password when `NODE_ENV != production`) | Optional (`""` in CI test seed) | **GCP Secret Manager** (`DEMO_USER_PASSWORD`) |
| `PORT` | No | HTTP server listening port (defaults to `3000` locally) | `.env` (`3000`) | `8080` in container smoke test | Injected automatically by Cloud Run (`8080`) |
| `HOST` | No | Network interface bind address (defaults to `0.0.0.0`) | `.env` (`0.0.0.0`) | `0.0.0.0` | `0.0.0.0` |
| `NODE_ENV` | No | Runtime environment mode (`development`, `test`, `production`) | `development` | `test` / `production` | `production` |
| `CLIENT_ORIGIN` | No | Allowed CORS origin when running separate dev servers | `http://localhost:5173` | Same-origin in container | Same-origin on Cloud Run service URL |
| `VITE_SHOW_DEMO_CREDENTIALS` | No | Controls visibility of local demo callout on Login view | Enabled in dev (`!import.meta.env.PROD`) | Disabled in production build | Disabled in production build |

---

## 3. Reproducible Local PostgreSQL 16 Setup & Verification (`L5-1`)

### 3.1 Start Local PostgreSQL 16 Instance
```bash
docker run --name equipflow-pg-local \
  -e POSTGRES_USER=appuser \
  -e POSTGRES_PASSWORD=localdevpassword \
  -e POSTGRES_DB=equipflow \
  -p 5432:5432 -d postgres:16-alpine

docker exec equipflow-pg-local psql -U appuser -d equipflow -c "CREATE DATABASE equipflow_test;"
```

### 3.2 Configure Local Environment
```bash
cp .env.example .env
```

### 3.3 Install, Validate, Migrate, Seed, and Build
```bash
npm ci
npm run db:validate
npm run db:generate
npm run db:migrate
npm run db:seed
npm run build
```

### 3.4 Run Full Automated Regression Suites (Against PostgreSQL 16)
```bash
# Backend API, concurrency, auth, /api/health + /api/ready probes, test DB guard & seed checks (40 tests)
npm test

# Frontend UI component tests (15 tests)
npm run test:client

# End-to-End Playwright browser verification suite (4 scenarios)
npx playwright test
```

### 3.5 Verified L5-1 Local Execution Evidence (PostgreSQL 16)
```text
$ npm run db:migrate && npm run db:seed
Datasource "db": PostgreSQL database "equipflow", schema "public"
1 migration found in prisma/migrations
All migrations have been successfully applied.
Running seed command `node --import tsx prisma/seed.ts` ...
Seeded 3 users and 6 equipment items.

$ npm run build
✔ Generated Prisma Client (v6.19.3) to .\node_modules\@prisma\client in 70ms
vite v7.3.8 building client environment for production...
✓ 32 modules transformed.
dist/index.html                   0.55 kB │ gzip:  0.33 kB
dist/assets/index-ClGdsf-u.css  241.44 kB │ gzip: 32.88 kB
dist/assets/index-D5tZKAj8.js   168.54 kB │ gzip: 52.44 kB
✓ built in 599ms
> @equipflow/server@0.1.0 build
> tsc -p tsconfig.json

$ npm test
Datasource "db": PostgreSQL database "equipflow_test", schema "public"
Applying migration `20261112205548_init`
Database reset successful
Seeded 3 users and 6 equipment items.
 ✓ tests/sprint-1/health.api.test.ts (11 tests) 72ms
 ✓ tests/sprint-1/catalog.api.test.ts (4 tests) 634ms
 ✓ tests/sprint-1/checkout.api.test.ts (5 tests) 666ms
 ✓ tests/sprint-1/requests.api.test.ts (7 tests) 1070ms
 ✓ tests/sprint-1/auth.api.test.ts (13 tests) 2469ms
 Test Files  5 passed (5)
      Tests  40 passed (40)

$ npm run test:client
 ✓ tests/sprint-1/MyRequests.test.tsx (3 tests) 185ms
 ✓ tests/sprint-1/CustodianDesk.test.tsx (3 tests) 225ms
 ✓ tests/sprint-1/Catalog.test.tsx (6 tests) 234ms
 ✓ tests/sprint-1/Login.test.tsx (3 tests) 269ms
 Test Files  4 passed (4)
      Tests  15 passed (15)

$ npx playwright test
Datasource "db": PostgreSQL database "equipflow_test", schema "public"
Applying migration `20261112205548_init`
Database reset successful
Seeded 3 users and 6 equipment items.
Running 4 tests using 1 worker
  4 passed (14.9s)
```

---

## 4. Containerization, CI/CD & Cloud Run Release Procedure

*(Sections for Docker Compose `L5-2`, GitHub Actions CI `L5-3`, GCP First Deploy `L5-4`, WIF & Merge Gate `L5-5`, and Automated Main Release `L5-6` will be expanded as each Lab 5 issue merges into `sprint-1-staging`.)*

