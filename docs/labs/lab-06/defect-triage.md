# CPE334 Lab 6 (Part C) — Outgoing Defect Reports & Incoming Defect Triage

**Course:** CPE 334 Software Engineering (Semester 1 / Year 3)  
**Assignment:** Lab 6 — Independent User Acceptance Testing and Defect Management (Part C: Defect Reporting & Triage)  
**Document ID:** `DEFECT-TRIAGE-SPRINT-01`  
**Version:** `1.1.0` *(Reconciled against approved PR `#49` / `partner-uat-execution.md v1.4.1`: aligned Part B case verdicts to `2 PASS / 4 BLOCKED / 0 FAIL` on supplied cases, scoped `UAT-AP-11` `<datalist>` timezone wording strictly to `EV-UAT-11`, cited `TH-017 #37` for confirmed holiday rules, and linked dedicated defect Issues `#52` (`DEF-EF-01`) and `#53` (`DEF-EF-02`))*  
**Tracking Issue:** [Issue #44 (`[Lab 6] L6-3: Outgoing defect reports and incoming triage (Part C)`)](https://github.com/NxNxmm/CPE334-Sec01-Team45/issues/44)  
**PR Author (Odd L6 Task):** `Norawit Mahaprom` (`67070501026` · `@NxNxmm`)  
**PR Reviewer (Odd/Even Rule):** `Pawarisa Thongchua` (`67070501032` · `@itspxsh`)  
**Collaboration Mode:** **Joint Pair Testing, Defect Triage & PR Review (`Handout §3.3`)** — Both members (`@NxNxmm` and `@itspxsh`) jointly verified outgoing defect reproduction steps, co-reproduced and triaged all incoming EquipFlow findings, and verified the sanitized PDF evidence packages before merging into `sprint-1-staging`.  
**Sanitized PDF Evidence Packages (`docs/evidence/lab-06/l6-3/`):**
- **Outgoing Report (`TH-045_P2` -> `TH-017` Appointly):** [`UAT-Execution-and-Defect-Report-TH045_P2-to-TH017-Appointly.pdf`](../../evidence/lab-06/l6-3/UAT-Execution-and-Defect-Report-TH045_P2-to-TH017-Appointly.pdf)
- **Incoming Report (`TH-017` -> `TH-045_P2` EquipFlow):** [`TH-017_UAT_Execution_and_Defect_Report_for_EquipFlow.pdf`](../../evidence/lab-06/l6-3/TH-017_UAT_Execution_and_Defect_Report_for_EquipFlow.pdf)

---

## 1. Outgoing Defect & Finding Reports Filed for Partner Team `TH-017` (Appointly)

During independent manual & exploratory UAT execution ([`partner-uat-execution.md` v1.4.1](./partner-uat-execution.md), `L6-2` / Issue `#43`, PR `#49`) against Appointly (`https://s96ba5182-4d7hbszvwq-as.a.run.app`, revision `s96ba5182-00005-ch9`, commit `6b73bfdbf029343e4af3268d72e9364fbab12f52`) on **24 November 2026 (`22:16–23:44 ICT`)**:
* **Supplied 6 cases (`UAT-AP-01`–`06`):** **`2 PASS`** (`UAT-AP-01`, `UAT-AP-06`), **`4 BLOCKED`** (`UAT-AP-02`, `UAT-AP-03`, `UAT-AP-04`, `UAT-AP-05`; *`BLOCKED` is explicitly not a pass*, preserving assertion-level `PASS` observations while marking unverified/unexecuted checks explicitly: `AP-02` post-rejection read-backs, `AP-03` inactive HTTP `403`, `/admin/doctors`, protected-state read-back & `AC-F002-02`, `AP-04` `AuditLog` UI/API non-observability, and `AP-05` positive `AC-F005-01` assignment), **`0 FAIL`**.
* **Exploratory 5 cases (`UAT-AP-07`–`11`):** **`4 PASS`** (strictly scoped to observed UI/API assertions) and **`1 FAIL`** (**`UAT-AP-09`**, uncovering **two Major reproducible defects: `DEF-AP-02` and `DEF-AP-03`**) alongside **one Minor session-handling defect (`DEF-AP-01`)** and **two minor precondition/observability findings (`OBS-AP-01`, `OBS-AP-02`)**.

### 1.1 Reproducible Defect Report: `DEF-AP-02` *(Duplicate Full-Day & Overlapping Partial-Day Holidays Allowed on Same Date)*

* **Issue / Defect ID:** `DEF-AP-02` *(Partner Confirmation: [`Piink7878/appointly-clinic-scheduling#37`](https://github.com/Piink7878/appointly-clinic-scheduling/issues/37))*
* **Product Owner / Team:** Team `TH-017` (`2 auan` — Kamonnat Seetakai `67070501001`, Benyapha Rattanakhunodom `67070501030`)
* **Reporting UAT Team:** Team `TH-045_P2` (EquipFlow — Norawit Mahaprom `67070501026`, Pawarisa Thongchua `67070501032`)
* **Tested Release / Revision:** `s96ba5182-00005-ch9` (commit `6b73bfdbf029343e4af3268d72e9364fbab12f52`)
* **Linked Case & Rule Grounding:** `UAT-AP-09` *(Exploratory)* / `UAT-AP-06` (`F-006` `POST /api/v1/doctors/me/exceptions`). While Appointly's baseline `sprint-1-contracts.md` `AC-F006-03` did not explicitly document duplicate/overlapping exception rejection, Partner Team `TH-017` confirmed in **[Issue `#37`](https://github.com/Piink7878/appointly-clinic-scheduling/issues/37)** that conflicting same-date exceptions must be rejected with **HTTP `409 Conflict` (`SCHEDULE_EXCEPTION_CONFLICT`)**.
* **Severity & User Impact Rationale:** **Major** *(Data integrity & schedule exception conflict on `F-006` — allows persisting duplicate full-day `HOLIDAY` records AND overlapping partial-day exceptions for the exact same doctor and calendar date `2026-12-31`, cluttering the doctor's schedule manager, requiring manual deletion of multiple conflicting rows to reopen a single date, and creating ambiguous exception evaluation when Sprint 2 slot generation consumes schedule overrides).*
* **Preconditions & Data:** Authenticated as `DOCTOR_USER` (`doctor@appointly.local`) on `/doctor/schedule` with an existing full-day `Holiday` exception already registered on `Thu, 31 Dec 2026` (`New Year Holiday - Clinic Closed`, created during `UAT-AP-06`).
* **Steps to Reproduce:**
  * **Path A (Duplicate Full-Day Holiday):**
    1. Sign in at `https://s96ba5182-4d7hbszvwq-as.a.run.app/login` as `DOCTOR_USER` (`doctor@appointly.local`) and navigate to `/doctor/schedule`.
    2. Confirm that `Thu, 31 Dec 2026 · Holiday · Full day · New Year Holiday - Clinic Closed` already exists under **Holidays & Time Off**.
    3. Select the exact same Date `2026-12-31`, Type `Holiday`, keep `Full day` checked, enter Reason `New Year Holiday - Clinic Closed`, and click **Add Exception** (`POST /api/v1/doctors/me/exceptions`).
  * **Path B (Partial-Day Exception Overlapping Existing Full-Day Holiday):**
    4. Select Date `2026-12-31`, Type `Holiday`, **uncheck** `Full day`, set Start `13:00` and End `17:00`, enter Reason `UAT-F-006-Test`, and click **Add Exception**. *(Note: Inverted partial-day times were verified to be blocked as expected.)*
* **Expected Result (Confirmed in `TH-017 #37`):** Both Path A (duplicate full-day exception) and Path B (partial-day exception on a date already blocked full-day) must be rejected by backend/UI validation with **HTTP `409 Conflict` (`SCHEDULE_EXCEPTION_CONFLICT`)** and a human-readable conflict alert banner, preserving a single non-conflicting exception for `Thu, 31 Dec 2026`.
* **Actual Result (Observed `2026-11-24 23:18:06` & `23:39:20 ICT`):**
  - **Path A:** Returned success banner `"Holiday added for Thu, 31 Dec 2026."` and persisted/rendered **two identical `Thu, 31 Dec 2026 · Holiday · Full day` entries** (`EV-UAT-09A` / `EV-B-15`).
  - **Path B:** Also succeeded without conflict rejection, persisting a **third conflicting row `Thu, 31 Dec 2026 · Holiday · 13:00–17:00 · UAT-F-006-Test`** on the already full-day-blocked date (`EV-UAT-09E` / `EV-B-19`).
* **Supporting Evidence:**
  - [`docs/evidence/lab-06/l6-2/F-006-duplicate-holiday.png`](../../evidence/lab-06/l6-2/F-006-duplicate-holiday.png) (`EV-UAT-09A` / `EV-B-15`, `2026-11-24 23:18:06 ICT`)
  - [`docs/evidence/lab-06/l6-2/F-006-dup-holiday-partial-time.png`](../../evidence/lab-06/l6-2/F-006-dup-holiday-partial-time.png) (`EV-UAT-09E` / `EV-B-19`, `2026-11-24 23:39:20 ICT`)
* **Notification & Partner Outcome:** Compiled into the sanitized outgoing PDF package ([`UAT-Execution-and-Defect-Report-TH045_P2-to-TH017-Appointly.pdf`](../../evidence/lab-06/l6-3/UAT-Execution-and-Defect-Report-TH045_P2-to-TH017-Appointly.pdf)) for Team `TH-017` handoff; tracked by Team `TH-017` under Issue `#37` with independent retest & acceptance recorded in Part D ([Issue `#46`](https://github.com/NxNxmm/CPE334-Sec01-Team45/issues/46)).

---

### 1.2 Reproducible Defect Report: `DEF-AP-03` *(Backend API Bypass Allows Persisting Past-Date Schedule Exceptions)*

* **Issue / Defect ID:** `DEF-AP-03` *(Partner Confirmation: [`Piink7878/appointly-clinic-scheduling#37`](https://github.com/Piink7878/appointly-clinic-scheduling/issues/37))*
* **Product Owner / Team:** Team `TH-017` (`2 auan` — Kamonnat Seetakai `67070501001`, Benyapha Rattanakhunodom `67070501030`)
* **Reporting UAT Team:** Team `TH-045_P2` (EquipFlow — Norawit Mahaprom `67070501026`, Pawarisa Thongchua `67070501032`)
* **Tested Release / Revision:** `s96ba5182-00005-ch9` (commit `6b73bfdbf029343e4af3268d72e9364fbab12f52`)
* **Linked Case & Rule Grounding:** `UAT-AP-09` *(Exploratory)* / `UAT-AP-06` (`F-006` `POST /api/v1/doctors/me/exceptions`). While baseline `AC-F006-03` only illustrated creating a valid exception, `TH-017` `uat-plan.md` §2.1 / `UAT-AP-06` specified upcoming holiday scheduling and Team `TH-017` confirmed in **[Issue `#37`](https://github.com/Piink7878/appointly-clinic-scheduling/issues/37)** that past-date schedule exceptions must be rejected server-side with **HTTP `400 Bad Request` (`VALIDATION_ERROR`)**.
* **Severity & User Impact Rationale:** **Major** *(Missing server-side domain date validation on `POST /api/v1/doctors/me/exceptions` — unlike `PUT /api/v1/patients/me` in `F-002` which properly enforces past-date validation server-side returning `400`, `POST /api/v1/doctors/me/exceptions` relies solely on the HTML calendar picker disabling past dates in the UI. Any direct API call or timezone/midnight boundary skew persists invalid historical exceptions such as `2020-01-01` into PostgreSQL and renders stale historical records on the doctor's schedule).*
* **Preconditions & Data:** Authenticated as `DOCTOR_USER` (`doctor@appointly.local`) with active session cookies on `/doctor/schedule`.
* **Steps to Reproduce:**
  1. Sign in at `https://s96ba5182-4d7hbszvwq-as.a.run.app/login` as `DOCTOR_USER` (`doctor@appointly.local`) and confirm the UI exception date picker grays out past dates.
  2. Open Browser DevTools Console (`F12`) and send a direct `POST` request with past `exceptionDate: "2020-01-01"`:
     ```javascript
     fetch('/api/v1/doctors/me/exceptions', {
       method: 'POST',
       headers: { 'Content-Type': 'application/json' },
       credentials: 'include',
       body: JSON.stringify({
         exceptionDate: '2020-01-01',
         exceptionType: 'HOLIDAY',
         startTime: null,
         endTime: null,
         reason: 'Past date edge test'
       })
     }).then(async r => console.log('Past Holiday Edge Status:', r.status, await r.json()));
     ```
  3. Reload `/doctor/schedule` and inspect the **Holidays & Time Off** list.
* **Expected Result (Confirmed in `TH-017 #37`):** `POST /api/v1/doctors/me/exceptions` must validate `exceptionDate >= CURRENT_DATE` (in clinic timezone `Asia/Bangkok`) on the server side and reject `"2020-01-01"` with **HTTP `400 Bad Request` (`VALIDATION_ERROR`)** without persisting any record.
* **Actual Result (Observed `2026-11-24 23:36:43` & `23:37:12 ICT`):**
  - Backend returned **HTTP `201 Created`** with `{success: true, data: {...}, message: 'Schedule exception created successfully.'}` (`EV-UAT-09C` / `EV-B-17`).
  - Reloading `/doctor/schedule` displayed **`Wed, 1 Jan 2020 · Holiday · Full day · Past date edge test`** persisted at the top of the doctor's exceptions list (`EV-UAT-09D` / `EV-B-18`).
* **Supporting Evidence:**
  - [`docs/evidence/lab-06/l6-2/F-006-API-adding-past-holidays-1.png`](../../evidence/lab-06/l6-2/F-006-API-adding-past-holidays-1.png) (`EV-UAT-09C` / `EV-B-17`, `2026-11-24 23:36:43 ICT`)
  - [`docs/evidence/lab-06/l6-2/F-006-API-adding-past-holidays-2.png`](../../evidence/lab-06/l6-2/F-006-API-adding-past-holidays-2.png) (`EV-UAT-09D` / `EV-B-18`, `2026-11-24 23:37:12 ICT`)
* **Notification & Partner Outcome:** Compiled into the sanitized outgoing PDF package ([`UAT-Execution-and-Defect-Report-TH045_P2-to-TH017-Appointly.pdf`](../../evidence/lab-06/l6-3/UAT-Execution-and-Defect-Report-TH045_P2-to-TH017-Appointly.pdf)) for Team `TH-017` handoff; tracked by Team `TH-017` under Issue `#37` with independent retest & acceptance recorded in Part D ([Issue `#46`](https://github.com/NxNxmm/CPE334-Sec01-Team45/issues/46)).

---

### 1.3 Reproducible Defect Report: `DEF-AP-01` *(Idle Session Expiry Without Silent Refresh or Redirect)*

* **Issue / Defect ID:** `DEF-AP-01`
* **Product Owner / Team:** Team `TH-017` (`2 auan` — Kamonnat Seetakai `67070501001`, Benyapha Rattanakhunodom `67070501030`)
* **Reporting UAT Team:** Team `TH-045_P2` (EquipFlow — Norawit Mahaprom `67070501026`, Pawarisa Thongchua `67070501032`)
* **Tested Release / Revision:** `s96ba5182-00005-ch9` (commit `6b73bfdbf029343e4af3268d72e9364fbab12f52`)
* **Linked Case / Requirement:** `UAT-AP-06` (`F-001` cookie session `access_token` + `refresh_token` lifecycle, `F-006` Schedule Exceptions `POST /api/v1/doctors/me/exceptions`)
* **Severity & User Impact Rationale:** **Minor** *(non-blocking workaround exists by manually navigating to `/login` and signing in again; does not block Sprint 1 core behavior once re-authenticated)* — When an active Doctor remains idle on `/doctor/schedule` beyond the short-lived `access_token` lifetime (~15–20 minutes), attempting to save a holiday exception fails silently with HTTP `401 (Unauthorized)` without transparently refreshing via `refresh_token` or redirecting the user to `/login`, leaving unsaved form edits stranded.
* **Preconditions & Data:** Authenticated as `DOCTOR_USER` (`doctor@appointly.local`) on `/doctor/schedule` (`UAT-AP-01` completed; session left open for ~15–20 minutes).
* **Steps to Reproduce:**
  1. Sign in at `https://s96ba5182-4d7hbszvwq-as.a.run.app/login` as `DOCTOR_USER` (`doctor@appointly.local`).
  2. Leave the browser tab open on `/doctor/schedule` past the `access_token` expiration (~15–20 minutes) without calling `/api/v1/auth/logout`.
  3. Under **Holidays & Time Off**, select Date `2026-12-31`, Type `Holiday`, check `Full day`, enter Reason `New Year Holiday - Clinic Closed`, and click **Add Exception** (`POST /api/v1/doctors/me/exceptions`).
  4. Immediately query `GET /api/v1/doctors/me/schedule` in DevTools Console.
* **Expected Result:** Because `F-001` provisions both `access_token` and `refresh_token` `HttpOnly` cookies, an expired `access_token` should either silently refresh via the `refresh_token` before retrying the mutation OR cleanly redirect the user to `/login` with a clear session-expired notice.
* **Actual Result (Observed `2026-11-24 22:44:52 ICT`):** Both `POST /api/v1/doctors/me/exceptions` and `GET /api/v1/doctors/me/schedule` failed with **HTTP `401 (Unauthorized)`** (causing Console verification `res.data` to be `undefined`), while the browser stayed on `/doctor/schedule` without refreshing the session or redirecting to `/login`. Re-authenticating immediately resolved the issue and `Add Exception` succeeded at `22:45:02 ICT`.
* **Supporting Evidence:** [`docs/evidence/lab-06/l6-2/04-uat-ap-06-holiday-exception.png`](../../evidence/lab-06/l6-2/04-uat-ap-06-holiday-exception.png) (`EV-UAT-06` / `EV-B-06`, timestamp `2026-11-24 22:44:52`).
* **Notification & Partner Outcome:** Compiled into the sanitized outgoing PDF package ([`UAT-Execution-and-Defect-Report-TH045_P2-to-TH017-Appointly.pdf`](../../evidence/lab-06/l6-3/UAT-Execution-and-Defect-Report-TH045_P2-to-TH017-Appointly.pdf)) alongside [`partner-uat-execution.md`](./partner-uat-execution.md) for Team `TH-017` handoff; acceptance disposition recorded in Part D ([Issue `#46`](https://github.com/NxNxmm/CPE334-Sec01-Team45/issues/46)).

### 1.4 Minor Precondition & Observability Findings (`OBS-AP-01`, `OBS-AP-02`)

| Observation ID | Linked Case & AC | Severity | Observed Behavior & Recommendation for Team `TH-017` | Evidence Ref |
| :---: | :--- | :---: | :--- | :---: |
| **`OBS-AP-01`** | `UAT-AP-01` (`F-006` / `AC-F006-01`) | **Minor** | 1) Seeded Monday working hours already default to `09:00–12:00` and `13:00–17:00`, which matches the `UAT-AP-01` synthetic inputs verbatim and keeps `Save Schedule` disabled (`dirty`-state check) until altered (`08:30–12:00` then restored `09:00–12:00`). Recommend updating `UAT-AP-01` synthetic inputs (e.g. `08:30–12:00` or Tuesday split-shift) so independent testers can click `Save Schedule` directly.<br>2) `GET /api/v1/doctors/me/schedule` returns `"09:00"` / `"12:00"` (`HH:MM`) whereas `UAT-AP-01` spec lists `"09:00:00"` (`HH:MM:SS`). | [`EV-UAT-01` (`EV-B-05`)](../../evidence/lab-06/l6-2/03-uat-ap-01-doctor-split-shift.png) |
| **`OBS-AP-02`** | `UAT-AP-04` (`F-007` / `AC-F007-01` AuditLog — **`BLOCKED`**) | **Minor** | `UAT-AP-04` Expected Result requires confirming an `AuditLog` row (`CLINIC_SETTINGS_UPDATED`), yet Sprint 1 exposes no Admin UI route or API endpoint to view `AuditLog` entries without direct PostgreSQL DB access—leaving that audit assertion **`BLOCKED`**. Recommend removing DB-only `AuditLog` verification from manual UAT expectations or adding a read-only audit verification endpoint. | [`EV-UAT-04A` (`EV-B-09`)](../../evidence/lab-06/l6-2/06a-uat-ap-04-settings-refresh.png) |

### 1.5 Sprint 1 UAT Coverage Audit & Executed Exploratory Cases (`UAT-AP-07`–`11`)

To satisfy Lab 6 Handout §3.2 and the instructor's clarification (*"check whether supplied cases adequately cover the important Sprint 1 requirements and acceptance criteria, and suggest additional cases where necessary"*), Team `TH-045_P2` additionally executed five Sprint 1 exploratory checks documented in [`partner-uat-execution.md` §4.7–§5](./partner-uat-execution.md) (explicitly scoped to the observed assertions):
- **`UAT-AP-07` (`F-002` / `AC-F002-03` — `PASS`, scoped):** Verified `/patient/profile` rejects invalid Thai phone (`0212345678`) and blank fields, disables today/future DOBs in the picker, and rejects a single combined invalid `PUT /api/v1/patients/me` payload (`fullName: '   '`, `dateOfBirth: '2030-01-01'`) with `400 Bad Request` (`EV-UAT-07A`–`07C` / `EV-B-11`–`13`).
- **`UAT-AP-08` (`F-003` — `PASS`):** Verified deactivating `Dr. Somchai Prasert` via Admin hides that doctor from the patient-facing `/patient/doctors` directory (`EV-UAT-08` / `EV-B-14`).
- **`UAT-AP-09` (`F-006` — `FAIL` -> `DEF-AP-02` & `DEF-AP-03`):** Verified inverted shifts and UI past dates are blocked (`EV-UAT-09B` / `EV-B-16`), while uncovering **`DEF-AP-02`** (duplicate full-day & overlapping partial-day holiday exceptions allowed on `2026-12-31`, `EV-UAT-09A`/`09E`) and **`DEF-AP-03`** (direct `POST /api/v1/doctors/me/exceptions` accepts past date `2020-01-01` with `201 Created`, `EV-UAT-09C`/`09D`), both confirmed in [`TH-017 #37`](https://github.com/Piink7878/appointly-clinic-scheduling/issues/37).
- **`UAT-AP-10` (`F-004` — `PASS`, scoped to `durationMinutes: 0`):** Verified Service duration lower bound `0` is rejected in the UI modal and by `POST /api/v1/admin/services` with `400 Bad Request` (`EV-UAT-10A`, `10B` / `EV-B-20`, `21`).
- **`UAT-AP-11` (`F-007` — `PASS`, narrowly scoped):** `/admin/settings` `Timezone` uses a text `<input>` with `<datalist>` suggestions (not an enforced dropdown). `EV-UAT-11` (`EV-B-22`) demonstrates entering valid timezone text (`Asia/Singapore`), setting interval `5 minutes`, and entering `-5` in cancellation cutoff—triggering inline error `"Enter a whole number of hours, 0 or more."` in an unsaved form; arbitrary invalid timezone strings and direct API `PATCH` calls were not executed here.

---

## 2. Incoming Findings & Defect Triage on EquipFlow (Product Team `TH-045_P2`)

* **Assessed Product Release:** EquipFlow (`https://equipflow-ddqo5fpv2a-as.a.run.app`, Cloud Run revision `equipflow-00009-kns`, `main` commit `8217beff7d33b2fc7657c36824d4a22a0df6bb94`, Sprint 1 tag `v0.1.0-sprint1` at commit `e661a2090bf82c1bcef465d81a8513f0eb8be2cc`)
* **Independent UAT Team:** Team `TH-017` (`2 auan` — Kamonnat Seetakai `67070501001`, Benyapha Rattanakhunodom `67070501030`)
* **Execution Window & Run ID:** **24 November 2026 (`19:52–20:54 ICT`)** · `Run ID: R01`
* **Created Live Records (`R01`):** Request ID `cmwuq6uo10001s601j8qbjvk4` · Loan ID `cmwuqbdqb0003s601jm1zifq0` (Asset: `CPE-RPI-001`)
* **Source Evidence Package:** [`TH-017_UAT_Execution_and_Defect_Report_for_EquipFlow.pdf`](../../evidence/lab-06/l6-3/TH-017_UAT_Execution_and_Defect_Report_for_EquipFlow.pdf)

### 2.1 Incoming UAT Execution Summary (`Team TH-017`, `Run ID: R01`)

All `6` planned UAT cases (`UAT-EF-01`–`06`) passed core functional, business-rule, authorization, ownership-isolation, and persistence checks (`0` Critical/Major defects), while `UAT-EF-04` and `UAT-EF-06` surfaced **two reproducible Minor UI contract defects (`DEF-EF-01`, `DEF-EF-02`)**:

| Case ID | Category & Req / AC | Tester (`TH-017`) | Executed At (`ICT`) | Observed Summary (UI & Sanitized API) | Verdict | Evidence Ref (`TH-017` PDF) |
| :---: | :--- | :--- | :---: | :--- | :---: | :---: |
| **`UAT-EF-02`** | `2A. Business-Rule` (`BR-04` / `AC-REQ-03`) | Kamonnat Seetakai (`67070501001`) | `2026-11-24 20:15:54` | `CPE-RPI-001` remained `AVAILABLE` with disabled `Limit Reached (3/3)` button; `POST /api/v1/requests` rejected with `HTTP 400` (`EXCEEDS_ACTIVE_QUOTA`); quota unchanged at `3/3`. | **`PASS`** | `EV-TH017-02` (p. 1, 4) |
| **`UAT-EF-03`** | `2B. Business-Rule` (`BR-01` / `AC-REQ-02`) | Kamonnat Seetakai (`67070501001`) | `2026-11-24 20:19:14` | Non-available cards showed disabled buttons; `POST /api/v1/requests` for `CPE-LOG-001` (`MAINTENANCE`) and `CPE-RPI-002` (`CHECKED_OUT`) rejected with `HTTP 400` (`ITEM_NOT_AVAILABLE`); quota unchanged (`1/3`). | **`PASS`** | `EV-TH017-03` (p. 2, 4–5) |
| **`UAT-EF-04`** | `3A. Forbidden Role` (`FR-04`, `BR-03`) | Benyapha Rattanakhunodom (`67070501030`) | `2026-11-24 19:52:33` | Direct visit to `/custodian/desk` did not mount Custodian Desk (`custodianDeskMounted: false`), API returned `401 UNAUTHENTICATED` (anon) and `403 FORBIDDEN_ROLE` (borrower) with `dataDisclosed: false`, but browser stayed on `/custodian/desk` with no unauthorized notice (`DEF-EF-01`). | **`PASS*`** *(`DEF-EF-01`)* | `EV-TH017-04` (p. 2, 5–6) |
| **`UAT-EF-05`** | `3B. Isolation & Logout` (`FR-11`, `FR-03`) | Benyapha Rattanakhunodom (`67070501030`) | `2026-11-24 20:54:40` | `GET /api/v1/requests/my` returned only own `CPE-RPI-002` records (`0` leaked `BORROWER_FULL` records); Session A logout returned `200` and revoked A (`401 TOKEN_REVOKED`) while concurrent Session B stayed `200` until own logout (`401`). | **`PASS`** | `EV-TH017-05` (p. 2, 6–7) |
| **`UAT-EF-01A/B`** | `1. Normal Journey` (Borrower Auth & Req / Custodian Checkout) | Kamonnat (`1–6`) & Benyapha (`7–11`) | `2026-11-24 20:24:48` / `20:27:34` | `BORROWER_FREE` (`67070501002`) reserved `CPE-RPI-001` (`cmwuq6uo10001s601j8qbjvk4`, `PENDING`, `RESERVED`, quota `2/3`); Custodian (`STAFF-001`) checked out creating `ACTIVE` loan `cmwuqbdqb0003s601jm1zifq0` (`CHECKED_OUT`, due date exactly `+7` days / `604800000 ms`). | **`PASS`** | `EV-TH017-01A`, `EV-TH017-01B` (p. 3, 7–9) |
| **`UAT-EF-06`** | `4. State & Persistence` (`FR-10`, `BR-05`, `BR-08`) | Kamonnat (`1–5`) & Benyapha (`6`) | `2026-11-24 20:32:58` | Across `Ctrl+F5` and fresh re-login: `CPE-RPI-001` stayed `CHECKED_OUT`, quota `2/3` (`pending: 0`, `active: 2`), request persisted as `APPROVED`, both loans persisted; lower `MyRequests` table rendered `APPROVED` rows under `Pending Requests (2)` (`DEF-EF-02`). | **`PASS*`** *(`DEF-EF-02`)* | `EV-TH017-06A`, `EV-TH017-06B` (p. 3, 9–10) |

### 2.2 Incoming Defect Triage Table (Dedicated Defect Issues `#52` & `#53`)

| Incoming ID | Dedicated Defect Issue | Reporter & Linked Case / Req | Finding Summary | Reproduced by Pair? (`NxNxmm` & `itspxsh`) | Classification | Contract Rationale (`docs/srs.md` / Sprint 1 Specs) | Severity | Owner | Fix Status & Disposition |
| :---: | :---: | :--- | :--- | :---: | :---: | :--- | :---: | :---: | :--- |
| **`DEF-EF-01`** | **[Issue `#52`](https://github.com/NxNxmm/CPE334-Sec01-Team45/issues/52)** | Benyapha Rattanakhunodom (`TH-017` · `67070501030`) — `UAT-EF-04` (`FR-04`, `BR-03`) | Direct navigation by `BORROWER_FREE` to `/custodian/desk` blocks Custodian Desk (`custodianDeskMounted: false`, API `401` / `403 FORBIDDEN_ROLE`, `dataDisclosed: false`), but the URL remains `/custodian/desk` and no unauthorized/forbidden toast or alert banner is shown (`unauthorizedNoticeRendered: false`). | **Yes** — Reproduced on `equipflow-00009-kns` and verified in [`client/src/App.tsx`](../../../client/src/App.tsx) (`App` does not inspect `window.location.pathname` or render an unauthorized alert). | **`accepted defect`** | Genuine UI contract mismatch against `UI-SPEC-SPRINT-01 §3.1` and `STS E2E-01-03` (expecting redirect off `/custodian/desk` and an explicit unauthorized notice). Security & data isolation remain intact. | **`Minor`** | `@NxNxmm` *(fix)* / `@itspxsh` *(review)* | **Open — Fix implemented in `L6-4` (`fix/lab6-def-ef-01-02`, Issue `#45` / `#52`)** via `RED -> GREEN` client test + redirect/alert in `App.tsx`; pending merge, deploy & independent retest in `L6-5` (`#46`). |
| **`DEF-EF-02`** | **[Issue `#53`](https://github.com/NxNxmm/CPE334-Sec01-Team45/issues/53)** | Kamonnat Seetakai (`67070501001`) & Benyapha Rattanakhunodom (`67070501030`) `[TH-017]` — `UAT-EF-06` (`FR-10`, `AC-REQ-05`) | Lower table in `MyRequests.tsx` displays heading `'Pending Requests (2)'` and renders both already-approved requests (`seed_request_checked_out` and `cmwuq6uo10001s601j8qbjvk4`) with static `'⏳ Pending Approval'` badges despite `GET /api/v1/requests/my` returning `apiStatus: 'APPROVED'` and `quota.pendingRequestsCount: 0`. | **Yes** — Reproduced on `equipflow-00009-kns` (`EV-TH017-06A`) and verified in [`client/src/components/MyRequests.tsx`](../../../client/src/components/MyRequests.tsx) (lines `121`, `234`, `251–260` render all `requests` without filtering by `status === 'PENDING'`). | **`accepted defect`** | Genuine UI display contract mismatch against `FR-10`, `AC-REQ-05`, and `UI-01-07`: pending requests section count (`2`) contradicts `quota.pendingRequestsCount` (`0`) and mislabels `APPROVED` history rows as `Pending Approval`. | **`Minor`** | `@NxNxmm` *(fix)* / `@itspxsh` *(review)* | **Open — Fix implemented in `L6-4` (`fix/lab6-def-ef-01-02`, Issue `#45` / `#53`)** via `RED -> GREEN` client test + status filtering/accurate status badges in `MyRequests.tsx`; pending merge, deploy & independent retest in `L6-5` (`#46`). |

### 2.3 Selected Part D Resolution Path (`#52`, `#53`, `#45` & `#46`)

Per Lab 6 Handout §§3.4–3.5 and the course instructor's clarification (**Lab 6: Clarification for Teams with No UAT Defects**):
- **Selected Path — Path 1 (Genuine Defect Resolution):** Because independent testing by Team `TH-017` uncovered two legitimate, reproducible Sprint 1 UI contract defects (`DEF-EF-01` -> Issue [`#52`](https://github.com/NxNxmm/CPE334-Sec01-Team45/issues/52), `DEF-EF-02` -> Issue [`#53`](https://github.com/NxNxmm/CPE334-Sec01-Team45/issues/53)), Product Team `TH-045_P2` formally **accepts both defects** and resolves both rather than leaving either as an unresolved minor limitation. **The Zero-Defect Special Exercise (deliberate defect reintroduction) is not required.**
- **Part D Execution Chain (`#52`, `#53`, `L6-4` Issue `#45` & `L6-5` Issue `#46`):**
  1. **`RED` Reproduction (`L6-4` / `#45`, `#52`, `#53`):** Added automated Vitest/RTL client tests reproducing `DEF-EF-01` (direct `/custodian/desk` navigation as `BORROWER` triggering URL replacement to `/` and an accessible `role="alert"` unauthorized notice) and `DEF-EF-02` (`MyRequests` excluding `APPROVED` requests from `Pending Requests (n)` so heading count matches `pendingRequestsCount` and approved history displays `Approved`), capturing failing `RED` output prior to source edits.
  2. **`GREEN` Implementation & Regression (`L6-4` / `#45`, `#52`, `#53`):** Updated [`client/src/App.tsx`](../../../client/src/App.tsx) and [`client/src/components/MyRequests.tsx`](../../../client/src/components/MyRequests.tsx), verified full client tests and workspace build (`npm run test:client`, `npm run build`), documented `RED -> GREEN` evidence in `docs/labs/lab-06/defect-resolution.md`, and submitted PR review + `test-and-docker` CI into `sprint-1-staging`.
  3. **Release Deploy & Non-Destructive Independent Retest (`L6-5` / `#46`):** Notify Team `TH-017`, merge Release PR (`sprint-1-staging -> main`) to deploy a new Cloud Run revision, and arrange Team `TH-017` independent retest on production. Note that **`BORROWER_FREE` (`borrower2@cpe.kmutt.ac.th`) already retains both persisted `APPROVED` requests in Cloud SQL**, enabling Team `TH-017` to verify both `#52` and `#53` directly without requiring a database reset.
