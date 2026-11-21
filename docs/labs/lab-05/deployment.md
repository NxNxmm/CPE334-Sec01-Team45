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

## 4. Continuous Integration Quality Gate (`L5-3`, `R-05`, `C-01`)

The PR CI pipeline is defined in [`.github/workflows/ci-docker.yml`](../../../.github/workflows/ci-docker.yml) with the stable required check name **`test-and-docker`**.

- **Triggers:** `pull_request` targeting `main` and `sprint-1-staging`, `push` to `sprint-1-staging`, and `workflow_dispatch`.
- **PostgreSQL 16 Service Container:** Runs `postgres:16-alpine` with `pg_isready` health checks and creates a dedicated `equipflow_test` database separate from `equipflow` (`DATABASE_URL` vs `TEST_DATABASE_URL`).
- **Verification Steps:**
  1. Clean dependency installation (`npm ci`) on Node.js 22.
  2. Schema validation and Prisma Client generation (`npm run db:validate`, `npm run db:generate`).
  3. Production database migration and seed (`npm run db:migrate`, `npm run db:seed`).
  4. Workspace build (`npm run build` for `client` and `server`).
  5. Automated backend integration tests (`npm test`) and frontend component tests (`npm run test:client`).
  6. Production Docker build (`docker build -t equipflow:ci-<sha> .`) and container smoke verification (`id -u != 0`, `/api/health`, `/api/ready`, `/`, and borrower login HTTP `200`).

---

## 5. Cloud Run Provisioning & Release Procedure (`L5-4`–`L5-6`)

### 5.0 First-Time GCP Provisioning & Deployment (`L5-4`, `R-03`, `C-04`)

[`deploy/deploy.sh`](../../../deploy/deploy.sh) idempotently provisions the team's GCP infrastructure in project `cpe334-team45`, builds both Docker targets (`runtime` and `db-tools`) for `linux/amd64` via **Google Cloud Build** ([`deploy/cloudbuild.yaml`](../../../deploy/cloudbuild.yaml), `BUILD_METHOD=cloudbuild` by default to avoid Cloud Shell local Docker daemon egress restrictions, or `BUILD_METHOD=docker` when overriding locally), resolves immutable Artifact Registry SHA-256 digests, runs Prisma migrations + initial seed via a Cloud Run Job, deploys the `runtime` image to Cloud Run, and verifies the live HTTPS URL with [`deploy/smoke_test.py`](../../../deploy/smoke_test.py).

#### Agreed GCP Resource Naming (`cpe334-team45`)

These defaults match [`deploy/deploy.sh`](../../../deploy/deploy.sh), [`deploy/release.sh`](../../../deploy/release.sh), and the `demo` GitHub Environment variables in `L5-5`:

| Resource / Setting | Default Value (`L5-4` / `L5-5` / `L5-6`) | Purpose |
| :--- | :--- | :--- |
| `GCP_PROJECT_ID` | `cpe334-team45` | Team GCP Project ID |
| `GCP_REGION` | `asia-southeast1` | Primary region for Cloud Run, Cloud SQL, and Artifact Registry |
| `AR_REPOSITORY` | `equipflow` | Artifact Registry Docker repository |
| `AR_IMAGE` | `app` | Image name (`:<sha>` for runtime, `:<sha>-db-tools` for Prisma CLI) |
| `SQL_INSTANCE` | `equipflow-pg` | Cloud SQL PostgreSQL 16 instance (`db-f1-micro`, 10 GB) |
| `CLOUD_RUN_SERVICE` | `equipflow` | Public Cloud Run HTTPS service (`PORT=8080`, non-root `node`) |
| `CLOUD_RUN_MIGRATION_JOB` | `equipflow-migrate` | Cloud Run Job configured with `npm run db:migrate` |
| `RUNTIME_SA` | `equipflow-runner@cpe334-team45.iam.gserviceaccount.com` | Least-privilege runtime SA (`roles/cloudsql.client` + Secret Manager accessors) |

#### Running First-Time Deploy from Google Cloud Shell (`NxNxmm`)

