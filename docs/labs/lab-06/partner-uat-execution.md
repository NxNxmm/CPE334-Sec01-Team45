# CPE334 Lab 6 (Part B) — Independent UAT Execution Report on Partner System (Appointly · Team `TH-017`)

**Course:** CPE 334 Software Engineering (Semester 1 / Year 3)  
**Assignment:** Lab 6 — Independent User Acceptance Testing and Defect Management (Part B: Independent UAT Execution)  
**Document ID:** `UAT-EXEC-PARTNER-TH017`  
**Version:** `1.3.0` *(Reconciled against PR `#49` review checklist: assertion-level verdicts, `#43` pair workflow exception & partner handoff links, `UAT-AP-03` protected-state honesty, complete 22-capture evidence index, and pre-retest fixture disposition)*  
**Tracking Issue:** [Issue #43 (`[Lab 6] L6-2: Independent UAT execution on partner system (Part B)`)](https://github.com/NxNxmm/CPE334-Sec01-Team45/issues/43)  
**PR Author (Agreed Pair Exception on `#43`):** `Norawit Mahaprom` (`67070501026` · `@NxNxmm`)  
**PR Reviewer:** `Pawarisa Thongchua` (`67070501032` · `@itspxsh`)  
**Execution Date & Window:** Tuesday, 24 November 2026 (`22:16–23:44 ICT`)  
**Execution Mode & Workflow Note:** **Manual UAT · Mandatory Pair Work (Lab 6 Handout §3.2)** — Both `Norawit Mahaprom` (`67070501026`) and `Pawarisa Thongchua` (`67070501032`) jointly executed all `6` supplied Sprint 1 UAT cases (`UAT-AP-01`–`06`) plus `5` exploratory Sprint 1 checks (`UAT-AP-07`–`11`), captured across `22` screenshots on Team `TH-017`'s live Cloud Run deployment. Per the agreed pair workflow exception documented in Issue `#43`, `@NxNxmm` authored PR `#49` and `@itspxsh` performed substantive PR review before merge into `sprint-1-staging`.

---

## 1. Assessed Partner System & Handoff Baseline (`TH-017` — `2 auan`)

| Attribute | Authoritative Value & Traceable Reference |
| :--- | :--- |
| **Product Team (System Owner)** | **`TH-017` (`2 auan`)** — **Kamonnat Seetakai** (`67070501001`) & **Benyapha Rattanakhunodom** (`67070501030`) |
| **Independent UAT Team (Assessors)** | **`TH-045_P2` (EquipFlow)** — **Norawit Mahaprom** (`67070501026` · `@NxNxmm`) & **Pawarisa Thongchua** (`67070501032` · `@itspxsh`) |
| **Product Under Test & Source Repo** | **Appointly** ([`Piink7878/appointly-clinic-scheduling`](https://github.com/Piink7878/appointly-clinic-scheduling)) |
| **Sprint 1 Contract Reference (`6b73bfdb`)** | [`specs/sprints/sprint-1-contracts.md` @ `6b73bfdb`](https://github.com/Piink7878/appointly-clinic-scheduling/blob/6b73bfdbf029343e4af3268d72e9364fbab12f52/specs/sprints/sprint-1-contracts.md) (`F-001`–`F-007`; excludes Sprint 2/3 patient self-registration, slot booking `/patient/appointments`, and reports) |
| **Supplied `TH-017` UAT Plan (`853e6a70`)** | [`docs/labs/lab-06/uat-plan.md` @ `853e6a70`](https://github.com/Piink7878/appointly-clinic-scheduling/blob/853e6a70366f9e1619e1723e998e90c30a3b749c/docs/labs/lab-06/uat-plan.md) & private handoff notes (`UAT-Test-Handoff-Appointly.txt`, received 24 Nov 2026) |
| **Sprint 1 Release Tag (`v0.1.0-sprint1`)** | `9808f9657a4200f5dddf49412a276fc874ff4175` |
| **Assessed `main` Release Commit** | `6b73bfdbf029343e4af3268d72e9364fbab12f52` |
| **Deployed Live Cloud Run URL** | `https://s96ba5182-4d7hbszvwq-as.a.run.app` |
| **Active Cloud Run Service & Revision** | Service: `s96ba5182` · Revision: **`s96ba5182-00005-ch9`** (`100%` traffic, GCP Project `cpe-se-course-2026`, `asia-southeast1`) |
| **Execution Outcome Headline** | **Supplied 6 cases (`UAT-AP-01`–`06`):** `3` Full `PASS` (`UAT-AP-01`, `UAT-AP-02`, `UAT-AP-06`), `2` **`PARTIAL PASS`** (`UAT-AP-03` unverified pre/post read-back; `UAT-AP-05` positive assignment not executed), `1` **`BLOCKED`** (`UAT-AP-04` unobservable `AuditLog` assertion).<br>**Exploratory 5 cases (`UAT-AP-07`–`11`):** `4` `PASS` (scoped to verified checks) and `1` **`FAIL`** (`UAT-AP-09` -> `DEF-AP-02` & `DEF-AP-03`). |
| **Credential Hygiene Confirmation** | Passwords for `ADMIN_USER`, `DOCTOR_USER`, `PATIENT_USER`, and `INACTIVE_USER` were received privately via team chat and are excluded from this report, console logs, and screenshots (`<REDACTED_PRIVATE_CREDENTIAL>`). |

---

## 2. Pair Participation & Executed Sequence (`UAT-AP-03 → 02 → 01 → 06 → 05 → 04 → Exploratory 07–11`)

Following [`TH-017` `uat-plan.md` §4.1](https://github.com/Piink7878/appointly-clinic-scheduling/blob/853e6a70366f9e1619e1723e998e90c30a3b749c/docs/labs/lab-06/uat-plan.md) and Lab 6 Handout §3.2 (*"Both students in a 2-person team must participate in UAT execution"*), both members of Team `TH-045_P2` jointly executed all `11` manual/exploratory cases across `22` evidence screenshots:

| Run Order | Case ID | Category (Lab 6 Handout §3.1) | Verified Feature & AC Scope *(Separated from Unexecuted / Unverified Items)* | Lead Tester (`TH-045_P2`) | Co-Tester / Verifier (`TH-045_P2`) | Evidence IDs |
| :---: | :---: | :--- | :--- | :--- | :--- | :--- |
| **1st** | **`UAT-AP-03`** | 3. Forbidden Role / Ownership Case | `F-001` Inactive Login (`AC-F001-03`) & `PATIENT` RBAC (`AC-F001-04` `/admin/settings` & `PATCH /api/v1/admin/settings`). *(`AC-F002-02` and protected-state read-back unverified here)* | **Norawit Mahaprom** (`67070501026`) | **Pawarisa Thongchua** (`67070501032`) | `EV-UAT-03A`, `EV-UAT-03B` |
| **2nd** | **`UAT-AP-02`** | 2. Business-Rule & Boundary Case | `F-006` Schedule Overlap Conflict (`AC-F006-02`) & `F-004` Upper Service Duration `481`/`500` (`AC-F004-03`). *(Inverted shift & lower bound verified separately in `UAT-AP-09`/`10`)* | **Pawarisa Thongchua** (`67070501032`) | **Norawit Mahaprom** (`67070501026`) | `EV-UAT-02A`, `EV-UAT-02B` |
| **3rd** | **`UAT-AP-01`** | 1. Normal Domain Journey | `F-006` Doctor Self-Schedule Split-Shift (`AC-F006-01`, `AC-F001-01`) | **Norawit Mahaprom** (`67070501026`) | **Pawarisa Thongchua** (`67070501032`) | `EV-UAT-01` |
| **4th** | **`UAT-AP-06`** | 2/4. Date Exception & Override Case | `F-006` Schedule Exceptions (`AC-F006-03` future holiday creation) | **Pawarisa Thongchua** (`67070501032`) | **Norawit Mahaprom** (`67070501026`) | `EV-UAT-06` |
| **5th** | **`UAT-AP-05`** | 1/2. Cross-Entity Assignment Journey | Verified `F-005` Duplicate `409` (`AC-F005-02`) & `F-003` Patient Filter (`AC-F003-02`). *(Positive new assignment `AC-F005-01` **Not Executed**)* | **Norawit Mahaprom** (`67070501026` — Admin API) & **Pawarisa Thongchua** (`67070501032` — Patient Filter) | Pair Co-Execution | `EV-UAT-05A`, `EV-UAT-05B` |
| **6th** | **`UAT-AP-04`** | 4. State, History & Persistence Case | Verified `F-007` Settings Persistence (`AC-F007-01` settings part) & `F-001` Logout `401` (`AC-F001-01`). *(AuditLog row **Blocked** — unobservable via UI/API)* | **Pawarisa Thongchua** (`67070501032`) | **Norawit Mahaprom** (`67070501026`) | `EV-UAT-04A`, `EV-UAT-04B` |
| **7th (Exp.)** | **`UAT-AP-07`** | Exploratory: Business-Rule & Boundary (`F-002`) | `F-002` Patient Profile UI (phone format, blank fields, future DOB picker) & combined-payload API `400` check | **Norawit Mahaprom** (`67070501026`) | **Pawarisa Thongchua** (`67070501032`) | `EV-UAT-07A`, `EV-UAT-07B`, `EV-UAT-07C` |
| **8th (Exp.)** | **`UAT-AP-08`** | Exploratory: Cross-Entity Visibility (`F-003`) | `F-003` Admin Doctor Deactivation Hidden from Patient Directory (`AC-F003-02`) | **Norawit Mahaprom** (`67070501026`) | **Pawarisa Thongchua** (`67070501032`) | `EV-UAT-08` |
| **9th (Exp.)** | **`UAT-AP-09`** | Exploratory: Schedule Exception & Boundary (`F-006`) | `F-006` (`AC-F006-03`, `AC-F006-02`) Duplicate Full-Day & Overlapping Partial-Day Holidays, Past-Date API Bypass & Inverted Shift | **Norawit Mahaprom** (`67070501026`) | **Pawarisa Thongchua** (`67070501032`) | `EV-UAT-09A`..`09E` |
| **10th (Exp.)** | **`UAT-AP-10`** | Exploratory: Service Lower Boundary (`F-004`) | `F-004` Service Duration Lower Bound (`0` / Negative Minutes) in UI & API (`AC-F004-03`) | **Norawit Mahaprom** (`67070501026`) | **Pawarisa Thongchua** (`67070501032`) | `EV-UAT-10A`, `EV-UAT-10B` |
| **11th (Exp.)** | **`UAT-AP-11`** | Exploratory: Clinic Settings UI Bounds (`F-007`) | `F-007` Negative Cutoff `-5` Inline Error & IANA Timezone LoV Selector *(UI-only; unsaved form)* | **Norawit Mahaprom** (`67070501026`) | **Pawarisa Thongchua** (`67070501032`) | `EV-UAT-11` |

---

## 3. Summary UAT Execution Log Table (Assertion-Honest Verdicts on `s96ba5182-00005-ch9`)

| Run Order & Case ID | Category & Verified AC Scope | Tested Commit / Rev | Timestamp (ICT) | Tester (`TH-045_P2`) | Synthetic Inputs Used | Actual Result & Per-Assertion Outcome | Case Verdict | Evidence ID |
| :---: | :--- | :---: | :---: | :--- | :--- | :--- | :---: | :---: |
| **1st · `UAT-AP-03`** | **Forbidden Role / RBAC**<br>`F-001` (`AC-F001-03`, `AC-F001-04`) | `6b73bfdb`<br>`s96ba5182-00005-ch9` | `2026-11-24 22:16:37` (`03A`)<br>`2026-11-24 22:20:30` (`03B`) | **Lead:** Norawit (`67070501026`)<br>**Co:** Pawarisa (`67070501032`) | 1) Login: `inactive@appointly.local`<br>2) Login: `patient@appointly.local` -> `/admin/settings`<br>3) `PATCH /api/v1/admin/settings` (`{"clinicName":"Unauthorized Name Mutation"}`) | - **Inactive Login (`PASS`):** Stayed on `/login` with `"Account Suspended: Your account is currently inactive..."` (`EV-UAT-03A`).<br>- **`/admin/settings` Redirect & API `403` (`PASS`):** Redirected to `/unauthorized` (`"403 — Access Denied"`); `PATCH /api/v1/admin/settings` returned HTTP `403` (`FORBIDDEN`, `EV-UAT-03B`).<br>- **`/admin/doctors` Nav & Pre/Post State Check (`UNVERIFIED`):** Direct `/admin/doctors` navigation and contemporaneous pre/post `GET /api/v1/settings/public` read-back were not captured.<br>- **`AC-F002-02` Cross-Patient Check:** Not covered by `UAT-AP-03` steps (`UNVERIFIED`; logged in §5). | **`PARTIAL PASS`** *(protected-state read-back unverified; `AC-F002-02` excluded)* | `EV-UAT-03A`, `EV-UAT-03B` |
| **2nd · `UAT-AP-02`** | **Boundary / Business Rule**<br>`F-006` (`AC-F006-02`), `F-004` (`AC-F004-03` upper) | `6b73bfdb`<br>`s96ba5182-00005-ch9` | `2026-11-24 22:24:50` (`02A`)<br>`2026-11-24 22:28:08` (`02B`) | **Lead:** Pawarisa (`67070501032`)<br>**Co:** Norawit (`67070501026`) | 1) `doctor@appointly.local`: Monday `09:00 AM–01:00 PM` & `12:00 AM–04:00 PM`; API `PUT` `09:00:00–13:00:00` & `12:00:00–16:00:00`<br>2) `admin@appointly.local`: UI `"UAT Test"` / `500` min; API `POST` `481` min | - **Overlap Conflict (`PASS`):** Red UI banner + inline `"Overlaps with 00:00–16:00."`; API returned **HTTP `422` (`INVALID_SCHEDULE_WINDOW`)** (`EV-UAT-02A`).<br>- **Upper Duration Bound (`PASS`):** UI blocked `500` (`"Duration must be between 1 and 480 minutes."`); API `481` returned **HTTP `400` (`VALIDATION_ERROR`)** (`EV-UAT-02B`).<br>- *(Note: Inverted shift & lower bound `0` tested separately in `UAT-AP-09`/`10`.)* | **`PASS`** | `EV-UAT-02A`, `EV-UAT-02B` |
| **3rd · `UAT-AP-01`** | **Normal Domain Journey**<br>`F-006` (`AC-F006-01`, `AC-F001-01`) | `6b73bfdb`<br>`s96ba5182-00005-ch9` | `2026-11-24 22:40:03` | **Lead:** Norawit (`67070501026`)<br>**Co:** Pawarisa (`67070501032`) | `doctor@appointly.local` Monday: changed Shift 1 to `08:30–12:00` & saved, then restored `09:00–12:00` & `13:00–17:00` (`isActive: true`) & saved | - **Split-Shift Persistence (`PASS`):** UI displayed `"Weekly schedule saved successfully."`; `GET /api/v1/doctors/me/schedule` returned 2 Monday rows: `09:00`–`12:00` & `13:00`–`17:00` (`active: true`, `EV-UAT-01`).<br>- **Precondition / Format Note (`OBS-AP-01`):** Seeded Monday already defaulted to `09:00–12:00` / `13:00–17:00` (`Save Schedule` disabled until edited); API returns `HH:MM` rather than `HH:MM:SS`. | **`PASS`** *(minor `OBS-AP-01` logged)* | `EV-UAT-01` |
| **4th · `UAT-AP-06`** | **Schedule Exception**<br>`F-006` (`AC-F006-03` create path) | `6b73bfdb`<br>`s96ba5182-00005-ch9` | `2026-11-24 22:44:52` (`401`)<br>`2026-11-24 22:45:02` (`EV-UAT-06`) | **Lead:** Pawarisa (`67070501032`)<br>**Co:** Norawit (`67070501026`) | `doctor@appointly.local`: Date `2026-12-31`, Type `Holiday`, `Full day`, Reason `"New Year Holiday - Clinic Closed"` | - **Future Holiday Persistence (`PASS`):** After fresh sign-in (`22:45:02`), UI rendered `"Holiday added for Thu, 31 Dec 2026."` and `GET /api/v1/doctors/me/schedule` returned `fullDay: true` (`EV-UAT-06`).<br>- **Idle `401` Finding (`DEF-AP-01`):** Prior ~15–20 min idle attempt at `22:44:52` failed `401` without `refresh_token` recovery or redirect. | **`PASS`** *(idle `401` logged as `DEF-AP-01`)* | `EV-UAT-06` |
| **5th · `UAT-AP-05`** | **Cross-Entity Assignment Journey**<br>`F-005` (`AC-F005-02`), `F-003` (`AC-F003-02`) | `6b73bfdb`<br>`s96ba5182-00005-ch9` | `2026-11-24 22:48:48` (`05A`)<br>`2026-11-24 22:50:01` (`05B`) | **Pair:** Norawit (Admin API) & Pawarisa (Patient Filter) | 1) Admin: `POST .../fd848770-.../services` (`316aee65-...`, already assigned)<br>2) Patient: `/patient/doctors?serviceId=72daa0a5-...` (`General Consultation`) | - **Duplicate Rejection (`PASS`):** `Manage Services` showed `3 of 4 services assigned`; duplicate `POST` returned **HTTP `409` (`DUPLICATE_ASSIGNMENT`)** (`EV-UAT-05A`).<br>- **Patient Directory Filter (`PASS`):** `/patient/doctors?serviceId=...` rendered the 2 active assigned doctors (`EV-UAT-05B`).<br>- **New Assignment Creation (`AC-F005-01` positive part):** **`NOT EXECUTED`** — unassigned service `Consultation` shown in modal was not newly assigned during the run. | **`PARTIAL PASS`** *(`AC-F005-01` new assignment not executed)* | `EV-UAT-05A`, `EV-UAT-05B` |
| **6th · `UAT-AP-04`** | **State Persistence, Audit & Logout**<br>`F-007` (`AC-F007-01`), `F-001` (`AC-F001-01`) | `6b73bfdb`<br>`s96ba5182-00005-ch9` | `2026-11-24 22:51:31` (`04A`)<br>`2026-11-24 22:52:14` (`04B`) | **Lead:** Pawarisa (`67070501032`)<br>**Co:** Norawit (`67070501026`) | `admin@appointly.local`: `Appointly Executive Care Centre`, `Asia/Bangkok`, `15 minutes`, `24` -> `Save Settings` -> `Ctrl+F5` -> `Log out` -> `GET /api/v1/auth/me` | - **Settings Persistence (`PASS`):** Retained across `Ctrl+F5` and matched `GET /api/v1/settings/public` (`EV-UAT-04A`).<br>- **Logout Revocation (`PASS`):** Redirected to `/login`; `GET /api/v1/auth/me` returned **HTTP `401 UNAUTHORIZED`** (`EV-UAT-04B`).<br>- **AuditLog (`CLINIC_SETTINGS_UPDATED` / `AC-F007-01`):** **`BLOCKED`** *(Sprint 1 exposes no Admin UI or API endpoint for independent testers to observe `AuditLog` entries without direct DB access; `OBS-AP-02`)*. | **`BLOCKED`** *(Settings & Logout `PASS`; AuditLog `BLOCKED`)* | `EV-UAT-04A`, `EV-UAT-04B` |
| **7th (Exp.) · `UAT-AP-07`** | **Exploratory (`F-002` Patient Profile)**<br>`GET/PUT /api/v1/patients/me` (`AC-F002-01`) | `6b73bfdb`<br>`s96ba5182-00005-ch9` | `2026-11-24 23:13:24` (`07A`)<br>`23:14:00` (`07B`)<br>`23:34:17` (`07C`) | **Lead:** Norawit (`67070501026`)<br>**Co:** Pawarisa (`67070501032`) | 1) UI phone `0212345678`, blank Full Name & Phone, DOB picker<br>2) Single combined API payload `{fullName:'   ', phoneNumber:'0812345678', dateOfBirth:'2030-01-01'}` | - **UI Guards (`PASS`):** Invalid phone & blank fields blocked inline; DOB calendar disabled `24 Nov 2026`+ (`EV-UAT-07A`, `07B`).<br>- **Combined API Rejection (`PASS`, scoped):** `PUT /api/v1/patients/me` returned **HTTP `400`** (`EV-UAT-07C`), proving backend rejection of the combined invalid payload *(per-field backend isolation not separately tested)*. | **`PASS`** *(scoped to UI + combined API payload)* | `EV-UAT-07A`..`07C` |
| **8th (Exp.) · `UAT-AP-08`** | **Exploratory (`F-003` Doctor Status)**<br>`PATCH /api/v1/admin/doctors/:id/status` (`AC-F003-02`) | `6b73bfdb`<br>`s96ba5182-00005-ch9` | `2026-11-24 23:16:27` | **Lead:** Norawit (`67070501026`)<br>**Co:** Pawarisa (`67070501032`) | Deactivated `Dr. Somchai Prasert` (`INACTIVE`), then opened `/patient/doctors` | Patient directory rendered only `Dr. Somchai Prasert (Lead)`; deactivated `Dr. Somchai Prasert` was excluded (`EV-UAT-08`). *(Doctor manually reactivated by tester after capture.)* | **`PASS`** | `EV-UAT-08` |
| **9th (Exp.) · `UAT-AP-09`** | **Exploratory (`F-006` Schedule Exceptions & Inverted Shift)**<br>`AC-F006-02`, `AC-F006-03` | `6b73bfdb`<br>`s96ba5182-00005-ch9` | `2026-11-24 23:18:06` (`09A`) – `23:39:20` (`09E`) | **Lead:** Norawit (`67070501026`)<br>**Co:** Pawarisa (`67070501032`) | 1) Duplicate full-day `2026-12-31`<br>2) Inverted shift `04:00 PM`–`10:00 AM`<br>3) API `POST /exceptions` `2020-01-01`<br>4) Partial `2026-12-31` `13:00–17:00` | - **Inverted Shift & UI Past Date (`PASS`):** Blocked inline (`"End time must be after start time."`, `EV-UAT-09B`); UI picker disabled past dates.<br>- **`DEF-AP-02` (`FAIL`):** Duplicate full-day (`EV-UAT-09A`) and overlapping partial-day `13:00–17:00` (`EV-UAT-09E`) succeeded on `2026-12-31` (3 rows persisted).<br>- **`DEF-AP-03` (`FAIL`):** Direct `POST /api/v1/doctors/me/exceptions` with `2020-01-01` returned **`201 Created`** and persisted `Wed, 1 Jan 2020` (`EV-UAT-09C`, `09D`). | **`FAIL`** *(`DEF-AP-02` & `DEF-AP-03`)* | `EV-UAT-09A`..`09E` |
| **10th (Exp.) · `UAT-AP-10`** | **Exploratory (`F-004` Service Lower Bound)**<br>`AC-F004-03` lower | `6b73bfdb`<br>`s96ba5182-00005-ch9` | `2026-11-24 23:40:44` (`10A`)<br>`23:41:30` (`10B`) | **Lead:** Norawit (`67070501026`)<br>**Co:** Pawarisa (`67070501032`) | UI modal & API `POST /api/v1/admin/services` (`durationMinutes: 0`) | Both UI modal (`EV-UAT-10A`) and backend API (**HTTP `400`**, `EV-UAT-10B`) rejected `durationMinutes: 0`. | **`PASS`** | `EV-UAT-10A`, `EV-UAT-10B` |
| **11th (Exp.) · `UAT-AP-11`** | **Exploratory (`F-007` Settings UI Validation)**<br>`AC-F007-01` *(UI-only)* | `6b73bfdb`<br>`s96ba5182-00005-ch9` | `2026-11-24 23:43:30` | **Lead:** Norawit (`67070501026`)<br>**Co:** Pawarisa (`67070501032`) | Unsaved `/admin/settings` draft: `Timezone` changed `Asia/Bangkok` -> `Asia/Singapore`, `Fixed start interval` changed `15` -> `5 minutes`, `Cancellation cutoff` changed `24` -> `-5` | - **UI Cutoff & Timezone LoV (`PASS`):** Entering `-5` highlighted cutoff red with `"Enter a whole number of hours, 0 or more."`; Timezone dropdown/LoV constrained selection (`Asia/Singapore`, `EV-UAT-11`). Changes were **not saved**.<br>- **Direct API Boundary (`NOT EXECUTED`):** Intentionally skipped `PATCH` to avoid mutating live clinic settings. | **`PASS`** *(UI-only validation; API not executed)* | `EV-UAT-11` |

