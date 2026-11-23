# EquipFlow — Sprint 1 User Acceptance Testing (UAT) Plan & Safe Handoff Package

**Course:** CPE 334 Software Engineering (Semester 1 / Year 3)  
**Assignment:** Lab 6 — Independent User Acceptance Testing and Defect Management (Part A)  
**Document ID:** `UAT-PLAN-SPRINT-01`  
**Version:** `1.1.0`  
**Tracking Issue:** [Issue #42 (`[Lab 6] L6-1: Sprint 1 UAT plan and safe handoff (Part A)`)](https://github.com/NxNxmm/CPE334-Sec01-Team45/issues/42)  
**LEB2 Submission Deadline:** **Sunday, 29 November 2026 at 23:59 ICT** per [LEB2 Lab 6 Activity (`23634766`)](https://app.leb2.org/class/1582970/activity/23634766) *(extended from the `22 November 2026 at 23:59 (GMT+7)` date printed on the Lab 6 handout PDF)*  

---

## 1. Team Pairing & Lab 6 Responsibility Matrix

### 1.1 Product Team vs. Independent UAT Team

| Role in This UAT Cycle | Team Code / Name | Section | Team Members (Full Name · Real Student ID · GitHub) | System Under Test |
| :--- | :--- | :---: | :--- | :--- |
| **Product Team** *(System Owner)* | **`TH-045_P2`** (**EquipFlow**) | Sec 1 | • **Norawit Mahaprom** (`67070501026` · `@NxNxmm`)<br>• **Pawarisa Thongchua** (`67070501032` · `@itspxsh`) | **EquipFlow** — Theme 2: CPE Hardware Inventory & Borrowing System |
| **Independent UAT Team** *(Assessors)* | **`TH-017`** (**2 auan**) | Sec 1 | • **Kamonnat Seetakai** (`67070501001`)<br>• **Benyapha Rattanakhunodom** (`67070501030`) | Executes independent manual UAT against EquipFlow Sprint 1 deployed release (`equipflow-00009-kns`) |

> [!IMPORTANT]
> **Disambiguating Real UAT Tester Student IDs vs. Synthetic Seeded Account IDs (`prisma/seed.ts`):**
> - **Real UAT Tester IDs (`TH-017` — `2 auan`):** **`Kamonnat Seetakai` (`67070501001`)** and **`Benyapha Rattanakhunodom` (`67070501030`)** are the human assessors from Partner Team `TH-017`.
> - **Synthetic Application Account IDs (`prisma/seed.ts`):** EquipFlow's deterministic database seed (`prisma/seed.ts`, lines 62–76) assigns synthetic `studentOrStaffId` values **`"67070501001"`** to `BORROWER_FULL` (`Student Borrower One`, `borrower@cpe.kmutt.ac.th`), **`"67070501002"`** to `BORROWER_FREE` (`Student Borrower Two`, `borrower2@cpe.kmutt.ac.th`), and **`"STAFF-001"`** to `CUSTODIAN_STAFF` (`CPE Lab Custodian`, `custodian@cpe.kmutt.ac.th`).
> - Throughout this UAT plan and execution log, human testers are always cited by their **full name + team (`Kamonnat Seetakai [TH-017 · 67070501001]` / `Benyapha Rattanakhunodom [TH-017 · 67070501030]`)**, while synthetic application accounts are cited by their role label (**`BORROWER_FULL`**, **`BORROWER_FREE`**, **`CUSTODIAN_STAFF`**).

### 1.2 Team `TH-045_P2` Lab 6 Task Index & Pair-Work Protocol (`Odd L6 Task = NxNxmm`, `Even L6 Task = itspxsh`)

To enforce peer review on every Pull Request while meeting the Lab 6 mandatory pair participation rules (Handout §§1, 3.2, 4.2, 5), Team `TH-045_P2` assigns **odd-numbered `L6-k` tasks (`L6-1`, `L6-3`, `L6-5`)** to `@NxNxmm` and **even-numbered `L6-k` tasks (`L6-2`, `L6-4`, `L6-6`)** to `@itspxsh`:

| L6 Task & GitHub Issue | Lab 6 Deliverable Scope & Target Repository Path | PR Author | PR Reviewer | Collaboration Mode & Mandatory Pair-Work Remark |
| :---: | :--- | :---: | :---: | :--- |
| **`L6-1` · [#42](https://github.com/NxNxmm/CPE334-Sec01-Team45/issues/42)** *(Odd L6)* | **Part A (20 pts):** Sprint 1 UAT plan & safe handoff (`docs/labs/lab-06/uat-plan.md` + `docs/evidence/lab-06/l6-1/01-preflight-equipflow-00009-kns.json`) | `@NxNxmm` | `@itspxsh` | **Individual Draft + Pair Walkthrough:** `@NxNxmm` authors the UAT plan and runs the sanitized preflight; `@itspxsh` reviews all 6 cases against Sprint 1 contracts and live DB preconditions so both members support Team `TH-017` identically. |
| **`L6-2` · [#43](https://github.com/NxNxmm/CPE334-Sec01-Team45/issues/43)** *(Even L6)* | **Part B (25 pts):** Independent UAT execution on Partner (`TH-017`) system (`docs/labs/lab-06/partner-uat-execution.md`) | `@itspxsh` | `@NxNxmm` | **MANDATORY PAIR WORK (§3.2):** Both `Norawit Mahaprom` (`67070501026`) and `Pawarisa Thongchua` (`67070501032`) must co-execute UAT cases together on Team `TH-017`'s live URL and record who performed each step. `@itspxsh` compiles the PR; `@NxNxmm` reviews. |
| **`L6-3` · [#44](https://github.com/NxNxmm/CPE334-Sec01-Team45/issues/44)** *(Odd L6)* | **Part C (20 pts):** Outgoing defect reports for `TH-017` & incoming defect triage on EquipFlow (`docs/labs/lab-06/defect-triage.md`) | `@NxNxmm` | `@itspxsh` | **MANDATORY PAIR TRIAGE (§3.3):** Both members sit together to reproduce every incoming finding reported by Team `TH-017` on EquipFlow and jointly agree on classification (`accepted defect` / `duplicate` / `not-defect` / `enhancement`) before `@NxNxmm` opens the PR and `@itspxsh` reviews. |
| **`L6-4` · [#45](https://github.com/NxNxmm/CPE334-Sec01-Team45/issues/45)** *(Even L6)* | **Part D (35 pts):** RED-to-GREEN defect resolution or controlled defect exercise (`docs/labs/lab-06/defect-resolution.md`) | `@itspxsh` | `@NxNxmm` | **Pair Root-Cause Analysis + Reviewed Code/Test PR (§§3.4–3.5):** Both members align on root cause and test design; `@itspxsh` implements the failing test (`RED`) and code fix (`GREEN`); `@NxNxmm` verifies test output and code diff in PR review. |
| **`L6-5` · [#46](https://github.com/NxNxmm/CPE334-Sec01-Team45/issues/46)** *(Odd L6)* | **Part D (35 pts):** Release deployment to `main` (if live fix) & independent retest verification (`docs/labs/lab-06/acceptance-record.md`) | `@NxNxmm` | `@itspxsh` | **MANDATORY PAIR RETEST & COORDINATION (§3.4):** `@NxNxmm` coordinates with Team `TH-017` before any redeploy and requests their independent retest on EquipFlow; both `@NxNxmm` and `@itspxsh` jointly retest fixed defects on Team `TH-017`'s updated deployment and record final UAT acceptance. |
| **`L6-6` · [#47](https://github.com/NxNxmm/CPE334-Sec01-Team45/issues/47)** *(Even L6)* | **Submission:** Self-contained Lab 6 final PDF report (`docs/submissions/lab6_sec1_TH-045_P2.pdf`) | `@itspxsh` | `@NxNxmm` | **Pair Final Verification (§4, §5):** `@itspxsh` compiles the self-contained PDF report; `@NxNxmm` audits every figure, table, secret-hygiene check, and pair contribution declaration before LEB2 upload. |

---

## 2. Assessed Sprint 1 Baseline, Provenance & Scope Boundary (Handout §§2, 3.1)

### 2.1 Version & Deployment Provenance Table

In accordance with Lab 6 Handout §2, User Acceptance Testing evaluates **strictly the delivered Sprint 1 scope** deployed on Google Cloud Run. The exact commit provenance from the Sprint 1 tag through the assessed Lab 5 Cloud Run release is pinned below:

| Provenance Stage / Environment Attribute | Authoritative Identifier / Value | Role & Explanation |
| :--- | :--- | :--- |
| **Sprint 1 Release Tag ([`v0.1.0-sprint1`](https://github.com/NxNxmm/CPE334-Sec01-Team45/tree/v0.1.0-sprint1))** | Commit `e661a2090bf82c1bcef465d81a8513f0eb8be2cc` *(annotated tag object `a63081065c9ddb0a25054022e29a1464c6220959`)* | `main` release merge commit (`Merge pull request #17 from NxNxmm/sprint-1-staging`) freezing the Sprint 1 functional baseline. |
| **Sprint 1 Staging Integration Head** | Commit `e7ee3849d617f2cb642e8e51e8fc807c91063f48` | Staging integration commit (`Merge pull request #16 from NxNxmm/test/sprint1-verification`) merged into `main` for `v0.1.0-sprint1`. |
| **Sprint 1 Test-Fixture Isolation Commit** | Commit `63e04268449d9ca07b1b8c5a60a044c47854363d` | Verification commit cited in `docs/sprints/sprint-1/tests.md` (§4) isolating automated E2E/server test suites on disposable `test.db`. |
| **Assessed Live `main` Release Commit SHA** | Commit `8217beff7d33b2fc7657c36824d4a22a0df6bb94` | Lab 5 Release 2 merge commit on `main` (PR `#38`, PostgreSQL 16 cloud runtime + KMUTT Lending Policy banner matching SRS `BR-04`/`BR-05`). |
| **Live Deployed Application URL** | `https://equipflow-ddqo5fpv2a-as.a.run.app` | Public HTTPS service endpoint on Google Cloud Run (`cpe334-team45`, `asia-southeast1`). |
| **Liveness & Database Readiness Probes** | • `GET /api/health` $\rightarrow$ `200 OK` (`{"status":"ok","service":"equipflow-api"}`)<br>• `GET /api/ready` $\rightarrow$ `200 OK` (`{"status":"ready","service":"equipflow-api","db":"connected"}`) | Verified healthy and connected to Cloud SQL PostgreSQL 16 during preflight (`2026-11-23T21:09:35+07:00`). |
| **Pinned Active Cloud Run Revision (100% Traffic)** | **`equipflow-00009-kns`** | Confirmed serving 100% traffic before UAT execution ([Deploy run `45022823168`](https://github.com/NxNxmm/CPE334-Sec01-Team45/actions/runs/45022823168/job/137209259668)). **Deployment Freeze Rule:** Revision `equipflow-00009-kns` remains frozen throughout Part B execution; any Part D defect-fix deployment to `main` will be coordinated with Team `TH-017` beforehand. |
| **Container Runtime Digest** | • Platform Manifest Digest: `sha256:604e51553a794404a063f40bdbaa8d037ee94dd72c92a87a9a2b47ae65f3f7a0`<br>• OCI Index Digest: `sha256:ac724f44dd1b11f0f67dbbe81a697685b64a60c8966d59981a42e29555ac6cfa` | Immutable container image digest running on `equipflow-00009-kns`. |
| **Backing Cloud Database** | Cloud SQL for PostgreSQL 16 (`equipflow-pg`, `asia-southeast1`, database `equipflow`) | Persistent relational store holding all seeded accounts, equipment items, requests, loans, and revoked token `jti` entries. |

### 2.2 Accepted-for-Test Sprint 1 Scope vs. Explicitly Excluded Scope

To prevent false defects caused by testing features scheduled for later sprints (Handout §2), the boundary between **Included Sprint 1 Scope** and **Excluded Future Scope** is defined below from [`docs/srs.md`](../../srs.md) and [`docs/sprints/sprint-1/specification.md`](../../sprints/sprint-1/specification.md) (§3.1 & §3.2):

| In-Scope for Sprint 1 UAT (Assessable Contract) | Out-of-Scope for Sprint 1 UAT (Excluded — Not a Defect) |
| :--- | :--- |
| **1. Authentication & Session Revocation (`F-01`):**<br>• Email + password sign-in (`POST /api/v1/auth/login`, `FR-01` / `AC-AUTH-01`, `AC-AUTH-02`) issuing JWT Bearer token.<br>• Current user profile check (`GET /api/v1/auth/me`, `FR-02` / `AC-AUTH-03`).<br>• Per-session logout (`POST /api/v1/auth/logout`, `FR-03` / `AC-AUTH-04`, `AC-AUTH-05`) persisting token `jti` to `RevokedToken` so replayed tokens return HTTP `401 TOKEN_REVOKED` while separate concurrent sessions remain valid.<br>• Role-based route & endpoint guard (`BORROWER` vs `CUSTODIAN`, `FR-04` / `BR-03`, HTTP `401` / `403`). | • Public user self-registration or automated forgot-password email loops (seeded accounts are used in Sprint 1).<br>• OAuth / Google SSO login. |
| **2. Serialized Equipment Catalog (`F-02` Read Slice):**<br>• Catalog grid listing (`GET /api/v1/items`, `FR-05` / `AC-CAT-01`) with real-time status badges (`AVAILABLE`, `RESERVED`, `CHECKED OUT`, `MAINTENANCE`).<br>• Item specification detail modal (`GET /api/v1/items/:id`, `FR-06` / `AC-CAT-02`) showing category, model number, manufacturer serial number, physical condition, and availability. | • Multi-criteria catalog search bar, category dropdown filtering, or pagination (`F-07`, allocated to Sprint 2).<br>• Custodian UI/API for creating, editing, or changing catalog asset maintenance status (`FR-07`, `FR-08`, allocated to Sprint 2; no `DELETE` endpoints exist by design). |
| **3. Borrower Request Submission & Personal History (`F-03`):**<br>• Submitting a borrow request (`POST /api/v1/requests`, `FR-09` / `AC-REQ-01`) for an `AVAILABLE` item with optional purpose notes ($\le 250$ chars), transitioning the item to `RESERVED` and creating a `PENDING` request.<br>• Combined Active Quota rule (`BR-04` / `AC-REQ-03`): $\text{Pending Requests} + \text{Active Loans} \le 3$.<br>• Non-available item rejection (`BR-01` / `AC-REQ-02`, HTTP `400 ITEM_NOT_AVAILABLE`).<br>• Personal history view (`My Requests` / `GET /api/v1/requests/my`, `FR-10` / `AC-REQ-05`) and strict cross-borrower data isolation (`FR-11` / `AC-REQ-06`). | • Borrower self-cancellation of a pending borrow request (`FR-12`, allocated to Sprint 2).<br>• Direct walk-in checkout without a prior borrower request (`FR-15`, allocated to Sprint 2).<br>• 48-hour automatic request expiration (`BR-06`, allocated to Sprint 2). |
| **4. Custodian Triage Queue & Physical Checkout (`F-04`):**<br>• Viewing all pending requests and active department loans (`GET /api/v1/custodian/requests`, `FR-13` / `AC-CHK-01`).<br>• Recording physical checkout (`POST /api/v1/custodian/checkouts`, `FR-14` / `AC-CHK-02`–`04`) with optional staff notes ($\le 500$ chars), atomically transitioning the item from `RESERVED` to `CHECKED_OUT`, marking the request `APPROVED`, creating an `ACTIVE` loan, auto-calculating `dueDate = checkedOutAt + 7 days` (`BR-05`), and attributing `custodianId` (`BR-08`). | • Custodian rejection/denial of a pending borrow request (`FR-16`, allocated to Sprint 2).<br>• Equipment return check-in and post-loan condition inspection (`FR-17` / `F-05`, allocated to Sprint 2).<br>• Automated overdue loan detection engine, warning badges, or late fines (`FR-18` / `F-06`, allocated to Sprint 2).<br>• Audit log viewer/export (`F-08`, allocated to Sprint 3). |

### 2.3 Sprint 1 Requirement & Acceptance Criteria Contract Excerpts and Known Released Implementation Nuances

The table below provides the authoritative contract excerpts from [`docs/srs.md`](../../srs.md), [`docs/sprints/sprint-1/specification.md`](../../sprints/sprint-1/specification.md), [`docs/sprints/sprint-1/api-spec.md`](../../sprints/sprint-1/api-spec.md), [`docs/sprints/sprint-1/ui-spec.md`](../../sprints/sprint-1/ui-spec.md), and [`docs/sprints/sprint-1/tests.md`](../../sprints/sprint-1/tests.md) (STS), together with documented nuances in the released code at `8217beff7d33b2fc7657c36824d4a22a0df6bb94`:

| Req / Rule ID | STS AC & Test IDs | Authoritative Sprint 1 Contract Excerpt & Released Code Behavior at `8217beff` |
| :--- | :--- | :--- |
| **`FR-01` / `FR-02`** | `AC-AUTH-01`, `AC-AUTH-02`, `AC-AUTH-03` (`API-01-01`–`04`, `UI-01-01`–`02`) | Valid email/password login via `POST /api/v1/auth/login` returns HTTP `200` with a signed JWT Bearer token and sanitized user profile (`BORROWER` or `CUSTODIAN`, no `passwordHash`). Invalid credentials return HTTP `401` with `"code": "INVALID_CREDENTIALS"` and render a dismissible red alert banner (`"Invalid email or password."`) while preserving the entered email. `GET /api/v1/auth/me` returns HTTP `200` with `{ data: { user: { id, email, fullName, studentOrStaffId, role } } }`. |
| **`FR-03`** | `AC-AUTH-04`, `AC-AUTH-05` (`API-01-05`–`07`) | Invoking `POST /api/v1/auth/logout` returns HTTP `200` (`"message": "Logged out successfully"`) and persists the token's `jti` into `RevokedToken`. Replaying that revoked token returns **HTTP `401`** with **`"code": "TOKEN_REVOKED"`** *(Note: `api-spec.md` §2.2 illustrates message `"This session has been logged out."`, whereas released `server/src/middlewares/auth.middleware.ts` line 56 returns `"message": "Token has been revoked"`; UAT asserts status `401` + `error.code === "TOKEN_REVOKED"`).* A separate concurrent session for the same user (different `jti`) remains valid (`HTTP 200`, `AC-AUTH-05`). |
| **`FR-04` / `BR-03`** | `AC-AUTH-06`, `AC-AUTH-07`, `AC-CHK-07` (`API-01-08`–`09`, `API-01-26`, `E2E-01-03`) | Unauthenticated requests to protected endpoints return **HTTP `401`** with **`"code": "UNAUTHENTICATED"`**. Authenticated `BORROWER` calls to `/api/v1/custodian/*` return **HTTP `403`** with **`"code": "FORBIDDEN_ROLE"`** *(Note: `api-spec.md` §5.1 illustrates `"Access denied: requires CUSTODIAN role."`, whereas released `auth.middleware.ts` line 95 returns `"Access denied for role BORROWER"`; UAT asserts status `403` + `error.code === "FORBIDDEN_ROLE"`).*<br>**Known UI Contract Discrepancy (`UI-SPEC` §3.1 / `STS` `E2E-01-03` vs. Released `App.tsx`):** `ui-spec.md` §3.1 and `tests.md` `E2E-01-03` state that direct navigation to `/custodian/desk` as a Borrower redirects with an unauthorized/forbidden toast notice. Released `client/src/App.tsx` (lines 124–130) gates rendering strictly by `user.role === 'CUSTODIAN'` and keeps the user on the Borrower Catalog view without rendering a toast notice. `UAT-EF-04` records the **access denial** (Custodian Desk unmounted, zero data leaked) and the **notice presence/absence** as distinct observations. |
| **`FR-05` / `FR-06`** | `AC-CAT-01`, `AC-CAT-02` (`API-01-11`–`13`, `UI-01-03`–`04`) | `GET /api/v1/items` lists all 6 serialized equipment assets with asset tag, name, category, model, condition, and real-time status badge (`AVAILABLE`, `RESERVED`, `CHECKED OUT`, `MAINTENANCE`). Clicking `View Details` (`GET /api/v1/items/:id`) opens a modal displaying technical description, manufacturer serial number, condition, and availability. |
| **`FR-09` / `BR-01` / `BR-02`** | `AC-REQ-01`, `AC-REQ-02`, `AC-REQ-04` (`API-01-14`–`15`, `API-01-17`, `UI-01-05`) | An authenticated `BORROWER` with active quota $< 3$ can submit a request (`POST /api/v1/requests`) only for an item whose status is strictly `AVAILABLE` (`HTTP 201 Created`, request `PENDING`, item `RESERVED`). In the UI, non-available items render disabled action buttons (`Reserved`, `Checked Out`, `Maintenance`).<br>**Sequential Unavailable Rejection (`AC-REQ-02` / `API-01-15`) vs. Concurrency Race (`AC-REQ-04` / `API-01-17`):** In released `server/src/services/request.service.ts` (lines 86–103), when an item is not `AVAILABLE`, the service checks whether a `PENDING` request exists for that item: items in `MAINTENANCE` (`CPE-LOG-001`) or `CHECKED_OUT` (`CPE-RPI-002`, whose request is `APPROVED`) return **HTTP `400 Bad Request` (`"code": "ITEM_NOT_AVAILABLE"`)**, whereas an item with an existing `PENDING` request (`RESERVED`) returns **HTTP `409 Conflict` (`"code": "CONCURRENT_REQUEST_CONFLICT"`)**. True reserve/checkout concurrency races (`BR-02` / `AC-REQ-04`, `AC-CHK-05`–`06`) are covered against disposable fixtures in automated integration tests (`API-01-17`, `API-01-24`, `API-01-25`). |
| **`BR-04`** | `AC-REQ-03` (`API-01-16`, `API-01-27`, `UI-01-06`) | $\text{Active Quota} = \text{Count}(\text{Pending Requests}) + \text{Count}(\text{Active Loans}) \le 3$. When a borrower's active quota reaches `3 / 3`, the catalog button on `AVAILABLE` items disables with label **`Limit Reached (3/3)`** and `POST /api/v1/requests` rejects any request with **HTTP `400 Bad Request`** (`"code": "EXCEEDS_ACTIVE_QUOTA"`, `"message": "Cannot submit request: active loans and requests combined cannot exceed 3."`). |
| **`FR-10` / `FR-11`** | `AC-REQ-05`, `AC-REQ-06` (`API-01-18`–`19`, `UI-01-07`) | `My Requests` (`GET /api/v1/requests/my`) returns the authenticated borrower's `activeQuota` (`current` / `maximum`), `quota` (`activeQuota`, `maxQuota`, `pendingRequestsCount`, `activeLoansCount`), `activeLoans` (`status: "ACTIVE"`), and `requests`. Cross-borrower isolation is strictly enforced (`FR-11`).<br>**Known UI Rendering Nuance in `MyRequests.tsx`:** `RequestService.getBorrowerRequestsAndLoans` (line 138) returns all `BorrowRequest` records for the borrower (both `PENDING` and `APPROVED`), while `quota.pendingRequestsCount` counts only `status: 'PENDING'`. In `client/src/components/MyRequests.tsx` (lines 233, 258–260), all returned `requests` rows are rendered under `Pending Requests ({requests.length})` with a static `⏳ Pending Approval` badge even after `req.status` transitions to `"APPROVED"`. Therefore, `UAT-EF-01` and `UAT-EF-06` explicitly inspect `req.status === "APPROVED"` and `quota.pendingRequestsCount` in the sanitized `/api/v1/requests/my` payload alongside the UI view. *(Note: SRS `NFR-05` covers server restart and migration reproducibility, which is verified separately in [`docs/labs/lab-05/persistence.md`](../lab-05/persistence.md).)* |
| **`FR-13` / `FR-14` / `BR-05` / `BR-08`** | `AC-CHK-01`–`AC-CHK-04` (`API-01-20`–`23`, `UI-01-08`, `E2E-01-01`) | `Custodian Triage & Checkout Desk` (`GET /api/v1/custodian/requests`) lists all `PENDING` requests and `ACTIVE` department loans. Confirming checkout (`POST /api/v1/custodian/checkouts`) returns **HTTP `201 Created`**, atomically updates the item from `RESERVED` to `CHECKED_OUT` and the request from `PENDING` to `APPROVED`, creates a single `ACTIVE` loan with `dueDate - checkedOutAt === 7 days` (`604,800,000` ms, `BR-05`), and attributes `custodianId` to the authenticated custodian (`STAFF-001`, `BR-08`). |

---

## 3. Timestamped Sanitized Preflight & Safe Handoff Package for Team `TH-017` (`2 auan`)

### 3.1 Environment Access & Private Credential Delivery Policy (Handout §3.1)

- **Live Deployed URL:** `https://equipflow-ddqo5fpv2a-as.a.run.app`
- **Pinned Assessed Revision:** `equipflow-00009-kns` (`100%` traffic, commit `8217beff7d33b2fc7657c36824d4a22a0df6bb94`)
- **Credential Hygiene Rule (§3.1, §4.2):** Passwords, JWT Bearer strings, and `Authorization` headers are **never** written in this document, Git repository, GitHub Issues/PRs, or the final PDF report. The account owner (`Norawit Mahaprom`, `@NxNxmm`) provides the credentials for **`BORROWER_FULL`**, **`BORROWER_FREE`**, and **`CUSTODIAN_STAFF`** directly to Team `TH-017` (`Kamonnat Seetakai` and `Benyapha Rattanakhunodom`) in private team chat only after PR `#42` review approval.

### 3.2 Timestamped Sanitized Live Preflight Verification (`2026-11-23T21:09:35+07:00`)

Before finalizing this handoff package, a read-only preflight verification was executed against `https://equipflow-ddqo5fpv2a-as.a.run.app` (`equipflow-00009-kns`, commit `8217beff7d33b2fc7657c36824d4a22a0df6bb94`) at **`2026-11-23T21:09:35+07:00` (`2026-11-23T14:09:35.913Z`)**. All three temporary preflight sessions were immediately logged out via `POST /api/v1/auth/logout` (`sessionCleanedUp: true`). The complete sanitized artifact is committed at [`docs/evidence/lab-06/l6-1/01-preflight-equipflow-00009-kns.json`](../../evidence/lab-06/l6-1/01-preflight-equipflow-00009-kns.json).

#### 3.2.1 Verified Account Sessions & Live Quota Preconditions

| Documented Handoff Label | Role | Login Email *(Password Sent Privately)* | Synthetic Seeded `studentOrStaffId` | Verified Preflight Quota & Records (`2026-11-23T21:09:35+07:00`) | Designated UAT Case Usage |
| :--- | :---: | :--- | :---: | :--- | :--- |
| **`BORROWER_FULL`** *(Student Borrower One)* | `BORROWER` | `borrower@cpe.kmutt.ac.th` | `"67070501001"` *(Synthetic seed ID — do not confuse with TH-017 tester Kamonnat)* | **`3 / 3 Items Active` (`activeQuota: 3`, `maxQuota: 3`)**<br>• `activeLoansCount: 1`:<br>  1. Loan `cmwns3i0h0003s601a249sjb7` on **`CPE-OSC-001`** (`ACTIVE`, `checkedOutAt: 2026-11-19T16:42:39.472Z`, `dueDate: 2026-11-26T16:42:39.472Z`)<br>• `pendingRequestsCount: 2`:<br>  1. Request `cmwqdf5ji0001s60101l4203z` on **`CPE-OSC-002`** (`PENDING`, `createdAt: 2026-11-21T12:15:07.470Z`, note `"LAB5-C05-20261121T1912ICT"` — **Protected Lab 5 C-05 record**)<br>  2. Request `cmwnl9ftz0001s601wk54wtfz` on **`CPE-FPG-001`** (`PENDING`, `createdAt: 2026-11-19T13:31:19.271Z`, note `"testing kub"` — **2nd pending reservation supporting `3/3` quota**)<br>• Historical `APPROVED` request row: `cmwns2yog0001s6014rng8e68` on `CPE-OSC-001` (`createdAt: 2026-11-19T16:42:14.416Z`, note `"Lab 5 C-04 deployment verification"`) | • **`UAT-EF-02` (Run 1st):** Quota Limit `3 / 3` UI & API rejection check against designated `AVAILABLE` asset **`CPE-RPI-001`**.<br>• **`UAT-EF-05` (Run 4th):** Comparison fixture inventory (`CPE-OSC-001`, `CPE-OSC-002`, `CPE-FPG-001`) that must remain hidden from `BORROWER_FREE`. |
| **`BORROWER_FREE`** *(Student Borrower Two)* | `BORROWER` | `borrower2@cpe.kmutt.ac.th` | `"67070501002"` | **`1 / 3 Items Active` (`activeQuota: 1`, `maxQuota: 3`, 2 Free Slots)**<br>• `activeLoansCount: 1`:<br>  1. Loan `seed_loan_checked_out` on **`CPE-RPI-002`** (`ACTIVE`, `checkedOutAt: 2026-11-12T00:00:00.000Z` [`12 Nov 2026`], `dueDate: 2026-11-19T00:00:00.000Z` [`19 Nov 2026`])<br>• `pendingRequestsCount: 0` (`0` pending reservations)<br>• Historical `APPROVED` request row: `seed_request_checked_out` on `CPE-RPI-002` (`status: "APPROVED"`, `createdAt: 2026-11-19T13:20:55.853Z`, note `"Deterministic sample checkout."`) | • **`UAT-EF-03` (Run 2nd):** Non-available item rejection (`CPE-LOG-001`, `CPE-RPI-002`).<br>• **`UAT-EF-04` (Run 3rd):** Forbidden role UI & read-only queue guard.<br>• **`UAT-EF-05` (Run 4th):** Cross-borrower isolation & 2-session token revocation.<br>• **`UAT-EF-01` (Run 5th) & `UAT-EF-06` (Run 6th):** Requesting & checking out **`CPE-RPI-001`** and verifying refresh/re-login persistence. |
| **`CUSTODIAN_STAFF`** *(CPE Lab Custodian)* | `CUSTODIAN` | `custodian@cpe.kmutt.ac.th` | `"STAFF-001"` | **Session Active (`role: "CUSTODIAN"`)**<br>• `pendingQueueCount: 2` (`cmwnl9ftz0001s601wk54wtfz` on `CPE-FPG-001`; `cmwqdf5ji0001s60101l4203z` on `CPE-OSC-002`)<br>• `activeLoansCount: 2` (`seed_loan_checked_out` on `CPE-RPI-002`; `cmwns3i0h0003s601a249sjb7` on `CPE-OSC-001`) | • **`UAT-EF-01` (Run 5th):** Reviewing triage queue & executing physical checkout for `BORROWER_FREE`'s new request on **`CPE-RPI-001`**.<br>• **`UAT-EF-06` (Run 6th):** Rechecking `Active Loans Monitor` persistence. |

#### 3.2.2 Reconciled Live Equipment Catalog Inventory (`6` Serialized Assets on `equipflow-00009-kns`)

| Asset ID (`id`) | Asset Tag | Equipment Name | Category & Model | Serial Number | Condition | Verified Live Status (`2026-11-23T21:09:35+07:00`) | Linked Record / UAT Fixture Role |
| :--- | :--- | :--- | :--- | :--- | :---: | :---: | :--- |
| **`seed_item_cpe_rpi_001`** | **`CPE-RPI-001`** | Raspberry Pi 4 Model B 4GB | Microcontrollers · `RPI4-4GB` | `RPI4-4GB-001` | `GOOD` | **`AVAILABLE`** | **Designated `AVAILABLE` UAT Target Asset:** Checked in `UAT-EF-02` (`3/3` quota limit button & API rejection) and then reserved & checked out by `BORROWER_FREE` in `UAT-EF-01` $\rightarrow$ `UAT-EF-06`. |
| **`seed_item_cpe_fpg_001`** | **`CPE-FPG-001`** | Terasic DE10-Lite FPGA Board | FPGA · `DE10-Lite` | `TERASIC-DE10LITE-001` | `GOOD` | **`RESERVED`** | **Retained `BORROWER_FULL` Pending Fixture #2:** Reserved by `BORROWER_FULL` request `cmwnl9ftz0001s601wk54wtfz` (`PENDING`, note `"testing kub"`), keeping `BORROWER_FULL` at `3/3` active quota. **Do NOT checkout.** |
| **`seed_item_cpe_osc_002`** | **`CPE-OSC-002`** | Keysight InfiniiVision DSOX1204A | Measurement · `DSOX1204A` | `KEYSIGHT-DSOX1204A-002` | `GOOD` | **`RESERVED`** | **Protected Lab 5 C-05 Record:** Reserved by `BORROWER_FULL` request `cmwqdf5ji0001s60101l4203z` (`PENDING`, note `"LAB5-C05-20261121T1912ICT"`). **Strictly Read-Only — zero write/checkout calls permitted against this record.** |
| **`seed_item_cpe_osc_001`** | **`CPE-OSC-001`** | Rigol DS1054Z Digital Oscilloscope | Measurement · `DS1054Z` | `RIGOL-DS1054Z-001` | `GOOD` | **`CHECKED_OUT`** | **Retained `BORROWER_FULL` Active Loan Fixture:** Checked out on loan `cmwns3i0h0003s601a249sjb7` (`19 Nov 2026` $\rightarrow$ `26 Nov 2026`). Used in `UAT-EF-05` isolation checks. |
| **`seed_item_cpe_rpi_002`** | **`CPE-RPI-002`** | Raspberry Pi 4 Model B 8GB | Microcontrollers · `RPI4-8GB` | `RPI4-8GB-002` | `GOOD` | **`CHECKED_OUT`** | **Retained `BORROWER_FREE` Seeded Active Loan Fixture:** Checked out on loan `seed_loan_checked_out` (`12 Nov 2026` $\rightarrow$ `19 Nov 2026`, request `seed_request_checked_out` is `APPROVED`). Used in `UAT-EF-03` (`400 ITEM_NOT_AVAILABLE`), `UAT-EF-05`, and `UAT-EF-06`. |
| **`seed_item_cpe_log_001`** | **`CPE-LOG-001`** | Saleae Logic 8 USB Analyzer | Measurement · `Logic 8` | `SALEAE-LOGIC8-001` | `GOOD` | **`MAINTENANCE`** | **Retained Maintenance Boundary Fixture:** Used in `UAT-EF-03` for UI disabled button (`Maintenance`) and API `400 ITEM_NOT_AVAILABLE` rejection. |

---

### 3.3 Mandatory Execution Order, Tester Assignment & Per-Run Identifier (`Run ID`)

#### 3.3.1 Mandatory Run Order (`02 → 03 → 04 → 05 → 01 → 06`)

Because **`CPE-RPI-001`** (`seed_item_cpe_rpi_001`) is the single `AVAILABLE` asset on the live database and `UAT-EF-01` transitions **`CPE-RPI-001`** from `AVAILABLE` $\rightarrow$ `RESERVED` $\rightarrow$ `CHECKED_OUT`, Team `TH-017` **must** execute the cases in the following fixed sequence:

1. **`UAT-EF-02` (Run 1st — Non-mutating):** Verify `BORROWER_FULL` (`3 / 3`) sees disabled button `Limit Reached (3/3)` on the **`AVAILABLE` `CPE-RPI-001` card** and receives `HTTP 400 EXCEEDS_ACTIVE_QUOTA` when attempting `POST /api/v1/requests` for `seed_item_cpe_rpi_001` while **`CPE-RPI-001` is still `AVAILABLE`**.
2. **`UAT-EF-03` (Run 2nd — Non-mutating):** Verify `BORROWER_FREE` (`1 / 3`) sees disabled buttons on `MAINTENANCE` (`CPE-LOG-001`), `CHECKED_OUT` (`CPE-RPI-002`, `CPE-OSC-001`), and `RESERVED` (`CPE-OSC-002`, `CPE-FPG-001`) cards, and receives `HTTP 400 ITEM_NOT_AVAILABLE` on `POST /api/v1/requests` for `CPE-LOG-001` and `CPE-RPI-002`.
3. **`UAT-EF-04` (Run 3rd — Non-mutating):** Verify `BORROWER_FREE` UI role boundary at `/custodian/desk` and read-only queue rejections (`GET /api/v1/custodian/requests` $\rightarrow$ `401 UNAUTHENTICATED` without token, `403 FORBIDDEN_ROLE` with `BORROWER_FREE` token). **Zero write attempts against `CPE-OSC-002`.**
4. **`UAT-EF-05` (Run 4th — Non-mutating / Disposable Sessions Cleaned Up):** Verify `BORROWER_FREE` cross-borrower data isolation (sees own `CPE-RPI-002`, zero leak of `BORROWER_FULL`'s `CPE-OSC-001`, `CPE-OSC-002`, or `CPE-FPG-001`) and two-session per-token logout revocation (`Session A` revoked $\rightarrow$ `401 TOKEN_REVOKED`, concurrent `Session B` stays `200 OK`, then `Session B` logged out).
5. **`UAT-EF-01` (Run 5th — Mutating Normal Journey):** `BORROWER_FREE` (`1 / 3`) submits borrow request for **`CPE-RPI-001`** (`AVAILABLE` $\rightarrow$ `RESERVED`, capturing `requestId`), then `CUSTODIAN_STAFF` checks out that exact `requestId` (`RESERVED` $\rightarrow$ `CHECKED_OUT`, request `PENDING` $\rightarrow$ `APPROVED`, creating `loanId` with 7-day `dueDate` and `custodianId` = `STAFF-001`).
6. **`UAT-EF-06` (Run 6th — Consumes Exact IDs from `UAT-EF-01` Before Any Reset):** Immediately after `UAT-EF-01`, verify that the exact `requestId` and `loanId` generated in `UAT-EF-01` persist across hard refresh (`Ctrl+F5`), `BORROWER_FREE` sign-out and fresh re-login, and `CUSTODIAN_STAFF` Active Loans Monitor recheck.

#### 3.3.2 Pair Tester Assignment for Team `TH-017` (`2 auan`)

To satisfy Lab 6 Handout §3.2 (*"Both students in a 2-person team must participate in UAT execution"*):
- **`Kamonnat Seetakai` (`TH-017` · Student ID `67070501001`):** Executes **`UAT-EF-02`**, **`UAT-EF-03`**, the **Borrower request half of `UAT-EF-01` (Steps 1–7)**, and the **Borrower refresh/re-login checks of `UAT-EF-06` (Steps 1–5)**.
- **`Benyapha Rattanakhunodom` (`TH-017` · Student ID `67070501030`):** Executes **`UAT-EF-04`**, **`UAT-EF-05`**, the **Custodian triage & checkout half of `UAT-EF-01` (Steps 8–11)**, and the **Custodian Active Loans Monitor recheck of `UAT-EF-06` (Step 6)**.

#### 3.3.3 Per-Run Identifier (`Run ID`) Convention

Every execution pass uses a unique monotonic **`Run ID`** (`R01` for initial Part B UAT execution; `R02`, `R03`, ... for any subsequent reset pass or Part D retest) embedded in the synthetic notes:
- Initial UAT Pass (`Run ID = R01`):
  - Borrower Request Note in `UAT-EF-01`: `UAT-TH017-R01-REQ: Raspberry Pi 4B embedded lab verification`
  - Custodian Checkout Note in `UAT-EF-01`: `UAT-TH017-R01-CHK: Verified student ID 67070501002; handed over CPE-RPI-001.`
- If a second run is performed after a database reset (`Run ID = R02`): replace `R01` with `R02` (`UAT-TH017-R02-REQ` / `UAT-TH017-R02-CHK`).

---

### 3.4 Deterministic Reset, Partial-Run Recovery & Stop Conditions Protocol

Because Sprint 1 excludes equipment return (`FR-17` / `F-05`) and request cancellation (`FR-12`), completing `UAT-EF-01` leaves **`CPE-RPI-001`** in `CHECKED_OUT` status (or `RESERVED` if a run is interrupted after Step 6 before Custodian checkout in Step 10) and leaves `BORROWER_FREE` at `2 / 3` active quota. Whenever a reset is required between runs or prior to Part D retesting, Product Team `TH-045_P2` executes the deterministic reset procedure below:

1. **Reset Owner & Confirmed Coordination Window:**
   - **Primary Reset Owner:** `Norawit Mahaprom` (`@NxNxmm`, `67070501026`, GCP Project Owner on `cpe334-team45`).
   - **Backup & Verification Owner:** `Pawarisa Thongchua` (`@itspxsh`, `67070501032`).
   - **Confirmed Reset Window & Turnaround:** Coordinated live via the shared `TH-045_P2 <-> TH-017` team chat during scheduled UAT windows (`09:00–23:00 ICT`), with an agreed turnaround of **$\le 15$ minutes** from reset request to verified readiness confirmation.
2. **Scoped Reset Procedure (Handling Both Completed Checkouts and Partial Reservations):**
   The Reset Owner executes a scoped transactional cleanup targeting **only** records created for `seed_item_cpe_rpi_001` (`CPE-RPI-001`) by `BORROWER_FREE` (`seed_user_borrower_2`):
   - **Step A (Delete UAT Loan if Checkout Completed):** Delete from `Loan` where `itemId = 'seed_item_cpe_rpi_001'` and `borrowerId = 'seed_user_borrower_2'` (or `request.requestNote LIKE 'UAT-TH017-%'`).
   - **Step B (Delete UAT BorrowRequest — Covers Both `APPROVED` Full Run and `PENDING` Partial Reservation):** Delete from `BorrowRequest` where `itemId = 'seed_item_cpe_rpi_001'` and `borrowerId = 'seed_user_borrower_2'` (or `requestNote LIKE 'UAT-TH017-%'`).
   - **Step C (Restore Designated Asset Status):** Update `EquipmentItem` where `id = 'seed_item_cpe_rpi_001'` (`CPE-RPI-001`) setting `status = 'AVAILABLE'`.
3. **Retained Fixtures (Never Modified or Deleted During Any Reset):**
   - `CPE-OSC-002` (`seed_item_cpe_osc_002`, `RESERVED`) and its protected Lab 5 `C-05` pending request `cmwqdf5ji0001s60101l4203z` (`LAB5-C05-20261121T1912ICT`, `PENDING`, `createdAt: 2026-11-21T12:15:07.470Z`).
   - `CPE-FPG-001` (`seed_item_cpe_fpg_001`, `RESERVED`) and `BORROWER_FULL`'s second pending request `cmwnl9ftz0001s601wk54wtfz` (`testing kub`, `PENDING`).
   - `CPE-OSC-001` (`seed_item_cpe_osc_001`, `CHECKED_OUT`) and `BORROWER_FULL`'s active loan `cmwns3i0h0003s601a249sjb7` + approved request `cmwns2yog0001s6014rng8e68`.
   - `CPE-RPI-002` (`seed_item_cpe_rpi_002`, `CHECKED_OUT`) and `BORROWER_FREE`'s seeded active loan `seed_loan_checked_out` + approved request `seed_request_checked_out`.
   - `CPE-LOG-001` (`seed_item_cpe_log_001`, `MAINTENANCE`).
4. **Post-Reset Readiness Check (Mandatory Before Resuming UAT):**
   Immediately after reset, the Reset Owner re-runs the read-only preflight verification and confirms all four invariants before notifying Team `TH-017` to proceed with the next `Run ID`:
   - `CPE-RPI-001` (`seed_item_cpe_rpi_001`) status is `"AVAILABLE"`.
   - `BORROWER_FULL` active quota is `3 / 3` (`pendingRequestsCount: 2`, `activeLoansCount: 1`).
   - `BORROWER_FREE` active quota is `1 / 3` (`pendingRequestsCount: 0`, `activeLoansCount: 1` on `CPE-RPI-002`).
   - Protected Lab 5 record `cmwqdf5ji0001s60101l4203z` (`CPE-OSC-002`, `LAB5-C05-20261121T1912ICT`) is `"PENDING"` and `CPE-OSC-002` is `"RESERVED"`.
5. **Explicit UAT Stop Conditions:**
   Team `TH-017` must stop execution immediately, mark any unexecuted dependent case as `BLOCKED`, and notify Team `TH-045_P2` if any of the following occur:
   - `GET /api/health` or `GET /api/ready` returns non-`200`.
   - Before `UAT-EF-02` or `UAT-EF-01`, `CPE-RPI-001` is not `AVAILABLE`, `BORROWER_FULL` is not at `3 / 3`, or `BORROWER_FREE` is not at `1 / 3`.
   - Any negative/rejection test (`UAT-EF-02`, `UAT-EF-03`, `UAT-EF-04`, `UAT-EF-05`) unexpectedly returns an HTTP `2xx` status on a forbidden/rejected action (indicating a broken guard that may have mutated live state).

---

## 4. Executable Sprint 1 UAT Test Cases (Handout §3.1)

### Summary Matrix of UAT Cases (Ordered by Mandatory Execution Sequence `02 → 03 → 04 → 05 → 01 → 06`)

| Run Order | Case ID | Mandatory Handout Category (§3.1) | Title / Scenario Focus | Primary Sprint 1 Requirements, ACs & STS Test IDs | Actor Role(s) | Assigned `TH-017` Tester |
| :---: | :---: | :--- | :--- | :--- | :---: | :--- |
| **1st** | **`UAT-EF-02`** | **2. Business-Rule / Boundary Case (A)** | Combined Active Borrowing Quota Limit (`3 / 3`) Enforcement on Designated `AVAILABLE` Asset (`CPE-RPI-001`) | `BR-04` / `AC-REQ-03` (`UI-01-06`, `API-01-16`) | `BORROWER_FULL` (`3/3`) | **Kamonnat Seetakai** (`67070501001`) |
| **2nd** | **`UAT-EF-03`** | **2. Business-Rule / Boundary Case (B)** | Sequential Rejection of Borrow Requests for Non-Available (`MAINTENANCE`, `CHECKED_OUT`, `RESERVED`) Assets | `BR-01` / `AC-REQ-02` (`UI-01-05`, `API-01-15`) *(distinguished from `BR-02` concurrency races `AC-REQ-04` / `AC-CHK-05`–`06`)* | `BORROWER_FREE` (`1/3`) | **Kamonnat Seetakai** (`67070501001`) |
| **3rd** | **`UAT-EF-04`** | **3. Forbidden Role / Ownership Case (A)** | Role Segregation Guard: Borrower Denied Access to Custodian Desk UI & Read-Only Queue Endpoint *(Zero Writes to `CPE-OSC-002`)* | `FR-04`, `BR-03` / `AC-AUTH-06`, `AC-AUTH-07` (`API-01-08`, `API-01-09`, `E2E-01-03`; isolated `AC-CHK-07` / `API-01-26` noted) | `BORROWER_FREE` & Anonymous | **Benyapha Rattanakhunodom** (`67070501030`) |
| **4th** | **`UAT-EF-05`** | **3. Forbidden Role / Ownership Case (B)** | Cross-Borrower Personal History Isolation (`FR-11`) & Two-Session Per-Token Logout Revocation (`FR-03`) | `FR-11`, `FR-03` / `AC-REQ-06`, `AC-AUTH-04`, `AC-AUTH-05` (`API-01-05`, `API-01-06`, `API-01-07`, `API-01-19`) | `BORROWER_FREE` vs `BORROWER_FULL` | **Benyapha Rattanakhunodom** (`67070501030`) |
| **5th** | **`UAT-EF-01`** | **1. Normal Domain Journey** | Authentication Checks & End-to-End Reservation of `CPE-RPI-001` by `BORROWER_FREE` $\rightarrow$ Physical Checkout by `CUSTODIAN_STAFF` | `FR-01`, `FR-02`, `FR-05`, `FR-06`, `FR-09`, `FR-13`, `FR-14`, `BR-01`, `BR-05`, `BR-08` / `AC-AUTH-01`–`03`, `AC-CAT-01`–`02`, `AC-REQ-01`, `AC-CHK-01`–`04` (`E2E-01-01`) | `BORROWER_FREE` $\rightarrow$ `CUSTODIAN_STAFF` | **Kamonnat** *(Borrower Steps 1–7)* & **Benyapha** *(Custodian Steps 8–11)* |
| **6th** | **`UAT-EF-06`** | **4. State / History / Persistence Case** | Linked State & History Persistence of `UAT-EF-01` Request/Loan IDs Across Browser Refresh, Re-Login & Custodian Monitor Recheck | `FR-10`, `BR-05`, `BR-08` / `AC-REQ-05`, `AC-CHK-03`, `AC-CHK-04` (`API-01-18`, `UI-01-07`) *(separate from SRS `NFR-05` server restart check)* | `BORROWER_FREE` & `CUSTODIAN_STAFF` | **Kamonnat** *(Steps 1–5)* & **Benyapha** *(Step 6)* |

---

### Case `UAT-EF-02` *(Run 1st)* — Business-Rule / Boundary Case (A): Combined Active Borrowing Quota Limit (`3 / 3`) Enforcement

* **Mandatory Category:** 2. Business-Rule or Boundary Case
* **Sprint 1 Requirement / AC / STS Reference:** `BR-04` (`AC-REQ-03`, `UI-01-06`, `API-01-16`)
* **Assigned `TH-017` Tester:** `Kamonnat Seetakai` (`67070501001`)
* **Purpose:** Verify that when `BORROWER_FULL`'s combined active quota ($\text{Pending Requests} + \text{Active Loans}$) equals `3 / 3`, (1) the Equipment Catalog UI disables the request button on the designated `AVAILABLE` asset (**`CPE-RPI-001`**, `seed_item_cpe_rpi_001`) with the exact label **`Limit Reached (3/3)`**, and (2) the backend API rejects a direct `POST /api/v1/requests` call targeting **`CPE-RPI-001`** with **HTTP `400 Bad Request` (`EXCEEDS_ACTIVE_QUOTA`)**, leaving **`CPE-RPI-001`** in `AVAILABLE` status and `BORROWER_FULL`'s request/loan records unchanged.
* **Actor Role:** `BORROWER_FULL` — `borrower@cpe.kmutt.ac.th` (`Student Borrower One`, synthetic seed ID `"67070501001"`)
* **Preconditions (Strict Fail-Closed Guard — No Fallback):**
  1. Executed **1st** in the UAT sequence on `https://equipflow-ddqo5fpv2a-as.a.run.app` (`equipflow-00009-kns`, commit `8217beff7d33b2fc7657c36824d4a22a0df6bb94`).
  2. Immediately before testing, `BORROWER_FULL` must have `activeQuota.current === 3` (`1` active loan `cmwns3i0h0003s601a249sjb7` on `CPE-OSC-001` + `2` pending requests `cmwqdf5ji0001s60101l4203z` on `CPE-OSC-002` and `cmwnl9ftz0001s601wk54wtfz` on `CPE-FPG-001`).
  3. Immediately before testing, designated asset **`CPE-RPI-001`** (`id: "seed_item_cpe_rpi_001"`) must be strictly in **`"AVAILABLE"`** status. **If either prerequisite fails, mark `UAT-EF-02` as `BLOCKED` and do not proceed until reset.**
* **Synthetic Inputs:**
  - **Login Email:** `borrower@cpe.kmutt.ac.th` (`BORROWER_FULL`)
  - **Password:** `<PROVIDED_PRIVATELY_TO_TH017>`
  - **Designated Target Asset:** `CPE-RPI-001` (`id: "seed_item_cpe_rpi_001"`, `Raspberry Pi 4 Model B 4GB`)
  - **Synthetic Purpose Note:** `"UAT-TH017-R01-QUOTA-BREACH"`
  - **Sanitized DevTools Console Verification Script (Fail-Closed Prerequisite Check + Before/After Comparison):**
    ```javascript
    await (async () => {
      const token = localStorage.getItem('equipflow_token');
      const hdr = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
      const beforeItems = (await (await fetch('/api/v1/items', { headers: hdr })).json()).data ?? [];
      const beforeMy = (await (await fetch('/api/v1/requests/my', { headers: hdr })).json()).data;
      const targetBefore = beforeItems.find(i => i.assetTag === 'CPE-RPI-001');

      if (!targetBefore || targetBefore.status !== 'AVAILABLE' || beforeMy?.activeQuota?.current !== 3) {
        const blocked = {
          verdict: 'BLOCKED_PRECONDITION_FAILED',
          observedQuota: beforeMy?.activeQuota?.current ?? null,
          targetAssetStatus: targetBefore?.status ?? 'NOT_FOUND'
        };
        console.error('UAT-EF-02 BLOCKED:', JSON.stringify(blocked, null, 2));
        return blocked;
      }

      const res = await fetch('/api/v1/requests', {
        method: 'POST',
        headers: hdr,
        body: JSON.stringify({ itemId: targetBefore.id, requestNote: 'UAT-TH017-R01-QUOTA-BREACH' })
      });
      const errBody = await res.json();

      if (res.ok) {
        console.error('STOP CONDITION: Unexpected 2xx on 3/3 quota boundary!');
      }

      const afterItems = (await (await fetch('/api/v1/items', { headers: hdr })).json()).data ?? [];
      const afterMy = (await (await fetch('/api/v1/requests/my', { headers: hdr })).json()).data;
      const targetAfter = afterItems.find(i => i.assetTag === 'CPE-RPI-001');

      const summary = {
        caseId: 'UAT-EF-02',
        capturedAtIct: new Date().toLocaleString('sv-SE', { timeZone: 'Asia/Bangkok' }).replace(' ', 'T') + '+07:00',
        targetAssetTag: 'CPE-RPI-001',
        before: {
          assetStatus: targetBefore.status,
          activeQuota: beforeMy.activeQuota.current,
          pendingRequestsCount: beforeMy.quota.pendingRequestsCount,
          activeLoansCount: beforeMy.quota.activeLoansCount,
          requestIds: beforeMy.requests.map(r => r.id).sort()
        },
        attempt: {
          httpStatus: res.status,
          errorCode: errBody?.error?.code ?? null,
          errorMessage: errBody?.error?.message ?? null
        },
        after: {
          assetStatus: targetAfter?.status ?? null,
          activeQuota: afterMy.activeQuota.current,
          pendingRequestsCount: afterMy.quota.pendingRequestsCount,
          activeLoansCount: afterMy.quota.activeLoansCount,
          requestIds: afterMy.requests.map(r => r.id).sort()
        },
        stateUnchanged:
          targetAfter?.status === 'AVAILABLE' &&
          afterMy.activeQuota.current === 3 &&
          JSON.stringify(beforeMy.requests.map(r => r.id).sort()) === JSON.stringify(afterMy.requests.map(r => r.id).sort())
      };
      console.log('UAT-EF-02 Result:', JSON.stringify(summary, null, 2));
      return summary;
    })();
    ```
* **Numbered User Actions:**
  1. Open `https://equipflow-ddqo5fpv2a-as.a.run.app` and sign in as **`BORROWER_FULL`** (`borrower@cpe.kmutt.ac.th`).
  2. On the **Department Equipment Catalog** page, confirm the header badge reads **`📋 My Active Items: 3 / 3`**. Locate the card for **`CPE-RPI-001`** (`Raspberry Pi 4 Model B 4GB`), confirm its availability badge reads **`● AVAILABLE`**, and inspect its right-hand action button.
  3. Click the **`My Requests`** tab and confirm the **`Personal Borrowing Quota`** banner displays **`3 / 3 Items Active`** with a 100% filled progress bar, listing Active Loan **`CPE-OSC-001`** and Pending Requests including **`CPE-OSC-002`** and **`CPE-FPG-001`**.
  4. Return to the **`Catalog`** tab, open Browser DevTools Console (`F12` $\rightarrow$ **Console**), paste the Sanitized DevTools Console Verification Script above, and press `Enter`.
  5. Capture a screenshot showing the live URL (`https://equipflow-ddqo5fpv2a-as.a.run.app`), the **`CPE-RPI-001`** card with **`● AVAILABLE`** and disabled **`Limit Reached (3/3)`** button, and the Console output (`EV-TH017-02`). Click **`Sign Out`**.
* **Expected Results:**
  - **UI Boundary (`UI-01-06`):** `CPE-RPI-001` displays badge **`● AVAILABLE`**, while its action button is **disabled** (`disabled` attribute present) with the exact label **`Limit Reached (3/3)`**.
  - **API Rule Enforcement (`API-01-16`):** The `POST /api/v1/requests` call targeting `seed_item_cpe_rpi_001` returns **HTTP `400 Bad Request`** with `"errorCode": "EXCEEDS_ACTIVE_QUOTA"` and `"errorMessage": "Cannot submit request: active loans and requests combined cannot exceed 3."`.
  - **Before/After State Invariance:** `before.assetStatus === "AVAILABLE"` and `after.assetStatus === "AVAILABLE"`, `activeQuota` remains `3`, `requestIds` remain identical (`["cmwnl9ftz0001s601wk54wtfz", "cmwns2yog0001s6014rng8e68", "cmwqdf5ji0001s60101l4203z"]`), and `stateUnchanged === true`.

---

### Case `UAT-EF-03` *(Run 2nd)* — Business-Rule / Boundary Case (B): Sequential Rejection of Borrow Requests for Non-Available (`MAINTENANCE`, `CHECKED_OUT`, `RESERVED`) Equipment

* **Mandatory Category:** 2. Business-Rule or Boundary Case
* **Sprint 1 Requirement / AC / STS Reference:** `BR-01` (`AC-REQ-02`, `UI-01-05`, `API-01-15`) *(Explicitly separated from concurrent reserve races under `BR-02` / `AC-REQ-04` / `API-01-17` and concurrent/duplicate custodian checkouts under `BR-02` / `AC-CHK-05`–`06` / `API-01-24`–`25`)*
* **Assigned `TH-017` Tester:** `Kamonnat Seetakai` (`67070501001`)
* **Purpose:** Verify that an authenticated Borrower with free quota (`BORROWER_FREE` at `1 / 3`) is prevented from requesting non-available equipment: (1) all non-available catalog cards (`MAINTENANCE`, `CHECKED_OUT`, `RESERVED`) render disabled action buttons in the UI (`UI-01-05`), and (2) sequential `POST /api/v1/requests` calls against **`CPE-LOG-001` (`MAINTENANCE`)** and **`CPE-RPI-002` (`CHECKED_OUT`)** are rejected with **HTTP `400 Bad Request` (`ITEM_NOT_AVAILABLE`)** (`API-01-15`), preserving identical before/after inventory and borrower history state.
* **Actor Role:** `BORROWER_FREE` — `borrower2@cpe.kmutt.ac.th` (`Student Borrower Two`, synthetic seed ID `"67070501002"`)
* **Preconditions:**
  1. `BORROWER_FREE` has `activeQuota.current === 1` (`1 / 3 Items Active`, 2 free quota slots).
  2. `CPE-LOG-001` is in `MAINTENANCE`, `CPE-RPI-002` and `CPE-OSC-001` are in `CHECKED_OUT`, and `CPE-OSC-002` and `CPE-FPG-001` are in `RESERVED`.
* **Synthetic Inputs:**
  - **Login Email:** `borrower2@cpe.kmutt.ac.th` (`BORROWER_FREE`)
  - **Password:** `<PROVIDED_PRIVATELY_TO_TH017>`
  - **API Rejection Targets:** `CPE-LOG-001` (`seed_item_cpe_log_001`, `MAINTENANCE`) and `CPE-RPI-002` (`seed_item_cpe_rpi_002`, `CHECKED_OUT`). *(Note: `CPE-OSC-002` and `CPE-FPG-001` are verified read-only via the UI disabled `Reserved` button; no write requests are sent to `CPE-OSC-002`.)*
  - **Sanitized DevTools Console Verification Script (Before/After Inventory & History Comparison + Stop on Unexpected Success):**
    ```javascript
    await (async () => {
      const token = localStorage.getItem('equipflow_token');
      const hdr = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
      const beforeItems = (await (await fetch('/api/v1/items', { headers: hdr })).json()).data ?? [];
      const beforeMy = (await (await fetch('/api/v1/requests/my', { headers: hdr })).json()).data;

      const maintItem = beforeItems.find(i => i.assetTag === 'CPE-LOG-001');
      const checkedOutItem = beforeItems.find(i => i.assetTag === 'CPE-RPI-002');

      if (beforeMy?.activeQuota?.current !== 1 || maintItem?.status !== 'MAINTENANCE' || checkedOutItem?.status !== 'CHECKED_OUT') {
        return { verdict: 'BLOCKED_PRECONDITION_FAILED', quota: beforeMy?.activeQuota?.current, maintStatus: maintItem?.status, checkedOutStatus: checkedOutItem?.status };
      }

      const rMaint = await fetch('/api/v1/requests', {
        method: 'POST',
        headers: hdr,
        body: JSON.stringify({ itemId: maintItem.id, requestNote: 'UAT-TH017-R01-MAINT-REJECT' })
      });
      const bMaint = await rMaint.json();
      if (rMaint.ok) {
        console.error('STOP CONDITION: Unexpected 2xx on MAINTENANCE item!');
        return { verdict: 'FAIL_STOP_UNEXPECTED_2XX', target: 'CPE-LOG-001', httpStatus: rMaint.status };
      }

      const rOut = await fetch('/api/v1/requests', {
        method: 'POST',
        headers: hdr,
        body: JSON.stringify({ itemId: checkedOutItem.id, requestNote: 'UAT-TH017-R01-CHECKEDOUT-REJECT' })
      });
      const bOut = await rOut.json();
      if (rOut.ok) {
        console.error('STOP CONDITION: Unexpected 2xx on CHECKED_OUT item!');
        return { verdict: 'FAIL_STOP_UNEXPECTED_2XX', target: 'CPE-RPI-002', httpStatus: rOut.status };
      }

      const afterItems = (await (await fetch('/api/v1/items', { headers: hdr })).json()).data ?? [];
      const afterMy = (await (await fetch('/api/v1/requests/my', { headers: hdr })).json()).data;

      const beforeSnapshot = beforeItems.map(i => `${i.assetTag}:${i.status}`).sort();
      const afterSnapshot = afterItems.map(i => `${i.assetTag}:${i.status}`).sort();

      const summary = {
        caseId: 'UAT-EF-03',
        capturedAtIct: new Date().toLocaleString('sv-SE', { timeZone: 'Asia/Bangkok' }).replace(' ', 'T') + '+07:00',
        borrowerQuotaBefore: beforeMy.activeQuota.current,
        maintenanceAttempt: {
          assetTag: 'CPE-LOG-001',
          httpStatus: rMaint.status,
          errorCode: bMaint?.error?.code ?? null,
          errorMessage: bMaint?.error?.message ?? null
        },
        checkedOutAttempt: {
          assetTag: 'CPE-RPI-002',
          httpStatus: rOut.status,
          errorCode: bOut?.error?.code ?? null,
          errorMessage: bOut?.error?.message ?? null
        },
        borrowerQuotaAfter: afterMy.activeQuota.current,
        inventoryUnchanged: JSON.stringify(beforeSnapshot) === JSON.stringify(afterSnapshot),
        historyUnchanged:
          afterMy.requests.length === beforeMy.requests.length &&
          afterMy.loans.length === beforeMy.loans.length
      };
      console.log('UAT-EF-03 Result:', JSON.stringify(summary, null, 2));
      return summary;
    })();
    ```
* **Numbered User Actions:**
  1. Sign in at `https://equipflow-ddqo5fpv2a-as.a.run.app` as **`BORROWER_FREE`** (`borrower2@cpe.kmutt.ac.th`). Confirm the top-right quota badge shows **`📋 My Active Items: 1 / 3`**.
  2. On the **Department Equipment Catalog**, inspect the 5 non-available equipment cards:
     - **`CPE-LOG-001`** (`Saleae Logic 8 USB Analyzer`): verify status badge **`▲ MAINTENANCE`** and disabled button **`Maintenance`**.
     - **`CPE-RPI-002`** (`Raspberry Pi 4 Model B 8GB`) and **`CPE-OSC-001`** (`Rigol DS1054Z Digital Oscilloscope`): verify status badge **`● CHECKED OUT`** and disabled button **`Checked Out`**.
     - **`CPE-OSC-002`** (`Keysight InfiniiVision DSOX1204A`) and **`CPE-FPG-001`** (`Terasic DE10-Lite FPGA Board`): verify status badge **`◉ RESERVED`** and disabled button **`Reserved`** *(read-only UI observation)*.
  3. Open Browser DevTools Console (`F12` $\rightarrow$ **Console**), paste the Sanitized DevTools Console Verification Script above, and press `Enter` to test backend rejection (`BR-01` / `AC-REQ-02` / `API-01-15`) against `CPE-LOG-001` (`MAINTENANCE`) and `CPE-RPI-002` (`CHECKED_OUT`).
  4. Capture a screenshot showing the live URL, the disabled non-available catalog cards, and the Console output (`EV-TH017-03`).
* **Expected Results:**
  - **UI Controls (`UI-01-05`):** All 5 non-available cards (`CPE-LOG-001`, `CPE-RPI-002`, `CPE-OSC-001`, `CPE-OSC-002`, `CPE-FPG-001`) have their request buttons disabled with matching non-color labels (`Maintenance`, `Checked Out`, `Reserved`).
  - **Sequential API Rejection (`API-01-15`):** Both `POST /api/v1/requests` calls return **HTTP `400 Bad Request`** with `"errorCode": "ITEM_NOT_AVAILABLE"` and `"errorMessage": "Equipment item <ASSET_TAG> is already reserved or checked out."`.
  - **Before/After Invariance:** `inventoryUnchanged === true`, `historyUnchanged === true`, and `borrowerQuotaAfter === 1`.

---

### Case `UAT-EF-04` *(Run 3rd)* — Forbidden Role / Access Control Case (A): Borrower Denied Access to Custodian Desk UI & Custodian Queue Endpoint

* **Mandatory Category:** 3. Forbidden Role or Ownership Case
* **Sprint 1 Requirement / AC / STS Reference:** `FR-04`, `BR-03` (`AC-AUTH-06`, `AC-AUTH-07`, `API-01-08`, `API-01-09`, `E2E-01-03`; with isolated disposable-fixture reference for `AC-CHK-07` / `API-01-26`)
* **Assigned `TH-017` Tester:** `Benyapha Rattanakhunodom` (`67070501030`)
* **Purpose:** Verify the access control boundary separating `BORROWER` and `CUSTODIAN` roles without issuing any mutating write request against live shared records (and **zero write attempts involving protected Lab 5 record `CPE-OSC-002`**):
  1. Direct browser navigation to `/custodian/desk` while signed in as `BORROWER_FREE` does not mount the `Custodian Triage & Checkout Desk` UI or disclose any department queue records (while explicitly recording the known contract discrepancy regarding the absent unauthorized toast notice in released `App.tsx`).
  2. Unauthenticated `GET /api/v1/custodian/requests` returns **HTTP `401` (`UNAUTHENTICATED`)** (`AC-AUTH-06` / `API-01-08`).
  3. `BORROWER_FREE`-authenticated `GET /api/v1/custodian/requests` returns **HTTP `403` (`FORBIDDEN_ROLE`)** (`AC-AUTH-07` / `API-01-09`) with zero data disclosure.
* **Actor Role(s):** `BORROWER_FREE` (`borrower2@cpe.kmutt.ac.th`) and Anonymous (Unauthenticated) Client
* **Preconditions:**
  1. Signed in to `https://equipflow-ddqo5fpv2a-as.a.run.app` as `BORROWER_FREE` (`borrower2@cpe.kmutt.ac.th`, `role: "BORROWER"`).
  2. **Safety Constraint:** No `POST /api/v1/custodian/checkouts` request may be sent against `CPE-OSC-002` (`cmwqdf5ji0001s60101l4203z`) or `CPE-FPG-001` (`cmwnl9ftz0001s601wk54wtfz`) on the live service. *(The write-endpoint role guard `POST /api/v1/custodian/checkouts` $\rightarrow$ `403 FORBIDDEN_ROLE` under `AC-CHK-07` / `API-01-26` is verified against a dedicated disposable fixture on isolated `equipflow_test` in `server/tests/sprint-1/checkout.api.test.ts`.)*
* **Synthetic Inputs:**
  - **Direct Browser URL Navigation:** `https://equipflow-ddqo5fpv2a-as.a.run.app/custodian/desk`
  - **Sanitized Read-Only DevTools Console Verification Script (Redacts Payload if Guard Fails):**
    ```javascript
    await (async () => {
      const token = localStorage.getItem('equipflow_token');
      const unauthRes = await fetch('/api/v1/custodian/requests');
      const unauthBody = await unauthRes.json().catch(() => ({}));

      const borrowerRes = await fetch('/api/v1/custodian/requests', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const borrowerBody = await borrowerRes.json().catch(() => ({}));

      const custodianHeadingMounted = Boolean(document.querySelector('#custodian-desk-title'));
      const activePortalHeading = document.querySelector('main h1')?.textContent?.trim() ?? null;
      const unauthorizedToastRendered = Boolean(document.querySelector('[role="alert"], .toast'));

      const summary = {
        caseId: 'UAT-EF-04',
        capturedAtIct: new Date().toLocaleString('sv-SE', { timeZone: 'Asia/Bangkok' }).replace(' ', 'T') + '+07:00',
        browserPath: window.location.pathname,
        uiObservations: {
          custodianDeskMounted: custodianHeadingMounted,
          renderedHeading: activePortalHeading,
          unauthorizedNoticeRendered: unauthorizedToastRendered,
          contractDiscrepancyNote: 'UI-SPEC 3.1 / STS E2E-01-03 specify an unauthorized redirect notice; released App.tsx renders Borrower Catalog by role without a toast notice.'
        },
        unauthenticatedGetQueue: {
          httpStatus: unauthRes.status,
          errorCode: unauthBody?.error?.code ?? null,
          dataDisclosed: Boolean(unauthBody?.data)
        },
        borrowerGetQueue: {
          httpStatus: borrowerRes.status,
          errorCode: borrowerBody?.error?.code ?? null,
          errorMessage: borrowerBody?.error?.message ?? null,
          dataDisclosed: Boolean(borrowerBody?.data)
        }
      };
      console.log('UAT-EF-04 Sanitized Result:', JSON.stringify(summary, null, 2));
      return summary;
    })();
    ```
* **Numbered User Actions:**
  1. While signed in as **`BORROWER_FREE`** (`borrower2@cpe.kmutt.ac.th`), navigate directly to `https://equipflow-ddqo5fpv2a-as.a.run.app/custodian/desk` in the browser address bar.
  2. Observe the rendered view and record two distinct UI observations:
     - **Observation 2a (Access Denial Boundary):** Whether any Custodian Desk elements (`Custodian Triage & Checkout Desk`, `Pending Requests` triage table, `Approve & Checkout` button, or `Active Loans Monitor`) are rendered.
     - **Observation 2b (Contract Discrepancy — Unauthorized Notice):** Whether an unauthorized toast/banner notice is displayed upon visiting `/custodian/desk` (comparing `UI-SPEC-SPRINT-01` §3.1 / `E2E-01-03` against released `client/src/App.tsx`).
  3. Open Browser DevTools Console (`F12` $\rightarrow$ **Console**), paste the Sanitized Read-Only DevTools Console Verification Script above, and press `Enter` to verify `GET /api/v1/custodian/requests` both without a token and with `BORROWER_FREE`'s Bearer token.
  4. Capture a screenshot (`EV-TH017-04`) showing the browser address bar at `https://equipflow-ddqo5fpv2a-as.a.run.app/custodian/desk`, the rendered Borrower view (`Signed in as: Student Borrower Two` · `BORROWER`), and the sanitized Console output.
* **Expected Results:**
  - **Step 2a (UI Role Boundary Enforced):** `custodianDeskMounted === false`; the page renders `Department Equipment Catalog` (`BORROWER` portal) and discloses zero department queue or active loan records.
  - **Step 2b (Documented Contract Discrepancy Observation):** `unauthorizedNoticeRendered === false` in released `App.tsx` (which gates view selection by `user.role === 'CUSTODIAN'` without URL routing or an unauthorized toast notice).
  - **Step 3 (API Status & Error Code Verification):**
    - `unauthenticatedGetQueue`: `httpStatus === 401`, `errorCode === "UNAUTHENTICATED"`, `dataDisclosed === false`.
    - `borrowerGetQueue`: `httpStatus === 403`, `errorCode === "FORBIDDEN_ROLE"`, `dataDisclosed === false` *(with released `auth.middleware.ts` message `"Access denied for role BORROWER"`).*
  - **Protected State Unchanged:** Zero write calls were issued; `CPE-OSC-002` (`cmwqdf5ji0001s60101l4203z`) and `CPE-FPG-001` (`cmwnl9ftz0001s601wk54wtfz`) remain untouched in `PENDING` / `RESERVED`.

---

### Case `UAT-EF-05` *(Run 4th)* — Forbidden Role / Ownership Case (B): Cross-Borrower Data Isolation (`FR-11`) & Two-Session Per-Token Logout Revocation (`FR-03`)

* **Mandatory Category:** 3. Forbidden Role or Ownership Case
* **Sprint 1 Requirement / AC / STS Reference:** `FR-11` (`AC-REQ-06`, `API-01-19`) and `FR-03` (`AC-AUTH-04`, `AC-AUTH-05`, `API-01-05`, `API-01-06`, `API-01-07`)
* **Assigned `TH-017` Tester:** `Benyapha Rattanakhunodom` (`67070501030`)
* **Purpose:**
  1. **Cross-Borrower Ownership Isolation (`FR-11` / `AC-REQ-06` / `API-01-19`):** Verify that `BORROWER_FREE` (`Student Borrower Two`, `"67070501002"`) sees their own pre-seeded active loan (`CPE-RPI-002`, positive own-record control) in `My Requests` and `GET /api/v1/requests/my`, while **none** of `BORROWER_FULL` (`Student Borrower One`, `"67070501001"`)'s verified live records (`CPE-OSC-001` active loan/request, `CPE-OSC-002` pending request `cmwqdf5ji0001s60101l4203z`, or `CPE-FPG-001` pending request `cmwnl9ftz0001s601wk54wtfz`) are disclosed.
  2. **Two-Session Per-Token Logout Revocation (`FR-03` / `AC-AUTH-04` & `AC-AUTH-05` / `API-01-05`–`07`):** Verify using two separate disposable sessions (`Session A` and `Session B`) for `BORROWER_FREE` that logging out `Session A` (`POST /api/v1/auth/logout` $\rightarrow$ `200 OK`) causes `Session A` to be rejected with **HTTP `401` (`TOKEN_REVOKED`)** (`AC-AUTH-04`), while concurrent `Session B` for the same account continues to succeed with **HTTP `200 OK`** (`AC-AUTH-05`), followed by immediate cleanup logout of `Session B`.
* **Actor Role:** `BORROWER_FREE` (`borrower2@cpe.kmutt.ac.th`) compared against `BORROWER_FULL` (`borrower@cpe.kmutt.ac.th`) fixture inventory
* **Preconditions:**
  1. `BORROWER_FULL` owns records on `CPE-OSC-001`, `CPE-OSC-002`, and `CPE-FPG-001` (verified in §3.2.1 preflight).
  2. `BORROWER_FREE` owns seeded loan `seed_loan_checked_out` and approved request `seed_request_checked_out` on `CPE-RPI-002`.
* **Synthetic Inputs:**
  - **Login Email:** `borrower2@cpe.kmutt.ac.th` (`BORROWER_FREE`)
  - **Password:** `<PROVIDED_PRIVATELY_TO_TH017>` *(entered via `prompt()` inside the script so the password is never written in Console code or output)*
  - **Sanitized DevTools Console Verification Script (Ownership Check + 2-Session Logout Revocation + Zero Token/Secret Logging):**
    ```javascript
    await (async () => {
      const uiToken = localStorage.getItem('equipflow_token');
      const myRes = await fetch('/api/v1/requests/my', {
        headers: { Authorization: `Bearer ${uiToken}` }
      });
      const myBody = await myRes.json();
      const myData = myBody.data ?? {};
      const ownLoanTags = (myData.loans ?? []).map(l => l.item?.assetTag);
      const ownReqTags = (myData.requests ?? []).map(r => r.item?.assetTag);

      const borrowerFullAssets = ['CPE-OSC-001', 'CPE-OSC-002', 'CPE-FPG-001'];
      const borrowerFullIds = [
        'cmwns3i0h0003s601a249sjb7',
        'cmwqdf5ji0001s60101l4203z',
        'cmwns2yog0001s6014rng8e68',
        'cmwnl9ftz0001s601wk54wtfz'
      ];
      const allReturnedTags = [...ownLoanTags, ...ownReqTags];
      const allReturnedIds = [
        ...(myData.loans ?? []).map(l => l.id),
        ...(myData.requests ?? []).map(r => r.id)
      ];
      const leakedTagCount = allReturnedTags.filter(t => borrowerFullAssets.includes(t)).length;
      const leakedIdCount = allReturnedIds.filter(id => borrowerFullIds.includes(id)).length;

      const pwd = window.prompt('Enter BORROWER_FREE demo password for 2-session FR-03 check (not logged):');
      if (!pwd) return { verdict: 'ABORTED_NO_PASSWORD_INPUT' };

      const loginSession = async () => {
        const r = await fetch('/api/v1/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: 'borrower2@cpe.kmutt.ac.th', password: pwd })
        });
        return (await r.json())?.data?.token;
      };

      const tokenA = await loginSession();
      const tokenB = await loginSession();

      const preA = await fetch('/api/v1/auth/me', { headers: { Authorization: `Bearer ${tokenA}` } });
      const preB = await fetch('/api/v1/auth/me', { headers: { Authorization: `Bearer ${tokenB}` } });

      const logoutA = await fetch('/api/v1/auth/logout', {
        method: 'POST',
        headers: { Authorization: `Bearer ${tokenA}` }
      });

      const postRevokeA = await fetch('/api/v1/auth/me', { headers: { Authorization: `Bearer ${tokenA}` } });
      const postRevokeABody = await postRevokeA.json().catch(() => ({}));

      const concurrentB = await fetch('/api/v1/auth/me', { headers: { Authorization: `Bearer ${tokenB}` } });

      const cleanupB = await fetch('/api/v1/auth/logout', {
        method: 'POST',
        headers: { Authorization: `Bearer ${tokenB}` }
      });
      const postCleanupB = await fetch('/api/v1/auth/me', { headers: { Authorization: `Bearer ${tokenB}` } });

      const summary = {
        caseId: 'UAT-EF-05',
        capturedAtIct: new Date().toLocaleString('sv-SE', { timeZone: 'Asia/Bangkok' }).replace(' ', 'T') + '+07:00',
        ownershipIsolation_FR11: {
          httpStatus: myRes.status,
          positiveOwnRecordPresent_CPE_RPI_002: ownLoanTags.includes('CPE-RPI-002'),
          ownLoanCount: ownLoanTags.length,
          ownRequestCount: ownReqTags.length,
          checkedAgainstBorrowerFullAssets: borrowerFullAssets,
          leakedBorrowerFullAssetCount: leakedTagCount,
          leakedBorrowerFullRecordIdCount: leakedIdCount,
          isolationPassed: ownLoanTags.includes('CPE-RPI-002') && leakedTagCount === 0 && leakedIdCount === 0
        },
        perSessionRevocation_FR03: {
          sessionA_beforeLogoutStatus: preA.status,
          sessionB_beforeLogoutStatus: preB.status,
          sessionA_logoutStatus: logoutA.status,
          sessionA_afterLogoutStatus: postRevokeA.status,
          sessionA_afterLogoutErrorCode: postRevokeABody?.error?.code ?? null,
          sessionA_afterLogoutErrorMessage: postRevokeABody?.error?.message ?? null,
          sessionB_concurrentWhileARevokedStatus: concurrentB.status,
          sessionB_cleanupLogoutStatus: cleanupB.status,
          sessionB_afterCleanupStatus: postCleanupB.status
        }
      };
      console.log('UAT-EF-05 Sanitized Result:', JSON.stringify(summary, null, 2));
      return summary;
    })();
    ```
* **Numbered User Actions:**
  1. While signed in at `https://equipflow-ddqo5fpv2a-as.a.run.app` as **`BORROWER_FREE`** (`borrower2@cpe.kmutt.ac.th`), click the **`My Requests`** tab in the top navigation bar.
  2. Visually confirm that **`Active Loans (1)`** displays **`CPE-RPI-002`** (`Raspberry Pi 4 Model B 8GB`), and verify that **none** of `BORROWER_FULL`'s items (`CPE-OSC-001`, `CPE-OSC-002`, `CPE-FPG-001`) appear anywhere on the page.
  3. Open Browser DevTools Console (`F12` $\rightarrow$ **Console**), paste the Sanitized DevTools Console Verification Script above, press `Enter`, and enter the `BORROWER_FREE` password into the browser prompt dialog when requested.
  4. Inspect the printed `UAT-EF-05 Sanitized Result` JSON in the Console (confirming zero tokens or passwords are printed) and capture screenshot `EV-TH017-05`.
  5. Click **`Sign Out`** in the top navigation bar to also test UI logout, confirming the browser returns to the Sign-In view and clears `localStorage.getItem('equipflow_token')`.
* **Expected Results:**
  - **Cross-Borrower Ownership Isolation (`FR-11` / `AC-REQ-06` / `API-01-19`):** `positiveOwnRecordPresent_CPE_RPI_002 === true`, `leakedBorrowerFullAssetCount === 0`, `leakedBorrowerFullRecordIdCount === 0`, and `isolationPassed === true`.
  - **Per-Token Revocation & Concurrent Session Survival (`FR-03` / `AC-AUTH-04` & `AC-AUTH-05` / `API-01-05`–`07`):**
    - `sessionA_beforeLogoutStatus === 200` and `sessionB_beforeLogoutStatus === 200`.
    - `sessionA_logoutStatus === 200`.
    - `sessionA_afterLogoutStatus === 401` with `sessionA_afterLogoutErrorCode === "TOKEN_REVOKED"` *(and released `auth.middleware.ts` message `"Token has been revoked"`).*
    - `sessionB_concurrentWhileARevokedStatus === 200` (proving `AC-AUTH-05`: logging out `Session A` does not invalidate concurrent `Session B` for the same user).
    - `sessionB_cleanupLogoutStatus === 200` and `sessionB_afterCleanupStatus === 401` (disposable session cleanly revoked).

---

### Case `UAT-EF-01` *(Run 5th)* — Normal Domain Journey: Authentication Checks, Borrower Reservation of `CPE-RPI-001` & Custodian Physical Checkout

* **Mandatory Category:** 1. Normal Domain Journey
* **Sprint 1 Requirement / AC / STS Reference:** `FR-01`, `FR-02`, `FR-05`, `FR-06`, `FR-09`, `FR-13`, `FR-14`, `BR-01`, `BR-05`, `BR-08` (`AC-AUTH-01`, `AC-AUTH-02`, `AC-AUTH-03`, `AC-CAT-01`, `AC-CAT-02`, `AC-REQ-01`, `AC-CHK-01`, `AC-CHK-02`, `AC-CHK-03`, `AC-CHK-04`, `E2E-01-01`)
* **Assigned `TH-017` Testers:**
  - **Borrower Steps (Steps 1–7):** `Kamonnat Seetakai` (`67070501001`)
  - **Custodian Steps (Steps 8–11):** `Benyapha Rattanakhunodom` (`67070501030`)
* **Purpose:** Verify the complete end-to-end Sprint 1 vertical slice on the designated `AVAILABLE` asset **`CPE-RPI-001`** (`seed_item_cpe_rpi_001`):
  1. Invalid login rejection (`AC-AUTH-02`) and valid Borrower authentication + `/api/v1/auth/me` profile check (`AC-AUTH-01`, `AC-AUTH-03`).
  2. Catalog browsing & detail modal inspection (`AC-CAT-01`, `AC-CAT-02`) and borrow request submission (`AC-REQ-01`), capturing the newly created `requestId` in `status: "PENDING"` and verifying **`CPE-RPI-001`** transitions to `status: "RESERVED"`.
  3. Custodian authentication (`AC-AUTH-01`), triage queue review (`AC-CHK-01`), and physical checkout execution (`AC-CHK-02`), matching the **exact same `requestId`** to its updated `status: "APPROVED"`, matching **`CPE-RPI-001`** to `status: "CHECKED_OUT"`, and verifying the **single newly created `ACTIVE` loan (`loanId`)** has `custodian.studentOrStaffId === "STAFF-001"` (`BR-08` / `AC-CHK-04`) and `dueDate - checkedOutAt === 7 days` (`604,800,000` ms, `BR-05` / `AC-CHK-03`).
* **Actor Roles:**
  1. `BORROWER_FREE` — `borrower2@cpe.kmutt.ac.th` (`Student Borrower Two`, synthetic seed ID `"67070501002"`)
  2. `CUSTODIAN_STAFF` — `custodian@cpe.kmutt.ac.th` (`CPE Lab Custodian`, synthetic seed ID `"STAFF-001"`)
* **Preconditions:**
  1. Non-mutating cases `UAT-EF-02`, `UAT-EF-03`, `UAT-EF-04`, and `UAT-EF-05` have been completed.
  2. **`CPE-RPI-001`** (`id: "seed_item_cpe_rpi_001"`) is strictly `"AVAILABLE"` and `BORROWER_FREE` has `activeQuota.current === 1` (`1 / 3`).
* **Synthetic Inputs (`Run ID = R01`):**
  - **Invalid Login Check Input:** Email `borrower2@cpe.kmutt.ac.th`, Password `WrongPassword999!`
  - **Valid Borrower Login:** Email `borrower2@cpe.kmutt.ac.th`, Password `<PROVIDED_PRIVATELY_TO_TH017>`
  - **Target Asset Tag:** **`CPE-RPI-001`** (`Raspberry Pi 4 Model B 4GB`, `id: "seed_item_cpe_rpi_001"`)
  - **Academic Purpose / Course Project Notes:** `UAT-TH017-R01-REQ: Raspberry Pi 4B embedded lab verification`
  - **Valid Custodian Login:** Email `custodian@cpe.kmutt.ac.th`, Password `<PROVIDED_PRIVATELY_TO_TH017>`
  - **Checkout Staff Notes:** `UAT-TH017-R01-CHK: Verified student ID 67070501002; handed over CPE-RPI-001.`
* **Numbered User Actions:**
  1. **Invalid Credential Check (`AC-AUTH-02` / `UI-01-02`):** Open `https://equipflow-ddqo5fpv2a-as.a.run.app`. Confirm the login card displays `EquipFlow — CPE Hardware Lending`, `Department of Computer Engineering · KMUTT`, and the `Lending Policy` banner (`Up to 3 pending requests and active loans combined · 7-day standard loan period`). Enter Email `borrower2@cpe.kmutt.ac.th` and an intentionally wrong password `WrongPassword999!`, then click **`Sign In`**. Verify the red alert banner (`"Invalid email or password."`) renders while preserving `borrower2@cpe.kmutt.ac.th` in the email field.
  2. **Valid Borrower Login & Identity Check (`AC-AUTH-01`, `AC-AUTH-03`):** Enter the valid privately provided password for **`BORROWER_FREE`** (`borrower2@cpe.kmutt.ac.th`) and click **`Sign In`**. Confirm the top navbar shows `Signed in as: Student Borrower Two` with badge `BORROWER` and the catalog header badge shows **`📋 My Active Items: 1 / 3`**.
  3. **Catalog & Detail Modal Check (`AC-CAT-01`, `AC-CAT-02`):** Locate the **`CPE-RPI-001`** (`Raspberry Pi 4 Model B 4GB`) card showing badge **`● AVAILABLE`**. Click **`View Details`**, confirm the modal shows Category `Microcontrollers`, Model `RPI4-4GB`, Serial number `RPI4-4GB-001`, Condition `GOOD`, and Availability `AVAILABLE`, then click **`Close`**.
  4. **Submit Borrow Request (`AC-REQ-01`):** On the **`CPE-RPI-001`** card, click **`Request to Borrow`**. Enter `UAT-TH017-R01-REQ: Raspberry Pi 4B embedded lab verification` in **`Academic Purpose / Course Project Notes (optional)`**, then click **`Confirm Request`**.
  5. Observe the green confirmation banner (`Request submitted successfully! CPE-RPI-001 is now reserved.`) and close the modal. Confirm the **`CPE-RPI-001`** card badge updates to **`◉ RESERVED`** with disabled button **`Reserved`**, and the header badge updates to **`📋 My Active Items: 2 / 3`**.
  6. **Capture Linked Pre-Checkout State (`PENDING` Request & `RESERVED` Item):** Open Browser DevTools Console (`F12` $\rightarrow$ **Console**) and run Checkpoint Script 1A below to record the newly created `requestId` in `sessionStorage` so it can be matched after checkout and in `UAT-EF-06`:
     ```javascript
     await (async () => {
       const token = localStorage.getItem('equipflow_token');
       const hdr = { Authorization: `Bearer ${token}` };
       const me = (await (await fetch('/api/v1/auth/me', { headers: hdr })).json()).data?.user;
       const item = (await (await fetch('/api/v1/items/seed_item_cpe_rpi_001', { headers: hdr })).json()).data;
       const my = (await (await fetch('/api/v1/requests/my', { headers: hdr })).json()).data;
       const createdReq = (my.requests ?? []).find(r => r.itemId === 'seed_item_cpe_rpi_001' && r.requestNote?.startsWith('UAT-TH017-R01-REQ'));
       if (createdReq) sessionStorage.setItem('uat_ef01_request_id', createdReq.id);
       const snap = {
         checkpoint: 'UAT-EF-01_STEP6_PRE_CHECKOUT',
         capturedAtIct: new Date().toLocaleString('sv-SE', { timeZone: 'Asia/Bangkok' }).replace(' ', 'T') + '+07:00',
         authMeRole: me?.role ?? null,
         authMeStudentIdTag: me?.studentOrStaffId ?? null,
         createdRequestId: createdReq?.id ?? null,
         createdRequestStatus: createdReq?.status ?? null,
         createdRequestNote: createdReq?.requestNote ?? null,
         itemAssetTag: item?.assetTag ?? null,
         itemStatus: item?.status ?? null,
         quotaAfterRequest: my?.quota ?? null
       };
       console.log('UAT-EF-01 Step 6 Pre-Checkout Snapshot:', JSON.stringify(snap, null, 2));
       return snap;
     })();
     ```
  7. Capture screenshot `EV-TH017-01A` (Borrower reservation state & Console output), then click **`Sign Out`**.
  8. **Custodian Login & Triage Queue Verification (`AC-CHK-01`):** Sign in as **`CUSTODIAN_STAFF`** (`custodian@cpe.kmutt.ac.th`). On the **`Custodian Triage & Checkout Desk`**, locate the row in **`Pending Requests`** for Student Name **`Student Borrower Two`**, Student ID **`67070501002`**, Asset Tag **`CPE-RPI-001`**, and Notes **`UAT-TH017-R01-REQ: Raspberry Pi 4B embedded lab verification`**. *(⚠️ Do NOT click `Approve & Checkout` on `Student Borrower One`'s `CPE-OSC-002` or `CPE-FPG-001` rows!)*
  9. **Execute Physical Checkout (`AC-CHK-02`):** Click **`Approve & Checkout`** on `Student Borrower Two`'s **`CPE-RPI-001`** row. In the **`Confirm Physical Checkout`** modal, verify Borrower `Student Borrower Two (67070501002)`, Equipment `CPE-RPI-001 (Raspberry Pi 4 Model B 4GB)`, and the 7-day **`📅 Scheduled Due Date`** callout. Enter `UAT-TH017-R01-CHK: Verified student ID 67070501002; handed over CPE-RPI-001.` into **`Checkout Staff Notes (optional)`** and click **`Confirm Physical Checkout`**.
  10. Observe the green banner `Checkout recorded for CPE-RPI-001.` Confirm `Student Borrower Two`'s `CPE-RPI-001` row is removed from **`Pending Requests`** and added to **`Active Loans Monitor`** with Accountable Custodian **`CPE Lab Custodian`**.
  11. **Capture Linked Post-Checkout State (`CHECKED_OUT` Item, Single `ACTIVE` Loan, 7-Day Due Date & Custodian Attribution):** In DevTools Console (`F12`), run Checkpoint Script 1B below and capture screenshot `EV-TH017-01B`:
      ```javascript
      await (async () => {
        const token = localStorage.getItem('equipflow_token');
        const hdr = { Authorization: `Bearer ${token}` };
        const reqId = sessionStorage.getItem('uat_ef01_request_id');
        const item = (await (await fetch('/api/v1/items/seed_item_cpe_rpi_001', { headers: hdr })).json()).data;
        const desk = (await (await fetch('/api/v1/custodian/requests', { headers: hdr })).json()).data;
        const matchingPending = (desk.requests ?? []).filter(r => r.id === reqId || r.item?.assetTag === 'CPE-RPI-001');
        const matchingLoans = (desk.activeLoans ?? []).filter(l => l.item?.assetTag === 'CPE-RPI-001');
        const loan = matchingLoans[0] ?? null;
        if (loan) sessionStorage.setItem('uat_ef01_loan_id', loan.id);
        const diffMs = loan ? (Date.parse(loan.dueDate) - Date.parse(loan.checkedOutAt)) : null;
        const snap = {
          checkpoint: 'UAT-EF-01_STEP11_POST_CHECKOUT',
          capturedAtIct: new Date().toLocaleString('sv-SE', { timeZone: 'Asia/Bangkok' }).replace(' ', 'T') + '+07:00',
          linkedRequestId: reqId,
          stillInPendingQueueCount: matchingPending.length,
          activeLoanCountForAsset: matchingLoans.length,
          createdLoanId: loan?.id ?? null,
          itemAssetTag: item?.assetTag ?? null,
          itemStatusAfterCheckout: item?.status ?? null,
          borrowerStudentIdTag: loan?.borrower?.studentOrStaffId ?? null,
          accountableCustodianName: loan?.custodian?.fullName ?? null,
          accountableCustodianStaffId: loan?.custodian?.studentOrStaffId ?? null,
          checkedOutAt: loan?.checkedOutAt ?? null,
          dueDate: loan?.dueDate ?? null,
          dueDateMinusCheckedOutAtMs: diffMs,
          isExactlySevenDays: diffMs === 7 * 24 * 60 * 60 * 1000
        };
        console.log('UAT-EF-01 Step 11 Post-Checkout Snapshot:', JSON.stringify(snap, null, 2));
        return snap;
      })();
      ```
* **Expected Results:**
  - **Step 1 (`AC-AUTH-02`):** Wrong password attempt returns HTTP `401` (`INVALID_CREDENTIALS`), displays `"Invalid email or password."`, and preserves `borrower2@cpe.kmutt.ac.th`.
  - **Step 2–6 (`AC-AUTH-01`, `AC-AUTH-03`, `AC-CAT-01`, `AC-CAT-02`, `AC-REQ-01`):** `authMeRole === "BORROWER"`, `createdRequestId` is non-null with `createdRequestStatus === "PENDING"`, `itemStatus === "RESERVED"`, and `quotaAfterRequest` shows `activeQuota: 2, pendingRequestsCount: 1, activeLoansCount: 1`.
  - **Step 8–11 (`AC-CHK-01`–`04`, `BR-05`, `BR-08`):** `stillInPendingQueueCount === 0`, `activeLoanCountForAsset === 1` (single `ACTIVE` loan created), `itemStatusAfterCheckout === "CHECKED_OUT"`, `accountableCustodianName === "CPE Lab Custodian"`, `accountableCustodianStaffId === "STAFF-001"`, `dueDateMinusCheckedOutAtMs === 604800000`, and `isExactlySevenDays === true`.

---

### Case `UAT-EF-06` *(Run 6th)* — State / History / Persistence Case: Linked Request/Loan History & State Persistence Across Browser Refresh, Re-Login & Custodian Monitor Recheck

* **Mandatory Category:** 4. State, History, or Persistence Case
* **Sprint 1 Requirement / AC / STS Reference:** `FR-10`, `BR-05`, `BR-08` (`AC-REQ-05`, `AC-CHK-03`, `AC-CHK-04`, `API-01-18`, `UI-01-07`) *(Note: Browser refresh and session re-login persistence map to `FR-10` / `AC-REQ-05` / `API-01-18` / `UI-01-07`. SRS `NFR-05` covers server process restart and migration reproducibility, which is verified separately in [`docs/labs/lab-05/persistence.md`](../lab-05/persistence.md).)*
* **Assigned `TH-017` Testers:**
  - **Borrower Refresh & Re-Login Checks (Steps 1–5):** `Kamonnat Seetakai` (`67070501001`)
  - **Custodian Monitor Persistence Recheck (Step 6):** `Benyapha Rattanakhunodom` (`67070501030`)
* **Purpose:** Consume the **exact `requestId` and `loanId` created in `UAT-EF-01`** (before any database reset) and verify that the linked request approval (`request.status === "APPROVED"`), the active loan record (`loan.id`, `checkedOutAt`, `dueDate`), the pre-seeded active loan (`seed_loan_checked_out` on `CPE-RPI-002` with `checkedOutAt: 2026-11-12T00:00:00.000Z` and `dueDate: 2026-11-19T00:00:00.000Z`), the borrower quota (`2 / 3`: `pendingRequestsCount: 0, activeLoansCount: 2`), the catalog item status (`CPE-RPI-001: CHECKED_OUT`), and the Custodian `Active Loans Monitor` remain identical before and after (a) a hard browser refresh (`Ctrl+F5`) and (b) a full sign-out and fresh re-login.
* **Actor Roles:** `BORROWER_FREE` (`borrower2@cpe.kmutt.ac.th`) and `CUSTODIAN_STAFF` (`custodian@cpe.kmutt.ac.th`)
* **Preconditions:**
  1. Executed **6th** immediately after `UAT-EF-01` on the same browser tab where `sessionStorage.getItem('uat_ef01_request_id')` and `sessionStorage.getItem('uat_ef01_loan_id')` were recorded (or matching the `createdRequestId` and `createdLoanId` logged in `UAT-EF-01`).
  2. No database reset has been performed between `UAT-EF-01` and `UAT-EF-06`.
* **Synthetic Inputs:**
  - **Borrower Login:** `borrower2@cpe.kmutt.ac.th` (`BORROWER_FREE`) / `<PROVIDED_PRIVATELY_TO_TH017>`
  - **Custodian Login:** `custodian@cpe.kmutt.ac.th` (`CUSTODIAN_STAFF`) / `<PROVIDED_PRIVATELY_TO_TH017>`
  - **Chained Identifiers from `UAT-EF-01`:** `uat_ef01_request_id` and `uat_ef01_loan_id` on asset **`CPE-RPI-001`** (`seed_item_cpe_rpi_001`).
  - **Sanitized DevTools Console Verification Script (Run at Checkpoint A [Initial Login], Checkpoint B [After Hard Refresh], and Checkpoint C [After Sign-Out & Fresh Re-Login]):**
    ```javascript
    await (async () => {
      const token = localStorage.getItem('equipflow_token');
      const hdr = { Authorization: `Bearer ${token}` };
      const expectedReqId = sessionStorage.getItem('uat_ef01_request_id');
      const expectedLoanId = sessionStorage.getItem('uat_ef01_loan_id');

      const item = (await (await fetch('/api/v1/items/seed_item_cpe_rpi_001', { headers: hdr })).json()).data;
      const my = (await (await fetch('/api/v1/requests/my', { headers: hdr })).json()).data;

      const uatReq = (my.requests ?? []).find(r => (expectedReqId ? r.id === expectedReqId : r.item?.assetTag === 'CPE-RPI-001'));
      const uatLoan = (my.loans ?? []).find(l => (expectedLoanId ? l.id === expectedLoanId : l.item?.assetTag === 'CPE-RPI-001'));
      const seedLoan = (my.loans ?? []).find(l => l.id === 'seed_loan_checked_out');

      const uiPendingSectionHeading = document.querySelector('#pending-requests-subheading')?.textContent?.trim() ?? null;
      const uiActiveLoansHeading = document.querySelector('#active-loans-subheading')?.textContent?.trim() ?? null;

      const snap = {
        caseId: 'UAT-EF-06',
        capturedAtIct: new Date().toLocaleString('sv-SE', { timeZone: 'Asia/Bangkok' }).replace(' ', 'T') + '+07:00',
        catalogItem_CPE_RPI_001_Status: item?.status ?? null,
        quota: my?.quota ?? null,
        chainedUatRequest: {
          id: uatReq?.id ?? null,
          matchesEf01RequestId: expectedReqId ? uatReq?.id === expectedReqId : null,
          apiStatus: uatReq?.status ?? null,
          assetTag: uatReq?.item?.assetTag ?? null,
          requestNote: uatReq?.requestNote ?? null
        },
        chainedUatLoan: {
          id: uatLoan?.id ?? null,
          matchesEf01LoanId: expectedLoanId ? uatLoan?.id === expectedLoanId : null,
          apiStatus: uatLoan?.status ?? null,
          assetTag: uatLoan?.item?.assetTag ?? null,
          checkedOutAt: uatLoan?.checkedOutAt ?? null,
          dueDate: uatLoan?.dueDate ?? null,
          isSevenDayDuration: uatLoan ? (Date.parse(uatLoan.dueDate) - Date.parse(uatLoan.checkedOutAt) === 604800000) : false
        },
        preSeededLoan_CPE_RPI_002: {
          id: seedLoan?.id ?? null,
          assetTag: seedLoan?.item?.assetTag ?? null,
          checkedOutAt: seedLoan?.checkedOutAt ?? null,
          dueDate: seedLoan?.dueDate ?? null
        },
        uiHeadingsObserved: {
          activeLoansHeading: uiActiveLoansHeading,
          requestsSectionHeading: uiPendingSectionHeading,
          uiNote: 'MyRequests.tsx renders all borrower requests (including apiStatus APPROVED) in the lower table with a static Pending Approval badge, while quota.pendingRequestsCount is 0.'
        }
      };
      console.log('UAT-EF-06 Persistence Snapshot:', JSON.stringify(snap, null, 2));
      return snap;
    })();
    ```
* **Numbered User Actions:**
  1. **Checkpoint A (Initial Post-Checkout Login as `BORROWER_FREE`):** Sign out from `CUSTODIAN_STAFF` after `UAT-EF-01`, sign in as **`BORROWER_FREE`** (`borrower2@cpe.kmutt.ac.th`), confirm the catalog header badge shows **`📋 My Active Items: 2 / 3`** and the **`CPE-RPI-001`** card displays **`● CHECKED OUT`** with disabled button **`Checked Out`**.
  2. Click the **`My Requests`** tab. Inspect the **`Personal Borrowing Quota`** banner (`2 / 3 Items Active`), the **`Active Loans (2)`** table (showing both **`CPE-RPI-001`** with its new 7-day due date and pre-seeded **`CPE-RPI-002`** with `Checked Out At: 12 Nov 2026` and `Due Date: 19 Nov 2026`), and the lower requests table. Run the Sanitized DevTools Console Verification Script above (`Checkpoint A`).
  3. **Checkpoint B (After Hard Browser Refresh):** Press `Ctrl+F5` (or `Cmd+Shift+R`) to perform a hard browser reload, navigate back to **`My Requests`**, and re-run the Sanitized DevTools Console Verification Script above (`Checkpoint B`). Confirm all IDs, statuses, timestamps, and counts match Checkpoint A.
  4. **Checkpoint C (After Full Sign-Out & Fresh Re-Login):** Click **`Sign Out`** in the top navbar, confirm the Sign-In card renders, sign back in fresh as **`BORROWER_FREE`** (`borrower2@cpe.kmutt.ac.th`), open **`My Requests`**, and re-run the Sanitized DevTools Console Verification Script (`Checkpoint C`). Capture screenshot `EV-TH017-06A`.
  5. Record both the **API request status assertion** (`chainedUatRequest.apiStatus === "APPROVED"`, `quota.pendingRequestsCount === 0`) and the **UI table observation** (`MyRequests.tsx` lists historical `APPROVED` requests in the `Pending Requests (2)` table with a static `⏳ Pending Approval` badge).
  6. **Checkpoint D (Custodian Active Loans Monitor Recheck):** Click **`Sign Out`**, sign back in as **`CUSTODIAN_STAFF`** (`custodian@cpe.kmutt.ac.th`), and verify on **`Custodian Triage & Checkout Desk`** that `Pending Requests (2)` still contains only `Student Borrower One`'s two retained requests (`CPE-FPG-001` and `CPE-OSC-002`), while **`Active Loans Monitor (3)`** persists the new **`CPE-RPI-001`** loan (`Student Borrower Two`, `CPE Lab Custodian`) alongside `CPE-RPI-002` and `CPE-OSC-001`. Capture screenshot `EV-TH017-06B`.
* **Expected Results:**
  - **Identical Linked State Across Checkpoints A, B, and C (`FR-10` / `AC-REQ-05` / `API-01-18` / `UI-01-07`):**
    - `catalogItem_CPE_RPI_001_Status === "CHECKED_OUT"`.
    - `quota` equals `{ activeQuota: 2, maxQuota: 3, pendingRequestsCount: 0, activeLoansCount: 2 }`.
    - `chainedUatRequest.id` matches `uat_ef01_request_id` (`matchesEf01RequestId === true`) and `chainedUatRequest.apiStatus === "APPROVED"`.
    - `chainedUatLoan.id` matches `uat_ef01_loan_id` (`matchesEf01LoanId === true`), `chainedUatLoan.apiStatus === "ACTIVE"`, and `isSevenDayDuration === true`.
    - `preSeededLoan_CPE_RPI_002` retains `checkedOutAt === "2026-11-12T00:00:00.000Z"` (`12 Nov 2026`) and `dueDate === "2026-11-19T00:00:00.000Z"` (`19 Nov 2026`).
  - **Checkpoint D (Custodian Monitor Persistence):** `Active Loans Monitor (3)` on `/custodian/desk` displays the persisted `CPE-RPI-001` loan attributed to `Student Borrower Two` and `CPE Lab Custodian` (`STAFF-001`) with identical dates.

---

## 5. Independent UAT Execution Record Template (For Team `TH-017` — `2 auan`)

> [!NOTE]
> **Execution & Evidence Instructions for Team `TH-017` (`Kamonnat Seetakai` `67070501001` & `Benyapha Rattanakhunodom` `67070501030`):**
> 1. **Execute in mandatory order `UAT-EF-02` $\rightarrow$ `03` $\rightarrow$ `04` $\rightarrow$ `05` $\rightarrow$ `01` $\rightarrow$ `06`** on `https://equipflow-ddqo5fpv2a-as.a.run.app` (`equipflow-00009-kns`, commit `8217beff7d33b2fc7657c36824d4a22a0df6bb94`).
> 2. **Keep Expected vs. Actual separate:** In the `Actual Result Observed (UI & Sanitized API)` column, write what you actually observed (including the exact `createdRequestId`, `createdLoanId`, HTTP status/error code, and any contract discrepancy observed) — **never copy-paste the expected result**.
> 3. **Screenshot Hygiene:** Every screenshot (`EV-TH017-01A`..`06B`) must keep the browser address bar (`https://equipflow-ddqo5fpv2a-as.a.run.app`) visible and must **never** expose plaintext passwords, JWT tokens, or `Authorization` headers.

| Run Order & Case ID | Mandatory Category & Req / AC Ref | Assigned `TH-017` Tester (Full Name & Real Student ID) | Execution Timestamp (ICT) | Tested Release SHA & Cloud Run Revision | Live URL Visible in Capture | Exact Synthetic Inputs Used (`Run ID = R01`) | Expected Result Summary | Actual Result Observed *(Write actual UI & sanitized API observation — do not copy expected)* | Verdict (`PASS` / `FAIL` / `BLOCKED`) | Evidence ID / Screenshot Ref |
| :---: | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :---: | :---: |
| **1st · `UAT-EF-02`** | **2A. Business-Rule / Boundary**<br>`BR-04` / `AC-REQ-03` (`UI-01-06`, `API-01-16`) | **Kamonnat Seetakai**<br>(`TH-017` · `67070501001`) | `2026-11-__ __:__ ICT` | `8217beff7d33b2fc7657c36824d4a22a0df6bb94`<br>`equipflow-00009-kns` | `https://equipflow-ddqo5fpv2a-as.a.run.app` | Account: `BORROWER_FULL` (`3/3`)<br>Target: `CPE-RPI-001` (`seed_item_cpe_rpi_001`)<br>Note: `UAT-TH017-R01-QUOTA-BREACH` | `CPE-RPI-001` is `AVAILABLE` with disabled `Limit Reached (3/3)` button; `POST /api/v1/requests` returns `400 EXCEEDS_ACTIVE_QUOTA`; asset & quota unchanged (`3/3`). | `[Record actual UI button state, HTTP status/code, and before/after stateUnchanged boolean]` | `[PASS / FAIL / BLOCKED]` | `EV-TH017-02` |
| **2nd · `UAT-EF-03`** | **2B. Business-Rule / Boundary**<br>`BR-01` / `AC-REQ-02` (`UI-01-05`, `API-01-15`) | **Kamonnat Seetakai**<br>(`TH-017` · `67070501001`) | `2026-11-__ __:__ ICT` | `8217beff7d33b2fc7657c36824d4a22a0df6bb94`<br>`equipflow-00009-kns` | `https://equipflow-ddqo5fpv2a-as.a.run.app` | Account: `BORROWER_FREE` (`1/3`)<br>API Targets: `CPE-LOG-001` (`MAINTENANCE`) & `CPE-RPI-002` (`CHECKED_OUT`)<br>Notes: `UAT-TH017-R01-MAINT-REJECT`, `UAT-TH017-R01-CHECKEDOUT-REJECT` | All 5 non-available cards show disabled buttons (`Maintenance`, `Checked Out`, `Reserved`); both `POST /api/v1/requests` calls return `400 ITEM_NOT_AVAILABLE`; inventory & history unchanged. | `[Record actual disabled buttons, HTTP 400 codes, and inventoryUnchanged/historyUnchanged booleans]` | `[PASS / FAIL / BLOCKED]` | `EV-TH017-03` |
| **3rd · `UAT-EF-04`** | **3A. Forbidden Role Guard**<br>`FR-04`, `BR-03` / `AC-AUTH-06`, `AC-AUTH-07` (`API-01-08`–`09`, `E2E-01-03`) | **Benyapha Rattanakhunodom**<br>(`TH-017` · `67070501030`) | `2026-11-__ __:__ ICT` | `8217beff7d33b2fc7657c36824d4a22a0df6bb94`<br>`equipflow-00009-kns` | `https://equipflow-ddqo5fpv2a-as.a.run.app/custodian/desk` | Account: `BORROWER_FREE` & Anonymous<br>Path: `/custodian/desk`<br>Read-only API: `GET /api/v1/custodian/requests` *(0 writes to `CPE-OSC-002`)* | Custodian Desk not mounted (`dataDisclosed: false`); note whether unauthorized toast renders; unauth `GET` returns `401 UNAUTHENTICATED`; borrower `GET` returns `403 FORBIDDEN_ROLE`. | `[Record actual UI view, toast presence/absence observation, and 401/403 status/code]` | `[PASS / FAIL / BLOCKED]` | `EV-TH017-04` |
| **4th · `UAT-EF-05`** | **3B. Ownership Isolation & Logout Revocation**<br>`FR-11`, `FR-03` / `AC-REQ-06`, `AC-AUTH-04`–`05` (`API-01-05`–`07`, `API-01-19`) | **Benyapha Rattanakhunodom**<br>(`TH-017` · `67070501030`) | `2026-11-__ __:__ ICT` | `8217beff7d33b2fc7657c36824d4a22a0df6bb94`<br>`equipflow-00009-kns` | `https://equipflow-ddqo5fpv2a-as.a.run.app` | Account: `BORROWER_FREE` (`1/3`)<br>Endpoints: `GET /api/v1/requests/my`, 2 disposable login sessions (`Session A`, `Session B`), `POST /api/v1/auth/logout` | Sees own `CPE-RPI-002`, zero leak of `BORROWER_FULL`'s 3 items (`isolationPassed: true`); after `Session A` logout, `Session A` returns `401 TOKEN_REVOKED` while `Session B` returns `200`, then `Session B` cleaned up (`401`). | `[Record actual isolationPassed boolean and Session A/B HTTP status codes & TOKEN_REVOKED code]` | `[PASS / FAIL / BLOCKED]` | `EV-TH017-05` |
| **5th (Part 1) · `UAT-EF-01A`** | **1. Normal Domain Journey (Borrower Auth & Request)**<br>`FR-01`–`02`, `FR-05`–`06`, `FR-09`, `BR-01` / `AC-AUTH-01`–`03`, `AC-CAT-01`–`02`, `AC-REQ-01` | **Kamonnat Seetakai**<br>(`TH-017` · `67070501001`) | `2026-11-__ __:__ ICT` | `8217beff7d33b2fc7657c36824d4a22a0df6bb94`<br>`equipflow-00009-kns` | `https://equipflow-ddqo5fpv2a-as.a.run.app` | Wrong pwd: `WrongPassword999!`<br>Valid: `BORROWER_FREE`<br>Target: `CPE-RPI-001`<br>Note: `UAT-TH017-R01-REQ: Raspberry Pi 4B embedded lab verification` | Wrong pwd shows alert & keeps email (`401 INVALID_CREDENTIALS`); valid login & detail modal (`RPI4-4GB-001`) succeed; request creates `createdRequestId` (`PENDING`), transitions `CPE-RPI-001` to `RESERVED`, quota `2/3`. | `[Record actual alert behavior, createdRequestId, itemStatus RESERVED, and quota 2/3]` | `[PASS / FAIL / BLOCKED]` | `EV-TH017-01A` |
| **5th (Part 2) · `UAT-EF-01B`** | **1. Normal Domain Journey (Custodian Checkout)**<br>`FR-13`–`14`, `BR-05`, `BR-08` / `AC-CHK-01`–`04` (`E2E-01-01`) | **Benyapha Rattanakhunodom**<br>(`TH-017` · `67070501030`) | `2026-11-__ __:__ ICT` | `8217beff7d33b2fc7657c36824d4a22a0df6bb94`<br>`equipflow-00009-kns` | `https://equipflow-ddqo5fpv2a-as.a.run.app` | Account: `CUSTODIAN_STAFF`<br>Target Request: `<createdRequestId>` on `CPE-RPI-001`<br>Note: `UAT-TH017-R01-CHK: Verified student ID 67070501002; handed over CPE-RPI-001.` | Checkout removes `<createdRequestId>` from pending queue, transitions `CPE-RPI-001` to `CHECKED_OUT`, creates single `ACTIVE` loan `<createdLoanId>` with `STAFF-001` and `dueDate - checkedOutAt === 604800000` ms (7 days). | `[Record actual createdLoanId, itemStatus CHECKED_OUT, custodian STAFF-001, checkedOutAt, and dueDate]` | `[PASS / FAIL / BLOCKED]` | `EV-TH017-01B` |
| **6th · `UAT-EF-06`** | **4. State, History & Persistence**<br>`FR-10`, `BR-05`, `BR-08` / `AC-REQ-05`, `AC-CHK-03`–`04` (`API-01-18`, `UI-01-07`) | **Kamonnat** *(Steps 1–5)* & **Benyapha** *(Step 6)* | `2026-11-__ __:__ ICT` | `8217beff7d33b2fc7657c36824d4a22a0df6bb94`<br>`equipflow-00009-kns` | `https://equipflow-ddqo5fpv2a-as.a.run.app` | Accounts: `BORROWER_FREE` (`Ctrl+F5` + Sign Out & Re-Login) & `CUSTODIAN_STAFF`<br>Chained IDs: `<createdRequestId>`, `<createdLoanId>` | Across initial view, hard refresh, and fresh re-login: `CPE-RPI-001` stays `CHECKED_OUT`, quota `2/3` (`pending: 0, loans: 2`), `<createdRequestId>` has `apiStatus: APPROVED`, `<createdLoanId>` & `CPE-RPI-002` (`12 Nov -> 19 Nov 2026`) persist in both Borrower & Custodian views. | `[Record actual persisted IDs, apiStatus APPROVED vs UI Pending Requests table badge observation, and Custodian Monitor count]` | `[PASS / FAIL / BLOCKED]` | `EV-TH017-06A`, `EV-TH017-06B` |
