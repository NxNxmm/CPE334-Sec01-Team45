# System-Level Software Design Specification (SDS)
## CPE Equipment & Hardware Inventory and Borrowing System (EquipFlow)

**Document ID:** `SDS-SYS-01`  
**Version:** `1.1.0`  
**Status:** Baseline Revised (Addressed Peer Review Feedback)  
**Deliverable:** Project Deliverable 1 — Part C  
**Due Date:** 15 November 2026 at 23:59 (Aligned with LEB2)  

---

## 1. System Architecture & Tech Stack

### 1.1 Architectural Overview
EquipFlow is structured as a **modular full-stack application** composed of three logical tiers:
1. **Client Tier (Presentation):** Single Page Application (SPA) built with React 18, Vite, and TypeScript.
2. **Application / API Tier (Business Logic):** RESTful service built with Node.js, Express, and TypeScript, structured into Controllers, Services, and Domain Validators.
3. **Persistence Tier (Data):** Relational database managed through Prisma ORM (SQLite for local deterministic development and testing; PostgreSQL in a Docker container for production / GCP deployment).

```mermaid
graph TD
    subgraph Client Tier ["Client Tier (Browser)"]
        UI[React 18 + Vite SPA]
        Router[React Router DOM]
        State[Auth & UI Context Store]
    end

    subgraph API Tier ["Application / API Tier (Express + TS)"]
        AuthMW[Auth Middleware (JWT Bearer)]
        RoleMW[Role Guard Middleware]
        Controllers[API Route Controllers (/api/v1/)]
        Services[Domain Service Layer]
        Validators[Zod / Schema Validation]
    end

    subgraph Data Tier ["Persistence Tier (Prisma ORM)"]
        Prisma[Prisma Client]
        DB[(Local SQLite / GCP Cloud SQL PostgreSQL)]
    end

    UI -->|HTTP / JSON REST API with Bearer Token| AuthMW
    AuthMW --> RoleMW
    RoleMW --> Controllers
    Controllers --> Validators
    Validators --> Services
    Services -->|Business Rules Enforced Inside Transactions| Prisma
    Prisma --> DB
```

### 1.2 Technology Stack Rationale

| Layer | Selected Technology | Version | Rationale & Justification |
| :--- | :--- | :--- | :--- |
| **Frontend Framework** | **React** with **Vite** | `18.3.x` / `6.x` | High responsiveness, fast HMR during development, strong component reusability, and continuity with TokTickIT labs 1–4. |
| **Language** | **TypeScript** | `5.7.x` | End-to-end type safety between client API calls, backend routes, and database models, eliminating common runtime type errors. |
| **Styling & UI** | **Bootstrap 5** | `5.3.x` | Clean, standardized utility classes, responsive grid system (mobile/tablet/desktop), and zero styling overhead. |
| **Backend Runtime** | **Node.js + Express** | `22.x` / `4.21.x`| Lightweight, fast event-driven HTTP request handling with robust middleware support for auth and role checks. |
| **ORM / Data Access**| **Prisma ORM** | `5.22.x` | Type-safe queries, automated database migrations, declarative schema definition, and seamless seed scripting. |
| **Database Engine** | **SQLite (Dev/Test)**<br>**PostgreSQL (GCP)** | SQLite 3<br>PostgreSQL 16 | SQLite provides zero-dependency, isolated, deterministic local testing. PostgreSQL on GCP Cloud SQL provides production durability for Lab 5. |
| **Testing Tools** | **Vitest**, **Supertest**, **Playwright** | Vitest 2.x<br>Supertest 7.x<br>Playwright 1.63.x | Vitest for lightning-fast unit and domain rule testing; Supertest for API and auth integration; Playwright for browser E2E journeys. |

### 1.3 Communication & Business Rule Enforcement Boundary
* **Strict Backend Enforcement:** All domain invariants and business rules (`BR-01` to `BR-08`) are enforced exclusively within the **Backend Service Layer** (`src/services/`).
* The client UI disables buttons and provides client-side validation solely for user convenience. A hidden button or disabled input is never treated as authorization.
* **Transactional Concurrency Protection:** Every state-mutating operation (request creation, checkout, return) executes inside a database transaction (`prisma.$transaction`) to guarantee atomicity and prevent race conditions.

---

## 2. Domain Data Model & Entity Specifications

### 2.1 Entity Relationship Diagram (ERD)