Run from a clean checkout of `feat/lab5-first-deploy` (or `sprint-1-staging` after merge) in **Google Cloud Shell**, where `gcloud`, `docker`, `python3`, and `openssl` are preinstalled:

```bash
git clone https://github.com/NxNxmm/CPE334-Sec01-Team45.git
cd CPE334-Sec01-Team45
git checkout feat/lab5-first-deploy

# Prompt for DEMO_USER_PASSWORD without saving it to shell history or Git
read -s -p "DEMO_USER_PASSWORD: " DEMO_USER_PASSWORD; echo
export DEMO_USER_PASSWORD

bash deploy/deploy.sh
unset DEMO_USER_PASSWORD
```

#### `C-04` Live Cloud Run Verification Checklist

After `deploy/deploy.sh` prints `SERVICE_URL` and `LATEST_REVISION` and passes `deploy/smoke_test.py`:

1. Confirm `GET ${SERVICE_URL}/api/health` returns `{"status":"ok","service":"equipflow-api"}` and `GET ${SERVICE_URL}/api/ready` returns `{"status":"ready","service":"equipflow-api","db":"connected"}`.
2. Open `${SERVICE_URL}` in a browser (keeping the `https://*.run.app` address bar visible in all `C-04` screenshots):
   - Sign in as the seeded Borrower (`borrower@cpe.kmutt.ac.th`) and submit a borrow request for an `AVAILABLE` item.
   - Sign out, sign in as the seeded Custodian (`custodian@cpe.kmutt.ac.th`), open `/custodian/desk`, and complete checkout (creating an active 7-day loan).
   - Verify a rule rejection or access restriction (e.g., attempting to request the occupied item, or confirming HTTP `403 FORBIDDEN_ROLE` when a Borrower requests Custodian endpoints).
3. Record the Cloud Run service URL and active revision:

   ```bash
   gcloud run services describe equipflow --project=cpe334-team45 --region=asia-southeast1 \
     --format='yaml(status.url,status.latestReadyRevisionName,status.traffic)'
   ```

#### Post-Grading Cost Cleanup (`R-12`) & Temporary Idle Pause
>
> [!IMPORTANT]
> Cloud Run (`--min-instances=0`) scales to zero with \$0 idle compute cost. Only the Cloud SQL instance (`equipflow-pg`, `db-f1-micro`) accrues compute charges while running. Keep both Cloud Run and Cloud SQL active (`ALWAYS`) throughout teammate review, CI/CD release testing, and Lab 5 grading (`R-12`).
>
> **Temporary pause/resume while idle before submission (Episode 9):**
> ```bash
> # Pause Cloud SQL compute temporarily while idle
> gcloud sql instances patch equipflow-pg --activation-policy=NEVER --project=cpe334-team45
>
> # Resume Cloud SQL before testing, CI/CD runs, or grading
> gcloud sql instances patch equipflow-pg --activation-policy=ALWAYS --project=cpe334-team45
> ```
>
> **Permanent teardown only AFTER Lab 5 grading concludes:**
> ```bash
> bash deploy/teardown.sh --confirm-teardown
> ```

