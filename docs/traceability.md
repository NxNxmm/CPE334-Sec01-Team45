# Requirements Traceability Matrix

## CPE Equipment & Hardware Inventory and Borrowing System (EquipFlow)

**Document ID:** `TRACE-01`  
**Version:** `1.1.0`  
**Status:** Approved
**Deliverable:** Project Deliverable 1 — Part B  

---

## 1. Traceability Matrix Overview

This matrix maps all Functional Requirements (FR), Business Rules (BR), and Non-Functional Requirements (NFR) from the [Software Requirements Specification](file:///c:/Year3/Semester%201/CPE334%20Software%20Engineering/CPE334-Sec01-Team45/docs/srs.md) to their delivering Features ([Feature Inventory](file:///c:/Year3/Semester%201/CPE334%20Software%20Engineering/CPE334-Sec01-Team45/docs/features.md)), target development sprints, and planned verification methods.

---

## 2. Requirements-to-Feature-to-Sprint Traceability Matrix

| Req ID | Req Type | Description Summary | Feature ID | Target Sprint | Planned Verification Method & Test ID |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **FR-01** | Functional | User login & JWT Bearer issuance | **F-01** | Sprint 1 | API Integration Test (`TEST-AUTH-01`) |
| **FR-02** | Functional | Current user identity (`GET /api/v1/auth/me`) | **F-01** | Sprint 1 | API Integration Test (`TEST-AUTH-02`) |
| **FR-03** | Functional | Logout & per-token jti revocation | **F-01** | Sprint 1 | API Test verifying 401 on revoked token & 200 on concurrent session (`TEST-AUTH-03`) |
| **FR-04** | Functional | Server-side role authorization guard | **F-01** | Sprint 1 | API Integration Test (`TEST-AUTH-04`) |
| **FR-05** | Functional | Browse equipment catalog (`/api/v1/items`) | **F-02** | Sprint 1 | UI Journey / E2E (`TEST-CAT-01`) |
| **FR-06** | Functional | Inspect equipment details & serial | **F-02** | Sprint 1 | API Integration Test (`TEST-CAT-02`) |
| **FR-07** | Functional | Custodian create new equipment | **F-02** | Sprint 2 | API & UI Test (Sprint 2 contract) |
| **FR-08** | Functional | Custodian manage item maintenance | **F-02** | Sprint 2 | API & UI Test (Sprint 2 contract) |
| **FR-09** | Functional | Borrower submit borrow request | **F-03** | Sprint 1 | E2E & API Integration (`TEST-REQ-01`) |
| **FR-10** | Functional | Borrower view personal requests (`/requests/my`) | **F-03** | Sprint 1 | UI Component & API Test (`TEST-REQ-02`) |
| **FR-11** | Functional | Cross-user data isolation (privacy) | **F-03** | Sprint 1 | API Security Test (`TEST-REQ-03`) |
| **FR-12** | Functional | Borrower cancel pending request | **F-03** | Sprint 2 | API & UI Test (Sprint 2 contract) |
| **FR-13** | Functional | Custodian pending request triage queue | **F-04** | Sprint 1 | UI Journey / E2E (`TEST-CHK-01`) |
| **FR-14** | Functional | Custodian checkout reserved item & 7d due date | **F-04** | Sprint 1 | E2E & DB Integration (`TEST-CHK-02`) |
| **FR-15** | Functional | Walk-in checkout by Custodian | **F-04** | Sprint 2 | API & UI Test (Sprint 2 contract) |
| **FR-16** | Functional | Custodian reject borrow request | **F-04** | Sprint 2 | API & UI Test (Sprint 2 contract) |
| **FR-17** | Functional | Process return & condition check | **F-05** | Sprint 2 | API & DB Integration (Sprint 2 contract) |
| **FR-18** | Functional | Overdue loan calculation & badges | **F-06** | Sprint 2 | Unit & API Integration (Sprint 2 contract) |
| **BR-01** | Business Rule | Item AVAILABLE to request; RESERVED at checkout | **F-03, F-04** | Sprint 1 | Domain Unit & API Test (`TEST-RULE-01`) |
| **BR-02** | Business Rule | Exclusive allocation & duplicate conflict rejection | **F-03, F-04** | Sprint 1 | Concurrency Stress Test (`TEST-RULE-02`) |
| **BR-03** | Business Rule | Role segregation: Borrowers cannot checkout | **F-04** | Sprint 1 | API Security Test (`TEST-RULE-03`) |
| **BR-04** | Business Rule | Active Quota: Count(requests) + Count(loans) $\le 3$ | **F-03** | Sprint 1 | Domain Unit & API Test (`TEST-RULE-04`) |
| **BR-05** | Business Rule | 7-day default loan period saved on checkout | **F-04, F-06** | Sprint 1/2 | DB Assertion (`TEST-CHK-02`) & Sprint 2 Engine |
| **BR-06** | Business Rule | 48-hour request expiration | **F-06** | Sprint 2 | Scheduler Unit Test (Sprint 2 contract) |
| **BR-07** | Business Rule | Unidirectional loan state transitions | **F-05** | Sprint 2 | State Machine Unit Test (Sprint 2 contract) |
| **BR-08** | Business Rule | Custodian accountability & audit actor | **F-04, F-08** | Sprint 1/3 | DB Assertion (`TEST-CHK-02`) & Sprint 3 Audit |
| **NFR-01** | Non-Funct. | Passwords hashed with bcrypt ($\ge 10$); local seeds | **F-01** | Sprint 1 | Unit & Seed DB Query (`TEST-NFR-01`) |
| **NFR-02** | Non-Funct. | 401/403 backend route protection & revocation | **F-01** | Sprint 1 | Supertest Route Suite (`TEST-NFR-02`) |
| **NFR-03** | Non-Funct. | Concurrency conflict safe rejection (HTTP 409) | **F-04** | Sprint 1 | Concurrency Test (`TEST-RULE-02`) |
| **NFR-04** | Non-Funct. | API query latency $< 200$ms on 50 items | **F-07** | Sprint 2 | Performance Benchmark Test |
| **NFR-05** | Non-Funct. | Persistence across server restart & migrations | **F-02, F-04** | Sprint 1 | Server Restart Integration (`TEST-NFR-05`) |
| **NFR-06** | Non-Funct. | Responsive viewport UI (375px to 1024px) | All UI | Sprint 2 | Playwright Responsive Test Suite |

---

## 3. Sprint Coverage Summary

| Sprint | Included Feature IDs | Covered Functional Requirements | Covered Business Rules | Covered Non-Functional Requirements | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Sprint 1** | `F-01`, `F-02` (read), `F-03`, `F-04` (core) | `FR-01`, `FR-02`, `FR-03`, `FR-04`, `FR-05`, `FR-06`, `FR-09`, `FR-10`, `FR-11`, `FR-13`, `FR-14` | `BR-01`, `BR-02`, `BR-03`, `BR-04`, `BR-05` (save), `BR-08` | `NFR-01`, `NFR-02`, `NFR-03`, `NFR-05` | **In Progress (Deliverable 1 Target: 15 Nov)** |
| **Sprint 2** | `F-02` (manage), `F-04` (walk-in), `F-05`, `F-06`, `F-07`, `F-03` (cancel), `F-04` (reject) | `FR-07`, `FR-08`, `FR-12`, `FR-15`, `FR-16`, `FR-17`, `FR-18` | `BR-05` (overdue), `BR-06`, `BR-07` | `NFR-04`, `NFR-06` | Planned (Deliverable 2 Target: 29 Nov) |
| **Sprint 3** | `F-08`, Integration & Hardening | Cross-feature hardening & analytics | Full system compliance | Full system regression & stability | Planned (Final Delivery Target: 13 Dec) |

---

## 4. Coverage Gap Analysis & Approved Changes

* **Baseline Completeness:** 100% of the SRS requirements are mapped to features and designated sprints. No orphan requirements exist.
* **Addressed Peer Review Changes:**
  1. `BR-01` clarified: Requesting an item requires status `AVAILABLE` and transitions it to `RESERVED`. Checkout requires the item to be `RESERVED` for the matching pending request.
  2. `BR-04` clarified: Quota is defined as $\text{Count}(\text{Pending Requests}) + \text{Count}(\text{Active Loans}) \le 3$.
  3. `FR-03` updated: Server-side token invalidation is tested by asserting HTTP 401 on subsequent requests.
  4. `FR-15` (Walk-in checkout) moved to Sprint 2.
  5. `BR-05` clarified: 7-day `dueDate` is calculated and saved on checkout in Sprint 1; overdue processing logic added in Sprint 2.