---

## 4. Detailed Case-by-Case Execution Observations & Console Captures

### 4.1 Case 1st: `UAT-AP-03` — Role-Based Access Control (RBAC) Denial & Inactive Account Rejection
* **Lead Tester:** Norawit Mahaprom (`67070501026`) · **Co-Tester:** Pawarisa Thongchua (`67070501032`)
* **Execution Timestamps (ICT):** `2026-11-24 22:16:37 ICT` (`EV-UAT-03A`) & `2026-11-24 22:20:30 ICT` (`EV-UAT-03B`)
* **Tested URL & Revision:** `https://s96ba5182-4d7hbszvwq-as.a.run.app` (`s96ba5182-00005-ch9`, commit `6b73bfdbf029343e4af3268d72e9364fbab12f52`)
* **Per-Assertion Results:**
  1. **Inactive Account Rejection (`AC-F001-03` — `PASS`):** Signing in with `inactive@appointly.local` stayed on `/login` and rendered the red alert banner `"Account Suspended: Your account is currently inactive. Please contact the clinic administrator."` (`EV-UAT-03A`).
  2. **Patient Role Route Guard on `/admin/settings` & API `403` (`AC-F001-04` — `PASS`):** Signing in as `patient@appointly.local` and visiting `/admin/settings` redirected immediately to `/unauthorized` rendering `"403 — Access Denied"` (`"Your current account role (PATIENT) does not have authorization to view this resource."`, `EV-UAT-03B`). Executing `PATCH /api/v1/admin/settings` in DevTools Console returned:
     ```text
     PATCH https://s96ba5182-4d7hbszvwq-as.a.run.app/api/v1/admin/settings 403 (Forbidden)
     === UAT-AP-03 PATIENT PRIVILEGE ESCALATION RESULT ===
     Timestamp ICT: 2026-11-24 22:20:30
     Status Code: 403
     Error Code : FORBIDDEN
     Message    : Access forbidden: Role 'PATIENT' lacks permission for this resource.
     ```
  3. **Protected-State Read-Back & `/admin/doctors` Nav (`UNVERIFIED`):** No contemporaneous `GET /api/v1/settings/public` read-back was captured immediately before or after the `22:20:30 ICT` `PATCH` attempt (`EV-UAT-04A` reflects a later authorized Admin save and cannot establish state before that save). Separate direct browser navigation to `/admin/doctors` as `PATIENT` was also not captured.
  4. **Cross-Patient Ownership Check (`AC-F002-02`):** Excluded from `UAT-AP-03` verified claims because `TH-017`'s `UAT-AP-03` actions contained no cross-patient query step and no evidence was captured (recorded in §5 Coverage Audit).