#### Verified L5-4 / C-04 First-Deploy Evidence (2026-11-19 ICT)
- **Deployed Source SHA:** `ac9b8dd564caa300473612f205b8e72ffbe57ed0`
- **Cloud Build Run:** `e4015d37-479f-48f8-b3b8-d28d1c41e4a5` (`STATUS: SUCCESS`, duration `3M5S`)
- **Runtime Image Digest:** `asia-southeast1-docker.pkg.dev/cpe334-team45/equipflow/app@sha256:ddc3b8d1de0d7feb4f53e4d6f1880b8646116edc676c75ffdeb01fed501f0e83`
- **Migration (`db-tools`) Image Digest:** `asia-southeast1-docker.pkg.dev/cpe334-team45/equipflow/app@sha256:1a6d7d9a46052c51549dacc411d6ecf5800d0bc330fcb72aa2d3ef59ad69babf`
- **Migration & Seed Executions:** `equipflow-migrate-7bw58` (`npm run db:migrate`, `1 / 1 complete`) and `equipflow-migrate-dntv9` (`npm run db:seed`, `1 / 1 complete`)
- **Live Cloud Run URL & Active Revision:** `https://equipflow-ddqo5fpv2a-as.a.run.app` (`equipflow-00001-t44`, `100%` traffic)
- **Live Domain Workflow (`C-04`):** Verified on `https://equipflow-ddqo5fpv2a-as.a.run.app` (`equipflow-00001-t44`, `100%` traffic) using the seeded demo accounts: a `BORROWER` submitted a borrow request for `CPE-OSC-001`, and a `CUSTODIAN` completed physical checkout into an active 7-day loan.
- **Browser Role Boundary (`C-04`):** Navigating directly to `https://equipflow-ddqo5fpv2a-as.a.run.app/custodian/desk` while signed in as `BORROWER` kept the user restricted to the Borrower portal without exposing Custodian operations.

```text
$ gcloud run services describe equipflow --project=cpe334-team45 --region=asia-southeast1 \
    --format='yaml(status.url,status.latestReadyRevisionName,status.traffic)'
status:
  latestReadyRevisionName: equipflow-00001-t44
  traffic:
  - latestRevision: true
    percent: 100
    revisionName: equipflow-00001-t44
  url: https://equipflow-ddqo5fpv2a-as.a.run.app

$ curl -sS https://equipflow-ddqo5fpv2a-as.a.run.app/api/health
{"status":"ok","service":"equipflow-api"}

$ curl -sS https://equipflow-ddqo5fpv2a-as.a.run.app/api/ready
{"status":"ready","service":"equipflow-api","db":"connected"}

$ curl -sS -w "\nHTTP %{http_code}\n" https://equipflow-ddqo5fpv2a-as.a.run.app/api/v1/custodian/requests
{"error":{"code":"UNAUTHENTICATED","message":"Authentication token is missing or malformed"}}
HTTP 401

$ curl -sS -w "\nHTTP %{http_code}\n" -H "Authorization: Bearer <BORROWER_JWT_REDACTED>" https://equipflow-ddqo5fpv2a-as.a.run.app/api/v1/custodian/requests
{"error":{"code":"FORBIDDEN_ROLE","message":"Access denied for role BORROWER"}}
HTTP 403
```

### 5.1 Keyless Workload Identity Federation, GitHub Environment & Merge Gate (`L5-5`, `R-06`, `C-02`)

[`deploy/setup-wif.sh`](../../../deploy/setup-wif.sh) establishes keyless authentication from GitHub Actions to Google Cloud Platform without generating or storing any service-account JSON keys (`R-12`).

1. **Provisioning the Deployer Identity & OIDC Federation:**
   Run in Google Cloud Shell as project owner on `cpe334-team45`:
   ```bash
   bash deploy/setup-wif.sh
   ```
   This script creates:
   - Service Account `equipflow-deployer@cpe334-team45.iam.gserviceaccount.com` with least-privilege roles:
     - `roles/artifactregistry.writer` on repository `equipflow` (`asia-southeast1`)
     - `roles/run.developer` on project `cpe334-team45`
     - `roles/iam.serviceAccountUser` on runtime SA `equipflow-runner@cpe334-team45.iam.gserviceaccount.com`
   - Workload Identity Pool `github-pool` and OIDC Provider `github-provider` (`https://token.actions.githubusercontent.com`):
     - Attribute mapping includes `google.subject=assertion.sub`, `attribute.actor=assertion.actor`, `attribute.repository=assertion.repository`, immutable `attribute.repository_id=assertion.repository_id`, `attribute.ref=assertion.ref`, `attribute.environment=assertion.environment`, and `attribute.workflow_ref=assertion.workflow_ref` (`workflow_ref` is used rather than `job_workflow_ref` because the `deploy` job is defined directly in `.github/workflows/deploy.yml`, where GitHub emits `workflow_ref` and omits `job_workflow_ref`).
     - Attribute condition restricts token exchange strictly to `assertion.repository == 'NxNxmm/CPE334-Sec01-Team45' && assertion.repository_id == '1455066360' && assertion.ref == 'refs/heads/main' && assertion.environment == 'demo' && assertion.workflow_ref == 'NxNxmm/CPE334-Sec01-Team45/.github/workflows/deploy.yml@refs/heads/main'`.
     - Existing providers are updated (`update-oidc`) and verified fail-closed (`describe --format=json`) against expected issuer, mapping, and condition; `setup-wif.sh` exits non-zero if any field drifts.
   - Binding `roles/iam.workloadIdentityUser` on `equipflow-deployer@cpe334-team45.iam.gserviceaccount.com` strictly for `principalSet://iam.googleapis.com/projects/906022478800/locations/global/workloadIdentityPools/github-pool/attribute.repository_id/1455066360` (removing any legacy `attribute.repository` binding).

