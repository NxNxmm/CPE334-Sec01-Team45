# Sprint 1 Test Plan & Traceability Matrix
**EquipFlow Hardware Inventory & Borrowing Verification**

**Document ID:** `TEST-PLAN-SPRINT-01`  
**Version:** `1.0.0`  
**Status:** Draft  
**Target Release:** `v0.1.0-sprint1`  

---

## 1. Test Strategy & Quality Plan

This document establishes the comprehensive Test Driven Development (TDD) and Test Driven Design (Test DD) plan for Sprint 1. In accordance with the CPE 334 engineering baseline, all domain rules, persistence integrity, access boundaries, and end-to-end user journeys are verified through automated test suites:

1. **Backend API & Integration Tests** (`server/tests/sprint-1/` via Vitest & Supertest):
   * Validating REST contracts, Prisma queries, transaction boundaries, optimistic locking, role authorization, and validation rules.
   * Real database integration running against isolated SQLite test databases (`DATABASE_URL="file:./test.db"`).
2. **Frontend UI Component Tests** (`client/tests/sprint-1/` via Vitest & React Testing Library):
   * Validating component rendering, form state management, role-based controls, button debouncing, and empty/error states.
3. **End-to-End (E2E) Browser Tests** (`e2e/sprint-1/` via Playwright):
   * Multi-role user journeys across Borrower and Custodian logins, catalog browsing, request submission, and custodian checkout.
   * Responsive viewport verification across desktop (1280px), tablet (768px), and mobile (375px), asserting zero horizontal scroll and visible keyboard focus rings.
4. **TDD Red-to-Green Evidence Strategy**:
   * For critical domain rules (`BR-01` availability, `BR-02` concurrency conflict, `BR-04` active quota limit $\le 3$, and `FR-03` token revocation), tests are written first.
   * Terminal output demonstrating the initial test failure (Red) is captured before implementing the service layer logic, followed by passing execution (Green).

---

## 2. Requirement & Acceptance Criteria Traceability Matrix

