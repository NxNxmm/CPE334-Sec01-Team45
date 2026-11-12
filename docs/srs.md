# Software Requirements Specification (SRS)
## CPE Equipment & Hardware Inventory and Borrowing System (EquipFlow)

**Document ID:** `SRS-01`  
**Version:** `1.1.0`  
**Status:** Baseline Revised (Addressed Peer Review Feedback)  
**Course:** CPE 334 Software Engineering (Semester 1/2026)  
**Deliverable:** Project Deliverable 1 — Part A  
**Due Date:** 15 November 2026 at 23:59 (Aligned with LEB2)  
**Assigned Theme:** Theme 2 — Inventory and Borrowing System  

---

## 1. Stakeholder Problem & Context

### 1.1 Problem Statement
The Department of Computer Engineering maintains specialized educational hardware, testing instruments, IoT kits, and laboratory equipment (e.g., microcontrollers, oscilloscopes, FPGA boards, logic analyzers) for academic coursework, senior capstone projects, and research. Currently, the lending process relies on informal messaging, paper-based logbooks, or ad-hoc spreadsheets managed by lab custodians. 

This causes critical operational problems:
1. **Lack of Real-Time Availability:** Students cannot determine whether equipment is currently on the shelf or in use without physically visiting the laboratory.
2. **Double-Allocation and Collisions:** Multiple students frequently request the same physical piece of equipment simultaneously, causing scheduling deadlocks and disputes.
3. **Loss of Custodial Custody and Accountability:** Custodians lack an authoritative, tamper-resistant system of record to log checkouts, enforce borrowing policies, monitor due dates, and hold borrowers accountable.
4. **No Role Separation:** Without verified identity and strict access controls, unauthorized users can manipulate reservation records or view other students' borrowing histories.

### 1.2 Chosen Context
**EquipFlow** is a web-based department inventory and lending management platform deployed for the CPE Department hardware laboratory. The system tracks individual serialized physical equipment units (assets) and governs the complete borrowing lifecycle between students/researchers (**Borrowers**) and lab technicians/equipment administrators (**Custodians**).

---

## 2. Actors & Responsibilities

| Actor | Role Definition | Primary Responsibilities |
| :--- | :--- | :--- |
| **Anonymous User (Visitor)** | Unauthenticated visitor accessing the web portal. | • View landing/login page.<br>• Authenticate using valid department credentials (login). |
| **Borrower (Student / Faculty / Researcher)** | Authenticated department member borrowing hardware. | • Browse catalog and check real-time availability.<br>• Submit borrow requests for available items (within quota).<br>• View own active borrow requests and personal loan history.<br>• Cancel own pending requests before checkout (Sprint 2). |
| **Custodian (Lab Administrator / Technician)** | Authorized laboratory staff managing hardware assets and transactions. | • Maintain equipment catalog (create, edit, retire items - Sprint 2).<br>• Review, approve, and fulfill pending borrow requests.<br>• Record physical checkout (transitioning item from reserved to active loan).<br>• Record direct walk-in checkout (Sprint 2).<br>• Record return of equipment, assess physical condition, and close loans (Sprint 2).<br>• Monitor overdue items and generate inventory audit summaries (Sprint 2 & 3). |
| **System (Automated Agent)** | Background scheduler and transactional boundary. | • Enforce exclusivity and atomic checkout locks.<br>• Calculate and persist 7-day loan due dates upon checkout.<br>• Evaluate overdue flags and trigger overdue state transitions (Sprint 2).<br>• Maintain append-only audit trail for all state transitions (Sprint 3). |

---

## 3. Product Scope & Explicit Exclusions

### 3.1 In-Scope Capabilities (Three-Sprint Roadmap)
* **Identity & Role-Based Access Control:** Secure authentication, bcrypt password hashing, JWT Bearer token lifecycle, server-side session invalidation on logout, and strict server-side authorization separating Borrower and Custodian operations.
* **Serialized Asset Inventory:** Tracking individual equipment units with unique asset tags, serial numbers, categories, models, conditions, and availability statuses.
* **Borrowing Lifecycle Management:** End-to-end state transitions: Item `AVAILABLE` $\rightarrow$ `RESERVED` (upon request) $\rightarrow$ `CHECKED_OUT` (upon custodian checkout) $\rightarrow$ `RETURNED` / `OVERDUE` (Sprint 2).
* **Exclusive Allocation & Concurrency Guard:** Atomic database transactions preventing double-booking, duplicate checkouts, or quota violations for physical assets.
* **Borrower Self-Service:** Personal dashboard showing current loans, pending requests, and recorded due dates.
* **Custodial Operations Desk:** Custodian dashboard for managing incoming requests, executing checkouts, inspecting item conditions, and processing returns.
* **Reporting & Auditing:** Inventory utilization, overdue tracking, and immutable transaction logs.

