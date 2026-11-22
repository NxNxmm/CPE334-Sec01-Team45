# EquipFlow — Sprint 1 User Acceptance Testing (UAT) Plan & Safe Handoff Package

**Course:** CPE 334 Software Engineering (Semester 1 / Year 3)  
**Assignment:** Lab 6 — Independent User Acceptance Testing and Defect Management (Part A)  
**Document ID:** `UAT-PLAN-SPRINT-01`  
**Version:** `1.0.0`  
**Tracking Issue:** [Issue #42 (`[Lab 6] L6-1: Sprint 1 UAT plan and safe handoff (Part A)`)](https://github.com/NxNxmm/CPE334-Sec01-Team45/issues/42)  
**LEB2 Submission Deadline:** Sunday, 29 November 2026 at 23:59 ICT  

---

## 1. Team Pairing & Lab 6 Responsibility Matrix

### 1.1 Product Team vs. Independent UAT Team

| Role in This UAT Cycle | Team Code / Name | Section | Team Members (Student ID · GitHub / Name) | System Under Test |
| :--- | :--- | :---: | :--- | :--- |
| **Product Team** *(System Owner)* | **`TH-045_P2`** (**EquipFlow**) | Sec 1 | • **Norawit Mahaprom** (`67070501026` · `@NxNxmm`)<br>• **Pawarisa Thongchua** (`67070501032` · `@itspxsh`) | **EquipFlow** — Theme 2: CPE Hardware Inventory & Borrowing System |
| **Independent UAT Team** *(Assessors)* | **`TH-017`** (**2 auan**) | Sec 1 | • Student 1: **`67070501001`**<br>• Student 2: **`67070501030`** | Executes independent manual UAT against EquipFlow Sprint 1 deployed release |

> [!IMPORTANT]
> **Reciprocal Independent UAT Arrangement:**
> - Team **`TH-017` (`2 auan`, `67070501001` & `67070501030`)** acts as the **Independent UAT Team** testing **EquipFlow (`TH-045_P2`)** using this UAT plan and handoff package.
> - Team **`TH-045_P2` (`67070501026` & `67070501032`)** acts as the **Independent UAT Team** testing **Team `TH-017` (`2 auan`)'s** deployed Sprint 1 release under [Issue #43 (`L6-2`)](https://github.com/NxNxmm/CPE334-Sec01-Team45/issues/43).

### 1.2 Team `TH-045_P2` Lab 6 Issue Index & Pair-Work Protocol (`Odd = NxNxmm`, `Even = itspxsh`)

To enforce peer review on every Pull Request while meeting the Lab 6 mandatory pair participation rules (Handout §§1, 3.2, 4.2, 5), Team `TH-045_P2` assigns odd-numbered issues to `@NxNxmm` and even-numbered issues to `@itspxsh`, with explicit **Mandatory Pair Work** checkpoints:

| GitHub Issue | Lab 6 Deliverable Scope | PR Author | PR Reviewer | Collaboration Mode & Mandatory Pair-Work Remark |
| :---: | :--- | :---: | :---: | :--- |
| **[#42 (`L6-1`)](https://github.com/NxNxmm/CPE334-Sec01-Team45/issues/42)** | **Part A (20 pts):** Sprint 1 UAT plan & safe handoff (`docs/labs/lab-06/uat-plan.md`) | `@NxNxmm` | `@itspxsh` | **Individual Draft + Pair Walkthrough:** `@NxNxmm` authors the UAT plan; `@itspxsh` reviews all 6 cases against Sprint 1 specs and verifies live DB preconditions so both members can support Team `TH-017` identically. |
| **[#43 (`L6-2`)](https://github.com/NxNxmm/CPE334-Sec01-Team45/issues/43)** | **Part B (25 pts):** Independent UAT execution on Partner (`TH-017`) system (`docs/labs/lab-06/uat-execution-partner.md`) | `@itspxsh` | `@NxNxmm` | **MANDATORY PAIR WORK (§3.2):** Both `Norawit Mahaprom` (`67070501026`) and `Pawarisa Thongchua` (`67070501032`) must co-execute UAT cases together on Team `TH-017`'s live URL and record their names in the execution table. `@itspxsh` compiles the PR; `@NxNxmm` reviews. |
| **[#44 (`L6-3`)](https://github.com/NxNxmm/CPE334-Sec01-Team45/issues/44)** | **Part C (20 pts):** Outgoing defect reports for `TH-017` & incoming defect triage on EquipFlow (`docs/labs/lab-06/defect-triage.md`) | `@NxNxmm` | `@itspxsh` | **MANDATORY PAIR TRIAGE (§3.3):** Both members sit together to reproduce every incoming finding reported by Team `TH-017` on EquipFlow and jointly agree on classification (`accepted defect` / `duplicate` / `not-defect` / `enhancement`) before `@NxNxmm` opens the PR. |
| **[#45 (`L6-4`)](https://github.com/NxNxmm/CPE334-Sec01-Team45/issues/45)** | **Part D (35 pts):** RED-to-GREEN defect resolution or controlled defect exercise (`docs/labs/lab-06/defect-resolution.md`) | `@itspxsh` | `@NxNxmm` | **Pair Root-Cause Analysis + Reviewed Code/Test PR (§§3.4–3.5):** Both members align on root cause and test design; `@itspxsh` implements the failing test (`RED`) and code fix (`GREEN`); `@NxNxmm` verifies test output and code diff in PR review. |
| **[#46 (`L6-5`)](https://github.com/NxNxmm/CPE334-Sec01-Team45/issues/46)** | **Part D (35 pts):** Release deployment to `main` (if live fix) & independent retest verification (`docs/labs/lab-06/retest-verification.md`) | `@NxNxmm` | `@itspxsh` | **MANDATORY PAIR RETEST & COORDINATION (§3.4):** `@NxNxmm` coordinates with Team `TH-017` before any redeploy and requests their independent retest on EquipFlow; both `@NxNxmm` and `@itspxsh` jointly retest fixed defects on Team `TH-017`'s updated deployment and sign off on final UAT acceptance. |
| **[#47 (`L6-6`)](https://github.com/NxNxmm/CPE334-Sec01-Team45/issues/47)** | **Submission:** Self-contained Lab 6 final PDF report (`docs/submissions/lab6_sec1_TH-045_P2.pdf`) | `@itspxsh` | `@NxNxmm` | **Pair Final Verification (§4, §5):** `@itspxsh` compiles the self-contained PDF report; `@NxNxmm` audits every figure, table, secret-hygiene check, and pair contribution declaration before LEB2 upload. |

---

## 2. Assessed Sprint 1 Baseline & Scope Boundary (Handout §§2, 3.1)

### 2.1 Version & Deployment Traceability

In accordance with Lab 6 Handout §2, User Acceptance Testing evaluates **strictly the delivered Sprint 1 scope** deployed on Google Cloud Run:

| Artifact / Environment Attribute | Authoritative Value |
| :--- | :--- |
| **Sprint 1 Functional Baseline Tag / Commit** | `v0.1.0-sprint1` (`63e04268449d9ca07b1b8c5a60a044c47854363d`) |
| **Assessed Live `main` Release Commit SHA** | `8217beff7d33b2fc7657c36824d4a22a0df6bb94` (Lab 5 Release 2 — PostgreSQL 16 cloud migration + KMUTT Lending Policy notice) |
| **Live Deployed Application URL** | `https://equipflow-ddqo5fpv2a-as.a.run.app` |
| **Liveness & Database Readiness Probes** | • `GET https://equipflow-ddqo5fpv2a-as.a.run.app/api/health` (`{"status":"ok","service":"equipflow-api"}`)<br>• `GET https://equipflow-ddqo5fpv2a-as.a.run.app/api/ready` (`{"status":"ready","service":"equipflow-api","db":"connected"}`) |
| **Active Cloud Run Revision (100% Traffic)** | `equipflow-00009-kns` (Region: `asia-southeast1`, Project: `cpe334-team45`) |
| **Container Runtime Digest** | • Platform Manifest Digest: `sha256:604e51553a794404a063f40bdbaa8d037ee94dd72c92a87a9a2b47ae65f3f7a0`<br>• OCI Index Digest: `sha256:ac724f44dd1b11f0f67dbbe81a697685b64a60c8966d59981a42e29555ac6cfa` |
| **Backing Cloud Database** | Cloud SQL for PostgreSQL 16 (`equipflow-pg`, `asia-southeast1`, database `equipflow`) |

### 2.2 Accepted-for-Test Sprint 1 Scope vs. Explicitly Excluded Scope

To prevent false defects caused by testing features scheduled for later sprints (Handout §2), the boundary between **Included Sprint 1 Scope** and **Excluded Future Scope** is defined below from [`docs/sprints/sprint-1/specification.md`](../../sprints/sprint-1/specification.md) (§3.1 & §3.2):

| In-Scope for Sprint 1 UAT (Assessable Contract) | Out-of-Scope for Sprint 1 UAT (Excluded — Not a Defect) |
| :--- | :--- |
| **1. Authentication & Session Revocation (`F-01`):**<br>• Email + password sign-in (`POST /api/v1/auth/login`) issuing JWT Bearer token.<br>• Current user profile check (`GET /api/v1/auth/me`).<br>• Per-session logout (`POST /api/v1/auth/logout`) persisting token `jti` to `RevokedToken` so replayed tokens return HTTP `401 TOKEN_REVOKED`.<br>• Role-based route & endpoint guard (`BORROWER` vs `CUSTODIAN`, HTTP `401` / `403`). | • Public user self-registration or automated forgot-password email loops (seeded accounts are used in Sprint 1).<br>• OAuth / Google SSO login. |
| **2. Serialized Equipment Catalog (`F-02` Read Slice):**<br>• Catalog grid listing (`GET /api/v1/items`) with real-time status badges (`AVAILABLE`, `RESERVED`, `CHECKED_OUT`, `MAINTENANCE`).<br>• Item specification detail modal (`GET /api/v1/items/:id`) showing category, model number, manufacturer serial number, physical condition, and availability. | • Multi-criteria catalog search bar, category dropdown filtering, or pagination (`F-07`, allocated to Sprint 2).<br>• Custodian UI for creating, editing, or deleting catalog assets (`F-02` write slice, allocated to Sprint 2; no `DELETE` endpoints exist by design). |
| **3. Borrower Request Submission & Personal History (`F-03`):**<br>• Submitting a borrow request (`POST /api/v1/requests`) for an `AVAILABLE` item with optional purpose notes ($\le 250$ chars), transitioning the item to `RESERVED` and creating a `PENDING` request.<br>• Combined Active Quota rule (`BR-04`): $\text{Pending Requests} + \text{Active Loans} \le 3$.<br>• Non-available item rejection (`BR-01`, HTTP `400 ITEM_NOT_AVAILABLE`) and concurrent reservation conflict lock (`BR-02`, HTTP `409`).<br>• Personal history view (`My Requests` / `GET /api/v1/requests/my`) and strict cross-borrower data isolation (`FR-11`). | • Borrower self-cancellation of a pending borrow request (allocated to Sprint 2).<br>• Direct walk-in checkout without a prior borrower request (`FR-15`, allocated to Sprint 2). |
| **4. Custodian Triage Queue & Physical Checkout (`F-04`):**<br>• Viewing all pending requests and active department loans (`GET /api/v1/custodian/requests`).<br>• Recording physical checkout (`POST /api/v1/custodian/checkouts`) with optional staff notes ($\le 500$ chars), atomically transitioning the item from `RESERVED` to `CHECKED_OUT`, marking the request `APPROVED`, creating an `ACTIVE` loan, auto-calculating `dueDate = checkedOutAt + 7 days` (`BR-05`), and attributing `custodianId` (`BR-08`). | • Custodian rejection/denial of a pending borrow request (allocated to Sprint 2).<br>• Equipment return check-in and post-loan condition inspection (`F-05`, allocated to Sprint 2).<br>• Automated overdue loan detection engine, warning badges, or late fines (`F-06`, allocated to Sprint 2).<br>• Audit log viewer/export (`F-08`, allocated to Sprint 3). |

### 2.3 Sprint 1 Requirement & Acceptance Criteria Contract Excerpts

The table below provides the authoritative contract excerpts from [`docs/sprints/sprint-1/specification.md`](../../sprints/sprint-1/specification.md), [`docs/sprints/sprint-1/api-spec.md`](../../sprints/sprint-1/api-spec.md), and [`docs/sprints/sprint-1/tests.md`](../../sprints/sprint-1/tests.md) referenced by our UAT cases:

| Req / Rule ID | Acceptance Criteria ID | Authoritative Sprint 1 Contract Requirement |
| :--- | :--- | :--- |
| **`FR-01` / `FR-02`** | `AC-AUTH-01`, `AC-AUTH-02`, `AC-AUTH-03` | Valid email/password login via `POST /api/v1/auth/login` returns HTTP `200` with a signed JWT Bearer token and user profile (`BORROWER` or `CUSTODIAN`). Invalid credentials return HTTP `401 INVALID_CREDENTIALS` and display a visible alert banner while preserving the typed email. `GET /api/v1/auth/me` returns the authenticated profile. |
| **`FR-03`** | `AC-AUTH-04`, `AC-AUTH-05` | Invoking `POST /api/v1/auth/logout` persists the token's unique `jti` into `RevokedToken`. Any subsequent request using that revoked token is rejected with HTTP `401 Unauthorized` (`"code": "TOKEN_REVOKED"`). |
| **`FR-04` / `BR-03`** | `AC-AUTH-06`, `AC-AUTH-07`, `AC-CHK-07` | Unauthenticated requests to protected endpoints return HTTP `401 UNAUTHENTICATED`. Only `CUSTODIAN` users may view `/api/v1/custodian/requests` or execute `/api/v1/custodian/checkouts`; any `BORROWER` attempt returns HTTP `403 FORBIDDEN_ROLE` and cannot access the Custodian Desk UI. |
| **`FR-05` / `FR-06`** | `AC-CAT-01`, `AC-CAT-02` | `GET /api/v1/items` lists all 6 serialized equipment assets with asset tag, name, category, model, condition, and real-time status badge (`AVAILABLE`, `RESERVED`, `CHECKED OUT`, `MAINTENANCE`). Clicking `View Details` (`GET /api/v1/items/:id`) opens a modal displaying the technical description, manufacturer serial number, condition, and availability. |
| **`FR-09` / `BR-01`** | `AC-REQ-01`, `AC-REQ-02` | An authenticated `BORROWER` with active quota $< 3$ can submit a request (`POST /api/v1/requests`) only for an item whose status is strictly `AVAILABLE`. Submission returns HTTP `201 Created`, creates a `PENDING` request, and immediately transitions the item to `RESERVED`. Attempting to request an item in `RESERVED`, `CHECKED_OUT`, or `MAINTENANCE` status is blocked in the UI (disabled button) and rejected by the API with HTTP `400 Bad Request` (`"code": "ITEM_NOT_AVAILABLE"`). |
| **`BR-04`** | `AC-REQ-03` | $\text{Active Quota} = \text{Count}(\text{Pending Requests}) + \text{Count}(\text{Active Loans}) \le 3$. When a borrower reaches `3 / 3` active items, catalog request buttons disable with label `Limit Reached (3/3)` and `POST /api/v1/requests` rejects any additional request with HTTP `400 Bad Request` (`"code": "EXCEEDS_ACTIVE_QUOTA"`). |
| **`FR-10` / `FR-11` / `NFR-05`** | `AC-REQ-05`, `AC-REQ-06` | `My Requests` (`GET /api/v1/requests/my`) displays the authenticated borrower's quota banner (`X / 3 Items Active`), active loans (with checkout date and 7-day due date), and requests. Cross-borrower isolation is strictly enforced: Borrower A never sees Borrower B's requests or loans. All state changes persist in PostgreSQL across page reloads and re-logins. |
| **`FR-13` / `FR-14` / `BR-02` / `BR-05` / `BR-08`** | `AC-CHK-01`–`AC-CHK-06` | `Custodian Triage & Checkout Desk` (`GET /api/v1/custodian/requests`) lists pending requests across all borrowers and active department loans. Clicking `Approve & Checkout` -> `Confirm Physical Checkout` (`POST /api/v1/custodian/checkouts`) atomically transitions the item from `RESERVED` to `CHECKED_OUT` and the request from `PENDING` to `APPROVED`, creates an `ACTIVE` loan with `dueDate = checkedOutAt + 7 days` (`BR-05`), and records the authenticated custodian as `custodianId` (`BR-08`). Duplicate or competing checkout attempts return HTTP `409 CONCURRENT_CHECKOUT_CONFLICT` (`BR-02`). |

---

## 3. Safe Handoff Package for Independent UAT Team `TH-017` (`2 auan`)

### 3.1 Environment Access & Private Credential Delivery Policy (Handout §3.1)

- **Live Deployed URL:** `https://equipflow-ddqo5fpv2a-as.a.run.app`
- **Supported Browsers:** Google Chrome, Microsoft Edge, or Mozilla Firefox (Desktop `1280px+` and Mobile `375px` viewports; Developer Tools Console `F12` used for verifying negative API responses alongside UI checks).
- **Credential Hygiene Rule (§3.1, §4.2):** Passwords and secret tokens are **never** written in this document, Git repository, GitHub Issues/PRs, or the final PDF report. The shared demo password (`<PROVIDED_PRIVATELY_TO_TH017>`) is delivered directly to Team `TH-017` (`67070501001` & `67070501030`) via private team chat prior to testing.

### 3.2 Pre-Provisioned Test Accounts & Live Quota State

To allow Team `TH-017` to execute both **normal request/checkout journeys** and **boundary quota-rejection (`3 / 3`) tests** immediately without manual setup overhead, the live Cloud SQL PostgreSQL database provides two distinct `BORROWER` accounts and one `CUSTODIAN` account:

| Account Label | Role | Login Email | Student / Staff ID | Pre-Test Live Quota State on `equipflow-00009-kns` | Intended UAT Usage |
| :--- | :---: | :--- | :---: | :--- | :--- |
| **`BORROWER_FREE`** *(Student Borrower Two)* | `BORROWER` | `borrower2@cpe.kmutt.ac.th` | `67070501002` | **`1 / 3 Items Active`**<br>• 1 Active Loan (`CPE-RPI-002`)<br>• 0 Pending Requests<br>• **2 Free Quota Slots Available** | Use for **Normal Domain Journey (`UAT-EF-01`)**, **Non-Available Item Rejection (`UAT-EF-03`)**, **Forbidden Role Guard (`UAT-EF-04`)**, **Cross-Borrower Isolation & Logout Revocation (`UAT-EF-05`)**, and **Persistence Verification (`UAT-EF-06`)**. |
| **`BORROWER_FULL`** *(Student Borrower One)* | `BORROWER` | `borrower@cpe.kmutt.ac.th` | `67070501001` | **`3 / 3 Items Active` (Quota Full)**<br>• 1 Active Loan (`CPE-OSC-001`)<br>• 2 Pending Requests (including Lab 5 C-05 record `CPE-OSC-002`, note `LAB5-C05-20261121T1912ICT`) | Use for **Active Quota Limit (`3 / 3`) Boundary Rejection (`UAT-EF-02`)** and as the comparison account for **Cross-Borrower Isolation (`UAT-EF-05`)**. |
| **`CUSTODIAN_STAFF`** *(CPE Lab Custodian)* | `CUSTODIAN` | `custodian@cpe.kmutt.ac.th` | `STAFF-001` | N/A (Custodian role) | Use for **Custodian Triage Queue & Physical Checkout (`UAT-EF-01`)** and **Active Loans Monitor Verification (`UAT-EF-06`)**. |

### 3.3 Live Equipment Catalog Fixtures (`6` Serialized Assets)

| Asset Tag | Equipment Name | Category | Model | Serial Number | Live Pre-UAT Status | Role in UAT Cases |
| :--- | :--- | :--- | :--- | :--- | :---: | :--- |
| **`CPE-OSC-001`** | Rigol DS1054Z Digital Oscilloscope | Measurement | `DS1054Z` | `RIGOL-DS1054Z-001` | `CHECKED_OUT` *(to `borrower@cpe.kmutt.ac.th`)* | Occupied item boundary (`UAT-EF-03`) & cross-borrower isolation check (`UAT-EF-05`). |
| **`CPE-OSC-002`** | Keysight InfiniiVision DSOX1204A | Measurement | `DSOX1204A` | `KEYSIGHT-DSOX1204A-002` | `RESERVED` *(by `borrower@cpe.kmutt.ac.th`, Lab 5 C-05 fixture)* | **Do NOT checkout during UAT** (preserved Lab 5 C-05 pending request `cmwqdf5ji0001s60101l4203z`); used as `RESERVED` boundary fixture in `UAT-EF-03` & `UAT-EF-05`. |
| **`CPE-RPI-001`** | Raspberry Pi 4 Model B 4GB | Microcontrollers | `RPI4-4GB` | `RPI4-4GB-001` | `AVAILABLE` or `RESERVED` *(by `borrower@cpe.kmutt.ac.th`)* | Available target asset for `UAT-EF-01` / `UAT-EF-02` (if `AVAILABLE`) or `RESERVED` fixture. |
| **`CPE-FPG-001`** | Terasic DE10-Lite FPGA Board | FPGA | `DE10-Lite` | `TERASIC-DE10LITE-001` | `AVAILABLE` or `RESERVED` *(by `borrower@cpe.kmutt.ac.th`)* | Primary `AVAILABLE` target asset for **Normal Domain Journey (`UAT-EF-01`)** and **`3/3` Quota UI check (`UAT-EF-02`)**. |
| **`CPE-RPI-002`** | Raspberry Pi 4 Model B 8GB | Microcontrollers | `RPI4-8GB` | `RPI4-8GB-002` | `CHECKED_OUT` *(seeded active loan to `borrower2@cpe.kmutt.ac.th`)* | Pre-existing active loan for `borrower2` (`1 / 3` baseline) and `CHECKED_OUT` rejection fixture (`UAT-EF-03`). |
| **`CPE-LOG-001`** | Saleae Logic 8 USB Analyzer | Measurement | `Logic 8` | `SALEAE-LOGIC8-001` | `MAINTENANCE` *(seeded maintenance fixture)* | Non-available `MAINTENANCE` boundary rejection fixture (`UAT-EF-03`). |

### 3.4 Required Execution Sequence & Data Reset / Cleanup Protocol

> [!WARNING]
> **Critical Ordering Rule (Preventing Self-Blocking):**
> Because `UAT-EF-01` (Normal Domain Journey) transitions the remaining `AVAILABLE` catalog asset (`CPE-FPG-001` or `CPE-RPI-001`) to `RESERVED` and then `CHECKED_OUT`, **Team `TH-017` should execute `UAT-EF-02` (`3 / 3` Quota Limit Check on an `AVAILABLE` item) BEFORE completing the request submission in `UAT-EF-01`**, OR execute in the exact recommended order below:
>
> **Recommended Zero-Block Execution Order for Team `TH-017` (`67070501001` & `67070501030`):**
> 1. **`UAT-EF-02`** (Category 2A: Quota Limit `3 / 3` Rejection using `borrower@cpe.kmutt.ac.th` — *Read-only / non-mutating; verifies `Limit Reached (3/3)` button on the `AVAILABLE` card before that item is borrowed!*)
> 2. **`UAT-EF-03`** (Category 2B: Non-Available Item Rejection `CHECKED_OUT` / `MAINTENANCE` / `RESERVED` using `borrower2@cpe.kmutt.ac.th` — *Read-only / non-mutating*)
> 3. **`UAT-EF-04`** (Category 3A: Forbidden Role Guard `BORROWER` -> Custodian Desk & API using `borrower2@cpe.kmutt.ac.th` — *Read-only / non-mutating*)
> 4. **`UAT-EF-05`** (Category 3B: Cross-Borrower Data Isolation & Logout Token Revocation using `borrower2@cpe.kmutt.ac.th` — *Read-only / revokes only that temporary session token*)
> 5. **`UAT-EF-01`** (Category 1: Normal End-to-End Domain Journey — `borrower2@cpe.kmutt.ac.th` requests the `AVAILABLE` asset -> `custodian@cpe.kmutt.ac.th` approves & records physical checkout — *Mutates the `AVAILABLE` item to `RESERVED` -> `CHECKED_OUT`*)
> 6. **`UAT-EF-06`** (Category 4: Personal History & State Persistence Across Refresh & Re-Login — verifies the newly created loan from `UAT-EF-01` persists across hard reload and fresh sign-in)

#### Recommended Pair Division for Team `TH-017` (`67070501001` & `67070501030`)
To satisfy Lab 6 Handout §3.2 (*"Both students in a 2-person team must participate in UAT execution"*):
- **Tester 1 (`67070501001`)** executes **`UAT-EF-02`**, **`UAT-EF-03`**, and the **Borrower half of `UAT-EF-01`** + **`UAT-EF-06`**.
- **Tester 2 (`67070501030`)** executes **`UAT-EF-04`**, **`UAT-EF-05`**, and the **Custodian checkout half of `UAT-EF-01`** + **`UAT-EF-06`**.
- Both testers sit together to observe all 6 cases and verify each screenshot.

#### Data Reset / Cleanup Instructions (If Needed for Re-Runs or Part D Retesting)
Because Sprint 1 excludes item return (`F-05`) and request cancellation (allocated to Sprint 2), once `UAT-EF-01` checks out the available item, it remains `CHECKED_OUT`. If Team `TH-017` needs the item reset to `AVAILABLE` for a second pass or Part D retest:
1. Message Team `TH-045_P2` (`@NxNxmm` / `@itspxsh`) in the coordination channel.
2. Team `TH-045_P2` will reset only the UAT test loan/request on `CPE-FPG-001` / `CPE-RPI-001` back to `AVAILABLE` (while keeping the Lab 5 C-05 fixture `cmwqdf5ji0001s60101l4203z` on `CPE-OSC-002` intact) and confirm readiness within 5 minutes.

---

## 4. Executable Sprint 1 UAT Test Cases (Handout §3.1)

### Summary Matrix of UAT Cases Across the 4 Mandatory Categories

| Case ID | Mandatory Handout Category (§3.1) | Title / Scenario Focus | Primary Sprint 1 Requirements & ACs | Actor Role(s) | Recommended Execution Order |
| :---: | :--- | :--- | :--- | :---: | :---: |
| **`UAT-EF-01`** | **1. Normal Domain Journey** | End-to-End Equipment Reservation by Borrower & Physical Checkout by Custodian | `FR-01`, `FR-05`, `FR-06`, `FR-09`, `FR-13`, `FR-14`, `BR-01`, `BR-05`, `BR-08` / `AC-CAT-01`, `AC-CAT-02`, `AC-REQ-01`, `AC-CHK-01`–`AC-CHK-04` | `BORROWER` (`borrower2`) $\rightarrow$ `CUSTODIAN` | **5th** *(after non-mutating checks)* |
| **`UAT-EF-02`** | **2. Business-Rule / Boundary Case (A)** | Combined Active Borrowing Quota Limit (`3 / 3`) Enforcement in UI and REST API | `BR-04` / `AC-REQ-03`, `UI-01-06`, `API-01-16` | `BORROWER` (`borrower` at `3/3`) | **1st** *(while an item is `AVAILABLE`)* |
| **`UAT-EF-03`** | **2. Business-Rule / Boundary Case (B)** | Rejection of Borrow Requests for Non-Available (`CHECKED_OUT`, `MAINTENANCE`, `RESERVED`) Assets | `BR-01`, `BR-02` / `AC-REQ-02`, `UI-01-05`, `API-01-15` | `BORROWER` (`borrower2`) | **2nd** |
| **`UAT-EF-04`** | **3. Forbidden Role / Ownership Case (A)** | Role Segregation Guard: Borrower Denied Access to Custodian Desk UI and Checkout Endpoints | `FR-04`, `BR-03` / `AC-AUTH-06`, `AC-AUTH-07`, `AC-CHK-07`, `E2E-01-03` | `BORROWER` (`borrower2`) & Anonymous | **3rd** |
| **`UAT-EF-05`** | **3. Forbidden Role / Ownership Case (B)** | Cross-Borrower Personal History Isolation (`FR-11`) & Per-Session Logout Token Revocation (`FR-03`) | `FR-11`, `FR-03` / `AC-REQ-06`, `AC-AUTH-04`, `API-01-05`, `API-01-06`, `API-01-19` | `BORROWER` (`borrower2` vs `borrower`) | **4th** |
| **`UAT-EF-06`** | **4. State / History / Persistence Case** | Personal Request/Loan History Accuracy & PostgreSQL State Persistence Across Refresh & Re-Login | `FR-10`, `NFR-05` / `AC-REQ-05`, `UI-01-07` | `BORROWER` (`borrower2`) & `CUSTODIAN` | **6th** *(immediately after `UAT-EF-01`)* |

---

### Case `UAT-EF-01` — Normal Domain Journey: End-to-End Equipment Reservation & Custodian Physical Checkout

* **Mandatory Category:** 1. Normal Domain Journey
* **Sprint 1 Requirement / AC Reference:** `FR-01`, `FR-05`, `FR-06`, `FR-09`, `FR-13`, `FR-14`, `BR-01`, `BR-05`, `BR-08` (`AC-CAT-01`, `AC-CAT-02`, `AC-REQ-01`, `AC-CHK-01`, `AC-CHK-02`, `AC-CHK-03`, `AC-CHK-04`)
* **Purpose:** Verify that an authenticated Borrower with free quota can inspect an `AVAILABLE` equipment asset and submit a reservation request (transitioning the item to `RESERVED` and incrementing active quota), and that an authenticated Custodian can review the pending request in the triage queue and complete physical checkout (transitioning the item to `CHECKED_OUT`, creating an `ACTIVE` loan with a 7-day `dueDate`, and attributing accountability to the custodian).
* **Actor Role(s):**
  1. `BORROWER` — `borrower2@cpe.kmutt.ac.th` (`Student Borrower Two`, ID `67070501002`)
  2. `CUSTODIAN` — `custodian@cpe.kmutt.ac.th` (`CPE Lab Custodian`, ID `STAFF-001`)
* **Preconditions:**
  1. Application is live at `https://equipflow-ddqo5fpv2a-as.a.run.app` (`equipflow-00009-kns`).
  2. `borrower2@cpe.kmutt.ac.th` has an active quota of `1 / 3` (`< 3`).
  3. At least one catalog item is in `AVAILABLE` status (specifically **`CPE-FPG-001`** `Terasic DE10-Lite FPGA Board` or **`CPE-RPI-001`** `Raspberry Pi 4 Model B 4GB`; use whichever card displays the green `● AVAILABLE` badge).
  4. Non-mutating cases `UAT-EF-02` through `UAT-EF-05` have already been completed.
* **Synthetic Inputs:**
  - **Borrower Login Email:** `borrower2@cpe.kmutt.ac.th`
  - **Custodian Login Email:** `custodian@cpe.kmutt.ac.th`
  - **Password:** `<PROVIDED_PRIVATELY_TO_TH017>`
  - **Target Asset Tag:** `CPE-FPG-001` *(or `CPE-RPI-001` if `CPE-FPG-001` is not `AVAILABLE`)*
  - **Academic Purpose / Course Project Notes:** `UAT-TH017-REQ-01: Digital logic lab verification`
  - **Custodian Checkout Staff Notes:** `UAT-TH017-CHK-01: Verified student ID 67070501002; handed over hardware kit.`
* **Numbered User Actions:**
  1. Open `https://equipflow-ddqo5fpv2a-as.a.run.app` in the browser. Confirm the sign-in card displays **`EquipFlow — CPE Hardware Lending`**, subtitle **`Department of Computer Engineering · KMUTT`**, and the **`Lending Policy`** banner (`Up to 3 pending requests and active loans combined · 7-day standard loan period`).
  2. Enter Email Address `borrower2@cpe.kmutt.ac.th` and the privately provided password, then click **`Sign In`**.
  3. On the **Department Equipment Catalog** page, verify the top-right quota badge shows **`📋 My Active Items: 1 / 3`** and locate the `AVAILABLE` equipment card (e.g., **`CPE-FPG-001`** `Terasic DE10-Lite FPGA Board`).
  4. Click **`View Details`** on that `AVAILABLE` card. Inspect the modal fields (`Category`, `Model`, `Serial number`, `Condition`, `Availability: AVAILABLE`), then click **`Close`**.
  5. On the same `AVAILABLE` card, click **`Request to Borrow`**.
  6. In the request modal, enter `UAT-TH017-REQ-01: Digital logic lab verification` into the **`Academic Purpose / Course Project Notes (optional)`** textarea (confirm character counter updates), then click **`Confirm Request`**.
  7. Observe the modal confirmation banner and close the modal. Verify the equipment card status badge in the catalog and the **`📋 My Active Items`** badge in the header.
  8. Click **`Sign Out`** in the top navigation bar, then sign in as Custodian using Email Address `custodian@cpe.kmutt.ac.th` and the privately provided password.
  9. On the **`Custodian Triage & Checkout Desk`** screen, locate the row in **`Pending Requests`** for Student Name **`Student Borrower Two`**, Student ID **`67070501002`**, Asset Tag **`CPE-FPG-001`** *(or `CPE-RPI-001`)*, and Notes **`UAT-TH017-REQ-01: Digital logic lab verification`**. Click **`Approve & Checkout`** on that row. *(Note: Do NOT click `Approve & Checkout` on `Student Borrower One`'s `CPE-OSC-002` request `LAB5-C05-20261121T1912ICT`.)*
  10. In the **`Confirm Physical Checkout`** modal, verify the Borrower identity, Equipment identity, and the **`📅 Scheduled Due Date`** callout (`7 days from checkout`). Enter `UAT-TH017-CHK-01: Verified student ID 67070501002; handed over hardware kit.` into **`Checkout Staff Notes (optional)`**, and click **`Confirm Physical Checkout`**.
* **Expected Results:**
  - **Step 2–4:** Login succeeds (`HTTP 200`); navbar shows `Signed in as: Student Borrower Two` with badge `BORROWER`. Detail modal displays manufacturer serial number (`TERASIC-DE10LITE-001` for `CPE-FPG-001` or `RPI4-4GB-001` for `CPE-RPI-001`), condition `GOOD`, and `AVAILABLE`.
  - **Step 6–7:** Request submission succeeds (`HTTP 201 Created`) and displays the green alert: `Request submitted successfully! <ASSET_TAG> is now reserved.` On the catalog grid, the card badge immediately updates to **`◉ RESERVED`**, its action button becomes disabled with text **`Reserved`**, and the header quota badge increments from **`1 / 3`** to **`2 / 3`**.
  - **Step 8–10:** Custodian login opens **`Custodian Triage & Checkout Desk`**. Confirming checkout (`HTTP 201 Created`) displays the green status banner `Checkout recorded for <ASSET_TAG>.`, removes that request row from **`Pending Requests`**, and adds a new row to **`Active Loans Monitor`** showing:
    - **Asset Tag & Equipment Name:** `<ASSET_TAG>`
    - **Borrower Name:** `Student Borrower Two`
    - **Checked Out At:** Today's date (e.g., `23 Nov 2026`)
    - **Due Date:** Exactly **7 calendar days** after `Checked Out At` (`BR-05`, e.g., `30 Nov 2026`)
    - **Accountable Custodian:** `CPE Lab Custodian` (`BR-08`)

---

### Case `UAT-EF-02` — Business-Rule / Boundary Case (A): Combined Active Borrowing Quota Limit (`3 / 3`) Enforcement

* **Mandatory Category:** 2. Business-Rule or Boundary Case
* **Sprint 1 Requirement / AC Reference:** `BR-04` (`AC-REQ-03`, `UI-01-06`, `API-01-16`)
* **Purpose:** Verify that when a Borrower's combined active quota ($\text{Pending Requests} + \text{Active Loans}$) equals the maximum limit of `3`, the UI disables requesting any `AVAILABLE` equipment with `Limit Reached (3/3)` and the backend API rejects any direct `POST /api/v1/requests` call with HTTP `400 Bad Request` (`EXCEEDS_ACTIVE_QUOTA`) without creating a request or altering item status.
* **Actor Role(s):** `BORROWER` — `borrower@cpe.kmutt.ac.th` (`Student Borrower One`, ID `67070501001`)
* **Preconditions:**
  1. Execute this case **first** (while `CPE-FPG-001` or `CPE-RPI-001` is still `AVAILABLE`).
  2. `borrower@cpe.kmutt.ac.th` has **1 Active Loan** (`CPE-OSC-001`) and **2 Pending Requests** (`CPE-OSC-002` plus `CPE-RPI-001` or `CPE-FPG-001`), totaling **`3 / 3 Items Active`**.
* **Synthetic Inputs:**
  - **Borrower Login Email:** `borrower@cpe.kmutt.ac.th`
  - **Password:** `<PROVIDED_PRIVATELY_TO_TH017>`
  - **Synthetic API Payload (via Browser DevTools Console):** Attempt to request the `AVAILABLE` item while at `3 / 3` quota:
    ```javascript
    await (async () => {
      const token = localStorage.getItem('equipflow_token');
      const itemsRes = await fetch('/api/v1/items', { headers: { Authorization: `Bearer ${token}` } });
      const items = (await itemsRes.json()).data;
      const availableItem = items.find(i => i.status === 'AVAILABLE') ?? items[0];
      const res = await fetch('/api/v1/requests', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId: availableItem.id, requestNote: 'UAT-TH017-QUOTA-BREACH-TEST' })
      });
      console.log('HTTP Status:', res.status, 'Target Asset:', availableItem.assetTag);
      const body = await res.json();
      console.log('Response JSON:', JSON.stringify(body, null, 2));
      return { status: res.status, targetAsset: availableItem.assetTag, body };
    })();
    ```
* **Numbered User Actions:**
  1. Open `https://equipflow-ddqo5fpv2a-as.a.run.app` and sign in as `borrower@cpe.kmutt.ac.th` with the privately provided password.
  2. On the **Department Equipment Catalog** screen, inspect the top-right quota badge (`📋 My Active Items`) and locate the equipment card whose status badge is **`● AVAILABLE`** (`CPE-FPG-001` or `CPE-RPI-001`). Inspect its primary action button.
  3. Click the **`My Requests`** tab in the top navigation bar and inspect the **`Personal Borrowing Quota`** banner and progress bar.
  4. Open the browser Developer Tools Console (`F12` -> **Console** tab), paste the Synthetic API Payload snippet above, and press `Enter` to test backend enforcement of `BR-04` directly against `POST /api/v1/requests`.
  5. Refresh the page (`F5`) and verify that the `AVAILABLE` item's status and the borrower's request list remain completely unchanged.
* **Expected Results:**
  - **Step 2 (UI Boundary Enforcement):** The top-right catalog badge displays **`📋 My Active Items: 3 / 3`**. Even though the target equipment card shows badge **`● AVAILABLE`**, its action button is **disabled** (`disabled` attribute present) and displays the exact label **`Limit Reached (3/3)`**.
  - **Step 3:** The **My Requests & Active Loans** view displays **`3 / 3 Items Active`** with a 100% full Matcha Green quota progress bar.
  - **Step 4–5 (Backend API Rule Enforcement):** The `POST /api/v1/requests` call is rejected with **HTTP `400 Bad Request`** and JSON payload:
    - `"success": false`
    - `"error.code": "EXCEEDS_ACTIVE_QUOTA"`
    - `"error.message": "Cannot submit request: active loans and requests combined cannot exceed 3."`
  - **Protected State Unchanged:** No fourth request is created, and the `AVAILABLE` item remains `AVAILABLE`.

---

### Case `UAT-EF-03` — Business-Rule / Boundary Case (B): Rejection of Borrow Requests for Non-Available (`CHECKED_OUT`, `MAINTENANCE`, `RESERVED`) Equipment

* **Mandatory Category:** 2. Business-Rule or Boundary Case
* **Sprint 1 Requirement / AC Reference:** `BR-01` (`AC-REQ-02`, `UI-01-05`, `API-01-15`) & `BR-02` (`AC-REQ-04`)
* **Purpose:** Verify that an authenticated Borrower with available quota (`< 3`) cannot request equipment that is currently in `CHECKED_OUT`, `MAINTENANCE`, or `RESERVED` status—both via disabled UI controls and via direct backend API validation (`HTTP 400 ITEM_NOT_AVAILABLE` / `HTTP 409 CONCURRENT_REQUEST_CONFLICT`).
* **Actor Role(s):** `BORROWER` — `borrower2@cpe.kmutt.ac.th` (`Student Borrower Two`, ID `67070501002`)
* **Preconditions:**
  1. `borrower2@cpe.kmutt.ac.th` has available borrowing quota (`1 / 3` before `UAT-EF-01`, or `2 / 3` after `UAT-EF-01`).
  2. Catalog contains items in `CHECKED_OUT` (`CPE-RPI-002`, `CPE-OSC-001`), `MAINTENANCE` (`CPE-LOG-001`), and `RESERVED` (`CPE-OSC-002`) states.
* **Synthetic Inputs:**
  - **Borrower Login Email:** `borrower2@cpe.kmutt.ac.th`
  - **Password:** `<PROVIDED_PRIVATELY_TO_TH017>`
  - **Synthetic API Payload (via Browser DevTools Console):** Attempt to submit borrow requests for `CPE-LOG-001` (`MAINTENANCE`) and `CPE-RPI-002` (`CHECKED_OUT`):
    ```javascript
    await (async () => {
      const token = localStorage.getItem('equipflow_token');
      const itemsRes = await fetch('/api/v1/items', { headers: { Authorization: `Bearer ${token}` } });
      const items = (await itemsRes.json()).data;
      const maintItem = items.find(i => i.assetTag === 'CPE-LOG-001');
      const checkedOutItem = items.find(i => i.assetTag === 'CPE-RPI-002');
      const r1 = await fetch('/api/v1/requests', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId: maintItem.id, requestNote: 'UAT-TH017-MAINT-REJECT' })
      });
      const r2 = await fetch('/api/v1/requests', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId: checkedOutItem.id, requestNote: 'UAT-TH017-CHECKEDOUT-REJECT' })
      });
      const out = {
        maintenanceAttempt: { asset: 'CPE-LOG-001', httpStatus: r1.status, body: await r1.json() },
        checkedOutAttempt: { asset: 'CPE-RPI-002', httpStatus: r2.status, body: await r2.json() }
      };
      console.log('Rejection Results:', JSON.stringify(out, null, 2));
      return out;
    })();
    ```
* **Numbered User Actions:**
  1. Sign in at `https://equipflow-ddqo5fpv2a-as.a.run.app` as `borrower2@cpe.kmutt.ac.th`. Confirm that `borrower2` has free quota (`1 / 3` or `2 / 3`).
  2. On the **Department Equipment Catalog**, inspect the equipment cards for:
     - **`CPE-LOG-001`** (`Saleae Logic 8 USB Analyzer` — status **`▲ MAINTENANCE`**)
     - **`CPE-RPI-002`** (`Raspberry Pi 4 Model B 8GB` — status **`● CHECKED OUT`**)
     - **`CPE-OSC-002`** (`Keysight InfiniiVision DSOX1204A` — status **`◉ RESERVED`**)
  3. Open Browser DevTools Console (`F12` -> **Console**), run the Synthetic API Payload above to attempt requesting `CPE-LOG-001` (`MAINTENANCE`) and `CPE-RPI-002` (`CHECKED_OUT`) directly against `POST /api/v1/requests`.
  4. Navigate to **`My Requests`** and verify that neither rejected request was added and `borrower2`'s active quota count did not increase.
* **Expected Results:**
  - **Step 2 (UI Boundary Enforcement):**
    - `CPE-LOG-001` displays badge **`▲ MAINTENANCE`** and a **disabled** button labeled **`Maintenance`**.
    - `CPE-RPI-002` displays badge **`● CHECKED OUT`** and a **disabled** button labeled **`Checked Out`**.
    - `CPE-OSC-002` displays badge **`◉ RESERVED`** and a **disabled** button labeled **`Reserved`**.
  - **Step 3 (Backend API Rule Enforcement):** Both `POST /api/v1/requests` calls return **HTTP `400 Bad Request`** with:
    - `"success": false`
    - `"error.code": "ITEM_NOT_AVAILABLE"`
    - `"error.message": "Equipment item CPE-LOG-001 is already reserved or checked out."` (and `"Equipment item CPE-RPI-002 is already reserved or checked out."`)
  - **Step 4 (Protected State Unchanged):** `CPE-LOG-001` remains `MAINTENANCE`, `CPE-RPI-002` remains `CHECKED_OUT`, and `borrower2`'s active quota and pending requests list remain unchanged.

---

### Case `UAT-EF-04` — Forbidden Role / Access Control Case (A): Borrower Denied Access to Custodian Desk UI and Custodian Endpoints

* **Mandatory Category:** 3. Forbidden Role or Ownership Case
* **Sprint 1 Requirement / AC Reference:** `FR-04`, `BR-03` (`AC-AUTH-06`, `AC-AUTH-07`, `AC-CHK-07`, `API-01-08`, `API-01-09`, `API-01-26`, `E2E-01-03`)
* **Purpose:** Verify that an authenticated `BORROWER` cannot access the Custodian Triage & Checkout Desk via browser URL navigation (`/custodian/desk`) or invoke custodian-only API endpoints (`GET /api/v1/custodian/requests` and `POST /api/v1/custodian/checkouts`), and that unauthenticated calls to custodian endpoints are rejected with HTTP `401 Unauthorized`.
* **Actor Role(s):** `BORROWER` (`borrower2@cpe.kmutt.ac.th`) and Unauthenticated Client
* **Preconditions:**
  1. Signed in to `https://equipflow-ddqo5fpv2a-as.a.run.app` as `borrower2@cpe.kmutt.ac.th` (`role: "BORROWER"`).
  2. Pending request `cmwqdf5ji0001s60101l4203z` (`CPE-OSC-002`) exists in the system so we can verify that a `BORROWER` cannot unauthorizedly check it out.
* **Synthetic Inputs:**
  - **Direct Browser URL Navigation:** `https://equipflow-ddqo5fpv2a-as.a.run.app/custodian/desk`
  - **Synthetic API Payload (via Browser DevTools Console):**
    ```javascript
    await (async () => {
      const token = localStorage.getItem('equipflow_token');
      const unauthQueue = await fetch('/api/v1/custodian/requests');
      const borrowerQueue = await fetch('/api/v1/custodian/requests', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const borrowerCheckout = await fetch('/api/v1/custodian/checkouts', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestId: 'cmwqdf5ji0001s60101l4203z', checkoutNotes: 'UAT-TH017-UNAUTHORIZED-CHECKOUT' })
      });
      const out = {
        unauthenticatedGetQueue: { httpStatus: unauthQueue.status, body: await unauthQueue.json() },
        borrowerGetQueue: { httpStatus: borrowerQueue.status, body: await borrowerQueue.json() },
        borrowerPostCheckout: { httpStatus: borrowerCheckout.status, body: await borrowerCheckout.json() }
      };
      console.log('Role Boundary Results:', JSON.stringify(out, null, 2));
      return out;
    })();
    ```
* **Numbered User Actions:**
  1. While signed in as `borrower2@cpe.kmutt.ac.th` (`BORROWER`), type `https://equipflow-ddqo5fpv2a-as.a.run.app/custodian/desk` directly into the browser address bar and press `Enter`.
  2. Inspect the rendered page and navigation bar to confirm whether any Custodian Desk headings (`CUSTODIAN PORTAL`, `Custodian Triage & Checkout Desk`, or `Approve & Checkout` buttons) are rendered.
  3. Open Browser DevTools Console (`F12` -> **Console**), paste the Synthetic API Payload above, and press `Enter` to test:
     - Unauthenticated `GET /api/v1/custodian/requests`
     - `BORROWER`-authenticated `GET /api/v1/custodian/requests`
     - `BORROWER`-authenticated `POST /api/v1/custodian/checkouts` targeting request ID `cmwqdf5ji0001s60101l4203z` (`CPE-OSC-002`).
* **Expected Results:**
  - **Step 1–2 (UI Role Guard):** Navigating to `/custodian/desk` as a `BORROWER` keeps the user strictly inside the **Borrower Portal** (`Department Equipment Catalog` with `BORROWER` badge). The `Custodian Triage & Checkout Desk` component is **not** mounted and zero department-wide borrower records are disclosed.
  - **Step 3 (Backend Role & Auth Guard):**
    1. `unauthenticatedGetQueue` returns **HTTP `401 Unauthorized`** with `"code": "UNAUTHENTICATED"`.
    2. `borrowerGetQueue` returns **HTTP `403 Forbidden`** with `"code": "FORBIDDEN_ROLE"` and message `"Access denied: requires CUSTODIAN role."` (no queue data leaked).
    3. `borrowerPostCheckout` returns **HTTP `403 Forbidden`** with `"code": "FORBIDDEN_ROLE"` and message `"Access denied: requires CUSTODIAN role."`.
  - **Protected State Unchanged:** Request `cmwqdf5ji0001s60101l4203z` (`CPE-OSC-002`) remains `PENDING` / `RESERVED` and is not checked out.

---

### Case `UAT-EF-05` — Forbidden Role / Ownership Case (B): Cross-Borrower Data Isolation (`FR-11`) & Per-Session Logout Token Revocation (`FR-03`)

* **Mandatory Category:** 3. Forbidden Role or Ownership Case
* **Sprint 1 Requirement / AC Reference:** `FR-11` (`AC-REQ-06`, `API-01-19`) & `FR-03` (`AC-AUTH-04`, `API-01-05`, `API-01-06`)
* **Purpose:** Verify that (1) Borrower 2 (`borrower2@cpe.kmutt.ac.th`) is strictly isolated from viewing Borrower 1 (`borrower@cpe.kmutt.ac.th`)'s pending requests (`CPE-OSC-002`) and active loans (`CPE-OSC-001`) in both the `My Requests` UI and `GET /api/v1/requests/my`, and (2) signing out (`POST /api/v1/auth/logout`) revokes the JWT token (`jti`) on the server so that any subsequent API call replaying that captured token is rejected with HTTP `401 Unauthorized` (`TOKEN_REVOKED`).
* **Actor Role(s):** `BORROWER` — `borrower2@cpe.kmutt.ac.th` (`67070501002`) isolated against `borrower@cpe.kmutt.ac.th` (`67070501001`)
* **Preconditions:**
  1. `borrower@cpe.kmutt.ac.th` owns active loan `CPE-OSC-001` and pending request `CPE-OSC-002` (note `LAB5-C05-20261121T1912ICT`).
  2. `borrower2@cpe.kmutt.ac.th` owns active loan `CPE-RPI-002`.
* **Synthetic Inputs:**
  - **Borrower Login Email:** `borrower2@cpe.kmutt.ac.th`
  - **Password:** `<PROVIDED_PRIVATELY_TO_TH017>`
  - **Synthetic API Payload (via Browser DevTools Console — Before & After Sign Out):**
    ```javascript
    // Run while signed in as borrower2@cpe.kmutt.ac.th:
    await (async () => {
      const capturedToken = localStorage.getItem('equipflow_token');
      const myRes = await fetch('/api/v1/requests/my', {
        headers: { Authorization: `Bearer ${capturedToken}` }
      });
      const myData = (await myRes.json()).data;
      const loanTags = (myData.loans ?? []).map(l => l.item.assetTag);
      const reqTags = (myData.requests ?? []).map(r => r.item.assetTag);
      const leakedBorrower1Data = [...loanTags, ...reqTags].some(tag => tag === 'CPE-OSC-001' || tag === 'CPE-OSC-002');
      window.__uatCapturedToken = capturedToken;
      console.log('Borrower 2 Loan Tags:', loanTags, 'Request Tags:', reqTags, 'Leaked Borrower 1 Data?', leakedBorrower1Data);
      return { httpStatus: myRes.status, loanTags, reqTags, leakedBorrower1Data };
    })();
    ```
    And **after clicking `Sign Out` in the navbar**, run:
    ```javascript
    await (async () => {
      const replayRes = await fetch('/api/v1/requests/my', {
        headers: { Authorization: `Bearer ${window.__uatCapturedToken}` }
      });
      const body = await replayRes.json();
      console.log('Replayed Revoked Token HTTP Status:', replayRes.status, 'Body:', JSON.stringify(body, null, 2));
      return { httpStatus: replayRes.status, body };
    })();
    ```
* **Numbered User Actions:**
  1. Sign in at `https://equipflow-ddqo5fpv2a-as.a.run.app` as `borrower2@cpe.kmutt.ac.th` and click the **`My Requests`** navigation tab.
  2. Inspect the **`Active Loans`** and **`Pending Requests`** tables on screen. Confirm that `borrower2`'s seeded active loan (`CPE-RPI-002`) is shown, and check whether any of `Student Borrower One`'s records (`CPE-OSC-001` or `CPE-OSC-002` / `LAB5-C05-20261121T1912ICT`) appear.
  3. Open Browser DevTools Console (`F12` -> **Console**) and run the **first** JavaScript snippet above to verify `GET /api/v1/requests/my` ownership filtering and store the session token in `window.__uatCapturedToken`.
  4. Click **`Sign Out`** in the top-right navigation bar. Confirm the browser returns to the Sign-In screen and `localStorage.getItem('equipflow_token')` is cleared (`null`).
  5. Without refreshing the tab, run the **second** JavaScript snippet in the Console to replay the captured JWT Bearer token (`window.__uatCapturedToken`) against `GET /api/v1/requests/my`.
* **Expected Results:**
  - **Step 2–3 (Cross-Borrower Data Isolation `FR-11`):** `My Requests` and `GET /api/v1/requests/my` return **only** records belonging to `borrower2@cpe.kmutt.ac.th` (`leakedBorrower1Data: false`). Neither `CPE-OSC-001` nor `CPE-OSC-002` (`LAB5-C05-20261121T1912ICT`) is visible or returned in the JSON payload.
  - **Step 4–5 (Server-Side Token Revocation `FR-03`):** Clicking **`Sign Out`** invokes `POST /api/v1/auth/logout` (`HTTP 200`) and removes the client token. Replaying the captured token against `GET /api/v1/requests/my` is rejected by the backend with **HTTP `401 Unauthorized`** and JSON error code **`"TOKEN_REVOKED"`** (`"message": "This session has been logged out."`), confirming server-side `RevokedToken` persistence.

---

### Case `UAT-EF-06` — State / History / Persistence Case: Personal History Accuracy & State Persistence Across Browser Refresh and Re-Login

* **Mandatory Category:** 4. State, History, or Persistence Case
* **Sprint 1 Requirement / AC Reference:** `FR-10`, `NFR-05`, `BR-05` (`AC-REQ-05`, `UI-01-07`)
* **Purpose:** Verify that after the complete borrow-request-to-custodian-checkout lifecycle in `UAT-EF-01`, all resulting state changes (updated item status `CHECKED_OUT`, updated borrower active quota `2 / 3`, and the newly created `Active Loan` with its 7-day `dueDate`) are durably persisted in Cloud SQL PostgreSQL (`equipflow-pg`) across hard browser refreshes (`Ctrl+F5`), full logout, and subsequent re-authentication by both Borrower and Custodian roles.
* **Actor Role(s):** `BORROWER` (`borrower2@cpe.kmutt.ac.th`) and `CUSTODIAN` (`custodian@cpe.kmutt.ac.th`)
* **Preconditions:**
  1. Case **`UAT-EF-01`** has just been executed, checking out `CPE-FPG-001` *(or `CPE-RPI-001`)* to `borrower2@cpe.kmutt.ac.th` (`Student Borrower Two`).
* **Synthetic Inputs:**
  - **Borrower Login Email:** `borrower2@cpe.kmutt.ac.th`
  - **Custodian Login Email:** `custodian@cpe.kmutt.ac.th`
  - **Password:** `<PROVIDED_PRIVATELY_TO_TH017>`
  - **Expected Checked-Out Asset Tag from `UAT-EF-01`:** `CPE-FPG-001` *(or `CPE-RPI-001`)*
* **Numbered User Actions:**
  1. Open `https://equipflow-ddqo5fpv2a-as.a.run.app` and sign in as `borrower2@cpe.kmutt.ac.th`.
  2. On the **Department Equipment Catalog**, inspect the header quota badge (`📋 My Active Items`) and locate the card for the item checked out in `UAT-EF-01` (`CPE-FPG-001` or `CPE-RPI-001`).
  3. Click the **`My Requests`** tab in the top navigation bar. Inspect the **`Personal Borrowing Quota`** banner, the **`Active Loans`** table, and the **`Pending Requests`** table.
  4. Perform a hard browser refresh (`Ctrl+F5` on Windows / `Cmd+Shift+R` on macOS) while on the logged-in portal, then navigate back to **`My Requests`**.
  5. Click **`Sign Out`**, close or clear the current view, and sign back in fresh as `borrower2@cpe.kmutt.ac.th`. Navigate to **`My Requests`** again and verify every column of the `Active Loans` table (`Asset Tag`, `Equipment Name`, `Checked Out At`, `Due Date`, `Status`).
* **Expected Results:**
  - **Step 2 (Catalog State Consistency):** The header badge displays **`📋 My Active Items: 2 / 3`**. The checked-out item (`CPE-FPG-001` or `CPE-RPI-001`) displays status badge **`● CHECKED OUT`** and disabled button **`Checked Out`**.
  - **Step 3–5 (Personal History & PostgreSQL Persistence Across Reload & Re-Login):**
    - After both hard refresh (`Step 4`) and full sign-out / re-login (`Step 5`), the **`Personal Borrowing Quota`** banner consistently displays **`2 / 3 Items Active`**.
    - The **`Active Loans (2)`** table lists both:
      1. The newly checked-out asset (`CPE-FPG-001` or `CPE-RPI-001`) with today's **`Checked Out At`** date, a **`Due Date`** exactly 7 days later (`BR-05`), and badge **`● Active Loan`**.
      2. The pre-seeded active loan **`CPE-RPI-002`** (`Checked Out At: 12 Nov 2026`, `Due Date: 19 Nov 2026`, badge **`● Active Loan`**).
    - Zero data loss, state reversion, or duplicate loan rows occur across refresh or re-authentication.

---

## 5. Independent UAT Execution Record Template (For Team `TH-017` — `2 auan`)

> [!NOTE]
> **Instructions for Independent UAT Team `TH-017` (`67070501001` & `67070501030`):**
> Per Lab 6 Handout §3.2:
> 1. **Both team members (`67070501001` and `67070501030`) must participate** in executing these 6 UAT cases on `https://equipflow-ddqo5fpv2a-as.a.run.app` (`equipflow-00009-kns`) and record which member executed each case.
> 2. Record the **actual observed behavior** in the `Actual Result Observed` column — **never copy-paste the expected result**.
> 3. Mark each case `PASS`, `FAIL`, or `BLOCKED` and assign an `Evidence ID` (`EV-TH017-01`..`06`) linking to your captured screenshot(s) showing the live `https://equipflow-ddqo5fpv2a-as.a.run.app` address bar.
> 4. If any case fails (`FAIL`), file a reproducible defect report with Team `TH-045_P2` containing the tested commit/revision (`8217bef` / `equipflow-00009-kns`), linked Case ID, preconditions, exact reproduction steps, expected vs. actual result, user-impact severity (`Critical` / `Major` / `Minor`), and screenshot evidence.

| Case ID | Category | Tester Name & Student ID (`TH-017`) | Execution Date & Time (ICT) | Tested Version / Revision | Synthetic Inputs Used | Actual Result Observed *(Write actual UI/API observation — do not copy expected)* | Status (`PASS` / `FAIL` / `BLOCKED`) | Evidence ID / Screenshot Ref |
| :---: | :--- | :--- | :--- | :--- | :--- | :--- | :---: | :---: |
| **`UAT-EF-02`** *(Run 1st)* | 2A. Business-Rule / Boundary (`BR-04` Quota `3/3`) | `[e.g., 67070501001]` | `2026-11-__ __:__ ICT` | `8217bef` / `equipflow-00009-kns` | `borrower@cpe.kmutt.ac.th` (`3/3` quota), DevTools `POST /api/v1/requests` | `[Fill actual observed UI button label & HTTP response]` | `[PASS / FAIL / BLOCKED]` | `EV-TH017-02` |
| **`UAT-EF-03`** *(Run 2nd)* | 2B. Business-Rule / Boundary (`BR-01` Unavailable Item) | `[e.g., 67070501001]` | `2026-11-__ __:__ ICT` | `8217bef` / `equipflow-00009-kns` | `borrower2@cpe.kmutt.ac.th`, target `CPE-LOG-001` & `CPE-RPI-002` | `[Fill actual observed disabled buttons & HTTP 400 response]` | `[PASS / FAIL / BLOCKED]` | `EV-TH017-03` |
| **`UAT-EF-04`** *(Run 3rd)* | 3A. Forbidden Role Guard (`FR-04` / `BR-03`) | `[e.g., 67070501030]` | `2026-11-__ __:__ ICT` | `8217bef` / `equipflow-00009-kns` | `borrower2@cpe.kmutt.ac.th` -> `/custodian/desk` & `/api/v1/custodian/*` | `[Fill actual observed UI view & HTTP 401/403 responses]` | `[PASS / FAIL / BLOCKED]` | `EV-TH017-04` |
| **`UAT-EF-05`** *(Run 4th)* | 3B. Cross-Borrower Isolation & Logout Revocation (`FR-11` / `FR-03`) | `[e.g., 67070501030]` | `2026-11-__ __:__ ICT` | `8217bef` / `equipflow-00009-kns` | `borrower2@cpe.kmutt.ac.th` -> `/api/v1/requests/my`, Sign Out, replay token | `[Fill actual observed records & HTTP 401 TOKEN_REVOKED response]` | `[PASS / FAIL / BLOCKED]` | `EV-TH017-05` |
| **`UAT-EF-01`** *(Run 5th)* | 1. Normal Domain Journey (`FR-09` -> `FR-14`) | `[Borrower: 67070501001 / Custodian: 67070501030]` | `2026-11-__ __:__ ICT` | `8217bef` / `equipflow-00009-kns` | `borrower2` requests `CPE-FPG-001` (`UAT-TH017-REQ-01`) -> `custodian` checks out (`UAT-TH017-CHK-01`) | `[Fill actual observed status transitions, quota, & 7-day dueDate]` | `[PASS / FAIL / BLOCKED]` | `EV-TH017-01` |
| **`UAT-EF-06`** *(Run 6th)* | 4. State, History & Persistence (`FR-10` / `NFR-05`) | `[67070501001 & 67070501030]` | `2026-11-__ __:__ ICT` | `8217bef` / `equipflow-00009-kns` | `borrower2@cpe.kmutt.ac.th` -> `My Requests` -> `Ctrl+F5` -> Sign Out & Re-Login | `[Fill actual observed Active Loans table & persisted quota]` | `[PASS / FAIL / BLOCKED]` | `EV-TH017-06` |
