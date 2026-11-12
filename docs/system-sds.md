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
        datetime tokenRevokedAt
        boolean isActive
        datetime createdAt
        datetime updatedAt
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
* `tokenRevokedAt` (DateTime, Nullable) — Timestamp of last logout/revocation. Tokens issued prior to this timestamp are rejected with HTTP 401.
* `isActive` (Boolean, Default `true`) — Disabled users cannot log in.

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

### 3.5 Single JWT Transport & Logout Revocation Contract
* **Single Transport:** All authenticated requests must pass the JWT token in the HTTP Authorization header:
  ```http
  Authorization: Bearer <jwt-token>
  ```
* **Payload Structure:** `{ userId: string, role: string, email: string, jti: string, iat: number, exp: number }`
* **Logout Contract & Server-Side Invalidation (`FR-03`):**
  1. When a user logs out, the client issues `POST /api/v1/auth/logout` with the Bearer token.
  2. The server updates `User.tokenRevokedAt = new Date()` (or stores the token `jti` in a revocation cache).
  3. The `requireAuth` middleware checks: if `token.iat < user.tokenRevokedAt`, the request is immediately rejected with HTTP 401 Unauthorized (`"Token has been revoked"`).
  4. **Verification Method:** An automated Supertest test (`TEST-AUTH-03`) logs in, calls a protected endpoint (verifying 200), calls logout (verifying 200), and immediately repeats the call to the protected endpoint asserting HTTP 401.

---

## 4. Database Setup, Migrations & Deployment Path

### 4.1 Reproducible Database Strategy across Environments

Prisma migration files are SQL-dialect specific. To ensure 100% reproducibility across Local Development, CI, and Cloud deployment without provider incompatibility:

#### A. Local Development & Automated Testing (Sprint 1)
* **Provider:** SQLite (`datasource db { provider = "sqlite" }`).
* **Environment Variable:** `DATABASE_URL="file:./dev.db"` (for dev) and `DATABASE_URL="file:./test.db"` (for isolated automated testing).
* **Migration Commands:**
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

#### B. Continuous Integration (CI Pipeline)
* Runs inside GitHub Actions.
* Uses the automated test configuration:
  ```bash
  npx prisma db push --skip-generate
  npm test
  ```
* Ensures fast, ephemeral, zero-drift test execution.

#### C. Cloud Deployment & GCP Cloud Run (Lab 5)
* **Provider:** PostgreSQL (`datasource db { provider = "postgresql" }`).
* **Environment Variable:** `DATABASE_URL="postgresql://user:pass@host:5432/equipflow?sslmode=require"`.
* **Migration Command in Deployment Pipeline:**
  ```bash
  npx prisma migrate deploy
  ```
* **Credential Segregation:**
  * No sample accounts or local passwords are used in production.
  * Production credentials (`DATABASE_URL`, `JWT_SECRET`) are provisioned via **GCP Secret Manager** and injected into the Cloud Run container at runtime.
  * Cloud accounts are created via an administrative CLI script or protected onboarding migration.

### 4.2 Multi-Stage Docker Packaging Readiness
The application is structured for containerization in Lab 5:
* **Stage 1 (Build Client):** Vite builds optimized static assets into `dist/`.
* **Stage 2 (Build Server):** TypeScript compiler compiles backend to `dist/`.
* **Stage 3 (Runtime):** Lightweight Node.js 22 Alpine runtime containing compiled backend and serving static client files, listening on `PORT` (default 8080 for Cloud Run).