```mermaid
erDiagram
    User ||--o{ BorrowRequest : "submits"
    User ||--o{ Loan : "borrower"
    User ||--o{ Loan : "custodian_checkout"
    User ||--o{ AuditLog : "performed_by"
    
    EquipmentItem ||--o{ BorrowRequest : "requested_for"
    EquipmentItem ||--o{ Loan : "loaned_as"
    EquipmentItem ||--o{ AuditLog : "asset"

    User {
        string id PK
        string email UK
        string passwordHash
        string fullName
        string studentOrStaffId UK
        enum role "BORROWER | CUSTODIAN"
        boolean isActive
        datetime createdAt
        datetime updatedAt
    }

    RevokedToken {
        string jti PK
        datetime expiresAt
        datetime createdAt
    }

    EquipmentItem {
        string id PK
        string assetTag UK
        string name
        string category
        string modelNumber
        string serialNumber UK
        string description
        enum condition "NEW | GOOD | FAIR | DAMAGED"
        enum status "AVAILABLE | RESERVED | CHECKED_OUT | MAINTENANCE | RETIRED"
        datetime createdAt
        datetime updatedAt
    }

    BorrowRequest {
        string id PK
        string borrowerId FK
        string itemId FK
        enum status "PENDING | APPROVED | REJECTED | CANCELLED | EXPIRED"
        string requestNote
        string rejectionReason
        datetime createdAt
        datetime updatedAt
    }

    Loan {
        string id PK
        string requestId FK
        string itemId FK
        string borrowerId FK
        string custodianId FK
        enum status "ACTIVE | RETURNED | OVERDUE"
        datetime checkedOutAt
        datetime dueDate
        datetime returnedAt
        string checkoutNotes
        string returnNotes
        enum returnCondition "NEW | GOOD | FAIR | DAMAGED"
        datetime createdAt
        datetime updatedAt
    }

    AuditLog {
        string id PK
        string entityType
        string entityId
        string action
        string details
        string performedById FK
        datetime timestamp
    }
```

### 2.2 Entity Field Dictionary & Integrity Constraints

#### 1. `User` Entity
* `id` (String, UUID/CUID, Primary Key)
* `email` (String, Unique, Not Null) — Institutional email address used for login.
* `passwordHash` (String, Not Null) — bcrypt hash (salt rounds $\ge 10$). Plaintext never stored.
* `fullName` (String, Not Null) — User display name.
* `studentOrStaffId` (String, Unique, Not Null) — Academic identifier (e.g., student ID `67070501026`).
* `role` (Enum: `BORROWER`, `CUSTODIAN`, Not Null) — User role for access control.
* `isActive` (Boolean, Default `true`) — Disabled users cannot log in.

#### 1.1 `RevokedToken` Entity
* `jti` (String, Primary Key) — Unique JWT identifier string.
* `expiresAt` (DateTime, Not Null) — Token expiry date/time. Records past this timestamp can be purged.
* `createdAt` (DateTime, Default `now()`) — Audit timestamp of when logout occurred.

#### 2. `EquipmentItem` Entity
* `id` (String, UUID/CUID, Primary Key)
* `assetTag` (String, Unique, Not Null) — Scannable department inventory barcode/tag (e.g., `CPE-OSC-001`).
* `name` (String, Not Null) — Equipment title (e.g., "Rigol DS1054Z Digital Oscilloscope").
* `category` (String, Not Null) — Classification (e.g., "Measurement", "Microcontrollers", "FPGA").
* `modelNumber` (String, Nullable) — Manufacturer part number.
* `serialNumber` (String, Unique, Not Null) — Manufacturer hardware serial number.
* `condition` (Enum: `NEW`, `GOOD`, `FAIR`, `DAMAGED`, Default `GOOD`).
* `status` (Enum: `AVAILABLE`, `RESERVED`, `CHECKED_OUT`, `MAINTENANCE`, `RETIRED`, Default `AVAILABLE`).

#### 3. `BorrowRequest` Entity
* `id` (String, UUID/CUID, Primary Key)
* `borrowerId` (String, Foreign Key $\rightarrow$ `User.id`, Not Null)
* `itemId` (String, Foreign Key $\rightarrow$ `EquipmentItem.id`, Not Null)
* `status` (Enum: `PENDING`, `APPROVED`, `REJECTED`, `CANCELLED`, `EXPIRED`, Default `PENDING`).
* `requestNote` (String, Nullable) — Stated academic purpose of request.
* `rejectionReason` (String, Nullable) — Recorded when rejected by custodian.