* **Verdict:** **`PARTIAL PASS`**

---

### 4.2 Case 2nd: `UAT-AP-02` — Schedule Overlap Conflict & Upper Service Duration Boundary
* **Lead Tester:** Pawarisa Thongchua (`67070501032`) · **Co-Tester:** Norawit Mahaprom (`67070501026`)
* **Execution Timestamps (ICT):** `2026-11-24 22:24:50 ICT` (`EV-UAT-02A`) & `2026-11-24 22:28:08 ICT` (`EV-UAT-02B`)
* **Tested URL & Revision:** `https://s96ba5182-4d7hbszvwq-as.a.run.app` (`s96ba5182-00005-ch9`, commit `6b73bfdbf029343e4af3268d72e9364fbab12f52`)
* **Observed UI & Console Output (`EV-UAT-02A` & `EV-UAT-02B`):**
  - On `/doctor/schedule`, overlapping Monday slots (`09:00 AM–01:00 PM` and `12:00 AM–04:00 PM`) rendered the UI banner `"Fix 1 time slot before saving: shifts need an end after the start and must not overlap."` + `"Overlaps with 00:00–16:00."` (`PASS`).
  - On `/admin/services` (`Add New Service` `"UAT Test"` / `500` min), inline red validation displayed `"Duration must be between 1 and 480 minutes."` (`PASS`).
  ```text
  PUT https://s96ba5182-4d7hbszvwq-as.a.run.app/api/v1/doctors/me/schedule 422 (Unprocessable Content)
  === UAT-AP-02 SCHEDULE OVERLAP RESULT ===
  Timestamp ICT: 2026-11-24 22:24:50
  Status Code: 422
  Error Code : INVALID_SCHEDULE_WINDOW
  Message    : Schedule windows on the same day (1) must not overlap: [09:00:00-13:00:00] and [12:00:00-16:00:00].

  POST https://s96ba5182-4d7hbszvwq-as.a.run.app/api/v1/admin/services 400 (Bad Request)
  === UAT-AP-02 SERVICE DURATION BOUNDARY ===
  Timestamp ICT: 2026-11-24 22:28:08
  Status Code: 400
  Response   : {"success":false,"error":{"code":"VALIDATION_ERROR","message":"durationMinutes: Duration must be between 1 and 480 minutes"}}
  ```