### 3.2 Explicit Exclusions (Out of Scope)
* **Financial Fines / Payment Gateway Integration:** The system will flag overdue items, but will not collect money, process credit cards, or compute monetary late fines.
* **Physical Barcode / RFID Hardware Scanners:** Barcode data strings can be typed or scanned via keyboard emulation; direct device drivers or proprietary RFID readers are excluded.
* **Multi-Department Multi-Tenancy:** The application is scoped strictly to a single department instance (CPE Lab); multi-tenant cloud partitioning is out of scope.
* **Automated External Communications:** No real SMS gateways, external SMTP servers, or LINE Notify webhooks are required; synthetic in-app notifications and status boards are used.
* **Consumable / Bulk Quantity Pooling in Sprint 1:** Sprint 1 focuses exclusively on uniquely serialized assets (discrete tracking) to enforce rigorous concurrency and state rules. Consumables (e.g., resistors, solder wire) are excluded from the core borrowing model.
* **Self-Registration & Password Recovery:** Seeded test accounts are provided for local sprint evaluations; public self-signup and email verification loops are excluded. Production cloud deployment will use externally provisioned credentials via environment variables.

---

## 4. Functional Requirements (FR)

### 4.1 Authentication & Session Management
* **FR-01 (User Login):** The system shall authenticate registered users using email and password, returning an authenticated JWT Bearer token upon credential validation.
* **FR-02 (Current User Identity):** The system shall provide endpoint `GET /api/v1/auth/me` returning the profile and role (`BORROWER` or `CUSTODIAN`) of the currently authenticated user.
* **FR-03 (User Logout & Per-Token Server-Side Revocation):** The system shall provide endpoint `POST /api/v1/auth/logout`. Upon invocation, the backend shall persist the Bearer token's unique identifier (`jti`) and expiry timestamp into the `RevokedToken` table. The authentication middleware shall reject any subsequent request presenting that specific token with HTTP 401 Unauthorized (`TOKEN_REVOKED`). Concurrent sessions for the same user (possessing different `jti` tokens) remain valid and unaffected.
* **FR-04 (Role-Based Authorization):** The system shall enforce server-side access control on all protected endpoints, denying unauthorized role actions with HTTP 403 Forbidden.

### 4.2 Catalog & Inventory Management
* **FR-05 (Catalog Browsing):** The system shall allow Borrowers and Custodians to view the catalog of equipment items via `GET /api/v1/items`, displaying asset tag, name, category, and real-time availability status.
* **FR-06 (Catalog Item Details):** The system shall allow users to inspect detailed specifications, item serial number, current condition, and borrowing restrictions of an item via `GET /api/v1/items/:id`.
* **FR-07 (Item Creation & Management - Sprint 2):** The system shall allow Custodians to register new physical equipment assets with unique asset tags, serial numbers, and initial condition via `POST /api/v1/custodian/items`.
* **FR-08 (Item Status Management - Sprint 2):** The system shall allow Custodians to update item statuses (e.g., mark an item `MAINTENANCE` or `RETIRED`) via `PATCH /api/v1/custodian/items/:id/status`.

### 4.3 Borrow Request & Reservation Workflow
* **FR-09 (Submit Borrow Request):** The system shall allow an authenticated Borrower to submit a borrow request for any available equipment item via `POST /api/v1/requests`. Submitting a request transitions the item status from `AVAILABLE` to `RESERVED` and creates a `BorrowRequest` in `PENDING` state.
* **FR-10 (View Personal Requests & Active Loans):** The system shall allow a Borrower to view all personal borrow requests and active loans via `GET /api/v1/requests/my`.
* **FR-11 (Data Ownership Isolation):** The system shall restrict Borrowers to viewing only their own requests/loans and forbid access to another user's private borrowing data (HTTP 403 or scoped query).
* **FR-12 (Cancel Pending Request - Sprint 2):** The system shall allow a Borrower to cancel their own request provided it is still in `PENDING` status via `POST /api/v1/requests/:id/cancel`, reverting the item status to `AVAILABLE`.

