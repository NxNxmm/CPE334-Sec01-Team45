# Sprint 1 Engineering Specification
**EquipFlow Hardware Inventory & Borrowing Vertical Slice**

**Document ID:** `SPEC-SPRINT-01`  
**Version:** `1.0.0`  
**Status:** Draft  
**Target Release:** `v0.1.0-sprint1`  
**Deadline:** 15 November 2026 at 23:59 (LEB2 Assignment Checkpoint)  

---

## 1. Sprint Goal

Deliver the complete, working, and verified **Sprint 1 vertical slice** for the Department of Computer Engineering Equipment & Hardware Inventory and Borrowing System (**EquipFlow**). The release must establish the engineering baseline across all three tiers (React/Vite client, Node.js/Express backend, and Prisma/SQLite database), demonstrating secure authentication, role segregation (`BORROWER` vs `CUSTODIAN`), serialized equipment catalog browsing, student borrow request submission, and custodian counter checkout with atomic concurrency conflict protection, 7-day due-date calculation, and reproducible seed data.

---

## 2. Stakeholder Request Interpretation

The Department of Computer Engineering hardware laboratories maintain high-value testing instruments, microcontroller boards, FPGA kits, and development tools used across undergraduate courses and senior design projects. Currently, custody tracking relies on manual spreadsheets or physical sign-out binders, resulting in double-allocations, missing equipment, and no real-time visibility for students.

Stakeholders require a modern, dependable, and role-governed platform:
1. **Students (Borrowers)** need a self-service portal to browse real-time hardware availability, inspect specifications, and submit requests without visiting the counter blindly. Furthermore, student borrowing must be bounded by a fair-usage quota ($\le 3$ active items) and protected by strict privacy boundaries so no student can view or tamper with another student's loan records.
2. **Lab Technicians (Custodians)** require an authoritative, tamper-resistant triage queue to inspect incoming requests and record the physical handover (checkout). The system must guarantee that an item cannot be checked out to multiple borrowers simultaneously, and that once checked out, the physical asset status is locked and a 7-day return deadline is recorded.
3. **Department Staff** require strict identity enforcement: users must authenticate securely with hashed passwords, and permissions must be verified on the backend—preventing borrowers from bypassing custodial approval or checking out equipment directly.

---

## 3. Scope

### 3.1 Included Scope
* **Authentication, Session & Access Control**:
  * Seeded user accounts for Borrowers and Custodians.
  * Credential validation via `POST /api/v1/auth/login` with bcrypt hashing ($\ge 10$ salt rounds).
  * Issuance of signed JWT Bearer tokens containing `{ userId, role, email, jti, exp }`.
  * Authenticated identity endpoint `GET /api/v1/auth/me`.
  * Per-token server-side revocation on `POST /api/v1/auth/logout` persisting token `jti` into `RevokedToken` table while keeping other concurrent sessions active.
  * Server-side route middleware returning HTTP 401 (unauthenticated/revoked) and HTTP 403 (unauthorized role).
* **Serialized Equipment Catalog**:
  * Catalog browsing endpoint `GET /api/v1/items` with real-time status badges (`AVAILABLE`, `RESERVED`, `CHECKED_OUT`, `MAINTENANCE`).
  * Detail view endpoint `GET /api/v1/items/:id` showing manufacturer serial number, category, model, and physical condition.
  * Idempotent local seed script (`prisma/seed.ts`) creating at least 6 distinct hardware units.
* **Borrower Request Submission & Personal History**:
  * Request creation endpoint `POST /api/v1/requests` creating a `PENDING` request and transitioning item status to `RESERVED`.
  * Combined Active Quota enforcement: $\text{Count}(\text{Pending Requests}) + \text{Count}(\text{Active Loans}) \le 3$.
  * Personal history endpoint `GET /api/v1/requests/my` returning owned requests and active loans.
  * Strict cross-user data isolation: Borrower A cannot view or access Borrower B's requests.
* **Custodian Triage & Exclusive Checkout**:
  * Custodian queue endpoint `GET /api/v1/custodian/requests` listing all pending requests.
  * Checkout execution endpoint `POST /api/v1/custodian/checkouts` validating that the item is `RESERVED` for the matching request, transitioning item to `CHECKED_OUT`, creating an active `Loan`, and persisting calculated 7-day `dueDate`.
  * Atomic transactional execution (`prisma.$transaction`) guaranteeing conflict rejection (HTTP 409) on duplicate or concurrent checkout attempts.
  * Role restriction: Borrowers forbidden from calling checkout endpoints (HTTP 403).