#### 4. `Loan` Entity
* `id` (String, UUID/CUID, Primary Key)
* `requestId` (String, Foreign Key $\rightarrow$ `BorrowRequest.id`, Unique, Nullable)
* `itemId` (String, Foreign Key $\rightarrow$ `EquipmentItem.id`, Not Null)
* `borrowerId` (String, Foreign Key $\rightarrow$ `User.id`, Not Null)
* `custodianId` (String, Foreign Key $\rightarrow$ `User.id`, Not Null) — Accountable staff recording checkout (`BR-08`).
* `status` (Enum: `ACTIVE`, `RETURNED`, `OVERDUE`, Default `ACTIVE`).
* `checkedOutAt` (DateTime, Default `now()`).
* `dueDate` (DateTime, Not Null) — Authoritative deadline (`checkedOutAt + 7 days`, `BR-05`).
* `returnedAt` (DateTime, Nullable).
* `returnCondition` (Enum, Nullable).

---

## 3. UI, API & Access Conventions

### 3.1 Screen Hierarchy & Navigation
The UI provides distinct views based on authenticated role identity:

```
[ Public / Unauthenticated ]
    ├── Login View (/login)
    
[ Authenticated: Borrower ]
    ├── Catalog Browser View (/catalog)
    │     └── Item Detail Modal (Specs, Status, "Request Item" button)
    └── My Requests & Loans View (/my-requests)
          ├── Active Loans List (Item details, Checked out date, Due date)
          └── Pending Requests List (Status badges: PENDING, APPROVED)

[ Authenticated: Custodian ]
    ├── Custodian Operations Desk (/custodian/desk)
    │     ├── Pending Requests Queue ("Approve & Checkout", "Reject" actions)
    │     └── Active Loans Queue ("Process Return" action)
    ├── Inventory Catalog Manager (/custodian/inventory) [Sprint 2]
    └── System Audit Logs View (/custodian/logs) [Sprint 3]
```

### 3.2 Shared UI Behaviors
* **Loading States:** All asynchronous fetch actions render a standardized loading spinner or skeleton card.
* **Empty States:** When a list is empty (e.g., zero pending requests), a contextual empty state card is rendered (`"No pending requests found."`).
* **Validation Feedback:** Forms display red inline helper text upon field validation failure and disable submit buttons while the request is in flight to prevent double submissions.
* **Alerts & Toasts:** Action confirmations (e.g., `"Checkout recorded successfully"`) appear as floating dismissible alerts.

### 3.3 Authoritative API Conventions & Error Structure

All API endpoints follow RESTful URI conventions under `/api/v1/` and return a standard JSON envelope:

#### Successful Response Format
```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "timestamp": "2026-11-12T18:00:00.000Z"
  }
}
```

#### Error Response Format
```json
{
  "success": false,
  "error": {
    "code": "ITEM_NOT_AVAILABLE",
    "message": "Equipment item CPE-OSC-001 is currently reserved or checked out.",
    "details": null
  },
  "meta": {
    "timestamp": "2026-11-12T18:00:00.000Z"
  }
}
```

#### HTTP Status Codes
* `200 OK`: Request succeeded.
* `201 Created`: Resource successfully created.
* `400 Bad Request`: Validation failure or business rule violation (`BR-01`, `BR-04`).
* `401 Unauthorized`: Missing, invalid, or revoked authentication token.
* `403 Forbidden`: Authenticated user lacks required role or is attempting cross-user access (`BR-03`, `FR-11`).
* `404 Not Found`: Target resource does not exist.
* `409 Conflict`: Concurrency conflict (e.g., duplicate checkout attempt `BR-02`, concurrent quota overflow).
* `500 Internal Server Error`: Unhandled server exception (sanitized in production).

### 3.4 Role & Permission Matrix

All endpoints strictly use the `/api/v1/` prefix:

