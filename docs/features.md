# Feature Inventory
## CPE Equipment & Hardware Inventory and Borrowing System (EquipFlow)

**Document ID:** `FEAT-01`  
**Version:** `1.1.0`  
**Status:** Baseline Revised (Addressed Peer Review Feedback)  
**Deliverable:** Project Deliverable 1 — Part B  

---

## 1. Feature Overview & Lifecycle Allocation

The EquipFlow platform is partitioned into eight (8) discrete functional features spanning a three-sprint development trajectory. Every baseline requirement (FR, BR, and NFR) defined in the SRS is assigned to an authoritative feature.

| Feature ID | Feature Name | Description | Target Sprint | Primary Actor | Dependencies |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **F-01** | **Authentication, Session, and Role Identity** | User login, JWT Bearer token issuance, current user identity (`/api/v1/auth/me`), server-side logout invalidation (`/api/v1/auth/logout`), password hashing, and role route guards. | **Sprint 1** | All Actors | None |
| **F-02** | **Serialized Equipment Catalog** | Browsing and viewing serialized equipment assets (`/api/v1/items`), specifications, and reproducible seed data. Custodian catalog editing added in Sprint 2. | **Sprint 1** (Core)<br>**Sprint 2** (Manage) | All Actors | `F-01` |
| **F-03** | **Borrower Request Submission & Personal History** | Student self-service interface to request available hardware (`POST /api/v1/requests`), enforce combined active quota ($\le 3$), prevent cross-user leakage, and view personal requests/loans (`GET /api/v1/requests/my`). | **Sprint 1** | Borrower | `F-01`, `F-02` |
| **F-04** | **Custodian Counter Checkout & Exclusive Allocation** | Custodian triage interface (`GET /api/v1/custodian/requests`), verifying requests, executing checkout of reserved items (`POST /api/v1/custodian/checkouts`), saving 7-day due date, and preventing concurrent collisions. Walk-in checkouts in Sprint 2. | **Sprint 1** (Core)<br>**Sprint 2** (Walk-in) | Custodian | `F-01`, `F-02`, `F-03` |
| **F-05** | **Equipment Return & Condition Assessment** | Custodian workflow to process equipment returns (`POST /api/v1/custodian/returns`), inspect physical condition, record notes, close active loans, and restore asset availability. | **Sprint 2** | Custodian | `F-04` |
| **F-06** | **Due Date Enforcement & Overdue Tracking** | Overdue processing engine evaluating persisted 7-day `dueDate`, dynamically flagging overdue accounts, and warning borrowers/custodians. | **Sprint 2** | All Actors | `F-04` |
| **F-07** | **Catalog Filtering, Full-Text Search & Category Navigation** | Rich search and filter capabilities across categories, tags, brands, and availability statuses with optimized query performance. | **Sprint 2** | All Actors | `F-02` |
| **F-08** | **Inventory Audit History & Custodial Reporting** | Append-only historical audit logging for all status changes, damage logging, utilization summaries, and compliance reporting. | **Sprint 3** | Custodian | `F-04`, `F-05`, `F-06` |

---

## 2. Detailed Feature Specifications

### F-01: Authentication, Session, and Role Identity
* **Scope in Sprint 1:** 
  * Seeded users (Borrowers and Custodians). 
  * Endpoint `POST /api/v1/auth/login` validating email and bcrypt password, issuing an HTTP Bearer JWT containing `{ userId, role, email, jti, exp }`.
  * Endpoint `GET /api/v1/auth/me` returning the authenticated user profile and role.
  * Endpoint `POST /api/v1/auth/logout` executing per-token server-side revocation: persists the token's unique `jti` and expiry into the database `RevokedToken` table. The `requireAuth` middleware rejects any request presenting a revoked `jti` with HTTP 401 Unauthorized (`TOKEN_REVOKED`), while concurrent sessions on other devices remain completely intact.
  * Server-side route middleware blocking unauthenticated (401) and unauthorized role requests (403).
* **Mapped Requirements:** `FR-01`, `FR-02`, `FR-03`, `FR-04`, `NFR-01`, `NFR-02`.
* **Verification Approach:** Automated unit tests for bcrypt hashing; Supertest API integration tests for valid/invalid login, role route guards, and `TEST-AUTH-03` asserting that logging out Session 1 revokes Token 1 (returns 401) while concurrent Session 2 (Token 2) continues to access protected routes with HTTP 200.

### F-02: Serialized Equipment Catalog
* **Scope in Sprint 1:** Read-only catalog endpoints `GET /api/v1/items` and `GET /api/v1/items/:id` showing asset tag, equipment name, model, category, serial number, and status (`AVAILABLE`, `RESERVED`, `CHECKED_OUT`, `MAINTENANCE`). Seeding script for reproducible demo data.
* **Scope in Sprint 2:** Custodian catalog administration (`POST /api/v1/custodian/items`, `PATCH /api/v1/custodian/items/:id/status` for marking maintenance/retired).
* **Mapped Requirements:** `FR-05`, `FR-06`, `FR-07`, `FR-08`, `BR-01`, `NFR-05`.
* **Verification Approach:** API endpoint tests for `/api/v1/items`; Playwright UI tests verifying catalog table rendering and availability badges.