### 4.4 Custodian Triage & Checkout Workflow
* **FR-13 (Custodian Request Triage):** The system shall allow Custodians to view all pending borrow requests across all borrowers via `GET /api/v1/custodian/requests`, ordered chronologically.
* **FR-14 (Record Physical Checkout against Request):** The system shall allow a Custodian to record the physical checkout of an item against a matching pending request via `POST /api/v1/custodian/checkouts`. The operation validates that the item is currently `RESERVED` for this specific request, transitions the item to `CHECKED_OUT`, sets the request to `APPROVED`, creates an active `Loan` record, and automatically calculates and stores a 7-day `dueDate`.
* **FR-15 (Direct Walk-in Checkout - Sprint 2):** The system shall allow Custodians to execute an immediate checkout for an on-premise borrower for an `AVAILABLE` item without prior web reservation via `POST /api/v1/custodian/checkouts/walk-in`.
* **FR-16 (Reject Borrow Request - Sprint 2):** The system shall allow Custodians to reject a pending borrow request with a recorded rejection reason via `POST /api/v1/custodian/requests/:id/reject`, reverting the item status to `AVAILABLE`.

### 4.5 Return, Overdue & Lifecycle Management (Sprints 2 & 3)
* **FR-17 (Record Item Return - Sprint 2):** The system shall allow Custodians to process an equipment return via `POST /api/v1/custodian/returns`, recording return date, condition upon return, setting loan to `RETURNED`, and restoring item status to `AVAILABLE`.
* **FR-18 (Overdue Tracking & Badges - Sprint 2):** The system shall calculate whether active loans have passed their recorded `dueDate` (`dueDate < now()`), dynamically flag them as overdue, and render overdue badges on borrower and custodian views.

---

## 5. Business Rules (BR)

* **BR-01 (Availability & Checkout State Consistency):** 
  * A Borrower can only submit a borrow request if the item's status is strictly `AVAILABLE`. Upon successful request creation, the item status immediately transitions to `RESERVED`.
  * A Custodian can check out an item if and only if:
    1. The item is currently in status `RESERVED` and matches the specific `PENDING` request being fulfilled, OR
    2. The item is currently in status `AVAILABLE` (for Sprint 2 walk-in checkouts).
  * An item in status `CHECKED_OUT`, `MAINTENANCE`, `RETIRED`, or `RESERVED` for *another* request cannot be requested or checked out. Any attempt returns HTTP 400 Bad Request with code `ITEM_NOT_AVAILABLE`.
* **BR-02 (Exclusive Allocation & Duplicate / Conflict Rejection):**
  * A physical serialized asset can have at most one active reservation or loan at any time.
  * If a second request is submitted for an item that has transitioned to `RESERVED` or `CHECKED_OUT`, the request is rejected with HTTP 400 Bad Request / 409 Conflict.
  * If concurrent checkout operations are submitted for the same item or request, the operations are executed within an atomic database transaction. The first transaction commits and transitions the item to `CHECKED_OUT`; the concurrent attempt detects the changed state, rolls back, and returns HTTP 409 Conflict with code `CONCURRENT_CHECKOUT_CONFLICT`.
* **BR-03 (Role Segregation on Checkout):** Only users with the `CUSTODIAN` role are authorized to record checkouts and update item availability. Borrowers are strictly forbidden from performing checkout operations, even for their own approved requests (HTTP 403 Forbidden).
* **BR-04 (Combined Active Quota per Borrower):** 
  * A Borrower's active quota is defined as:  
    $$\text{Active Quota} = \text{Count}(\text{Pending Requests}) + \text{Count}(\text{Active Loans})$$
  * A Borrower may have at most three (3) active items combined ($\text{Active Quota} \le 3$).
  * Any request submission that would cause $\text{Active Quota} > 3$ is rejected immediately with HTTP 400 Bad Request (`EXCEEDS_ACTIVE_QUOTA`).
  * If a borrower submits concurrent requests across different tabs/sessions when already near the limit, requests are evaluated inside a transaction with lock/count verification. The request that causes the count to exceed 3 is aborted and rejected with HTTP 409/400.
* **BR-05 (Default Loan Duration & Due Date):**
  * In Sprint 1, every newly created loan record automatically calculates and persists `dueDate = checkedOutAt + 7 days`.
  * In Sprint 2, the overdue processing engine evaluates this persisted `dueDate` against current system time to flag overdue loans.
* **BR-06 (Request Expiration - Sprint 2):** A pending borrow request that is not checked out within forty-eight (48) hours of submission shall automatically expire, setting request status to `EXPIRED` and reverting the item to `AVAILABLE`.
* **BR-07 (State Machine Immutability - Sprint 2):** Loan state transitions are strictly unidirectional: `PENDING` request $\rightarrow$ `ACTIVE` loan $\rightarrow$ `RETURNED`. A closed or returned loan cannot be reverted to `ACTIVE`.
* **BR-08 (Custodian Accountability):** Every checkout record must automatically capture the authenticated custodian's user ID as the accountable operator (`custodianId`), preventing anonymous or forged checkouts.

