# Requirements Traceability Matrix

## CPE Equipment & Hardware Inventory and Borrowing System (EquipFlow)

**Document ID:** `TRACE-01`  
**Version:** `1.0.0`  
**Status:** Wait for review
**Deliverable:** Project Deliverable 1 — Part B  

---

## 1. Traceability Matrix Overview

This matrix maps all Functional Requirements (FR), Business Rules (BR), and Non-Functional Requirements (NFR) from the [Software Requirements Specification](file:///c:/Year3/Semester%201/CPE334%20Software%20Engineering/CPE334-Sec01-Team45/docs/srs.md) to their delivering Features ([Feature Inventory](file:///c:/Year3/Semester%201/CPE334%20Software%20Engineering/CPE334-Sec01-Team45/docs/features.md)), target development sprints, and planned verification methods.

---

## 2. Requirements-to-Feature-to-Sprint Traceability Matrix

| Req ID | Req Type | Description Summary | Feature ID | Target Sprint | Planned Verification Method & Test ID |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **FR-01** | Functional | User login & token generation | **F-01** | Sprint 1 | API Integration Test (`TEST-AUTH-01`) |
| **FR-02** | Functional | Current authenticated user identity | **F-01** | Sprint 1 | API Integration Test (`TEST-AUTH-02`) |
| **FR-03** | Functional | User logout & session invalidation | **F-01** | Sprint 1 | UI / API Integration Test (`TEST-AUTH-03`) |
| **FR-04** | Functional | Server-side role authorization guard | **F-01** | Sprint 1 | API Integration Test (`TEST-AUTH-04`) |
| **FR-05** | Functional | Browse equipment catalog | **F-02** | Sprint 1 | UI Journey / E2E (`TEST-CAT-01`) |
| **FR-06** | Functional | Inspect equipment details & serial | **F-02** | Sprint 1 | API Integration Test (`TEST-CAT-02`) |
| **FR-07** | Functional | Custodian create new equipment | **F-02** | Sprint 2 | API & UI Test (Sprint 2 contract) |
| **FR-08** | Functional | Custodian manage item maintenance | **F-02** | Sprint 2 | API & UI Test (Sprint 2 contract) |
| **FR-09** | Functional | Borrower submit borrow request | **F-03** | Sprint 1 | E2E & API Integration (`TEST-REQ-01`) |
| **FR-10** | Functional | Borrower view personal loan history | **F-03** | Sprint 1 | UI Component & API Test (`TEST-REQ-02`) |
| **FR-11** | Functional | Cross-user data isolation (privacy) | **F-03** | Sprint 1 | API Security Test (`TEST-REQ-03`) |
| **FR-12** | Functional | Borrower cancel pending request | **F-03** | Sprint 2 | API & UI Test (Sprint 2 contract) |
| **FR-13** | Functional | Custodian pending request triage | **F-04** | Sprint 1 | UI Journey / E2E (`TEST-CHK-01`) |
| **FR-14** | Functional | Custodian record physical checkout | **F-04** | Sprint 1 | E2E & DB Integration (`TEST-CHK-02`) |
| **FR-15** | Functional | Walk-in checkout by Custodian | **F-04** | Sprint 2 | API & UI Test (Sprint 2 contract) |
| **FR-16** | Functional | Custodian reject borrow request | **F-04** | Sprint 2 | API & UI Test (Sprint 2 contract) |
| **FR-17** | Functional | Process return & condition check | **F-05** | Sprint 2 | API & DB Integration (Sprint 2 contract) |
| **FR-18** | Functional | Overdue loan calculation & badges | **F-06** | Sprint 2 | Unit & API Integration (Sprint 2 contract) |
| **BR-01** | Business Rule | Item must be AVAILABLE to request/borrow | **F-03, F-04** | Sprint 1 | Domain Unit & API Test (`TEST-RULE-01`) |
| **BR-02** | Business Rule | Exclusive allocation / conflict rejection | **F-03, F-04** | Sprint 1 | Concurrency Stress Test (`TEST-RULE-02`) |
| **BR-03** | Business Rule | Role segregation: Borrowers cannot checkout | **F-04** | Sprint 1 | API Security Test (`TEST-RULE-03`) |
| **BR-04** | Business Rule | Maximum 3 active loans/requests per borrower | **F-03** | Sprint 1 | Domain Unit & API Test (`TEST-RULE-04`) |
| **BR-05** | Business Rule | 7-day default loan period | **F-06** | Sprint 2 | Domain Logic Unit Test (Sprint 2 contract) |
| **BR-06** | Business Rule | 48-hour request expiration | **F-06** | Sprint 2 | Scheduler Unit Test (Sprint 2 contract) |
| **BR-07** | Business Rule | Unidirectional loan state transitions | **F-05** | Sprint 2 | State Machine Unit Test (Sprint 2 contract) |
| **BR-08** | Business Rule | Custodian accountability & audit actor | **F-04, F-08** | Sprint 1/3 | DB Assertion (`TEST-CHK-02`) & Sprint 3 |
| **NFR-01** | Non-Funct. | Passwords hashed with bcrypt ($\ge 10$) | **F-01** | Sprint 1 | Unit & Seed DB Query (`TEST-NFR-01`) |
| **NFR-02** | Non-Funct. | 401/403 backend route protection | **F-01** | Sprint 1 | Supertest Route Suite (`TEST-NFR-02`) |
| **NFR-03** | Non-Funct. | Concurrency conflict safe rejection | **F-04** | Sprint 1 | Concurrency Test (`TEST-RULE-02`) |
| **NFR-04** | Non-Funct. | API query latency $< 200$ms on 50 items | **F-07** | Sprint 2 | Performance Benchmark Test |
| **NFR-05** | Non-Funct. | Persistence across server restart | **F-02, F-04** | Sprint 1 | Server Restart Integration (`TEST-NFR-05`) |
| **NFR-06** | Non-Funct. | Responsive viewport UI (375px to 1024px) | All UI | Sprint 2 | Playwright Responsive Test Suite |

---

## 3. Sprint Coverage Summary

| Sprint | Included Feature IDs | Covered Functional Requirements | Covered Business Rules | Covered Non-Functional Requirements | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Sprint 1** | `F-01`, `F-02` (read), `F-03`, `F-04` | `FR-01`, `FR-02`, `FR-03`, `FR-04`, `FR-05`, `FR-06`, `FR-09`, `FR-10`, `FR-11`, `FR-13`, `FR-14` | `BR-01`, `BR-02`, `BR-03`, `BR-04`, `BR-08` | `NFR-01`, `NFR-02`, `NFR-03`, `NFR-05` | **In Progress (Deliverable 1 Target)** |
| **Sprint 2** | `F-02` (manage), `F-05`, `F-06`, `F-07`, `F-03` (cancel), `F-04` (reject) | `FR-07`, `FR-08`, `FR-12`, `FR-15`, `FR-16`, `FR-17`, `FR-18` | `BR-05`, `BR-06`, `BR-07` | `NFR-04`, `NFR-06` | Planned (Deliverable 2 Target) |
| **Sprint 3** | `F-08`, Integration & Hardening | Cross-feature hardening & analytics | Full system compliance | Full system regression & stability | Planned (Final Delivery Target) |

---

## 4. Coverage Gap Analysis & Approved Changes

* **Baseline Completeness:** 100% of the SRS requirements are mapped to features and designated sprints. No orphan requirements exist.
* **Sprint 1 Scope Boundary:** Self-registration (`FR-01` variant), fine calculations, barcode scanning, and multi-tenant partitioning are explicitly excluded from the baseline per stakeholder agreement.
* **Approved Adjustments:**
  * In Sprint 1, initial borrow requests immediately place the requested item into `RESERVED` status. This prevents race conditions while physical students arrive at the lab counter. Custodian checkout confirms the handover and updates status to `CHECKED_OUT`.