| Operation / Endpoint | Anonymous | Borrower | Custodian | Ownership & Business Rule Guard | Sprint |
| :--- | :---: | :---: | :---: | :--- | :---: |
| `POST /api/v1/auth/login` | **Allowed** | Allowed | Allowed | Public authentication | Sprint 1 |
| `POST /api/v1/auth/logout` | Denied (401) | **Allowed** | **Allowed** | Server records revocation; token rendered invalid | Sprint 1 |
| `GET /api/v1/auth/me` | Denied (401) | **Allowed** | **Allowed** | Returns authenticated profile and role | Sprint 1 |
| `GET /api/v1/items` | Denied (401) | **Allowed** | **Allowed** | View all catalog items and statuses | Sprint 1 |
| `GET /api/v1/items/:id` | Denied (401) | **Allowed** | **Allowed** | View single item details and specifications | Sprint 1 |
| `POST /api/v1/requests` | Denied (401) | **Allowed** | Denied (403) | Item must be `AVAILABLE` (`BR-01`); Active Quota $\le 3$ (`BR-04`) | Sprint 1 |
| `GET /api/v1/requests/my` | Denied (401) | **Allowed** | Denied (403) | Filtered strictly by authenticated `userId` (`FR-11`) | Sprint 1 |
| `POST /api/v1/requests/:id/cancel` | Denied (401) | **Allowed** | Denied (403) | Can only cancel owned pending requests | Sprint 2 |
| `GET /api/v1/custodian/requests`| Denied (401) | Denied (403) | **Allowed** | Lists all pending department requests | Sprint 1 |
| `POST /api/v1/custodian/checkouts`| Denied (401) | Denied (403) | **Allowed** | Item must be `RESERVED` for matching request (`BR-01`, `BR-02`) | Sprint 1 |
| `POST /api/v1/custodian/checkouts/walk-in`| Denied (401) | Denied (403) | **Allowed** | Item must be `AVAILABLE` for walk-in (`FR-15`) | Sprint 2 |
| `POST /api/v1/custodian/requests/:id/reject`| Denied (401) | Denied (403) | **Allowed** | Custodian rejects with reason; item $\rightarrow$ `AVAILABLE` | Sprint 2 |
| `POST /api/v1/custodian/returns`| Denied (401) | Denied (403) | **Allowed** | Custodian records return condition; item $\rightarrow$ `AVAILABLE` | Sprint 2 |
| `POST /api/v1/custodian/items` | Denied (401) | Denied (403) | **Allowed** | Custodian registers new equipment asset | Sprint 2 |
| `PATCH /api/v1/custodian/items/:id/status`| Denied (401) | Denied (403) | **Allowed** | Custodian marks item `MAINTENANCE` or `RETIRED` | Sprint 2 |

### 3.5 Single JWT Transport & Per-Token Revocation Contract

* **Single Transport:** All authenticated requests must pass the JWT token in the HTTP Authorization header:
  ```http
  Authorization: Bearer <jwt-token>
  ```
* **Payload Structure:**
  ```json
  {
    "userId": "usr_cuid123",
    "role": "BORROWER",
    "email": "borrower@cpe.kmutt.ac.th",
    "jti": "550e8400-e29b-41d4-a716-446655440000",
    "iat": 1731448800,
    "exp": 1731535200
  }
  ```
* **Authoritative Logout Contract & Enforcement across Instances (`FR-03`):**
  1. **Logout Action:** When a user logs out, the client issues `POST /api/v1/auth/logout` presenting its Bearer token.
  2. **Database Persistence:** The backend decodes the token, extracts `jti` and `exp`, and creates a record in the database:
     ```typescript
     await prisma.revokedToken.create({
       data: {
         jti: decoded.jti,
         expiresAt: new Date(decoded.exp * 1000)
       }
     });
     ```
  3. **Multi-Instance Enforcement:** Because `RevokedToken` is stored in the shared relational database (SQLite locally, Cloud SQL in production), every backend instance or container synchronously observes the revocation. The authentication middleware (`requireAuth`) queries:
     ```typescript
     const isRevoked = await prisma.revokedToken.findUnique({ where: { jti: decoded.jti } });
     if (isRevoked) {
       return res.status(401).json({
         success: false,
         error: { code: "TOKEN_REVOKED", message: "This session has been logged out." }
       });
     }
     ```
  4. **Multi-Session Independence:** Because revocation is keyed strictly by the unique `jti` of that specific token, logging out on Device A does not invalidate concurrent active sessions on Device B.
  5. **Verification Specification (`TEST-AUTH-03`):**
     * Step 1: Login user as Session 1 $\rightarrow$ obtain `token1` (with `jti_1`).
     * Step 2: Login same user as Session 2 $\rightarrow$ obtain `token2` (with `jti_2`).
     * Step 3: Call `GET /api/v1/auth/me` with `token1` $\rightarrow$ assert HTTP 200.
     * Step 4: Call `GET /api/v1/auth/me` with `token2` $\rightarrow$ assert HTTP 200.
     * Step 5: Call `POST /api/v1/auth/logout` with `token1` $\rightarrow$ assert HTTP 200.
     * Step 6: Call `GET /api/v1/auth/me` with `token1` $\rightarrow$ assert HTTP 401 (`TOKEN_REVOKED`).
     * Step 7: Call `GET /api/v1/auth/me` with `token2` $\rightarrow$ assert HTTP 200 (proving concurrent session remains valid).

---

## 4. Database Setup, Migrations & Deployment Path

### 4.1 Reproducible Database Strategy across Environments

Prisma migration files are SQL-dialect specific. To ensure 100% reproducibility across Local Development, CI, and Cloud deployment without provider incompatibility:

