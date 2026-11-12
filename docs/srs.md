# Software Requirements Specification (SRS)

## CPE Equipment & Hardware Inventory and Borrowing System (EquipFlow)

**Document ID:** `SRS-01`  
**Version:** `1.0.0`  
**Status:** Wait for review
**Course:** CPE 334 Software Engineering (Semester 1/2026)  
**Deliverable:** Project Deliverable 1 — Part A  
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
| **Anonymous User (Visitor)** | Unauthenticated visitor accessing the web portal. | • View landing page.<br>• Authenticate using valid department credentials (login).<br>• Access public system status (if configured). |
| **Borrower (Student / Faculty / Researcher)** | Authenticated department member borrowing hardware. | • Browse and search available catalog items.<br>• Submit borrow requests for available items.<br>• View own active borrow requests and loan history.<br>• Cancel own pending requests before checkout. |
| **Custodian (Lab Administrator / Technician)** | Authorized laboratory staff managing hardware assets and transactions. | • Maintain equipment catalog (create, edit, retire items).<br>• Review, approve, and fulfill pending borrow requests.<br>• Record physical checkout (transitioning item to active loan).<br>• Record return of equipment, assess physical condition, and close loans.<br>• Monitor overdue items and generate inventory audit summaries. |
| **System (Automated Agent)** | Background scheduler and transactional boundary. | • Enforce exclusivity and prevent concurrent checkout collisions.<br>• Calculate loan durations, due dates, and overdue status flags.<br>• Maintain append-only audit trail for all state transitions. |

---

## 3. Product Scope & Explicit Exclusions

### 3.1 In-Scope Capabilities (Three-Sprint Roadmap)

* **Identity & Role-Based Access Control:** Secure authentication, password hashing, session/token management, and strict server-side authorization separating Borrower and Custodian operations.
* **Serialized Asset Inventory:** Tracking individual equipment units with unique asset tags, serial numbers, categories, models, conditions, and availability statuses.
* **Borrowing Lifecycle Management:** End-to-end state transitions: Item Available $\rightarrow$ Requested $\rightarrow$ Checked Out (Active Loan) $\rightarrow$ Returned / Overdue.
* **Exclusive Allocation & Concurrency Guard:** Deterministic prevention of double-booking or concurrent checkouts for the same physical asset.
* **Borrower Self-Service:** Personal dashboard showing current loans, pending requests, and due dates.
* **Custodial Operations Desk:** Custodian dashboard for managing incoming requests, executing checkouts, inspecting item conditions, and processing returns.
* **Reporting & Auditing:** Inventory utilization, overdue tracking, and immutable transaction logs.

### 3.2 Explicit Exclusions (Out of Scope)

* **Financial Fines / Payment Gateway Integration:** The system will flag overdue items, but will not collect money, process credit cards, or compute monetary late fines.
* **Physical Barcode / RFID Hardware Scanners:** Barcode data strings can be typed or scanned via keyboard emulation; direct device drivers or proprietary RFID readers are excluded.
* **Multi-Department Multi-Tenancy:** The application is scoped strictly to a single department instance (CPE Lab); multi-tenant cloud partitioning is out of scope.
* **Automated External Communications:** No real SMS gateways, external SMTP servers, or LINE Notify webhooks are required; synthetic in-app notifications and status boards are used.
* **Consumable / Bulk Quantity Pooling in Sprint 1:** Sprint 1 focuses exclusively on uniquely serialized assets (discrete tracking) to enforce rigorous concurrency and state rules. Consumables (e.g., resistors, solder wire) are excluded from the core borrowing model.
* **Self-Registration & Password Recovery:** Seeded test accounts are provided for sprint evaluations; public self-signup and email verification loops are excluded.

---

## 4. Functional Requirements (FR)

### 4.1 Authentication & Session Management

* **FR-01 (User Login):** The system shall authenticate registered users using email/username and password, returning an authenticated session token upon credential validation.
* **FR-02 (Current User Identity):** The system shall provide an endpoint returning the profile and role (`BORROWER` or `CUSTODIAN`) of the currently authenticated user.
* **FR-03 (User Logout):** The system shall invalidate the active session/token upon user logout, terminating authenticated access.
* **FR-04 (Role-Based Authorization):** The system shall enforce server-side access control on all protected endpoints, denying unauthorized role actions with HTTP 403 Forbidden.