* **Testing & Quality Baseline**:
  * Unit tests for quota calculation and password hashing.
  * API integration tests via Supertest covering all endpoints, auth guards, and race conditions.
  * End-to-end browser tests via Playwright for complete domain journeys.

### 3.2 Explicitly Excluded Scope
* Monetary late fines and payment gateway processing.
* Physical barcode/RFID hardware scanner integration (data typed or emulated via keyboard).
* Public self-registration and automated email password reset loops (seeded accounts used).
* Direct walk-in checkouts without prior request (allocated to Sprint 2 - `FR-15`).
* Request cancellation by borrower and request rejection by custodian (allocated to Sprint 2).
* Equipment return processing and condition inspection (allocated to Sprint 2 - `F-05`).
* Overdue background detection engine and warning badges (allocated to Sprint 2 - `F-06`).
* Custodian catalog asset creation/editing (allocated to Sprint 2 - `F-02`).
* Multi-criteria catalog search and filtering (allocated to Sprint 2 - `F-07`).
* Historical audit log reporting and export (allocated to Sprint 3 - `F-08`).
* Docker packaging, GCP Cloud Run deployment, and PostgreSQL cloud migrations (allocated to Lab 5).

---

## 4. Functional Requirements (FR)

### Authentication & Access Control
- **FR-01**: The system shall authenticate registered users using email and password, returning an authenticated JWT Bearer token upon credential validation.
- **FR-02**: The system shall provide endpoint `GET /api/v1/auth/me` returning the profile and role (`BORROWER` or `CUSTODIAN`) of the currently authenticated user.
- **FR-03**: The system shall provide endpoint `POST /api/v1/auth/logout`. Upon invocation, the backend shall persist the Bearer token's unique identifier (`jti`) into the `RevokedToken` table, causing subsequent requests with that token to be rejected with HTTP 401 Unauthorized while leaving other concurrent sessions valid.
- **FR-04**: The system shall enforce server-side access control on all protected endpoints, denying unauthorized role actions with HTTP 403 Forbidden.

### Equipment Catalog
- **FR-05**: The system shall allow Borrowers and Custodians to browse the catalog of equipment items via `GET /api/v1/items`, displaying asset tag, name, category, and real-time availability status.
- **FR-06**: The system shall allow users to inspect detailed equipment specifications, model number, serial number, and physical condition via `GET /api/v1/items/:id`.

### Borrower Workflow & Ownership
- **FR-09**: The system shall allow an authenticated Borrower to submit a borrow request for any available equipment item via `POST /api/v1/requests`, transitioning the item to `RESERVED` and creating a `PENDING` request.
- **FR-10**: The system shall allow a Borrower to view all personal borrow requests and active loans via `GET /api/v1/requests/my`.
- **FR-11**: The system shall enforce data ownership isolation, restricting Borrowers to viewing only their own requests/loans and forbidding access to other borrowers' records.

### Custodian Triage & Checkout
- **FR-13**: The system shall allow Custodians to view all pending borrow requests across all borrowers via `GET /api/v1/custodian/requests`.
- **FR-14**: The system shall allow a Custodian to record the physical checkout of an item against a matching pending request via `POST /api/v1/custodian/checkouts`, transitioning the item to `CHECKED_OUT`, creating an active `Loan`, and automatically calculating a 7-day `dueDate`.

---

## 5. Business Rules (BR)

### Inventory & Reservation Rules
- **BR-01: Availability & Reservation Consistency**:
  - An equipment item may only be requested if its status is strictly `AVAILABLE`.
  * Submitting a request transitions the item status immediately from `AVAILABLE` to `RESERVED`.
  * An item in status `CHECKED_OUT`, `MAINTENANCE`, `RETIRED`, or `RESERVED` cannot be requested. Any attempt returns HTTP 400 Bad Request (`ITEM_NOT_AVAILABLE`).
- **BR-02: Exclusive Allocation & Concurrency Lock**:
  - A physical serialized equipment asset can have at most one active reservation or loan at any time.
  - If concurrent checkout requests or competing requests arrive for the same asset, they must be resolved atomically within a database transaction. Exactly one operation succeeds; subsequent or competing attempts must be rejected with HTTP 409 Conflict (`CONCURRENT_CHECKOUT_CONFLICT`).