#### A. Local Development & Automated Testing (Sprint 1 Baseline)
* **Provider:** SQLite (`datasource db { provider = "sqlite" }` in `prisma/schema.prisma`).
* **Environment Variable:** `DATABASE_URL="file:./dev.db"` (for dev) and `DATABASE_URL="file:./test.db"` (for isolated automated testing).
* **Migration Directory:** `prisma/migrations/` (committed to Git).
* **Migration Generation & Application:**
  ```bash
  # Generate and apply local migration
  npx prisma migrate dev --name init
  ```
* **Deterministic Seed Command:**
  ```bash
  # Execute reproducible seed data
  npx prisma db seed
  ```
  *Seed Data Details:* Creates local test accounts `borrower@cpe.kmutt.ac.th` and `custodian@cpe.kmutt.ac.th` with password `Password123!` (strictly restricted to local dev), plus 6 seeded equipment items across statuses.

#### B. Continuous Integration (CI Pipeline in Sprint 1)
* Runs inside GitHub Actions on PRs into `sprint1-staging` and `main`.
* **Migration Validation:** CI explicitly validates committed migrations against a fresh SQLite database rather than using `db push`:
  ```bash
  # Drops DB and applies all committed migrations from scratch to guarantee reproducibility
  npx prisma migrate reset --force --skip-seed
  npx prisma db seed
  npm test
  ```
* Ensures that committed migrations execute cleanly from scratch with zero drift before PR approval.

#### C. Cloud Deployment & GCP Cloud Run (Lab 5 Release)
* **Provider & Schema Source:** PostgreSQL (`datasource db { provider = "postgresql" }`). The PostgreSQL schema and migrations reside in `prisma/schema.pg.prisma` with dialect-specific migration files committed to `prisma/migrations_pg/`.
* **CI & Pre-Deployment PostgreSQL Verification:**
  * Prior to GCP deployment, the CI pipeline boots an ephemeral PostgreSQL service container (`services: postgres:16`).
  * Runs pre-deploy migration check against a clean database:
    ```bash
    npx prisma migrate deploy --schema=prisma/schema.pg.prisma
    npx prisma db seed
    npm test
    ```
  * Proves that the PostgreSQL migrations and seed scripts succeed on a clean, empty database before deployment.
* **GCP Cloud Run Deployment Command:**
  * Uses Cloud SQL Auth Proxy connecting to GCP Cloud SQL (PostgreSQL 16):
    ```bash
    DATABASE_URL="postgresql://equipflow_user:${DB_PASSWORD}@127.0.0.1:5432/equipflow?sslmode=disable" \
    npx prisma migrate deploy --schema=prisma/schema.pg.prisma
    ```
* **Credential Segregation:**
  * No sample accounts or local passwords are used in production.
  * Production credentials (`DATABASE_URL`, `JWT_SECRET`) are provisioned via **GCP Secret Manager** and injected into the Cloud Run container at runtime.
  * Initial administrative cloud account is provisioned via a dedicated onboarding script, not via development seeds.

### 4.2 Multi-Stage Docker Packaging Readiness & Release Boundary

#### Distinction between Sprint 1 Release and Lab 5 Deployment:
1. **Sprint 1 Accepted Release (`v0.1.0-sprint1`):**
   * **Scope:** Complete, locally runnable vertical slice on SQLite with passing Vitest, Supertest, and Playwright tests, comprehensive setup documentation in `README.md`, and seed scripts.
   * **Commit Location:** Merged into `main` and tagged as `v0.1.0-sprint1`.
   * **Exclusions:** Does *not* require Docker containers, live GCP URLs, or active cloud pipelines (strictly per Deliverable 1 handout).
2. **Lab 5 Deployment Release (`v0.2.0-lab5`):**
   * **Scope:** Branches off `v0.1.0-sprint1` on branch `lab-5/cloud-deployment`.
   * Adds the multi-stage `Dockerfile`, `.github/workflows/ci-cd.yml`, `prisma/schema.pg.prisma`, and Cloud Run deployment pipeline.
   * Reviewed by teammate, merged into `main`, and deployed live on GCP.

#### Docker Multi-Stage Build Architecture (for Lab 5):
* **Stage 1 (Build Client):** Vite builds optimized static assets into `client/dist/`.
* **Stage 2 (Build Server):** TypeScript compiler compiles backend into `server/dist/`.
* **Stage 3 (Runtime):** Lightweight Node.js 22 Alpine runtime containing compiled backend, serving static client files, listening on `PORT` (default 8080 for Cloud Run).