### 4.2 Catalog & Inventory Management

* **FR-05 (Catalog Browsing):** The system shall allow Borrowers and Custodians to view the catalog of equipment items, displaying asset tag, name, category, and real-time availability status.
* **FR-06 (Catalog Item Details):** The system shall allow users to inspect detailed specifications, item serial number, current condition, and borrowing restrictions of an item.
* **FR-07 (Item Creation & Management):** The system shall allow Custodians to register new physical equipment assets with unique asset tags, serial numbers, and initial condition.
* **FR-08 (Item Status Management):** The system shall allow Custodians to update item statuses (e.g., mark an item `MAINTENANCE` or `RETIRED`).

### 4.3 Borrow Request & Reservation Workflow

* **FR-09 (Submit Borrow Request):** The system shall allow an authenticated Borrower to submit a borrow request for any available equipment item.
* **FR-10 (View Personal Requests):** The system shall allow a Borrower to view all borrow requests and loans created by themselves, including current statuses (`PENDING`, `APPROVED`, `CHECKED_OUT`, `REJECTED`, `RETURNED`).
* **FR-11 (Data Ownership Isolation):** The system shall restrict Borrowers to viewing only their own requests/loans and forbid access to another user's private borrowing data.
* **FR-12 (Cancel Pending Request):** The system shall allow a Borrower to cancel their own request provided it is still in `PENDING` status.

### 4.4 Custodian Triage & Checkout Workflow

* **FR-13 (Custodian Request Triage):** The system shall allow Custodians to view all pending borrow requests across all borrowers, ordered chronologically.
* **FR-14 (Record Physical Checkout):** The system shall allow a Custodian to record the physical handover (checkout) of an item to a borrower, transitioning the item to `CHECKED_OUT` and creating an active `Loan` record.
* **FR-15 (Direct Walk-in Checkout):** The system shall allow Custodians to execute an immediate checkout for an on-premise borrower without prior web reservation.
* **FR-16 (Reject Borrow Request):** The system shall allow Custodians to reject a pending borrow request with a recorded rejection reason.

### 4.5 Return, Overdue & Lifecycle Management (Sprints 2 & 3)

* **FR-17 (Record Item Return):** The system shall allow Custodians to process an equipment return, recording return date, condition upon return, and restoring item availability.
* **FR-18 (Overdue Tracking):** The system shall flag active loans exceeding their loan duration as `OVERDUE` and display overdue indicators to both Borrowers and Custodians.

---

## 5. Business Rules (BR)

* **BR-01 (Availability Rule):** An equipment item may only be requested or checked out if its current status is strictly `AVAILABLE`. An item in status `CHECKED_OUT`, `MAINTENANCE`, `RESERVED`, or `RETIRED` cannot be borrowed.
* **BR-02 (Exclusive Allocation & Conflict Prevention):** A physical serialized item cannot have more than one active loan or approved reservation at any given time. Competing requests for the same item must be resolved such that only one succeeds; subsequent or concurrent attempts must be rejected with HTTP 409 Conflict or 400 Bad Request.
* **BR-03 (Role Segregation on Checkout):** Only users with the `CUSTODIAN` role are authorized to record checkouts and update item availability. Borrowers are strictly forbidden from performing checkout operations, even for their own approved requests.
* **BR-04 (Maximum Active Loans per Borrower):** A Borrower may have at most three (3) concurrent active loans and/or pending requests. Any request that causes a Borrower's active quota to exceed 3 shall be rejected.
* **BR-05 (Default Loan Duration):** Every newly created loan shall have a default borrowing period of seven (7) calendar days from the moment of checkout, after which it enters the overdue inspection window.
* **BR-06 (Request Expiration):** A pending borrow request that is not approved or checked out within forty-eight (48) hours of submission shall automatically expire and release the item.
* **BR-07 (State Machine Immutability):** Loan state transitions are unidirectional: `PENDING` $\rightarrow$ `CHECKED_OUT` $\rightarrow$ `RETURNED`. A closed or returned loan cannot be reverted to `CHECKED_OUT`.
* **BR-08 (No Self-Approval by Proxy):** Custodians cannot bypass system authentication; all inventory updates and checkouts must record the custodian's authenticated user ID as the accountable operator.