* **Scope Boundary Note:** Inverted shift rejection (`endTime <= startTime`) and service duration lower boundary (`<= 0`) were not executed inside `UAT-AP-02` itself; both were verified separately in exploratory cases `UAT-AP-09` (`EV-UAT-09B`) and `UAT-AP-10` (`EV-UAT-10A`, `10B`).
* **Verdict:** **`PASS`**

---

### 4.3 Case 3rd: `UAT-AP-01` — Doctor Self-Schedule Split-Shift Configuration
* **Lead Tester:** Norawit Mahaprom (`67070501026`) · **Co-Tester:** Pawarisa Thongchua (`67070501032`)
* **Execution Timestamp (ICT):** `2026-11-24 22:40:03 ICT` (`EV-UAT-01`)
* **Tested URL & Revision:** `https://s96ba5182-4d7hbszvwq-as.a.run.app/doctor/schedule` (`s96ba5182-00005-ch9`, commit `6b73bfdbf029343e4af3268d72e9364fbab12f52`)
* **Observed UI & Console Behavior:**
  - Seeded Monday hours already defaulted to `09:00 AM–12:00 PM` & `01:00 PM–05:00 PM`, keeping `Save Schedule` disabled (`dirty`-state check, `OBS-AP-01`). The tester updated Shift 1 to `08:30 AM–12:00 PM`, saved, then restored `09:00 AM–12:00 PM` & `01:00 PM–05:00 PM` and saved -> green banner `"Weekly schedule saved successfully."`.
  ```text
  === UAT-AP-01 MONDAY SHIFTS === 2026-11-24 22:40:03
  (index) | day      | start   | end     | active
  0       | 'Monday' | '09:00' | '12:00' | true
  1       | 'Monday' | '13:00' | '17:00' | true
  ```
* **Verdict:** **`PASS`** *(minor test-plan precondition / `HH:MM` format observation logged as `OBS-AP-01`)*

---

### 4.4 Case 4th: `UAT-AP-06` — Doctor Holiday & Schedule Exception Overrides
* **Lead Tester:** Pawarisa Thongchua (`67070501032`) · **Co-Tester:** Norawit Mahaprom (`67070501026`)
* **Execution Timestamps (ICT):** `2026-11-24 22:44:52 ICT` (idle `401`) & `2026-11-24 22:45:02 ICT` (`EV-UAT-06`)
* **Tested URL & Revision:** `https://s96ba5182-4d7hbszvwq-as.a.run.app/doctor/schedule` (`s96ba5182-00005-ch9`, commit `6b73bfdbf029343e4af3268d72e9364fbab12f52`)
* **Observed UI & Console Behavior:**
  - **Idle `401` Finding (`DEF-AP-01`):** After ~15–20 min idle on `/doctor/schedule`, submitting at `22:44:52` returned `401 (Unauthorized)` on both `POST /api/v1/doctors/me/exceptions` and `GET /api/v1/doctors/me/schedule` without `refresh_token` refresh or `/login` redirect.
  - After fresh sign-in (`22:45:02`), submitting Date `2026-12-31`, Type `Holiday`, `Full day`, Reason `"New Year Holiday - Clinic Closed"` succeeded with `"Holiday added for Thu, 31 Dec 2026."`:
  ```text
  // At 22:44:52 (expired idle session on /doctor/schedule):
  GET https://s96ba5182-4d7hbszvwq-as.a.run.app/api/v1/doctors/me/schedule 401 (Unauthorized)
  POST https://s96ba5182-4d7hbszvwq-as.a.run.app/api/v1/doctors/me/exceptions 401 (Unauthorized)

  // At 22:45:02 (after re-authentication):
  === UAT-AP-06 REGISTERED EXCEPTIONS === 2026-11-24 22:45:02
  (index) | date                   | type      | reason                | fullDay
  0       | '2026-12-31T00:00:...' | 'HOLIDAY' | 'New Year Holiday...' | true
  ```