2. **`demo` GitHub Environment Variables (`Settings -> Environments -> demo`):**
   | Variable | Value (`cpe334-team45`) |
   | :--- | :--- |
   | `GCP_PROJECT_ID` | `cpe334-team45` |
   | `GCP_REGION` | `asia-southeast1` |
   | `WIF_PROVIDER` | `projects/906022478800/locations/global/workloadIdentityPools/github-pool/providers/github-provider` |
   | `WIF_SERVICE_ACCOUNT` | `equipflow-deployer@cpe334-team45.iam.gserviceaccount.com` |
   | `AR_REPOSITORY` | `equipflow` |
   | `AR_IMAGE` | `app` |
   | `CLOUD_RUN_SERVICE` | `equipflow` |
   | `CLOUD_RUN_MIGRATION_JOB` | `equipflow-migrate` |

3. **`protect-main` Branch Ruleset & `C-02` Quality Gate Proof (`R-06`):**
   - Configured GitHub branch ruleset **`protect-main`** on `main`: block force pushes, require a pull request with `1` approval (dismiss stale approvals on new commits), and require status check **`test-and-docker`** to pass before merging.
   - To verify `C-02`, open a temporary PR from `test/prove-gate` targeting `main` containing one intentionally failing test, wait for `test-and-docker` to fail and confirm GitHub blocks merging, capture the PR and failed Actions run evidence, then close the temporary PR without merging and delete `test/prove-gate`.

#### Verified L5-5 / C-02 WIF & Merge-Gate Evidence (2026-11-20 – 2026-11-21 ICT)
- **Keyless WIF & Deployer Identity (`R-07`, `R-12`):** Executed `bash deploy/setup-wif.sh` in Google Cloud Shell on project `cpe334-team45` (`906022478800`), provisioning `equipflow-deployer@cpe334-team45.iam.gserviceaccount.com` with least-privilege IAM roles (`roles/artifactregistry.writer` on `equipflow`, `roles/run.developer` on `cpe334-team45`, `roles/iam.serviceAccountUser` on `equipflow-runner@cpe334-team45.iam.gserviceaccount.com`), Workload Identity Pool `github-pool`, and OIDC Provider `projects/906022478800/locations/global/workloadIdentityPools/github-pool/providers/github-provider` with zero downloaded JSON keys. On `2026-11-21 ICT` (from commit `3bb7dbc`), `bash deploy/setup-wif.sh` was re-executed in Google Cloud Shell on `cpe334-team45` (`906022478800`) to converge `github-provider` (`update-oidc`) from `job_workflow_ref` to `workflow_ref` with fail-closed verification passing:
  - Live `gcloud iam workload-identity-pools providers describe github-provider ... --format=json` confirmed `state: "ACTIVE"`, `issuerUri: "https://token.actions.githubusercontent.com"`, `attributeMapping` containing `attribute.workflow_ref: assertion.workflow_ref` (with no `job_workflow_ref`), and `attributeCondition` checking `repository`, `repository_id == '1455066360'`, `refs/heads/main`, `demo`, and `workflow_ref == 'NxNxmm/CPE334-Sec01-Team45/.github/workflows/deploy.yml@refs/heads/main'`.
  - Live `gcloud iam service-accounts get-iam-policy equipflow-deployer@cpe334-team45.iam.gserviceaccount.com` confirmed a single `roles/iam.workloadIdentityUser` binding for `principalSet://iam.googleapis.com/projects/906022478800/locations/global/workloadIdentityPools/github-pool/attribute.repository_id/1455066360` with no legacy `attribute.repository` binding.
