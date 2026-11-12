# Feature Inventory

## CPE Equipment & Hardware Inventory and Borrowing System (EquipFlow)

**Document ID:** `FEAT-01`  
**Version:** `1.0.0`  
**Status:** Wait for review
**Deliverable:** Project Deliverable 1 — Part B  

---

## 1. Feature Overview & Lifecycle Allocation

The EquipFlow platform is partitioned into eight (8) discrete functional features spanning a three-sprint development trajectory. Every baseline requirement (FR, BR, and NFR) defined in the SRS is assigned to an authoritative feature.

| Feature ID | Feature Name | Description | Target Sprint | Primary Actor | Dependencies |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **F-01** | **Authentication, Session, and Role Identity** | User login, secure token issuance, current user identity retrieval, password hashing, and role-based route guard enforcement (`BORROWER` vs `CUSTODIAN`). | **Sprint 1** | All Actors | None |
| **F-02** | **Serialized Equipment Catalog** | Browsing and viewing serialized equipment assets with real-time status indicators (`AVAILABLE`, `RESERVED`, `CHECKED_OUT`, `MAINTENANCE`), specification details, and seed initialization. | **Sprint 1** (Core)<br>**Sprint 2** (Manage) | All Actors | `F-01` |
| **F-03** | **Borrower Request Submission & Personal History** | Student self-service interface to request available hardware, enforce active borrowing quotas, prevent cross-user data leakage, and view personal loan status. | **Sprint 1** | Borrower | `F-01`, `F-02` |
| **F-04** | **Custodian Counter Checkout & Exclusive Allocation** | Custodian triage interface to review requests, verify borrower identity, execute physical checkout, create active loan records, and prevent concurrent double-booking. | **Sprint 1** | Custodian | `F-01`, `F-02`, `F-03` |
| **F-05** | **Equipment Return & Condition Assessment** | Custodian workflow to process equipment returns, inspect physical condition, record notes, close active loans, and restore asset availability. | **Sprint 2** | Custodian | `F-04` |
| **F-06** | **Due Date Enforcement & Overdue Tracking** | Automatic calculation of 7-day loan periods, flagging overdue accounts, and warning borrowers/custodians of delinquent assets. | **Sprint 2** | All Actors | `F-04` |
| **F-07** | **Catalog Filtering, Full-Text Search & Category Navigation** | Rich search and filter capabilities across categories, tags, brands, and availability statuses with optimized query performance. | **Sprint 2** | All Actors | `F-02` |
| **F-08** | **Inventory Audit History & Custodial Reporting** | Append-only historical audit logging for all status changes, damage logging, utilization summaries, and compliance reporting. | **Sprint 3** | Custodian | `F-04`, `F-05`, `F-06` |

---

## 2. Detailed Feature Specifications

### F-01: Authentication, Session, and Role Identity

* **Scope in Sprint 1:** Seeded users (Borrowers and Custodians). Login endpoint validating email and bcrypt password. Issue HTTP-only Bearer JWT containing `userId` and `role`. Protected `/api/auth/me` endpoint. Logout handler. Server-side middleware blocking unauthenticated and unauthorized requests with HTTP 401 and 403.
* **Mapped Requirements:** `FR-01`, `FR-02`, `FR-03`, `FR-04`, `NFR-01`, `NFR-02`.
* **Verification Approach:** Automated unit tests for bcrypt hashing; Supertest API integration tests for valid/invalid login, token expiration, and route guards.

### F-02: Serialized Equipment Catalog

* **Scope in Sprint 1:** Read-only catalog view showing asset tag, equipment name, model, category, serial number, and status (`AVAILABLE`, `RESERVED`, `CHECKED_OUT`). Seeding script for reproducible demo data.
* **Scope in Sprint 2:** Custodian catalog administration (create, update metadata, mark maintenance/retired).
* **Mapped Requirements:** `FR-05`, `FR-06`, `FR-07`, `FR-08`, `BR-01`, `NFR-05`.
* **Verification Approach:** API endpoint tests for `/api/items`; Playwright UI tests verifying catalog table rendering and availability badges.

### F-03: Borrower Request Submission & Personal History

* **Scope in Sprint 1:** Borrower browses catalog, clicks "Request Item" on an available asset. Backend checks item availability (`BR-01`), verifies borrower has $< 3$ active loans (`BR-04`), and transitions item status to `RESERVED` while creating a `BorrowRequest` in `PENDING` state. Borrower can query `/api/borrower/my-requests` to view their personal requests. Strict ownership check ensuring Borrower A cannot view Borrower B's requests (`FR-11`).
* **Mapped Requirements:** `FR-09`, `FR-10`, `FR-11`, `FR-12`, `BR-01`, `BR-02`, `BR-04`, `NFR-02`.
* **Verification Approach:** Unit tests for quota checks; Supertest integration tests verifying cross-user isolation and request creation; Playwright end-to-end request journey.

### F-04: Custodian Counter Checkout & Exclusive Allocation

* **Scope in Sprint 1:** Custodian desk view listing pending requests. Custodian executes checkout (`POST /api/custodian/checkouts`). Backend executes transactional update: validates item is available/reserved for this request (`BR-01`), ensures no active duplicate loan exists (`BR-02`), transitions item to `CHECKED_OUT`, sets request to `APPROVED`, and inserts a new `Loan` record. Rejects non-custodian users (`BR-03`).
* **Mapped Requirements:** `FR-13`, `FR-14`, `FR-15`, `FR-16`, `BR-01`, `BR-02`, `BR-03`, `BR-08`, `NFR-03`.
* **Verification Approach:** Concurrency integration tests simulating double checkouts; role authorization tests (Borrower getting 403); UI E2E test of complete checkout journey.

### F-05: Equipment Return & Condition Assessment

* **Scope in Sprint 2:** Custodian selects an active loan, enters return inspection notes and condition grade (e.g., `GOOD`, `MINOR_WEAR`, `DAMAGED`), and marks returned. Loan status set to `RETURNED`; item status reverted to `AVAILABLE`.
* **Mapped Requirements:** `FR-17`, `BR-01`, `BR-07`.

### F-06: Due Date Enforcement & Overdue Tracking

* **Scope in Sprint 2:** Set 7-day due date upon checkout. Automated query/helper identifying loans where `dueDate < now()` and `status == CHECKED_OUT`. Visual warning badges on Borrower and Custodian dashboards.
* **Mapped Requirements:** `FR-18`, `BR-05`, `BR-06`.

### F-07: Catalog Filtering, Full-Text Search & Category Navigation

* **Scope in Sprint 2:** Multi-parameter search endpoint (`category`, `availability`, keyword query against name and asset tag). Fast indexed lookup. Responsive UI filter sidebar.
* **Mapped Requirements:** `FR-05`, `FR-06`, `NFR-04`, `NFR-06`.

### F-08: Inventory Audit History & Custodial Reporting

* **Scope in Sprint 3:** Append-only transaction log table tracking all state transitions with timestamps and actor IDs. Summary dashboard metrics (utilization rate, most borrowed equipment, active loans vs total capacity).
* **Mapped Requirements:** `BR-08`, `NFR-05`.
