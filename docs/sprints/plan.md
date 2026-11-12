# Three-Sprint Development Plan

## CPE Equipment & Hardware Inventory and Borrowing System (EquipFlow)

**Document ID:** `PLAN-01`  
**Version:** `1.0.0`  
**Status:** Wait for review
**Deliverable:** Project Deliverable 1 — Part D  

---

## 1. Executive Summary & Delivery Milestones

The EquipFlow engineering plan spans three structured iterations across the course semester. The project follows a progressive vertical-slice methodology: establishing an end-to-end authenticated domain baseline in Sprint 1, expanding core lifecycle operations in Sprint 2, and hardening the product for release and verification in Sprint 3.

```mermaid
timeline
    title EquipFlow Three-Sprint Roadmap
    section Sprint 1 : Baseline & Slice
        Auth & RBAC (F-01) : 16 Nov
        Catalog & Seed (F-02) : 16 Nov
        Borrower Request (F-03) : 16 Nov
        Custodian Checkout (F-04) : 16 Nov
    section Sprint 2 : Core Expansion
        Equipment Return (F-05) : 29 Nov
        Overdue Engine (F-06) : 29 Nov
        Catalog Management (F-02) : 29 Nov
        Search & Filter (F-07) : 29 Nov
    section Sprint 3 : Hardening & Release
        Audit & Reports (F-08) : 13 Dec
        Regression Testing : 13 Dec
        Final Packaging & Video : 13 Dec
```

---

## 2. Sprint Breakdown

### Sprint 1: Working Domain Slice & Baseline

* **Milestone Deadline:** Deliverable 1 (8 November 2026) | 80 Points
* **Sprint Goal:** Establish the engineering baseline and release a small, fully functional vertical slice demonstrating secure login, role separation, equipment browsing, item requesting, and custodian checkout with strict conflict rejection and real database persistence.
* **Included Features:**
  * **`F-01`**: Authentication, Session, and Role Identity (`FR-01`, `FR-02`, `FR-03`, `FR-04`, `NFR-01`, `NFR-02`).
  * **`F-02` (Core)**: Serialized Equipment Catalog view & Seed data (`FR-05`, `FR-06`, `BR-01`, `NFR-05`).
  * **`F-03` (Core)**: Borrower Request Submission & Personal History (`FR-09`, `FR-10`, `FR-11`, `BR-01`, `BR-02`, `BR-04`).
  * **`F-04` (Core)**: Custodian Counter Checkout & Conflict Prevention (`FR-13`, `FR-14`, `BR-01`, `BR-02`, `BR-03`, `BR-08`, `NFR-03`).
* **Dependencies:** None (initial development sprint).
* **Expected Completion Outcome:**
  * A working increment merged to `main` with reproducible seed scripts.
  * Borrower can log in, request an available oscilloscope, and see their pending request.
  * Custodian can log in, see the pending request, and perform checkout, moving the asset to `CHECKED_OUT`.
  * Second attempt to check out or request the occupied asset is deterministically rejected.
  * Borrower attempting custodian checkout receives HTTP 403 Forbidden.
  * Automated Vitest, Supertest, and Playwright suites passing.

---

### Sprint 2: Core Lifecycle Expansion & Asset Management

* **Milestone Deadline:** Deliverable 2 (29 November 2026) | 70 Points
* **Sprint Goal:** Complete the circular borrowing lifecycle by introducing return processing with condition inspections, 7-day loan duration enforcement with overdue flagging, custodian inventory editing, and multi-criteria catalog search.
* **Included Features:**
  * **`F-05`**: Equipment Return & Condition Assessment (`FR-17`, `BR-01`, `BR-07`).
  * **`F-06`**: Due Date Enforcement & Overdue Tracking (`FR-18`, `BR-05`, `BR-06`).
  * **`F-02` (Expansion)**: Custodian Catalog Administration (`FR-07`, `FR-08`).
  * **`F-07`**: Catalog Filtering, Search & Category Navigation (`FR-05`, `FR-06`, `NFR-04`, `NFR-06`).
  * **`F-03` (Expansion)**: Borrower Request Cancellation (`FR-12`).
  * **`F-04` (Expansion)**: Custodian Request Rejection with reasons (`FR-16`).