- **GitHub Environment `demo`:** Configured all 8 required deployment variables in `Settings -> Environments -> demo` (`WIF_PROVIDER` retains the same provider resource path).
- **Branch Ruleset & Failing-PR Merge-Gate Proof (`C-02` / `R-06`):**
  - Ruleset **`protect-main`** active on `main` requiring PR approval (`1` review, dismiss stale approvals), status check **`test-and-docker`**, and force-push protection.
  - Opened temporary demonstration PR **`#34`** (`https://github.com/NxNxmm/CPE334-Sec01-Team45/pull/34`, `test/prove-gate` -> `main`, label `lab5`) containing an intentional failing assertion in `server/tests/sprint-1/health.api.test.ts`.
  - Required check **`test-and-docker`** failed in GitHub Actions run **`https://github.com/NxNxmm/CPE334-Sec01-Team45/actions/runs/44601332891`** (`CI - Test & Docker` #10, duration `51s`, `Test Files: 1 failure, 4 passes`, `Test Results: 2 failures, 38 passes`, `AssertionError: expected 200 to be 500`).
  - Confirmed GitHub blocked merging on PR `#34` (`test-and-docker` failing + `1` approving review required), captured screenshot evidence for `C-02`, closed PR `#34` without merging, and deleted `test/prove-gate`.

```text
$ bash deploy/setup-wif.sh
Enabling required IAM, STS, and deployment APIs on project cpe334-team45...
Operation "operations/acat.p2-906022478800-76073a18-9899-452c-9366-8ef7a1d72ace" finished successfully.
Granting least-privilege IAM roles to equipflow-deployer@cpe334-team45.iam.gserviceaccount.com...
Updated IAM policy for repository [equipflow].
Updated IAM policy for serviceAccount [equipflow-runner@cpe334-team45.iam.gserviceaccount.com].
Updating existing OIDC Workload Identity Provider github-provider...
Updated workload identity pool provider [github-provider].
name: projects/906022478800/locations/global/workloadIdentityPools/github-pool/providers/github-provider/operations/bigarx76qdmamefy6kn5maq000000000
Removing legacy repository-name WIF binding if present...
Binding immutable repository_id 1455066360 (NxNxmm/CPE334-Sec01-Team45) to equipflow-deployer@cpe334-team45.iam.gserviceaccount.com...
Updated IAM policy for serviceAccount [equipflow-deployer@cpe334-team45.iam.gserviceaccount.com].

=== GitHub Environment 'demo' Variables (Settings -> Environments -> demo) ===
GITHUB_REPOSITORY_ID=1455066360
GCP_PROJECT_ID=cpe334-team45
GCP_REGION=asia-southeast1
WIF_PROVIDER=projects/906022478800/locations/global/workloadIdentityPools/github-pool/providers/github-provider
WIF_SERVICE_ACCOUNT=equipflow-deployer@cpe334-team45.iam.gserviceaccount.com
AR_REPOSITORY=equipflow
AR_IMAGE=app
CLOUD_RUN_SERVICE=equipflow
CLOUD_RUN_MIGRATION_JOB=equipflow-migrate
```

```text
$ gcloud iam workload-identity-pools providers describe github-provider --project=cpe334-team45 --location=global --workload-identity-pool=github-pool --format=json
{
  "attributeCondition": "assertion.repository == 'NxNxmm/CPE334-Sec01-Team45' && assertion.repository_id == '1455066360' && assertion.ref == 'refs/heads/main' && assertion.environment == 'demo' && assertion.workflow_ref == 'NxNxmm/CPE334-Sec01-Team45/.github/workflows/deploy.yml@refs/heads/main'",
  "attributeMapping": {
    "attribute.actor": "assertion.actor",
    "attribute.environment": "assertion.environment",
    "attribute.ref": "assertion.ref",
    "attribute.repository": "assertion.repository",
    "attribute.repository_id": "assertion.repository_id",
    "attribute.workflow_ref": "assertion.workflow_ref",
    "google.subject": "assertion.sub"
  },
  "displayName": "GitHub Actions Provider",
  "name": "projects/906022478800/locations/global/workloadIdentityPools/github-pool/providers/github-provider",
  "oidc": {
    "issuerUri": "https://token.actions.githubusercontent.com"
  },
  "state": "ACTIVE"
}

$ gcloud iam service-accounts get-iam-policy equipflow-deployer@cpe334-team45.iam.gserviceaccount.com --project=cpe334-team45
bindings:
- members:
  - principalSet://iam.googleapis.com/projects/906022478800/locations/global/workloadIdentityPools/github-pool/attribute.repository_id/1455066360
  role: roles/iam.workloadIdentityUser
etag: BwZgxH4lYlU=
version: 1
```

### 5.2 Automated main deployment (`L5-6`)

`.github/workflows/deploy.yml` is designed to deploy only after a push to `main`, which in this project should be a reviewed release PR from `sprint-1-staging`. Its `test` job reuses `ci-docker.yml`; the deploy job requires that job to pass before it authenticates through Workload Identity Federation, builds and pushes the `runtime` and `db-tools` targets tagged with the 40-character source SHA, resolves both immutable image digests, runs the migration job with the `db-tools` image, updates the service with the production `runtime` image, and performs read-only HTTP smoke checks. The distinct image targets are required because `npm prune --omit=dev` removes the Prisma CLI from `runtime`, while the migrations require Prisma CLI. A migration failure stops the workflow before service rollout. The optional manual rollback input must be a full SHA already present in Artifact Registry; rollback skips migrations and reuses that runtime image.

The `demo` GitHub Environment must be configured by the project owner/team before enabling a release. Configure these **variables** there (values are project-specific and must match the resources created for `cpe334-team45`):

| Variable | Purpose |
| :--- | :--- |
| `GCP_PROJECT_ID` | GCP project ID |
| `GCP_REGION` | Region containing Cloud Run, Cloud SQL, and Artifact Registry |
| `WIF_PROVIDER` | Full Workload Identity Provider resource name |
| `WIF_SERVICE_ACCOUNT` | Dedicated GitHub deploy service-account email |
| `AR_REPOSITORY` | Artifact Registry Docker repository name |
| `AR_IMAGE` | Container image name in that repository |
| `CLOUD_RUN_SERVICE` | Existing Cloud Run service name |
| `CLOUD_RUN_MIGRATION_JOB` | Existing Cloud Run Job name configured for `npm run db:migrate` |

The Cloud Run service and migration job must already reference the intended Secret Manager values and Cloud SQL instance from `L5-4`; the deploy workflow updates images only and does not create or change IAM, billing, databases, or secret values. Do not put credentials in workflow files or GitHub variables.

The workflow smoke checks are read-only and use this application's routes: `/api/health`, `/api/ready`, and `/`. The workflow summary records the source SHA, image tag/digest, service URL, rollback mode, and successful smoke step. Release 1 (`#36`) verified the first automated end-to-end deployment; the second visible-change release (`L5-6` repeatability proof) is pending before closing `#26` for `C-06`.

#### Verified L5-6 / C-06 Automated Release Evidence (2026-11-21 ICT)
- **Release 1 — First Automated Main Deployment (PR `#36`, Part of `#26`):**
  - **Release PR:** `#36` (`sprint-1-staging` -> `main`, `[Lab 5] L5-6: Release automated deployment to main`)
  - **Merge Commit SHA (`main`):** `e19ea5c6dd568e17b0dcadc6e1ee641abc2f8c77`
  - **GitHub Actions Run:** `https://github.com/NxNxmm/CPE334-Sec01-Team45/actions/runs/44885217719` (`Deploy EquipFlow to Cloud Run`, keyless WIF auth, `test` + `deploy` succeeded)
  - **Migration Execution:** `equipflow-migrate-5n7zv` (`COMPLETE: 1 / 1`, `2026-11-21 08:34:29 UTC`, run by `equipflow-deployer@cpe334-team45.iam.gserviceaccount.com`)
  - **Migration Image Digest:** `asia-southeast1-docker.pkg.dev/cpe334-team45/equipflow/app@sha256:8b9db9f790babb1fa42da1d78bbe90110613b13804c70f4bfccad2e7df9d6851`
  - **Runtime Image Digest:** `asia-southeast1-docker.pkg.dev/cpe334-team45/equipflow/app@sha256:a0827599e158b5ccef28fc43096540aa63259c708333d6d164d179deb709d69f`
  - **Cloud Run Revision & Traffic:** `equipflow-00002-wnj` (`100%` traffic, `latestRevision: true`)
  - **Service URL & Smoke Checks:** `https://equipflow-ddqo5fpv2a-as.a.run.app` (`/api/health`, `/api/ready`, and `/` passed)

**Current verification boundary (`L5-4` & `L5-5` completed; `L5-6` Release 1 verified / Release 2 pending; `L5-7` pending):**
- **Completed (`L5-4` / `C-04`):** Required GCP APIs (`run.googleapis.com`, `sqladmin.googleapis.com`, `artifactregistry.googleapis.com`, `cloudbuild.googleapis.com`, `secretmanager.googleapis.com`, `iam.googleapis.com`, and `iamcredentials.googleapis.com`) are enabled on project `cpe334-team45`. Cloud SQL (`equipflow-pg`), Artifact Registry (`equipflow`), Secret Manager secrets, migration job (`equipflow-migrate`), and Cloud Run service (`equipflow`) are provisioned and verified live at `https://equipflow-ddqo5fpv2a-as.a.run.app` on revision `equipflow-00001-t44` (`100%` traffic) deployed from source SHA `ac9b8dd564caa300473612f205b8e72ffbe57ed0` (covering `/api/health`, `/api/ready`, `401`/`403` role guards, browser role boundary, and Borrower request for `CPE-OSC-001` -> Custodian checkout).
- **Completed (`L5-5` `#25` / `C-02`):** Provisioned `equipflow-deployer@cpe334-team45.iam.gserviceaccount.com`, `github-pool` / `github-provider`, all 8 variables in the `demo` GitHub Environment, and activated `protect-main` on `main` (blocking failing PR `#34`, run `44601332891`, before closing `#34` without merging). On `2026-11-21 ICT` (from commit `3bb7dbc`), `bash deploy/setup-wif.sh` was re-executed in Google Cloud Shell on `cpe334-team45` (`906022478800`), and live `providers describe --format=json` plus `service-accounts get-iam-policy` confirmed `state: ACTIVE`, `attribute.workflow_ref`, `assertion.workflow_ref == 'NxNxmm/CPE334-Sec01-Team45/.github/workflows/deploy.yml@refs/heads/main'` (with zero `job_workflow_ref` mapping/condition remaining), and a single `roles/iam.workloadIdentityUser` binding for `attribute.repository_id/1455066360`. End-to-end GitHub Actions OIDC exchange from `.github/workflows/deploy.yml` was then proven live in `L5-6` Release 1 (`#36`).
- **In Progress (`L5-6` `#26` / `C-06`):** Release 1 (`#36`, `e19ea5c`, run `44885217719`, `equipflow-migrate-5n7zv`, revision `equipflow-00002-wnj` `100%` traffic) is verified live; Release 2 (visible UI change adding KMUTT subtitle, Lab Hours & quota notice on Login, and portal footer on `feat/lab5-visible-release`) is pending merge to `sprint-1-staging` and reviewed release PR to `main` to prove repeatability and capture the second revision/digest before closing `#26`.
- **Pending (`L5-7` `#27` / `C-05`):** Verify synthetic domain-record persistence across Cloud Run restart and redeploy.
