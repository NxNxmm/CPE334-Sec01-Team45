# CPE334 Lab 6 (Part D) — Defect Resolution & RED/GREEN Evidence

**Course:** CPE 334 Software Engineering (Semester 1 / Year 3)  
**Assignment:** Lab 6 — Independent User Acceptance Testing and Defect Management (Part D: Defect Resolution)  
**Document ID:** `DEFECT-RESOLUTION-SPRINT-01`  
**Version:** `1.0.1` *(Fixed L6-4 Fix PR reference to `PR #51`, linked dedicated defect Issues `#52` & `#53`, and recorded `RED`/`GREEN` commit SHAs)*  
**Tracking Issues:** [Issue #45 (`L6-4`)](https://github.com/NxNxmm/CPE334-Sec01-Team45/issues/45) · [Issue #52 (`DEF-EF-01`)](https://github.com/NxNxmm/CPE334-Sec01-Team45/issues/52) · [Issue #53 (`DEF-EF-02`)](https://github.com/NxNxmm/CPE334-Sec01-Team45/issues/53)  
**L6-4 Fix Pull Request:** [PR `#51`](https://github.com/NxNxmm/CPE334-Sec01-Team45/pull/51) (`fix/lab6-def-ef-01-02 -> sprint-1-staging`)  
**Working Branch & Commits:** `fix/lab6-def-ef-01-02` *(branched from `sprint-1-staging` at `4e85a137ff2162e3225ccbfcfa244bca30902fcc`; `RED` test commit: `085ac7b815e6ddb544d0eb5c9d9c7fa86d138e71`; `GREEN` fix commit: `7ca93dfc3e0aafae8148e56843f7dd87ba7ced5d`)*  
**Team Members (`TH-045_P2` — EquipFlow):** `Norawit Mahaprom` (`67070501026` · `@NxNxmm`) & `Pawarisa Thongchua` (`67070501032` · `@itspxsh`)  
**Collaboration Mode:** **Joint Pair Resolution, Regression Testing & PR Review (`Handout §3.4`)**  
**Resolved Defects:** `DEF-EF-01` ([`#52`](https://github.com/NxNxmm/CPE334-Sec01-Team45/issues/52), `Minor`, `UI-SPEC-SPRINT-01 §3.1`, `STS E2E-01-03`) and `DEF-EF-02` ([`#53`](https://github.com/NxNxmm/CPE334-Sec01-Team45/issues/53), `Minor`, `FR-10`, `AC-REQ-05`, `UI-01-07`) — accepted in [`defect-triage.md`](./defect-triage.md) from Team `TH-017`'s `Run ID: R01` UAT report against Cloud Run revision `equipflow-00009-kns`.

---

## 1. Resolution Summary & Scope Decision

Team `TH-017` (`2 auan`) uncovered two legitimate, reproducible Minor UI contract defects (`DEF-EF-01` and `DEF-EF-02`) on EquipFlow `equipflow-00009-kns` (without any Critical or Major backend/security failures). Both defects were formally accepted in [`defect-triage.md` §2.2](./defect-triage.md) and resolved using strict **`RED -> GREEN`** test-driven correction on branch `fix/lab6-def-ef-01-02`:

| Defect ID | Linked Spec / UAT Case | Root Cause Before Fix | Implemented Correction (`GREEN`) | Files Changed |
| :---: | :--- | :--- | :--- | :--- |
| **`DEF-EF-01`** | `UAT-EF-04` (`FR-04`, `BR-03`, `UI-SPEC-SPRINT-01 §3.1`, `STS E2E-01-03`) | [`client/src/App.tsx`](../../../client/src/App.tsx) prevented mounting `<CustodianDesk />` when `user.role !== 'CUSTODIAN'`, but never checked `window.location.pathname`. Directly visiting `/custodian/desk` as a `BORROWER` kept `/custodian/desk` in the URL bar and silently displayed Catalog with no unauthorized alert. | Added `isCustodianRoute(pathname)` and a `[user]` `useEffect` + `popstate` guard that detects `user.role === 'BORROWER'` on `/custodian` paths, calls `window.history.replaceState(null, '', '/')`, resets tab to `'catalog'`, and renders a dismissible `role="alert"` (`alert-danger`) notice naming the restricted route. Cleared notice on logout. | [`client/src/App.tsx`](../../../client/src/App.tsx)<br>[`client/tests/sprint-1/AppAccessControl.test.tsx`](../../../client/tests/sprint-1/AppAccessControl.test.tsx) |
| **`DEF-EF-02`** | `UAT-EF-06` (`FR-10`, `AC-REQ-05`, `UI-01-07`) | [`client/src/components/MyRequests.tsx`](../../../client/src/components/MyRequests.tsx) (lines `121`, `234`, `251–260`) rendered all `data.requests` directly under `Pending Requests ({requests.length})` with a hardcoded `⏳ Pending Approval` badge—so already-approved requests (`APPROVED`, while `quota.pendingRequestsCount === 0`) appeared under `Pending Requests`. | Split `requests` into `pendingRequests` (`status === 'PENDING'`) and `processedRequests` (`status !== 'PENDING'`). `Pending Requests ({pendingRequests.length})` now shows strictly pending rows (`0` + empty message when none), and non-pending rows render under `Request History ({processedRequests.length})` with accurate status badges (`✓ Approved`, `✕ Rejected`, `— Cancelled`) via `getRequestStatusBadge()`. | [`client/src/components/MyRequests.tsx`](../../../client/src/components/MyRequests.tsx)<br>[`client/tests/sprint-1/MyRequests.test.tsx`](../../../client/tests/sprint-1/MyRequests.test.tsx) |

---

## 2. Step 1 — Reproducing Tests & Verbatim `RED` Execution Output

Before editing any application source file under `client/src/`, three reproducing tests (plus two positive regression tests) were added:
1. **`client/tests/sprint-1/AppAccessControl.test.tsx`** *(new file, 3 tests)*:
   - `DEF-EF-01: redirects BORROWER from /custodian/desk to / and renders a dismissible unauthorized alert` *(expected to fail `RED`)*
   - `DEF-EF-01 regression: allows CUSTODIAN on /custodian/desk without redirecting or showing an unauthorized alert`
   - `DEF-EF-01 regression: does not show an unauthorized alert when BORROWER visits /`
2. **`client/tests/sprint-1/MyRequests.test.tsx`** *(appended 2 tests; kept all 3 baseline tests intact)*:
   - `DEF-EF-02: excludes APPROVED requests from Pending Requests count and renders them under Request History with Approved badge` *(expected to fail `RED` using Team `TH-017` `EV-TH017-06A` payload)*
   - `DEF-EF-02: separates PENDING requests from APPROVED history when both statuses exist` *(expected to fail `RED`)*

### Verbatim `RED` Run Output (Executed Prior to `client/src/` Edits)

Command: `npm run test:client` · Exit Code: **`1`**

```text
> equipflow-sprint-1@0.1.0 test:client
> npm run test --workspace client

> @equipflow/client@0.1.0 test
> vitest run

 RUN  v5.1.0 C:/Year3/Semester 1/CPE334 Software Engineering/CPE334-Sec01-Team45/client

 ✓ tests/sprint-1/Catalog.test.tsx (6 tests) 290ms
 ✓ tests/sprint-1/CustodianDesk.test.tsx (3 tests) 287ms
 ✓ tests/sprint-1/Login.test.tsx (4 tests) 328ms
 ❯ tests/sprint-1/MyRequests.test.tsx (5 tests | 2 failed) 360ms
   ❯ Sprint 1 - My Requests & Loans UI (5)
     ✓ UI-01-07: renders active loans and pending requests with 7-day due date 170ms
     ✓ renders illustrative empty state when borrower has no active loans or requests 27ms
     ✓ renders error alert when fetching requests fails 14ms
     × DEF-EF-02: excludes APPROVED requests from Pending Requests count and renders them under Request History with Approved badge 97ms
     × DEF-EF-02: separates PENDING requests from APPROVED history when both statuses exist 49ms
 ❯ tests/sprint-1/AppAccessControl.test.tsx (3 tests | 1 failed) 1184ms
   ❯ Sprint 1 - Role-Based Route Guard (DEF-EF-01) (3)
     × DEF-EF-01: redirects BORROWER from /custodian/desk to / and renders a dismissible unauthorized alert 1153ms
     ✓ DEF-EF-01 regression: allows CUSTODIAN on /custodian/desk without redirecting or showing an unauthorized alert 15ms
     ✓ DEF-EF-01 regression: does not show an unauthorized alert when BORROWER visits / 12ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 3 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  tests/sprint-1/AppAccessControl.test.tsx > Sprint 1 - Role-Based Route Guard (DEF-EF-01) > DEF-EF-01: redirects BORROWER from /custodian/desk to / and renders a dismissible unauthorized alert
AssertionError: expected '/custodian/desk' to be '/' // Object.is equality

 FAIL  tests/sprint-1/MyRequests.test.tsx > Sprint 1 - My Requests & Loans UI > DEF-EF-02: excludes APPROVED requests from Pending Requests count and renders them under Request History with Approved badge
TestingLibraryElementError: Unable to find an accessible element with the role "heading" and name `/pending requests \(0\)/i`

 FAIL  tests/sprint-1/MyRequests.test.tsx > Sprint 1 - My Requests & Loans UI > DEF-EF-02: separates PENDING requests from APPROVED history when both statuses exist
TestingLibraryElementError: Unable to find an accessible element with the role "heading" and name `/pending requests \(1\)/i`

 Test Files  2 failed | 3 passed (5)
      Tests  3 failed | 18 passed (21)
   Start at  00:16:23
   Duration  5.59s
```

---

## 3. Step 2 — Minimal Fixes & Verbatim `GREEN` Verification Output

After implementing the fixes in [`client/src/App.tsx`](../../../client/src/App.tsx) and [`client/src/components/MyRequests.tsx`](../../../client/src/components/MyRequests.tsx), the full client test suite and TypeScript/Vite workspace production build passed cleanly.

### 3.1 Client Unit & Component Test Suite (`npm run test:client`)

Command: `npm run test:client` · Exit Code: **`0`** (`21 passed`, `0 failed`, `0 skipped`)

```text
> equipflow-sprint-1@0.1.0 test:client
> npm run test --workspace client

> @equipflow/client@0.1.0 test
> vitest run

 RUN  v5.1.0 C:/Year3/Semester 1/CPE334 Software Engineering/CPE334-Sec01-Team45/client

 ✓ tests/sprint-1/AppAccessControl.test.tsx (3 tests) 225ms
 ✓ tests/sprint-1/MyRequests.test.tsx (5 tests) 303ms
 ✓ tests/sprint-1/Catalog.test.tsx (6 tests) 324ms
 ✓ tests/sprint-1/CustodianDesk.test.tsx (3 tests) 333ms
 ✓ tests/sprint-1/Login.test.tsx (4 tests) 340ms

 Test Files  5 passed (5)
      Tests  21 passed (21)
   Start at  00:17:59
   Duration  4.65s (environment 73%, setup 16%, tests 7%, import 2%, worker 1%, transform 1%)
```

### 3.2 Workspace Typecheck & Production Build (`npm run build`)

Command: `npm run build` · Exit Code: **`0`**

```text
> equipflow-sprint-1@0.1.0 build
> npm run db:generate && npm run build --workspace client && npm run build --workspace server

✔ Generated Prisma Client (v6.19.3) to .\node_modules\@prisma\client in 78ms

> @equipflow/client@0.1.0 build
> tsc -b && vite build

vite v7.3.8 building client environment for production...
transforming...
✓ 32 modules transformed.
rendering chunks...
computing gzip size...
dist/index.html                   0.55 kB │ gzip:  0.33 kB
dist/assets/index-CFvp8iut.css  242.10 kB │ gzip: 32.96 kB
dist/assets/index-DUIxegCD.js   170.65 kB │ gzip: 53.05 kB
✓ built in 686ms

> @equipflow/server@0.1.0 build
> tsc -p tsconfig.json
```

### 3.3 Server Suite & CI Execution Note

- Zero server/API or Prisma schema files were modified in this fix branch (`fix/lab6-def-ef-01-02`).
- Local execution of `npm test` failed during Vitest global setup with `P1001: Can't reach database server at localhost:5433` because PostgreSQL was not running locally in this session.
- Full backend integration tests (`npm test`), Prisma migration/seed checks (`db:validate`, `db:migrate`, `db:seed`), production container build (`docker build`), and live HTTP `/api/health` + `/api/ready` + `/api/v1/auth/login` smoke checks run automatically via [`.github/workflows/ci-docker.yml`](../../../.github/workflows/ci-docker.yml) (`test-and-docker`) on [`PR #51`](https://github.com/NxNxmm/CPE334-Sec01-Team45/pull/51) targeting `sprint-1-staging`.

---

## 4. Handoff Notes for `L6-5` Independent Retest (`Team TH-017`)

Once **`L6-4` Fix [`PR #51`](https://github.com/NxNxmm/CPE334-Sec01-Team45/pull/51)** (`fix/lab6-def-ef-01-02 -> sprint-1-staging`, resolving Issues [`#45`](https://github.com/NxNxmm/CPE334-Sec01-Team45/issues/45), [`#52`](https://github.com/NxNxmm/CPE334-Sec01-Team45/issues/52), and [`#53`](https://github.com/NxNxmm/CPE334-Sec01-Team45/issues/53)) is reviewed and merged into `sprint-1-staging`, and a separate reviewed **Release PR (`sprint-1-staging -> main`)** under `L6-5` ([Issue `#46`](https://github.com/NxNxmm/CPE334-Sec01-Team45/issues/46)) passes CI and deploys the corrected Cloud Run revision, Team `TH-017` can verify both fixes non-destructively in production without needing a database reset:
1. **`DEF-EF-01` Retest:** Sign in as `BORROWER_FREE` (`borrower2@cpe.kmutt.ac.th`) and visit `https://equipflow-ddqo5fpv2a-as.a.run.app/custodian/desk` -> verify URL redirects cleanly to `/` (`window.location.pathname === '/'`), Catalog renders, Custodian Desk remains unmounted, and the dismissible unauthorized alert banner (`role="alert"`) appears.
2. **`DEF-EF-02` Retest:** Navigate to **My Requests** as `BORROWER_FREE` -> verify **Pending Requests (0)** shows `"No pending borrowing requests."` (matching `pendingRequestsCount: 0`), while `seed_request_checked_out` and `cmwuq6uo10001s601j8qbjvk4` render under **Request History (2)** with accurate **`✓ Approved`** badges.