| Test ID | Type | Requirement / AC | What It Tests | Expected Result | Automated Test File | Final Status |
|---|---|---|---|---|---|:---:|
| **API-01-01** | API | FR-01 / AC-AUTH-01 | User login with valid email and password | Returns HTTP 200 with signed JWT Bearer token and sanitized user profile (no passwordHash) | `server/tests/sprint-1/auth.api.test.ts` | **Passed** |
| **API-01-02** | API | FR-01 / AC-AUTH-02 | User login with invalid password | Returns HTTP 401 with error code `INVALID_CREDENTIALS` | `server/tests/sprint-1/auth.api.test.ts` | **Passed** |
| **API-01-03** | API | FR-01 / AC-AUTH-02 | User login with non-existent email | Returns HTTP 401 with error code `INVALID_CREDENTIALS` | `server/tests/sprint-1/auth.api.test.ts` | **Passed** |
| **API-01-04** | API | FR-02 / AC-AUTH-03 | Fetch authenticated identity via `/api/v1/auth/me` | Returns HTTP 200 with matching authenticated user ID, email, and role | `server/tests/sprint-1/auth.api.test.ts` | **Passed** |
| **API-01-05** | API | FR-03 / AC-AUTH-04 | User logout via `POST /api/v1/auth/logout` | Returns HTTP 200; token `jti` persisted to `RevokedToken` table | `server/tests/sprint-1/auth.api.test.ts` | **Passed** |
| **API-01-06** | API | FR-03 / AC-AUTH-04 | Request protected endpoint using revoked token | Returns HTTP 401 Unauthorized with code `TOKEN_REVOKED` | `server/tests/sprint-1/auth.api.test.ts` | **Passed** |
| **API-01-07** | API | FR-03 / AC-AUTH-05 | Two concurrent sessions for same user; logout Session 1 | Session 1 returns HTTP 401; concurrent Session 2 continues to return HTTP 200 | `server/tests/sprint-1/auth.api.test.ts` | **Passed** |
| **API-01-08** | API | FR-04 / AC-AUTH-06 | Request protected endpoint without Authorization header | Returns HTTP 401 Unauthorized with code `UNAUTHENTICATED` | `server/tests/sprint-1/auth.api.test.ts` | **Passed** |
| **API-01-09** | API | FR-04 / AC-AUTH-07 | Borrower attempts to access `/api/v1/custodian/requests` | Returns HTTP 403 Forbidden with code `FORBIDDEN_ROLE` | `server/tests/sprint-1/auth.api.test.ts` | **Passed** |
| **API-01-10** | API | NFR-01 / AC-AUTH-08 | Verify password hashing in database | `passwordHash` string in DB begins with `$2a$` or `$2b$` and salt rounds $\ge 10$ | `server/tests/sprint-1/auth.api.test.ts` | **Passed** |
| **API-01-11** | API | FR-05 / AC-CAT-01 | Browse catalog via `GET /api/v1/items` | Returns HTTP 200 with array of equipment items and accurate availability statuses | `server/tests/sprint-1/catalog.api.test.ts` | Planned |
| **API-01-12** | API | FR-06 / AC-CAT-02 | Fetch single item details via `/api/v1/items/:id` | Returns HTTP 200 with technical description, serial number, and condition | `server/tests/sprint-1/catalog.api.test.ts` | Planned |
| **API-01-13** | API | FR-06 / AC-CAT-02 | Fetch non-existent item detail ID | Returns HTTP 404 Not Found with code `ITEM_NOT_FOUND` | `server/tests/sprint-1/catalog.api.test.ts` | Planned |
| **API-01-14** | API | FR-09 / AC-REQ-01 | Borrower submits request for `AVAILABLE` item | Returns HTTP 201; request status `PENDING`; item status updated to `RESERVED` | `server/tests/sprint-1/requests.api.test.ts` | Planned |
| **API-01-15** | API | BR-01 / AC-REQ-02 | Borrower submits request for `RESERVED` or `CHECKED_OUT` item | Returns HTTP 400 Bad Request with code `ITEM_NOT_AVAILABLE`; item status unchanged | `server/tests/sprint-1/requests.api.test.ts` | Planned |
| **API-01-16** | API | BR-04 / AC-REQ-03 | Borrower submits request when active quota $\ge 3$ | Returns HTTP 400 Bad Request with code `EXCEEDS_ACTIVE_QUOTA`; no request created | `server/tests/sprint-1/requests.api.test.ts` | Planned |
| **API-01-17** | API | BR-02 / AC-REQ-04 | Concurrent requests for the same available item | Exactly 1 request succeeds (HTTP 201); competing request rejected with HTTP 409 Conflict (`CONCURRENT_REQUEST_CONFLICT`) | `server/tests/sprint-1/requests.api.test.ts` | Planned |
| **API-01-18** | API | FR-10 / AC-REQ-05 | Borrower queries `/api/v1/requests/my` | Returns HTTP 200 with borrower's personal requests and active loans | `server/tests/sprint-1/requests.api.test.ts` | Planned |
| **API-01-19** | API | FR-11 / AC-REQ-06 | Cross-borrower data isolation check | Borrower A cannot view Borrower B's requests/loans; query results strictly scoped | `server/tests/sprint-1/requests.api.test.ts` | Planned |
| **API-01-20** | API | FR-13 / AC-CHK-01 | Custodian fetches pending triage queue | Returns HTTP 200 with list of pending requests, borrower details, and item tags | `server/tests/sprint-1/checkout.api.test.ts` | Planned |
| **API-01-21** | API | FR-14 / AC-CHK-02 | Custodian checks out reserved item | Returns HTTP 201; item status $\rightarrow$ `CHECKED_OUT`; request status $\rightarrow$ `APPROVED`; Loan created | `server/tests/sprint-1/checkout.api.test.ts` | Planned |
| **API-01-22** | API | BR-05 / AC-CHK-03 | Due date calculation check on checkout | Loan record stores `dueDate` exactly 7 days after `checkedOutAt` | `server/tests/sprint-1/checkout.api.test.ts` | Planned |
| **API-01-23** | API | BR-08 / AC-CHK-04 | Accountable custodian attribution check | Loan record stores `custodianId` matching authenticated custodian session | `server/tests/sprint-1/checkout.api.test.ts` | Planned |
| **API-01-24** | API | BR-02 / AC-CHK-05 | Duplicate checkout attempt on already checked out item | Returns HTTP 409 Conflict with code `CONCURRENT_CHECKOUT_CONFLICT` | `server/tests/sprint-1/checkout.api.test.ts` | Planned |
| **API-01-25** | API | BR-02 / AC-CHK-06 | Concurrent checkout calls for same pending request | Exactly 1 checkout succeeds (HTTP 201); second call returns HTTP 409 Conflict | `server/tests/sprint-1/checkout.api.test.ts` | Planned |
| **API-01-26** | API | BR-03 / AC-CHK-07 | Borrower attempts to invoke checkout endpoint | Returns HTTP 403 Forbidden with code `FORBIDDEN_ROLE` | `server/tests/sprint-1/checkout.api.test.ts` | Planned |
| **API-01-27** | API | BR-04 / AC-REQ-03 | Concurrent requests from same borrower exceeding quota (starts at 2, submits 2 items concurrently) | Exactly 1 request succeeds (total quota reaches 3); second request rejected with HTTP 400 (`EXCEEDS_ACTIVE_QUOTA`) | `server/tests/sprint-1/requests.api.test.ts` | Planned |
| **UI-01-01** | UI | AC-AUTH-01 | Login form rendering, credentials input & submit | Form renders email/password; button shows loading state during submit | `client/tests/sprint-1/Login.test.tsx` | **Passed** |
| **UI-01-02** | UI | AC-AUTH-02 | Invalid login alert banner rendering | Displays red alert banner upon HTTP 401; preserves entered email address | `client/tests/sprint-1/Login.test.tsx` | **Passed** |
| **UI-01-03** | UI | AC-CAT-01 | Catalog grid rendering & status badges | Cards render name, category, and correct badge (`.badge-avail`, `.badge-out`) | `client/tests/sprint-1/Catalog.test.tsx` | Planned |
| **UI-01-04** | UI | AC-CAT-02 | Detail modal opens with specs and serial number | Clicking item opens modal with full description, serial, and condition | `client/tests/sprint-1/Catalog.test.tsx` | Planned |
| **UI-01-05** | UI | AC-REQ-01 | Request button disabled when item is unavailable | "Request to Borrow" button is disabled with gray badge if status != AVAILABLE | `client/tests/sprint-1/Catalog.test.tsx` | Planned |
| **UI-01-06** | UI | AC-REQ-03 | Request button disabled when borrower active quota = 3 | Quota badge displays "3/3"; request buttons disable with "Limit Reached" | `client/tests/sprint-1/Catalog.test.tsx` | Planned |
| **UI-01-07** | UI | AC-REQ-05 | My Requests view displays pending requests & loans | Tables render active loans and pending requests with 7-day due date | `client/tests/sprint-1/MyRequests.test.tsx` | Planned |
| **UI-01-08** | UI | AC-CHK-01 | Custodian triage queue table rendering | Renders pending requests table with borrower name and "Approve & Checkout" button | `client/tests/sprint-1/CustodianDesk.test.tsx` | Planned |
| **E2E-01-01** | E2E | AC-REQ-01, AC-CHK-02 | Full Domain Journey: Borrower request to Custodian checkout | Borrower logs in, requests item -> Custodian logs in, checks out item -> DB verified | `e2e/sprint-1/domain-journey.spec.ts` | Planned |
| **E2E-01-02** | E2E | AC-REQ-02, AC-CHK-05 | Meaningful Business Rule Rejection: Duplicate booking/checkout | Attempt to request or checkout occupied asset displays human-readable error banner | `e2e/sprint-1/rejection-rules.spec.ts` | Planned |
| **E2E-01-03** | E2E | AC-AUTH-06, AC-AUTH-07 | Access Control: Borrower forbidden from Custodian desk | Direct navigation to `/custodian/desk` as Borrower redirects with forbidden notice | `e2e/sprint-1/access-control.spec.ts` | Planned |
| **E2E-01-04** | E2E | §4.1, §4.2 | Viewport layout audit (375px/768px/1280px) and focus rings | Real browser verification of zero horizontal scroll and visible keyboard focus rings | `e2e/sprint-1/layout-a11y.spec.ts` | Planned |

---

## 3. Test Execution Guidelines

> **Seed-State Contract & Deterministic Re-Runnability:**  
> The backend test runner utilizes an automated `globalSetup` script (`server/tests/global-setup.ts`) that executes `npx prisma migrate reset --force --skip-seed` followed by `npx prisma db seed` before running tests. This guarantees that all tests run against a pristine database with known sample credentials (`borrower@cpe.kmutt.ac.th`, `custodian@cpe.kmutt.ac.th` / `Password123!`) and deterministic seed assets.

### 3.1 Backend Integration Tests
Execute all backend API and domain rule tests:
```bash
npm --prefix server test
```

### 3.2 Frontend Component Tests
Execute React Testing Library component tests:
```bash
npm --prefix client test
```

### 3.3 End-to-End (E2E) Playwright Tests
Execute browser automation test journeys:
```bash
npx playwright test
```

### 3.4 Full Test Suite Execution
Execute the entire test battery across backend, frontend, and E2E:
```bash
npm test
npm run test:e2e
```