* **Verdict:** **`PASS`** *(logged session-expiry refresh finding `DEF-AP-01`)*

---

### 4.5 Case 5th: `UAT-AP-05` — Doctor-Service Assignment & Patient Directory Filter
* **Pair Testers:** Norawit Mahaprom (`67070501026` — Admin API) & Pawarisa Thongchua (`67070501032` — Patient Portal)
* **Execution Timestamps (ICT):** `2026-11-24 22:48:48 ICT` (`EV-UAT-05A`) & `2026-11-24 22:50:01 ICT` (`EV-UAT-05B`)
* **Tested URL & Revision:** `https://s96ba5182-4d7hbszvwq-as.a.run.app/admin/doctors` & `/patient/doctors?serviceId=72daa0a5-f266-42c3-9f3f-80db23aeb934` (`s96ba5182-00005-ch9`)
* **Per-Assertion Results:**
  1. **Duplicate Assignment Rejection (`AC-F005-02` — `PASS`):** `Manage Services` for `Dr. Somchai Prasert (Lead)` already showed `3 of 4 services assigned` (`Comprehensive Health Checkup`, `Flu Vaccination`, `General Consultation` assigned; `Consultation` unassigned). Posting an existing pair returned:
     ```text
     POST https://s96ba5182-4d7hbszvwq-as.a.run.app/api/v1/admin/doctors/fd848770-67bb-4126-9aba-91f76cb9d59b/services 409 (Conflict)
     === UAT-AP-05 DUPLICATE ASSIGNMENT CHECK === 2026-11-24 22:48:48
     Status Code (Expected 409): 409
     Response: {"success":false,"error":{"code":"DUPLICATE_ASSIGNMENT","message":"Doctor is already assigned to this service."}}
     ```
  2. **Patient Filtered Directory (`AC-F003-02` / `F-005` query — `PASS`):** `/patient/doctors?serviceId=72daa0a5-f266-42c3-9f3f-80db23aeb934` displayed `Dr. Somchai Prasert` and `Dr. Somchai Prasert (Lead)` for `General Consultation (30 mins)` (`EV-UAT-05B`).
  3. **New Assignment Creation Positive Path (`AC-F005-01` — `NOT EXECUTED`):** Neither UI click (`Assign` on `Consultation`) nor API `POST` with a previously unassigned `(doctorId, serviceId)` pair returning `201 Created` was executed.
* **Verdict:** **`PARTIAL PASS`** *(`AC-F005-02` & patient filter `PASS`; positive new assignment `AC-F005-01` `NOT EXECUTED`)*

---

### 4.6 Case 6th: `UAT-AP-04` — State Persistence, Audit Trail & Session Token Revocation
* **Lead Tester:** Pawarisa Thongchua (`67070501032`) · **Co-Tester:** Norawit Mahaprom (`67070501026`)
* **Execution Timestamps (ICT):** `2026-11-24 22:51:31 ICT` (`EV-UAT-04A`) & `2026-11-24 22:52:14 ICT` (`EV-UAT-04B`)
* **Tested URL & Revision:** `https://s96ba5182-4d7hbszvwq-as.a.run.app/admin/settings` & `/login` (`s96ba5182-00005-ch9`)
* **Per-Assertion Results:**
  1. **Settings Persistence (`AC-F007-01` settings part — `PASS`):** After saving `"Appointly Executive Care Centre"`, `"Asia/Bangkok"`, `"15 minutes"`, `"24"` and hard refreshing (`Ctrl+F5`), `/admin/settings` and `GET /api/v1/settings/public` matched (`EV-UAT-04A`).
  2. **Logout Token Revocation (`AC-F001-01` — `PASS`):** Clicking `Log out` redirected to `/login`; `GET /api/v1/auth/me` immediately returned HTTP `401` (`UNAUTHORIZED`, `EV-UAT-04B`):
     ```text
     === UAT-AP-04 PERSISTED PUBLIC SETTINGS === 2026-11-24 22:51:31
     Clinic Name    : Appointly Executive Care Centre
     Timezone       : Asia/Bangkok
     Slot Interval  : 15 mins
     Cutoff Hours   : 24 hrs

     GET https://s96ba5182-4d7hbszvwq-as.a.run.app/api/v1/auth/me 401 (Unauthorized)
     === UAT-AP-04 POST-LOGOUT VERIFICATION === 2026-11-24 22:52:14
     Status Code (Expected 401): 401
     Response: {"success":false,"error":{"code":"UNAUTHORIZED","message":"Authentication token is required."}}
     ```
  3. **AuditLog Verification (`CLINIC_SETTINGS_UPDATED`, `AC-F007-01` audit part — `BLOCKED`):** Sprint 1 exposes no Admin UI view or API endpoint for an independent UAT team to verify `AuditLog` persistence without direct database access (`OBS-AP-02`). Per Lab 6 Handout §3.2 (*"If blocked, record BLOCKED and the reason; it is not a pass"*), the audit assertion and overall case are recorded as `BLOCKED`.
* **Verdict:** **`BLOCKED`** *(Settings persistence & Logout `401` `PASS`; `AuditLog` assertion `BLOCKED`)*

---

### 4.7 Exploratory Case 7th: `UAT-AP-07` — Patient Profile Validation (`F-002`)
* **Lead Tester:** Norawit Mahaprom (`67070501026`) · **Co-Tester:** Pawarisa Thongchua (`67070501032`)
* **Execution Timestamps (ICT):** `2026-11-24 23:13:24` (`07A`), `23:14:00` (`07B`), `23:34:17` (`07C`)
* **Observed UI & Backend Behavior:**
  - **UI Validation (`PASS`):** Non-mobile phone `0212345678` triggered inline error `"Enter a valid phone number, e.g. 0812345678 or +66812345678."` (`EV-UAT-07A`). Clearing `Full Name` and `Phone Number` triggered `"Full name is required."` and `"Phone number is required."`; DOB picker disabled `24 Nov 2026`+ (`EV-UAT-07B`, `07C`).
  - **Combined-Payload API Check (`PASS`, narrowly scoped):** Direct `PUT /api/v1/patients/me` with a **single combined invalid payload** `{ fullName: '   ', phoneNumber: '0812345678', dateOfBirth: '2030-01-01' }` returned:
    ```text
    PUT https://s96ba5182-4d7hbszvwq-as.a.run.app/api/v1/patients/me 400 (Bad Request)
    Profile Edge Status: 400 {success: false, error: {...}}
    ```
    *Scope Precision Note:* This proves the backend rejected that combined invalid request (`400 Bad Request`), but because blank `fullName` and future `dateOfBirth` were sent together and `error` details remained collapsed in DevTools Console (`{...}`), it does not isolate each validation rule individually on the backend.
* **Verdict:** **`PASS`** *(scoped to UI validation + combined invalid API payload)*

---

### 4.8 Exploratory Case 8th: `UAT-AP-08` — Deactivated Doctor Visibility in Patient Directory (`F-003`)
* **Lead Tester:** Norawit Mahaprom (`67070501026`) · **Co-Tester:** Pawarisa Thongchua (`67070501032`)
* **Execution Timestamp (ICT):** `2026-11-24 23:16:27 ICT` (`EV-UAT-08`)
* **Observed Behavior:** After deactivating `Dr. Somchai Prasert` (`INACTIVE`) via Admin, `/patient/doctors` (`All services`) rendered only `Dr. Somchai Prasert (Lead)`, confirming deactivated doctors are excluded from the patient directory (`EV-UAT-08`). Immediately after capturing `EV-UAT-08`, the UAT team manually reactivated `Dr. Somchai Prasert` back to `ACTIVE` so subsequent doctor testing (`UAT-AP-09`) could proceed.
* **Verdict:** **`PASS`**

---