- **BR-03: Role Segregation on Checkout**:
  - Only authenticated users with the `CUSTODIAN` role are permitted to record checkouts and transition items to `CHECKED_OUT`. Borrowers attempting checkout operations must be rejected with HTTP 403 Forbidden.
- **BR-04: Combined Active Quota per Borrower**:
  - A Borrower's active quota is defined as:  
    $$\text{Active Quota} = \text{Count}(\text{Pending Requests}) + \text{Count}(\text{Active Loans})$$
  - The maximum permitted active quota per borrower is three ($\text{Active Quota} \le 3$).
  - Any request submission that would cause $\text{Active Quota} > 3$ must be rejected with HTTP 400 Bad Request (`EXCEEDS_ACTIVE_QUOTA`).
  - Concurrent request submissions from the same borrower are evaluated in a serialized transaction; any request that causes the count to exceed 3 is aborted and rejected with HTTP 400.
- **BR-05: Default Loan Duration & Due Date**:
  - Every newly created loan record automatically calculates and persists:  
    $$\text{dueDate} = \text{checkedOutAt} + 7\text{ days}$$
  - The calculated due date is immutable during Sprint 1.
- **BR-08: Custodian Accountability**:
  - Every checkout record must automatically record the authenticated custodian's user ID as `custodianId`. Client payloads cannot override or omit this attribution.

### Concurrency Invariant & Evaluation Order
For state mutations (`POST /api/v1/requests`, `POST /api/v1/custodian/checkouts`), the backend enforces the following strict evaluation hierarchy:
1. `401 Unauthorized`: Missing, invalid, or revoked Bearer token.
2. `403 Forbidden`: Role restriction (e.g. Borrower attempting custodian checkout).
3. `400 Bad Request`: Payload validation failure or business quota breach (`EXCEEDS_ACTIVE_QUOTA`).
4. `409 Conflict`: Concurrency conflict or duplicate checkout attempt on an already transitioned asset (`CONCURRENT_CHECKOUT_CONFLICT`).

---

## 6. Domain Data Model & Persistence

### 6.1 Database Schema (Prisma ORM)
The Sprint 1 schema is defined in `prisma/schema.prisma` using the SQLite provider:

```prisma
datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model User {
  id               String          @id @default(cuid())
  email            String          @unique
  passwordHash     String
  fullName         String
  studentOrStaffId String          @unique
  role             Role            @default(BORROWER)
  isActive         Boolean         @default(true)
  createdAt        DateTime        @default(now())
  updatedAt        DateTime        @updatedAt

  requests         BorrowRequest[]
  loansAsBorrower  Loan[]          @relation("BorrowerLoans")
  loansAsCustodian Loan[]          @relation("CustodianLoans")
  auditLogs        AuditLog[]
}

enum Role {
  BORROWER
  CUSTODIAN
}

model RevokedToken {
  jti       String   @id
  expiresAt DateTime
  createdAt DateTime @default(now())
}

model EquipmentItem {
  id           String        @id @default(cuid())
  assetTag     String        @unique
  name         String
  category     String
  modelNumber  String?
  serialNumber String        @unique
  description  String?
  condition    ItemCondition @default(GOOD)
  status       ItemStatus    @default(AVAILABLE)
  createdAt    DateTime      @default(now())
  updatedAt    DateTime      @updatedAt

  requests     BorrowRequest[]
  loans        Loan[]
  auditLogs    AuditLog[]

  @@index([status])
  @@index([category])
}

enum ItemCondition {
  NEW
  GOOD
  FAIR
  DAMAGED
}

enum ItemStatus {
  AVAILABLE
  RESERVED
  CHECKED_OUT
  MAINTENANCE
  RETIRED
}

model BorrowRequest {
  id              String        @id @default(cuid())
  borrowerId      String
  itemId          String
  status          RequestStatus @default(PENDING)
  requestNote     String?
  rejectionReason String?
  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt

  borrower        User          @relation(fields: [borrowerId], references: [id])
  item            EquipmentItem @relation(fields: [itemId], references: [id])
  loan            Loan?

  @@index([borrowerId])
  @@index([itemId])
  @@index([status])
}

enum RequestStatus {
  PENDING
  APPROVED
  REJECTED
  CANCELLED
  EXPIRED
}

model Loan {
  id              String         @id @default(cuid())
  requestId       String?        @unique
  itemId          String
  borrowerId      String
  custodianId     String
  status          LoanStatus     @default(ACTIVE)
  checkedOutAt    DateTime       @default(now())
  dueDate         DateTime
  returnedAt      DateTime?
  checkoutNotes   String?
  returnNotes     String?
  returnCondition ItemCondition?
  createdAt       DateTime       @default(now())
  updatedAt       DateTime       @updatedAt

  request         BorrowRequest? @relation(fields: [requestId], references: [id])
  item            EquipmentItem  @relation(fields: [itemId], references: [id])
  borrower        User           @relation("BorrowerLoans", fields: [borrowerId], references: [id])
  custodian       User           @relation("CustodianLoans", fields: [custodianId], references: [id])

  @@index([borrowerId])
  @@index([custodianId])
  @@index([itemId])
  @@index([status])
}

enum LoanStatus {
  ACTIVE
  RETURNED
  OVERDUE
}

model AuditLog {
  id            String   @id @default(cuid())
  entityType    String
  entityId      String
  action        String
  details       String?
  performedById String
  timestamp     DateTime @default(now())

  performedBy   User     @relation(fields: [performedById], references: [id])
  item          EquipmentItem? @relation(fields: [entityId], references: [id])

  @@index([entityType, entityId])
}
```