---

## 6. Non-Functional Requirements (NFR)

| NFR ID | Category | Requirement Description | Measurable Target | Practical Verification Method | Allocated Sprint |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **NFR-01** | **Security** | Passwords must never be stored or logged in plaintext. Sample credentials restricted to local dev. | Passwords hashed using bcrypt with salt rounds $\ge 10$. Zero plaintext passwords in database or logs. | Direct database query inspection & unit test inspecting User table. | **Sprint 1** |
| **NFR-02** | **Security / Auth** | Unauthenticated, unauthorized, or revoked token requests blocked at backend. | 100% of protected API endpoints return HTTP 401 (if unauthenticated/revoked) or HTTP 403 (if wrong role). No data leaked in error body. | Automated Supertest / API integration test suite. | **Sprint 1** |
| **NFR-03** | **Data Integrity** | Concurrency conflicts on the same physical asset must be rejected safely. | Zero duplicate active loans in database under simulated concurrent checkout requests. | Concurrent API stress integration test verifying second request returns 409 Conflict. | **Sprint 1** |
| **NFR-04** | **Performance** | API response latency for catalog browsing and checkout transactions under normal local load. | 95th percentile response time $< 200$ ms for local API queries on seeded dataset ($\ge 50$ items). | Automated integration test benchmark timer. | **Sprint 2** |
| **NFR-05** | **Reliability & Persistence** | Data persistence across application restarts. Database setup reproducible via migrations. | Zero data loss of users, inventory, or active loans after server process restart. Migration commands execute cleanly. | Automated restart verification script and migration runner check. | **Sprint 1** |
| **NFR-06** | **Usability & Responsiveness** | UI layout must be fully functional across mobile (375px), tablet (768px), and desktop ($\ge 1024$px). | Zero horizontal scrolling or clipped action buttons across standard viewport breakpoints. | Playwright responsive viewport automated checks. | **Sprint 2** |

---

## 7. Assumptions, Design Decisions & Resolved Questions

### 7.1 Key Assumptions
1. **Discrete Asset Model:** The department manages high-value equipment identified by unique asset tags (e.g., `CPE-OSC-001`, `CPE-RPI-004`). Tracking is unit-based rather than aggregate quantity pooling.
2. **Local Seed vs Cloud Provisioning:** Seeded accounts (`borrower@cpe.kmutt.ac.th`, `custodian@cpe.kmutt.ac.th`) with known passwords are used strictly in local development and automated CI. Cloud environments will provision accounts via external configuration and secure migrations.
3. **Single Physical Location:** All equipment is housed within the central CPE Laboratory; multi-building transfers are not modeled.

### 7.2 Design Decisions
* **Decision 01 (Per-Token JWT `jti` Revocation):** Authentication uses signed HTTP Bearer Tokens (`Authorization: Bearer <token>`) containing `{ userId, role, email, jti, exp }`. Logout (`FR-03`) persists the token's unique `jti` into a database `RevokedToken` table until its expiry. This guarantees deterministic cross-instance invalidation for the logged-out device while safely preserving a user's concurrent sessions across multiple devices.
* **Decision 02 (Relational Integrity with Prisma ORM):** Use relational database foreign keys (`userId`, `itemId`, `loanId`) with atomic transactions (`prisma.$transaction`) to enforce concurrency rules and prevent orphaned borrowing records.
* **Decision 03 (Two-Tier Role Hierarchy):** Role enum is strictly `BORROWER` and `CUSTODIAN`. Borrowers can request and view personal history; Custodians control catalog and checkouts.

### 7.3 Resolved Questions
* **Q1: Does a Borrower's request immediately change the item status?**  
  * *Resolution:* Yes. Submitting a request transitions the item from `AVAILABLE` to `RESERVED`. Custodian checkout validates that the item is `RESERVED` for that request and transitions it to `CHECKED_OUT`. If rejected or cancelled, it returns to `AVAILABLE`.
* **Q2: How do active loans and pending requests interact regarding the quota of 3?**  
  * *Resolution:* Both count equally toward the limit: $\text{Active Quota} = \text{Count}(\text{Pending Requests}) + \text{Count}(\text{Active Loans}) \le 3$. Submitting a request when active count is 3 is rejected with HTTP 400.
