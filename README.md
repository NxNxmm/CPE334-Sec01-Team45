# EquipFlow — Sprint 1

EquipFlow is the CPE334 Inventory and Borrowing System. This repository is a small npm workspace with a React 18/Vite client, an Express/TypeScript API, and a Prisma/SQLite database.

## Requirements

- Node.js 20.19+ or 22.12+ (an active LTS release is recommended)
- npm 10+

## Local setup

```bash
npm install
cp .env.example .env
npm run db:generate
npm run db:migrate
npm run db:seed
npm run dev
```

The client runs at <http://localhost:5173> and the API health endpoint at <http://localhost:3000/api/health>. Vite proxies `/api` requests to the local API.

`DATABASE_URL` in `.env` defaults to `file:./dev.db`, resolved relative to `prisma/schema.prisma`; the generated database is ignored by Git. The initial migration is committed under `prisma/migrations/`.

## Seed accounts

The local seed creates these development-only accounts. Each uses the password `Password123!`; stored values are bcrypt hashes (12 rounds).

| Role | Email | Student/staff ID |
| --- | --- | --- |
| Borrower | `borrower@cpe.kmutt.ac.th` | `67070501001` |
| Borrower | `borrower2@cpe.kmutt.ac.th` | `67070501002` |
| Custodian | `custodian@cpe.kmutt.ac.th` | `STAFF-001` |

The seed is safe to re-run and ensures six specification fixtures, including an active checkout for `CPE-RPI-002` and the maintenance item `CPE-LOG-001`. Do not use these sample credentials outside local development.

## Available commands

- `npm run dev` — run the Vite client and Express API together (Vite provides client hot reload; restart the API after server code changes)
- `npm run build` — build the client and type-check/compile the API
- `npm test` — run backend API & integration tests (`server/tests/sprint-1/`)
- `npm run test:client` — run frontend React component tests (`client/tests/sprint-1/`)
- `npm run test:all` — run both backend and frontend test suites
- `npm run test:e2e` (`npx playwright test`) — run Playwright end-to-end browser verification journeys (`e2e/sprint-1/`)
- `npm run db:generate` — generate Prisma Client
- `npm run db:migrate` — create/apply the local development migration
- `npm run db:seed` — seed development fixtures
- `npm run db:setup` — migrate and seed a local database

## Sprint 1 Documentation (`v0.1.0-sprint1`)

- [Sprint 1 Engineering Specification](docs/sprints/sprint-1/specification.md)
- [Sprint 1 REST API Specification](docs/sprints/sprint-1/api-spec.md)
- [Sprint 1 UI Specification (Blue Matcha Design System)](docs/sprints/sprint-1/ui-spec.md)
- [Sprint 1 Test Plan, Traceability Matrix & Release Evidence](docs/sprints/sprint-1/tests.md)