### F-03: Borrower Request Submission & Personal History
* **Scope in Sprint 1:** 
  * Borrower submits a borrow request via `POST /api/v1/requests` with payload `{ itemId: string, requestNote?: string }`.
  * **Availability Validation:** Backend verifies item status is strictly `AVAILABLE` (`BR-01`). If already `RESERVED` or `CHECKED_OUT`, request is rejected with HTTP 400 (`ITEM_NOT_AVAILABLE`).
  * **Quota Validation:** Backend verifies combined active count: $\text{Count}(\text{Pending Requests}) + \text{Count}(\text{Active Loans}) < 3$ (`BR-04`). If $\ge 3$, rejected with HTTP 400 (`EXCEEDS_ACTIVE_QUOTA`).
  * **Concurrency Protection:** Evaluation and status update to `RESERVED` execute within a database transaction; concurrent requests for the same item or exceeding quota are rejected with HTTP 409/400.
  * **Personal History:** Endpoint `GET /api/v1/requests/my` returns only the authenticated borrower's own requests and active loans. Strict ownership check ensures Borrower A cannot access Borrower B's records (`FR-11`).
* **Scope in Sprint 2:** Request cancellation by borrower (`POST /api/v1/requests/:id/cancel`).
* **Mapped Requirements:** `FR-09`, `FR-10`, `FR-11`, `FR-12`, `BR-01`, `BR-02`, `BR-04`, `NFR-02`.
* **Verification Approach:** Unit tests for combined quota calculation; Supertest integration tests verifying cross-user isolation and request creation; Playwright end-to-end request journey.

### F-04: Custodian Counter Checkout & Exclusive Allocation
* **Scope in Sprint 1:** 
  * Endpoint `GET /api/v1/custodian/requests` lists pending borrow requests.
  * Custodian records checkout via `POST /api/v1/custodian/checkouts` with payload `{ requestId: string, checkoutNotes?: string }`.
  * **State Validation:** Backend validates that the referenced request is `PENDING` and the associated item is currently `RESERVED` for this specific request (`BR-01`).
  * **Atomic State Transition:** Executed inside `prisma.$transaction`:
    1. Update item status to `CHECKED_OUT`.
    2. Update request status to `APPROVED`.
    3. Create `Loan` record storing `checkedOutAt = now()`, `dueDate = now() + 7 days` (`BR-05`), and `custodianId = authenticatedUserId` (`BR-08`).
  * **Conflict Prevention:** If a duplicate checkout attempt occurs, the atomic transaction detects the changed state and rejects the second call with HTTP 409 Conflict (`BR-02`, `NFR-03`).
  * **Role Restriction:** Rejects non-custodian callers with HTTP 403 Forbidden (`BR-03`).
* **Scope in Sprint 2:** Direct walk-in checkout (`POST /api/v1/custodian/checkouts/walk-in`) without prior web reservation (`FR-15`) and request rejection (`POST /api/v1/custodian/requests/:id/reject` - `FR-16`).
* **Mapped Requirements:** `FR-13`, `FR-14`, `FR-15`, `FR-16`, `BR-01`, `BR-02`, `BR-03`, `BR-05`, `BR-08`, `NFR-03`.
* **Verification Approach:** Concurrency integration tests simulating duplicate checkouts; role authorization tests (Borrower getting 403); UI E2E test of complete checkout journey.

### F-05: Equipment Return & Condition Assessment
* **Scope in Sprint 2:** Custodian selects an active loan, enters return inspection notes and condition grade (e.g., `GOOD`, `MINOR_WEAR`, `DAMAGED`) via `POST /api/v1/custodian/returns`. Loan status set to `RETURNED`; item status reverted to `AVAILABLE`.
* **Mapped Requirements:** `FR-17`, `BR-01`, `BR-07`.

### F-06: Due Date Enforcement & Overdue Tracking
* **Scope in Sprint 2:** Background overdue evaluation comparing persisted `dueDate` with `now()` for loans in status `ACTIVE`. Flags delinquent loans as `OVERDUE` and displays visual warning badges on Borrower and Custodian dashboards.
* **Mapped Requirements:** `FR-18`, `BR-05`, `BR-06`.

### F-07: Catalog Filtering, Full-Text Search & Category Navigation
* **Scope in Sprint 2:** Multi-parameter search endpoint (`GET /api/v1/items?search=...&category=...&availability=...`). Fast indexed lookup. Responsive UI filter sidebar.
* **Mapped Requirements:** `FR-05`, `FR-06`, `NFR-04`, `NFR-06`.

### F-08: Inventory Audit History & Custodial Reporting
* **Scope in Sprint 3:** Append-only transaction log table tracking all state transitions with timestamps and actor IDs (`GET /api/v1/custodian/logs`). Summary dashboard metrics (utilization rate, most borrowed equipment, active loans vs total capacity).
* **Mapped Requirements:** `BR-08`, `NFR-05`.