### 6.2 Seed Data Specifications
The idempotent seed script (`prisma/seed.ts`) generates:
* **Borrower 1:** `borrower@cpe.kmutt.ac.th` / `Password123!` (Student ID: `67070501001`)
* **Borrower 2:** `borrower2@cpe.kmutt.ac.th` / `Password123!` (Student ID: `67070501002`, for cross-user isolation tests)
* **Custodian:** `custodian@cpe.kmutt.ac.th` / `Password123!` (Staff ID: `STAFF-001`)
* **Equipment Assets (6 Units)**:
  1. `CPE-OSC-001`: Rigol DS1054Z Digital Oscilloscope (`AVAILABLE`)
  2. `CPE-OSC-002`: Keysight InfiniiVision DSOX1204A (`AVAILABLE`)
  3. `CPE-RPI-001`: Raspberry Pi 4 Model B 4GB (`AVAILABLE`)
  4. `CPE-RPI-002`: Raspberry Pi 4 Model B 8GB (`CHECKED_OUT` on pre-seeded active loan)
  5. `CPE-FPG-001`: Terasic DE10-Lite FPGA Board (`AVAILABLE`)
  6. `CPE-LOG-001`: Saleae Logic 8 USB Analyzer (`MAINTENANCE`)

---

## 7. Product Definition of Done (DoD)

The Sprint 1 vertical slice is marked **Done** when all of the following criteria are verified:
1. **Full Domain Slice Functional**:
   * Borrower logs in $\rightarrow$ browses catalog $\rightarrow$ requests available item (status becomes `RESERVED`).
   * Borrower views pending request in `/my-requests`.
   * Custodian logs in $\rightarrow$ reviews pending request in `/custodian/desk` $\rightarrow$ records checkout.
   * Item status transitions to `CHECKED_OUT`, active `Loan` record is created, and 7-day `dueDate` is saved.
2. **Business Rules Verified**:
   * Requesting an occupied item is rejected with HTTP 400 (`ITEM_NOT_AVAILABLE`).
   * Exceeding quota of 3 active items is rejected with HTTP 400 (`EXCEEDS_ACTIVE_QUOTA`).
   * Concurrent checkouts for the same asset are rejected with HTTP 409 Conflict.
3. **Security & Authorization Verified**:
   * Unauthenticated requests to protected routes return HTTP 401.
   * Borrowers attempting custodian actions return HTTP 403.
   * Calling `POST /api/v1/auth/logout` revokes the specific token (`jti`), returning HTTP 401 on subsequent requests while keeping concurrent sessions active.
   * Zero plaintext passwords in database or logs (bcrypt $\ge 10$ salt rounds).
4. **Automated Testing Complete**:
   * 100% of planned tests in `tests.md` pass with zero failures or skipped tests (`npm test`).
   * Playwright E2E browser journeys pass cleanly (`npx playwright test`).
5. **Git & Integration Requirements**:
   * Feature contracts committed before implementation.
   * Features implemented on branches off `sprint-1-staging`, peer-reviewed, and merged.
   * Reviewed release PR merged into `main` and tagged as `v0.1.0-sprint1`.