* **Dependencies:** Completed Sprint 1 database entities and authenticated endpoints.
* **Expected Completion Outcome:**
  * Complete lifecycle from Request $\rightarrow$ Checkout $\rightarrow$ Active Loan $\rightarrow$ Return $\rightarrow$ Available.
  * Overdue loan indicator flags visually and logically active.
  * Lab 5 Docker/GCP pipeline operational and hosting the deployed Sprint 2 candidate.

---

### Sprint 3: Completion, Auditing, Hardening & Final Release

* **Milestone Deadline:** Final Project Delivery (13 December 2026) | 100 Points
* **Sprint Goal:** Finalize the complete product with append-only audit trail logging, custodial utilization metrics, defect resolution from Lab 6 UAT, full automated regression coverage, and final documentation/demonstration video.
* **Included Features:**
  * **`F-08`**: Inventory Audit History & Custodial Reporting (`BR-08`, `NFR-05`).
  * **System Hardening:** Error boundaries, edge-case validation, UI accessibility (WCAG 2.1 AA), and responsive polish.
  * **Full Regression:** Comprehensive end-to-end regression tests across all features.
  * **Release Packaging:** Immutable production release tag, final report PDF, and 10-minute demonstration video.
* **Dependencies:** Completed Sprint 1 & 2 features, Lab 6 UAT feedback, and Lab 7 maintenance change.
* **Expected Completion Outcome:**
  * Zero critical defects, 100% baseline requirement coverage.
  * Deployed live on GCP Cloud Run with durable database.
  * Complete release documentation and verification evidence index.

---

## 3. Team Work Allocation & Responsibilities

| Student Role / Focus | Primary Sprint 1 Ownership | Primary Sprint 2 Ownership | Primary Sprint 3 Ownership |
| :--- | :--- | :--- | :--- |
| **Partner 1 (Lead Spec / Backend)** | • Authentication & JWT middleware (`F-01`)<br>• Custodian Checkout Service & Concurrency (`F-04`)<br>• Supertest integration test suite | • Return & condition workflow (`F-05`)<br>• Overdue calculation engine (`F-06`)<br>• Lab 5 Docker containerization | • Audit logging service (`F-08`)<br>• Performance testing & regression suite<br>• Final deployment verification |
| **Partner 2 (Lead UI / Flow)** | • Catalog view & seed setup (`F-02`)<br>• Borrower request submission UI (`F-03`)<br>• Playwright E2E test suite | • Catalog admin & search UI (`F-07`, `F-02`)<br>• Custodian return desk UI (`F-05`)<br>• Responsive styling & UX review | • Utilization reporting dashboard (`F-08`)<br>• Cross-team UAT remediation (Lab 6)<br>• Final demonstration video recording |

*Note: In accordance with course guidelines, both team members participate in requirements analysis, code reviews, and testing. Every pull request must be reviewed and approved by the peer teammate before integration.*

---

## 4. Scope Feasibility & Risk Mitigation

| Identified Risk | Impact | Probability | Mitigation Strategy |
| :--- | :---: | :---: | :--- |
| **Concurrency deadlocks on physical asset checkouts** | High | Low | Use Prisma atomic transactions (`$transaction`) with optimistic locking on item status (`AVAILABLE` guard). |
| **Scope creep (e.g. barcode scanner hardware, fine payments)** | High | Medium | Explicitly bound baseline in SRS Section 3.2. Fines and physical scanners are strictly excluded from baseline. |
| **Database migration issues between SQLite & PostgreSQL** | Medium | Low | Use Prisma ORM standard relational types and avoid proprietary database-specific SQL dialect extensions. |
| **Delay in teammate PR reviews** | Medium | Medium | Agree on scheduled daily review windows and pair-programming sessions during sprint workshops. |