---

## 6. Non-Functional Requirements (NFR)

| NFR ID | Category | Requirement Description | Measurable Target | Practical Verification Method | Allocated Sprint |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **NFR-01** | **Security** | Passwords must never be stored or logged in plaintext. | Passwords hashed using bcrypt with salt rounds $\ge 10$. Zero plaintext passwords in database or logs. | Direct database query inspection & unit test inspecting User table. | **Sprint 1** |
| **NFR-02** | **Security / Auth** | Unauthenticated and unauthorized requests must be blocked at backend. | 100% of protected API endpoints return HTTP 401 (if unauthenticated) or HTTP 403 (if wrong role). No data leaked in error body. | Automated Supertest / API integration test suite. | **Sprint 1** |
| **NFR-03** | **Data Integrity** | Concurrency conflicts on the same physical asset must be rejected safely. | Zero duplicate active loans in database under simulated concurrent checkout requests. | Concurrent API stress integration test verifying second request returns 400/409. | **Sprint 1** |
| **NFR-04** | **Performance** | API response latency for catalog browsing and checkout transactions under normal local load. | 95th percentile response time $< 200$ ms for local API queries on seeded dataset ($\ge 50$ items). | Automated integration test benchmark timer. | **Sprint 2** |
| **NFR-05** | **Reliability & Persistence** | Data persistence across application restarts and container rebuilds. | Zero data loss of users, inventory, or active loans after server process restart. | Automated end-to-end restart verification script. | **Sprint 1** |
| **NFR-06** | **Usability & Responsiveness** | UI layout must be fully functional across mobile (375px), tablet (768px), and desktop ($\ge 1024$px). | Zero horizontal scrolling or clipped action buttons across standard viewport breakpoints. | Playwright responsive viewport automated checks. | **Sprint 2** |

---

## 7. Assumptions, Design Decisions & Resolved Questions

### 7.1 Key Assumptions

1. **Discrete Asset Model:** The department manages high-value equipment identified by unique asset tags (e.g., `CPE-OSC-001`, `CPE-RPI-004`). Tracking is unit-based rather than aggregate quantity pooling.
2. **Pre-Seeded User Accounts:** For development and grading, the system is pre-seeded with representative Borrowers and Custodians. Self-registration is excluded to focus engineering rigor on core borrowing workflows.
3. **Single Physical Location:** All equipment is housed within the central CPE Laboratory; multi-building transfers are not modeled.

### 7.2 Design Decisions

* **Decision 01 (Stateless JWT vs State-Store Sessions):** The team chose signed HTTP-only Bearer/Cookie JSON Web Tokens (JWT) containing the user ID and role claim. This provides lightweight stateless authentication compatible with future containerized Cloud Run deployment (Lab 5) while preventing client-side script tampering.
* **Decision 02 (Relational Integrity with Prisma ORM):** Use relational database foreign keys (`userId`, `itemId`, `loanId`) with strict cascade guards to ensure no orphaned borrowing records can exist.
* **Decision 03 (Two-Tier Role Hierarchy):** Role enum is strictly `BORROWER` and `CUSTODIAN`. If administrative actions are needed later, `CUSTODIAN` possesses administrative inventory rights.

### 7.3 Resolved Questions

* **Q1: Does a Borrower's request immediately change the item status?**  
  * *Resolution:* Yes. In Sprint 1, submitting a request transitions the item to `RESERVED` / `PENDING_CHECKOUT` to prevent another student from requesting it while the first student walks to the lab counter. Custodian checkout then transitions it to `CHECKED_OUT`. If rejected or cancelled, it returns to `AVAILABLE`.
* **Q2: Can a Borrower check out equipment directly without Custodian intervention?**  
  * *Resolution:* No. Physical hardware custody requires staff verification at the lab counter. The system enforces `BR-03` via backend authorization middleware.