### 4.9 Exploratory Case 9th: `UAT-AP-09` — Schedule Inverted Shift, Past Holiday API Bypass, Duplicate & Overlapping Holidays (`F-006`)
* **Lead Tester:** Norawit Mahaprom (`67070501026`) · **Co-Tester:** Pawarisa Thongchua (`67070501032`)
* **Execution Timestamps (ICT):** `2026-11-24 23:18:06` (`09A`), `23:20:08` (`09B`), `23:36:43` (`09C`), `23:37:12` (`09D`), `23:39:20` (`09E`)
* **Contract Basis (`6b73bfdb` & `853e6a70`):**
  - [`sprint-1-contracts.md`](https://github.com/Piink7878/appointly-clinic-scheduling/blob/6b73bfdbf029343e4af3268d72e9364fbab12f52/specs/sprints/sprint-1-contracts.md) `F-006` (`AC-F006-02` non-overlapping same-day schedule windows; `AC-F006-03` date-specific holiday/custom-hour exception overrides) and [`TH-017` `uat-plan.md` §2.1 & `UAT-AP-06`](https://github.com/Piink7878/appointly-clinic-scheduling/blob/853e6a70366f9e1619e1723e998e90c30a3b749c/docs/labs/lab-06/uat-plan.md) specifying future/upcoming exception overrides (`Holiday (Full Day)` or partial blocks) governing schedule availability.
* **Observed Behavior:**
  - **Inverted Shift & UI Picker Past Date (`PASS`):** Setting Shift 1 `04:00 PM`–`10:00 AM` blocked save with `"End time must be after start time."` (`EV-UAT-09B`); UI date picker disabled past dates.
  - **`DEF-AP-02` (`FAIL` — Duplicate Full-Day & Overlapping Partial-Day Exceptions):** Submitting a second full-day `Holiday` on `2026-12-31` (`EV-UAT-09A`) and an overlapping partial-day `Holiday` (`13:00–17:00`, `"UAT-F-006-Test"`, `EV-UAT-09E`) both succeeded without `409 Conflict` or `422 Unprocessable Entity`, persisting 3 conflicting exception rows on `Thu, 31 Dec 2026`.
  - **`DEF-AP-03` (`FAIL` — Past-Date Exception API Bypass):** Direct `POST /api/v1/doctors/me/exceptions` with `exceptionDate: '2020-01-01'` returned **HTTP `201 Created`** (`EV-UAT-09C`) and persisted `Wed, 1 Jan 2020 · Holiday · Full day · Past date edge test` upon reload (`EV-UAT-09D`).
* **Verdict:** **`FAIL`** *(`DEF-AP-02` & `DEF-AP-03`)*

---

### 4.10 Exploratory Case 10th: `UAT-AP-10` — Service Duration Lower Boundary (`0` & Negative) (`F-004`)
* **Lead Tester:** Norawit Mahaprom (`67070501026`) · **Co-Tester:** Pawarisa Thongchua (`67070501032`)
* **Execution Timestamps (ICT):** `2026-11-24 23:40:44` (`10A`) & `23:41:30` (`10B`)
* **Observed Behavior:** Both the UI `Add New Service` modal (`durationMinutes: 0`, `"Duration must be between 1 and 480 minutes."`, `EV-UAT-10A`) and `POST /api/v1/admin/services` (`durationMinutes: 0` -> HTTP `400 Bad Request`, `EV-UAT-10B`) enforced the lower bound (`>= 1` minute).
* **Verdict:** **`PASS`**

---

### 4.11 Exploratory Case 11th: `UAT-AP-11` — Clinic Settings UI Validation (`F-007`)
* **Lead Tester:** Norawit Mahaprom (`67070501026`) · **Co-Tester:** Pawarisa Thongchua (`67070501032`)
* **Execution Timestamp (ICT):** `2026-11-24 23:43:30 ICT` (`EV-UAT-11`)
* **Reconciled Form State (`EV-UAT-11`):** On `/admin/settings` (showing `"Appointly Executive Care Centre"` persisted earlier in `UAT-AP-04`), the tester modified **three unsaved fields**:
  1. `Timezone` changed from `Asia/Bangkok` to `Asia/Singapore` via controlled LoV selection,
  2. `Fixed start interval` changed from `15 minutes` to `5 minutes` via dropdown, and
  3. `Cancellation cutoff (hours)` changed from `24` to `-5`, immediately triggering red inline validation: `"Enter a whole number of hours, 0 or more."`.
* **Unsaved & UI-Only Scope:** Changes were **not saved**, and no direct backend API (`PATCH /api/v1/admin/settings`) negative/invalid-timezone call was executed.
* **Verdict:** **`PASS`** *(UI-only validation; API negative check not executed)*

---

## 5. Coverage Adequacy Review & Gap Summary (Lab 6 §3.2 & Instructor Clarification)

Per Lab 6 Handout §3.2 and the instructor's clarification, Team `TH-045_P2` audited `TH-017`'s 6 supplied cases against [`sprint-1-contracts.md`](https://github.com/Piink7878/appointly-clinic-scheduling/blob/6b73bfdbf029343e4af3268d72e9364fbab12f52/specs/sprints/sprint-1-contracts.md) (`F-001`–`F-007`) and executed 5 exploratory cases (`UAT-AP-07`–`11`), while explicitly tracking remaining unexecuted/unobservable Sprint 1 AC items:

| Requirement Area (`TH-017` Sprint 1) | Supplied Case Coverage | UAT Execution Status & Finding (`TH-045_P2`) |
| :--- | :---: | :--- |
| **`F-002` Patient Profile Self-Service (`GET/PUT /api/v1/patients/me`)** | Missing from `UAT-AP-01`..`06` | **Executed (`UAT-AP-07` — `PASS`):** UI validation + combined invalid payload `400` (`EV-UAT-07A`–`07C`). Per-field backend isolation not separately tested. |
| **`F-002` Cross-Patient Isolation (`AC-F002-02`)** | Header only in `UAT-AP-03` | **`NOT EXECUTED / UNVERIFIED`:** Listed in `TH-017` `UAT-AP-03` header, but no cross-patient check step existed in `UAT-AP-03` actions. |
| **`F-003` Doctor Deactivation Visibility (`PATCH .../status`)** | Partial | **Executed (`UAT-AP-08` — `PASS`):** Deactivated doctor omitted from `/patient/doctors` (`EV-UAT-08`). |
| **`F-004` Service Duration Lower Bound (`>= 1` min)** | Upper bound only in `UAT-AP-02` | **Executed (`UAT-AP-10` — `PASS`):** UI + API `400` verified (`EV-UAT-10A`, `10B`). |
| **`F-005` Positive New Service Assignment (`AC-F005-01`)** | Duplicate only in `UAT-AP-05` script | **`NOT EXECUTED`:** Duplicate `409` & filter verified (`EV-UAT-05A`, `05B`), but creating a brand-new assignment returning `201` was not executed. |
| **`F-006` Exceptions, Inverted Shift & Past-Date API** | Partial | **Executed (`UAT-AP-09` — `FAIL`):** Inverted shift blocked (`EV-UAT-09B`); uncovered **`DEF-AP-02`** (`EV-UAT-09A`/`09E`) and **`DEF-AP-03`** (`EV-UAT-09C`/`09D`). |
| **`F-007` Clinic Settings Bounds & `AuditLog`** | Happy path + DB-only AuditLog | **`UAT-AP-11` (`PASS` UI-only):** Negative cutoff `-5` blocked (`EV-UAT-11`). **`AuditLog` (`UAT-AP-04`):** **`BLOCKED`** (`OBS-AP-02`). |
| **`F-001` Idle Token Refresh / Expiry UX** | Uncovered | **Observed (`UAT-AP-06` — `DEF-AP-01`):** Idle session failed `401` without silent refresh or redirect (`EV-UAT-06`). |

---

## 6. Outgoing Findings Summary for Team `TH-017` (Tracked in Issue `#44`)

All reproducible findings and minor observations are filed for formal defect reporting and partner triage in **[Issue `#44`](https://github.com/NxNxmm/CPE334-Sec01-Team45/issues/44)** *(whose Part C file `docs/labs/lab-06/defect-triage.md` is tracked on its separate PR branch)*:

| Finding ID | Linked Case & Contract Rule | Classification / Severity | Observed vs. Contract-Expected Behavior | Evidence ID |
| :---: | :--- | :---: | :--- | :--- |
| **`DEF-AP-02`** | `UAT-AP-09` / `UAT-AP-06`<br>`F-006` (`AC-F006-03` & `AC-F006-02` non-overlapping date-window rule) | **Major Defect** | Doctor was allowed to persist duplicate full-day `HOLIDAY` rows and an overlapping partial-day (`13:00–17:00`) row on already full-day-blocked `2026-12-31` (`3` conflicting rows persisted instead of `409 Conflict` / `422` rejection). | `EV-UAT-09A`, `EV-UAT-09E` |
| **`DEF-AP-03`** | `UAT-AP-09` / `UAT-AP-06`<br>`F-006` (`AC-F006-03` upcoming/future holiday contract; `TH-017` `uat-plan.md` §2.1 & `UAT-AP-06`) | **Major Defect** | Past-date guard existed only in the UI calendar picker; direct `POST /api/v1/doctors/me/exceptions` with `2020-01-01` returned `201 Created` and persisted `Wed, 1 Jan 2020` instead of `400 Bad Request` (`VALIDATION_ERROR`). | `EV-UAT-09C`, `EV-UAT-09D` |
| **`DEF-AP-01`** | `UAT-AP-06`<br>`F-001` (`access_token` + `refresh_token` lifecycle) | **Minor Defect** | Idle expired `access_token` (~15–20 min) failed mutations/reads with `401` at `22:44:52` without silent refresh via `refresh_token` or redirecting to `/login`. | `EV-UAT-06` |
| **`OBS-AP-01`** | `UAT-AP-01`<br>`F-006` (`AC-F006-01` & `uat-plan.md` spec) | **Minor Observation** | Seeded Monday schedule already matched `UAT-AP-01` inputs (`Save Schedule` disabled until edited); API returns `HH:MM` rather than `HH:MM:SS`. | `EV-UAT-01` |
| **`OBS-AP-02`** | `UAT-AP-04`<br>`F-007` (`AC-F007-01` AuditLog) | **Minor Observation** | `AuditLog` (`CLINIC_SETTINGS_UPDATED`) cannot be inspected via Sprint 1 UI or API by independent testers, causing the audit assertion in `UAT-AP-04` to be `BLOCKED`. | `EV-UAT-04A` |

---

## 7. Complete Evidence Index (`22` Captures) & `#43` Naming Mapping

**Scheme Mapping to Issue `#43`:** All `22` raw PNG screenshots reside in [`docs/evidence/lab-06/l6-2/`](../../evidence/lab-06/l6-2/). Prefix `01a`–`06b` corresponds sequentially (`1st`–`6th`) to Team `TH-017`'s Section 4.1 execution sequence (`EV-UAT-03A`..`04B`), while prefix `F-002`–`F-007` corresponds to exploratory cases `UAT-AP-07`–`11` (`EV-UAT-07A`..`11`). Every capture below targets **Appointly revision `s96ba5182-00005-ch9` (commit `6b73bfdbf029343e4af3268d72e9364fbab12f52`)**:

| Evidence ID | Filename (`docs/evidence/lab-06/l6-2/`) | Case ID | Action Executed | Expected Result | Observed Result | Timestamp (ICT) | Tested Revision / Commit |
| :---: | :--- | :---: | :--- | :--- | :--- | :---: | :---: |
| **`EV-UAT-03A`** | [`01a-uat-ap-03-inactive-login.png`](../../evidence/lab-06/l6-2/01a-uat-ap-03-inactive-login.png) | `UAT-AP-03` | Submit login for `inactive@appointly.local` | Reject sign-in (`403 ACCOUNT_INACTIVE`) with alert | Blocked on `/login` with `"Account Suspended..."` red alert (`PASS`) | `2026-11-24 22:16:37` | `s96ba5182-00005-ch9` (`6b73bfdb`) |
| **`EV-UAT-03B`** | [`01b-uat-ap-03-patient-rbac.png`](../../evidence/lab-06/l6-2/01b-uat-ap-03-patient-rbac.png) | `UAT-AP-03` | `PATIENT` visits `/admin/settings` & runs `PATCH /api/v1/admin/settings` | Redirect `/unauthorized` + `403 FORBIDDEN` | Redirected `/unauthorized`; Console returned `403 FORBIDDEN` (`PASS`; state unchanged unverified) | `2026-11-24 22:20:30` | `s96ba5182-00005-ch9` (`6b73bfdb`) |
| **`EV-UAT-02A`** | [`02a-uat-ap-02-schedule-overlap.png`](../../evidence/lab-06/l6-2/02a-uat-ap-02-schedule-overlap.png) | `UAT-AP-02` | Submit overlapping Monday shifts via UI & `PUT /doctors/me/schedule` | UI overlap alert + HTTP `422 INVALID_SCHEDULE_WINDOW` | Red UI overlap banner + Console `422 INVALID_SCHEDULE_WINDOW` (`PASS`) | `2026-11-24 22:24:50` | `s96ba5182-00005-ch9` (`6b73bfdb`) |
| **`EV-UAT-02B`** | [`02b-uat-ap-02-service-duration.png`](../../evidence/lab-06/l6-2/02b-uat-ap-02-service-duration.png) | `UAT-AP-02` | Enter `500` in UI modal & `POST /admin/services` (`481` min) | UI bound message + HTTP `400 VALIDATION_ERROR` | Modal blocked `500`; Console `POST` returned `400 VALIDATION_ERROR` (`PASS`) | `2026-11-24 22:28:08` | `s96ba5182-00005-ch9` (`6b73bfdb`) |
| **`EV-UAT-01`** | [`03-uat-ap-01-doctor-split-shift.png`](../../evidence/lab-06/l6-2/03-uat-ap-01-doctor-split-shift.png) | `UAT-AP-01` | Edit/save Shift 1 `08:30`, restore `09:00–12:00` & `13:00–17:00`, save & query API | Success banner + 2 persisted Monday shifts | Banner shown; `GET /schedule` returned `'09:00'–'12:00'` & `'13:00'–'17:00'` (`PASS`) | `2026-11-24 22:40:03` | `s96ba5182-00005-ch9` (`6b73bfdb`) |
| **`EV-UAT-06`** | [`04-uat-ap-06-holiday-exception.png`](../../evidence/lab-06/l6-2/04-uat-ap-06-holiday-exception.png) | `UAT-AP-06` | Add full-day `2026-12-31` holiday on idle then fresh session | HTTP `201` + `fullDay: true` row persisted | `22:44:52` idle session hit `401` (`DEF-AP-01`); `22:45:02` re-login succeeded & persisted (`PASS`) | `2026-11-24 22:45:02` | `s96ba5182-00005-ch9` (`6b73bfdb`) |
| **`EV-UAT-05A`** | [`05a-uat-ap-05-duplicate-409.png`](../../evidence/lab-06/l6-2/05a-uat-ap-05-duplicate-409.png) | `UAT-AP-05` | Open `Manage Services` modal & post duplicate `(doctorId, serviceId)` | HTTP `409 DUPLICATE_ASSIGNMENT` | Modal showed `3 of 4 assigned`; API returned `409 DUPLICATE_ASSIGNMENT` (`PASS` dup; new assign not run) | `2026-11-24 22:48:48` | `s96ba5182-00005-ch9` (`6b73bfdb`) |
| **`EV-UAT-05B`** | [`05b-uat-ap-05-patient-filter.png`](../../evidence/lab-06/l6-2/05b-uat-ap-05-patient-filter.png) | `UAT-AP-05` | Patient selects `General Consultation (30 mins)` directory filter | Only active assigned doctors shown | `/patient/doctors?serviceId=72daa0a5...` listed both active assigned doctors (`PASS`) | `2026-11-24 22:50:01` | `s96ba5182-00005-ch9` (`6b73bfdb`) |
| **`EV-UAT-04A`** | [`06a-uat-ap-04-settings-refresh.png`](../../evidence/lab-06/l6-2/06a-uat-ap-04-settings-refresh.png) | `UAT-AP-04` | Save clinic settings, `Ctrl+F5`, inspect `/settings/public` | Values persist; `AuditLog` verified | Settings persisted across `Ctrl+F5` + API (`PASS`); `AuditLog` unobservable (`BLOCKED`) | `2026-11-24 22:51:31` | `s96ba5182-00005-ch9` (`6b73bfdb`) |
| **`EV-UAT-04B`** | [`06b-uat-ap-04-logout-401.png`](../../evidence/lab-06/l6-2/06b-uat-ap-04-logout-401.png) | `UAT-AP-04` | Click `Log out` and call `GET /api/v1/auth/me` | Redirect `/login` + `401 UNAUTHORIZED` | Redirected `/login`; Console returned `401 UNAUTHORIZED` (`PASS`) | `2026-11-24 22:52:14` | `s96ba5182-00005-ch9` (`6b73bfdb`) |
| **`EV-UAT-07A`** | [`F-002-patient-self-profile-non-valid-format-phone.png`](../../evidence/lab-06/l6-2/F-002-patient-self-profile-non-valid-format-phone.png) | `UAT-AP-07` | Enter landline `0212345678` in `/patient/profile` | Reject invalid Thai mobile format | Red inline error `"Enter a valid phone number..."` (`PASS`) | `2026-11-24 23:13:24` | `s96ba5182-00005-ch9` (`6b73bfdb`) |
| **`EV-UAT-07B`** | [`F-002-blocking-future-birthday.png`](../../evidence/lab-06/l6-2/F-002-blocking-future-birthday.png) | `UAT-AP-07` | Open DOB date picker on `/patient/profile` | Today & future DOBs disabled | Calendar picker disabled `24 Nov 2026`+ (`PASS`) | `2026-11-24 23:14:00` | `s96ba5182-00005-ch9` (`6b73bfdb`) |
| **`EV-UAT-07C`** | [`F-002-API-fetching-future-birthday.png`](../../evidence/lab-06/l6-2/F-002-API-fetching-future-birthday.png) | `UAT-AP-07` | Clear name/phone in UI & send combined `PUT /patients/me` (`fullName:'   '`, `dateOfBirth:'2030-01-01'`) | Inline required errors + HTTP `400` | Inline required errors shown; API returned HTTP `400` on combined invalid payload (`PASS`) | `2026-11-24 23:34:17` | `s96ba5182-00005-ch9` (`6b73bfdb`) |
| **`EV-UAT-08`** | [`F-003-deactivate-doctor.png`](../../evidence/lab-06/l6-2/F-003-deactivate-doctor.png) | `UAT-AP-08` | Deactivate `Dr. Somchai Prasert` & view `/patient/doctors` | Inactive doctor hidden from patients | Only `Dr. Somchai Prasert (Lead)` rendered (`PASS`) | `2026-11-24 23:16:27` | `s96ba5182-00005-ch9` (`6b73bfdb`) |
| **`EV-UAT-09A`** | [`F-006-duplicate-holiday.png`](../../evidence/lab-06/l6-2/F-006-duplicate-holiday.png) | `UAT-AP-09` | Submit duplicate full-day `Holiday` on `2026-12-31` | Reject duplicate with `409 Conflict` | Succeeded and rendered 2 identical `Thu, 31 Dec 2026` rows (`FAIL` -> `DEF-AP-02`) | `2026-11-24 23:18:06` | `s96ba5182-00005-ch9` (`6b73bfdb`) |
| **`EV-UAT-09B`** | [`F-006-blocking-inverted-shift.png`](../../evidence/lab-06/l6-2/F-006-blocking-inverted-shift.png) | `UAT-AP-09` | Set Monday Shift 1 `04:00 PM` to `10:00 AM` | Inline/banner rejection | Red banner + `"End time must be after start time."` (`PASS`) | `2026-11-24 23:20:08` | `s96ba5182-00005-ch9` (`6b73bfdb`) |
| **`EV-UAT-09C`** | [`F-006-API-adding-past-holidays-1.png`](../../evidence/lab-06/l6-2/F-006-API-adding-past-holidays-1.png) | `UAT-AP-09` | `POST /api/v1/doctors/me/exceptions` with `exceptionDate:'2020-01-01'` | Reject past date (`400 VALIDATION_ERROR`) | Returned HTTP `201 Created` (`FAIL` -> `DEF-AP-03`) | `2026-11-24 23:36:43` | `s96ba5182-00005-ch9` (`6b73bfdb`) |
| **`EV-UAT-09D`** | [`F-006-API-adding-past-holidays-2.png`](../../evidence/lab-06/l6-2/F-006-API-adding-past-holidays-2.png) | `UAT-AP-09` | Reload `/doctor/schedule` after `2020-01-01` API call | Past holiday must not persist | Rendered `Wed, 1 Jan 2020 · Holiday · Full day · Past date edge test` (`FAIL` -> `DEF-AP-03`) | `2026-11-24 23:37:12` | `s96ba5182-00005-ch9` (`6b73bfdb`) |
| **`EV-UAT-09E`** | [`F-006-dup-holiday-partial-time.png`](../../evidence/lab-06/l6-2/F-006-dup-holiday-partial-time.png) | `UAT-AP-09` | Add partial-day `13:00–17:00` holiday on full-day-blocked `2026-12-31` | Reject overlapping holiday (`409 Conflict`) | Persisted 3rd overlapping `Thu, 31 Dec 2026` row (`13:00–17:00`, `FAIL` -> `DEF-AP-02`) | `2026-11-24 23:39:20` | `s96ba5182-00005-ch9` (`6b73bfdb`) |
| **`EV-UAT-10A`** | [`F-004-service-duration-zero.png`](../../evidence/lab-06/l6-2/F-004-service-duration-zero.png) | `UAT-AP-10` | Enter `0` in `Add New Service` modal duration field | Inline bound error (`1..480`) | Highlighted red with `"Duration must be between 1 and 480 minutes."` (`PASS`) | `2026-11-24 23:40:44` | `s96ba5182-00005-ch9` (`6b73bfdb`) |
| **`EV-UAT-10B`** | [`F-004-API-service-duration-zero.png`](../../evidence/lab-06/l6-2/F-004-API-service-duration-zero.png) | `UAT-AP-10` | Direct `POST /api/v1/admin/services` with `durationMinutes: 0` | Reject lower bound (`400 Bad Request`) | Console logged `Duration 0 Edge Status: 400` (`PASS`) | `2026-11-24 23:41:30` | `s96ba5182-00005-ch9` (`6b73bfdb`) |
| **`EV-UAT-11`** | [`F-007-clinic-setting-blocking-non-whole-num.png`](../../evidence/lab-06/l6-2/F-007-clinic-setting-blocking-non-whole-num.png) | `UAT-AP-11` | Unsaved draft: set Timezone `Asia/Singapore`, interval `5 minutes`, cutoff `-5` | Inline cutoff error; IANA LoV control | Cutoff highlighted red (`"Enter a whole number of hours, 0 or more."`); form not saved (`PASS` UI-only) | `2026-11-24 23:43:30` | `s96ba5182-00005-ch9` (`6b73bfdb`) |

---

## 8. Post-Run Fixture & Environment Disposition (Before Independent Retest)

At the close of Part B execution (`24 Nov 2026 23:44 ICT`), mutated fixtures stood as follows prior to Team `TH-017`'s defect resolution and retest cleanup:

| Mutated Entity / Account | Originating Case(s) | Status at End of Part B (`23:44 ICT`) | Cleanup / Handoff Action Required Before Retest |
| :--- | :---: | :--- | :--- |
| **Monday Weekly Shifts (`DOCTOR_USER`, `doctor@appointly.local`)** | `UAT-AP-01`, `UAT-AP-09` | **Restored by UAT Team** | Saved back to `09:00–12:00` and `13:00–17:00` (`EV-UAT-01`); inverted edit in `EV-UAT-09B` was blocked/unsaved. Ready as baseline. |
| **Doctor Status (`Dr. Somchai Prasert`, `doctor@appointly.local`)** | `UAT-AP-08` | **Restored (`ACTIVE`) by UAT Team** | Manually reactivated by UAT Team immediately after `EV-UAT-08` so subsequent doctor schedule tests ran on an active doctor *(no separate post-reactivation screenshot captured)*. |
| **Clinic Settings (`ADMIN_USER`, `/admin/settings`)** | `UAT-AP-04`, `UAT-AP-11` | **Pending Owner Cleanup (`UAT-AP-04` saved)** | `UAT-AP-04` persisted `"Appointly Executive Care Centre"` (`Asia/Bangkok`, `15 minutes`, `24` hours, `EV-UAT-04A`). The `UAT-AP-11` draft (`Asia/Singapore`, `5 minutes`, `-5`) was **not saved**. |
| **Schedule Exceptions (`DOCTOR_USER`, `doctor@appointly.local`)** | `UAT-AP-06`, `UAT-AP-09` | **Pending Owner Cleanup (4 test rows)** | Retained `3` overlapping `2026-12-31` exceptions (2 duplicate full-day + 1 partial-day `13:00–17:00`, `DEF-AP-02`) and `1` past-date `2020-01-01` exception (`DEF-AP-03`) for Team `TH-017` reproduction; owner must clean up redundant/past rows (leaving 1 valid `2026-12-31` holiday) prior to independent retest. |
