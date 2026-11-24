# CPE334 Lab 6 (Part B) — Independent UAT Execution Report on Partner System (Appointly · Team `TH-017`)

**Course:** CPE 334 Software Engineering (Semester 1 / Year 3)  
**Assignment:** Lab 6 — Independent User Acceptance Testing and Defect Management (Part B: Independent UAT Execution)  
**Document ID:** `UAT-EXEC-PARTNER-TH017`  
**Version:** `1.2.0`  
**Tracking Issue:** [Issue #43 (`[Lab 6] L6-2: Independent UAT execution on partner system (Part B)`)](https://github.com/NxNxmm/CPE334-Sec01-Team45/issues/43)  
**PR Author (Even L6 Task):** `Pawarisa Thongchua` (`67070501032` · `@itspxsh`)  
**PR Reviewer (Odd/Even Rule):** `Norawit Mahaprom` (`67070501026` · `@NxNxmm`)  
**Execution Date & Window:** Tuesday, 24 November 2026 (`22:16–23:44 ICT`)  
**Execution Mode:** **Manual UAT · Mandatory Pair Work (Handout §3.2)** — Both `Norawit Mahaprom` (`67070501026`) and `Pawarisa Thongchua` (`67070501032`) jointly executed all `6` supplied Sprint 1 UAT cases (`UAT-AP-01`–`06`) plus `5` exploratory Sprint 1 edge-case checks (`UAT-AP-07`–`11`), captured across `22` evidence screenshots on Team `TH-017`'s live Cloud Run deployment.  

---

## 1. Assessed Partner System & Handoff Baseline (`TH-017` — `2 auan`)

| Attribute | Authoritative Value from Team `TH-017` Handoff Package |
| :--- | :--- |
| **Product Team (System Owner)** | **`TH-017` (`2 auan`)** — **Kamonnat Seetakai** (`67070501001`) & **Benyapha Rattanakhunodom** (`67070501030`) |
| **Independent UAT Team (Assessors)** | **`TH-045_P2` (EquipFlow)** — **Norawit Mahaprom** (`67070501026` · `@NxNxmm`) & **Pawarisa Thongchua** (`67070501032` · `@itspxsh`) |
| **Product Under Test** | **Appointly** — Clinic Appointment & Scheduling Management System |
| **Assessed Sprint 1 Scope** | Sprint 1 Engineering Contracts (`F-001` through `F-007` per `DEC-017` baseline; excludes Sprint 2/3 patient self-registration, slot booking `/patient/appointments`, and operational reports) |
| **Sprint 1 Release Tag (`v0.1.0-sprint1`)** | `9808f9657a4200f5dddf49412a276fc874ff4175` |
| **Assessed `main` Release Commit** | `6b73bfdbf029343e4af3268d72e9364fbab12f52` |
| **Deployed Live Cloud Run URL** | `https://s96ba5182-4d7hbszvwq-as.a.run.app` |
| **Active Cloud Run Service & Revision** | Service: `s96ba5182` · Revision: **`s96ba5182-00005-ch9`** (`100%` traffic, GCP Project `cpe-se-course-2026`, `asia-southeast1`) |
| **Credential Hygiene Confirmation** | Passwords for `ADMIN_USER`, `DOCTOR_USER`, `PATIENT_USER`, and `INACTIVE_USER` were received privately via team chat and are excluded from this report, console logs, and screenshots (`<REDACTED_PRIVATE_CREDENTIAL>`). |

---

## 2. Pair Participation & Executed Sequence (`UAT-AP-03 → 02 → 01 → 06 → 05 → 04 → Exploratory 07–11`)

Following Team `TH-017`'s Section 4.1 execution order and Lab 6 Handout §3.2 (*"Both students in a 2-person team must participate in UAT execution"*), both members of Team `TH-045_P2` sat together and alternated leading manual execution across all `11` executed cases (`22` screenshots total):

| Run Order | Case ID | Category (Lab 6 Handout §3.1) | Linked Appointly Feature & AC | Lead Tester (`TH-045_P2`) | Co-Tester / Verifier (`TH-045_P2`) | Evidence File(s) |
| :---: | :---: | :--- | :--- | :--- | :--- | :--- |
| **1st** | **`UAT-AP-03`** | 3. Forbidden Role / Ownership Case | `F-001` RBAC & `F-002` Isolation (`AC-F001-03`, `AC-F001-04`, `AC-F002-02`) | **Norawit Mahaprom** (`67070501026`) | **Pawarisa Thongchua** (`67070501032`) | [`01a-uat-ap-03-inactive-login.png`](../../evidence/lab-06/l6-2/01a-uat-ap-03-inactive-login.png)<br>[`01b-uat-ap-03-patient-rbac.png`](../../evidence/lab-06/l6-2/01b-uat-ap-03-patient-rbac.png) |
| **2nd** | **`UAT-AP-02`** | 2. Business-Rule & Boundary Case | `F-006` Overlap Conflict & `F-004` Service Bounds (`AC-F006-02`, `AC-F004-03`) | **Pawarisa Thongchua** (`67070501032`) | **Norawit Mahaprom** (`67070501026`) | [`02a-uat-ap-02-schedule-overlap.png`](../../evidence/lab-06/l6-2/02a-uat-ap-02-schedule-overlap.png)<br>[`02b-uat-ap-02-service-duration.png`](../../evidence/lab-06/l6-2/02b-uat-ap-02-service-duration.png) |
| **3rd** | **`UAT-AP-01`** | 1. Normal Domain Journey | `F-006` Doctor Self-Schedule Split-Shift (`AC-F006-01`, `AC-F001-01`) | **Norawit Mahaprom** (`67070501026`) | **Pawarisa Thongchua** (`67070501032`) | [`03-uat-ap-01-doctor-split-shift.png`](../../evidence/lab-06/l6-2/03-uat-ap-01-doctor-split-shift.png) |
| **4th** | **`UAT-AP-06`** | 2/4. Date Exception & Override Case | `F-006` Schedule Exceptions (`AC-F006-03`) | **Pawarisa Thongchua** (`67070501032`) | **Norawit Mahaprom** (`67070501026`) | [`04-uat-ap-06-holiday-exception.png`](../../evidence/lab-06/l6-2/04-uat-ap-06-holiday-exception.png) |
| **5th** | **`UAT-AP-05`** | 1/2. Cross-Entity Assignment Journey | `F-005` Doctor-Service Duplicate `409` & `F-003` Directory Filter (`AC-F005-01`, `AC-F005-02`, `AC-F003-02`) | **Norawit Mahaprom** (`67070501026` — Admin API) & **Pawarisa Thongchua** (`67070501032` — Patient Filter) | Pair Co-Execution | [`05a-uat-ap-05-duplicate-409.png`](../../evidence/lab-06/l6-2/05a-uat-ap-05-duplicate-409.png)<br>[`05b-uat-ap-05-patient-filter.png`](../../evidence/lab-06/l6-2/05b-uat-ap-05-patient-filter.png) |
| **6th** | **`UAT-AP-04`** | 4. State, History & Persistence Case | `F-007` Settings Persistence & `F-001` Logout Cookie Revocation (`AC-F007-01`, `AC-F001-01`) | **Pawarisa Thongchua** (`67070501032`) | **Norawit Mahaprom** (`67070501026`) | [`06a-uat-ap-04-settings-refresh.png`](../../evidence/lab-06/l6-2/06a-uat-ap-04-settings-refresh.png)<br>[`06b-uat-ap-04-logout-401.png`](../../evidence/lab-06/l6-2/06b-uat-ap-04-logout-401.png) |
| **7th (Exp.)** | **`UAT-AP-07`** | Exploratory: Business-Rule & Boundary (`F-002`) | `F-002` Patient Profile Phone Format, Blank Required Fields & Future DOB API Bypass | **Norawit Mahaprom** (`67070501026`) | **Pawarisa Thongchua** (`67070501032`) | [`F-002-patient-self-profile-non-valid-format-phone.png`](../../evidence/lab-06/l6-2/F-002-patient-self-profile-non-valid-format-phone.png)<br>[`F-002-blocking-future-birthday.png`](../../evidence/lab-06/l6-2/F-002-blocking-future-birthday.png)<br>[`F-002-API-fetching-future-birthday.png`](../../evidence/lab-06/l6-2/F-002-API-fetching-future-birthday.png) |
| **8th (Exp.)** | **`UAT-AP-08`** | Exploratory: Cross-Entity Visibility (`F-003`) | `F-003` Admin Doctor Deactivation Hidden from Patient Directory | **Norawit Mahaprom** (`67070501026`) | **Pawarisa Thongchua** (`67070501032`) | [`F-003-deactivate-doctor.png`](../../evidence/lab-06/l6-2/F-003-deactivate-doctor.png) |
| **9th (Exp.)** | **`UAT-AP-09`** | Exploratory: Schedule Exception & Boundary (`F-006`) | `F-006` Duplicate Full-Day & Overlapping Partial-Day Holidays, Past Holiday API Bypass & Inverted Shift | **Norawit Mahaprom** (`67070501026`) | **Pawarisa Thongchua** (`67070501032`) | [`F-006-duplicate-holiday.png`](../../evidence/lab-06/l6-2/F-006-duplicate-holiday.png)<br>[`F-006-blocking-inverted-shift.png`](../../evidence/lab-06/l6-2/F-006-blocking-inverted-shift.png)<br>[`F-006-API-adding-past-holidays-1.png`](../../evidence/lab-06/l6-2/F-006-API-adding-past-holidays-1.png)<br>[`F-006-API-adding-past-holidays-2.png`](../../evidence/lab-06/l6-2/F-006-API-adding-past-holidays-2.png)<br>[`F-006-dup-holiday-partial-time.png`](../../evidence/lab-06/l6-2/F-006-dup-holiday-partial-time.png) |
| **10th (Exp.)** | **`UAT-AP-10`** | Exploratory: Service Lower Boundary (`F-004`) | `F-004` Service Duration Lower Bound (`0` / Negative Minutes) in UI & API | **Norawit Mahaprom** (`67070501026`) | **Pawarisa Thongchua** (`67070501032`) | [`F-004-service-duration-zero.png`](../../evidence/lab-06/l6-2/F-004-service-duration-zero.png)<br>[`F-004-API-service-duration-zero.png`](../../evidence/lab-06/l6-2/F-004-API-service-duration-zero.png) |
| **11th (Exp.)** | **`UAT-AP-11`** | Exploratory: Clinic Settings Boundary (`F-007`) | `F-007` Cancellation Cutoff Negative Value & IANA Timezone LoV Guard | **Norawit Mahaprom** (`67070501026`) | **Pawarisa Thongchua** (`67070501032`) | [`F-007-clinic-setting-blocking-non-whole-num.png`](../../evidence/lab-06/l6-2/F-007-clinic-setting-blocking-non-whole-num.png) |

---

## 3. Summary UAT Execution Log Table (Manual UAT on Appointly `s96ba5182-00005-ch9`)

| Run Order & Case ID | Category & Linked AC | Tested Commit / Revision | Execution Timestamp (ICT) | Tester Name & ID (`TH-045_P2`) | Synthetic Inputs Used | Actual Result Observed *(Recorded from live browser & DevTools runs)* | Status | Evidence Ref ID |
| :---: | :--- | :---: | :---: | :--- | :--- | :--- | :---: | :---: |
| **1st · `UAT-AP-03`** | **Forbidden Role / RBAC**<br>`F-001`, `F-002`, `F-007` (`AC-F001-03`, `AC-F001-04`, `AC-F002-02`) | `6b73bfdb`<br>`s96ba5182-00005-ch9` | `2026-11-24 22:16:37 ICT` (`03A`)<br>`2026-11-24 22:20:30 ICT` (`03B`) | **Lead:** Norawit Mahaprom (`67070501026`)<br>**Co-Tester:** Pawarisa Thongchua (`67070501032`) | 1) Login: `inactive@appointly.local`<br>2) Login: `patient@appointly.local`<br>3) Direct URL: `/admin/settings`<br>4) `PATCH /api/v1/admin/settings` (`{"clinicName":"Unauthorized Name Mutation"}`) | 1) `inactive@appointly.local` sign-in stayed on `/login` and displayed the red alert banner: `"Account Suspended: Your account is currently inactive. Please contact the clinic administrator."`<br>2) Navigating to `/admin/settings` as `PATIENT_USER` redirected to `/unauthorized` rendering `"403 — Access Denied / Your current account role (PATIENT) does not have authorization to view this resource."` with `"Go to My Portal"` and `"Switch Account"` buttons.<br>3) `PATCH /api/v1/admin/settings` returned **HTTP `403`** (`code: "FORBIDDEN"`, message: `"Access forbidden: Role 'PATIENT' lacks permission for this resource."`). Protected clinic settings remained unaltered. | **`PASS`** | `EV-UAT-03A`, `EV-UAT-03B` |
| **2nd · `UAT-AP-02`** | **Boundary / Business Rule**<br>`F-006`, `F-004` (`AC-F006-02`, `AC-F004-03`) | `6b73bfdb`<br>`s96ba5182-00005-ch9` | `2026-11-24 22:24:50 ICT` (`02A`)<br>`2026-11-24 22:28:08 ICT` (`02B`) | **Lead:** Pawarisa Thongchua (`67070501032`)<br>**Co-Tester:** Norawit Mahaprom (`67070501026`) | 1) `doctor@appointly.local`: Monday overlapping UI slots (`09:00 AM–01:00 PM` & `12:00 AM–04:00 PM`) + API `PUT /api/v1/doctors/me/schedule` (`09:00:00–13:00:00` & `12:00:00–16:00:00`)<br>2) `admin@appointly.local`: UI modal `UAT Test` / `durationMinutes: 500` + API `POST /api/v1/admin/services` (`durationMinutes: 481`) | 1) Schedule UI displayed red banner `"Fix 1 time slot before saving: shifts need an end after the start and must not overlap."` and inline warning `"Overlaps with 00:00–16:00."`. API `PUT` returned **HTTP `422`** (`code: "INVALID_SCHEDULE_WINDOW"`, message: `"Schedule windows on the same day (1) must not overlap: [09:00:00-13:00:00] and [12:00:00-16:00:00]."`).<br>2) Service UI modal rejected `500` inline (`"Duration must be between 1 and 480 minutes."`). API `POST` with `481` returned **HTTP `400`** (`code: "VALIDATION_ERROR"`, message: `"durationMinutes: Duration must be between 1 and 480 minutes"`). No invalid record was persisted. | **`PASS`** | `EV-UAT-02A`, `EV-UAT-02B` |
| **3rd · `UAT-AP-01`** | **Normal Domain Journey**<br>`F-006` (`AC-F006-01`, `AC-F001-01`) | `6b73bfdb`<br>`s96ba5182-00005-ch9` | `2026-11-24 22:40:03 ICT` | **Lead:** Norawit Mahaprom (`67070501026`)<br>**Co-Tester:** Pawarisa Thongchua (`67070501032`) | `doctor@appointly.local` Monday (`dayOfWeek: 1`): changed Shift 1 to `08:30–12:00` & saved, then restored `09:00–12:00` & `13:00–17:00` (`isActive: true`) & saved | **Precondition note (`OBS-AP-01`):** Seeded Monday shifts already matched `09:00 AM–12:00 PM` and `01:00 PM–05:00 PM`, keeping `Save Schedule` disabled until modified (`dirty`-form guard). After changing Shift 1 to `08:30–12:00` -> Save, then re-setting `09:00–12:00` and `13:00–17:00` -> clicking `Save Schedule`, UI showed green banner `"Weekly schedule saved successfully."` and `GET /api/v1/doctors/me/schedule` returned 2 Monday rows: `09:00`–`12:00` (`active: true`) and `13:00`–`17:00` (`active: true`). *(API returns `HH:MM` rather than `HH:MM:SS`.)* | **`PASS`** *(with minor UAT precondition/format observation)* | `EV-UAT-01` |
| **4th · `UAT-AP-06`** | **Schedule Exception**<br>`F-006` (`AC-F006-03`) | `6b73bfdb`<br>`s96ba5182-00005-ch9` | `2026-11-24 22:44:52 ICT` (`401` obs)<br>`2026-11-24 22:45:02 ICT` (`EV-UAT-06`) | **Lead:** Pawarisa Thongchua (`67070501032`)<br>**Co-Tester:** Norawit Mahaprom (`67070501026`) | `doctor@appointly.local` Date: `2026-12-31`, Type: `Holiday`, `Full day` checked, Reason: `New Year Holiday - Clinic Closed` | **Session expiry finding (`DEF-AP-01` at `22:44:52`):** After ~15–20 min idle on `/doctor/schedule`, initial `POST /api/v1/doctors/me/exceptions` and `GET /api/v1/doctors/me/schedule` returned **HTTP `401 (Unauthorized)`** without silent refresh via `refresh_token` or redirecting to `/login`. Upon fresh doctor session (`22:45:02`), clicking `Add Exception` succeeded with green banner `"Holiday added for Thu, 31 Dec 2026."`, rendered row `Thu, 31 Dec 2026 · Holiday · Full day · New Year Holiday - Clinic Closed`, and Console returned `date: '2026-12-31T00:00:...'`, `type: 'HOLIDAY'`, `fullDay: true`. | **`PASS`** *(logged idle `401` session-refresh finding `DEF-AP-01`)* | `EV-UAT-06` |
| **5th · `UAT-AP-05`** | **Cross-Entity Assignment Journey**<br>`F-005`, `F-003` (`AC-F005-01`, `AC-F005-02`, `AC-F003-02`) | `6b73bfdb`<br>`s96ba5182-00005-ch9` | `2026-11-24 22:48:48 ICT` (`05A`)<br>`2026-11-24 22:50:01 ICT` (`05B`) | **Pair:** Norawit Mahaprom (`67070501026` — Admin) & Pawarisa Thongchua (`67070501032` — Patient) | 1) `admin@appointly.local`: duplicate `POST /api/v1/admin/doctors/fd848770-67bb-4126-9aba-91f76cb9d59b/services` with `serviceId: 316aee65-e768-4d1f-a1ff-8db6303b0dda` (`Comprehensive Health Checkup`)<br>2) `patient@appointly.local`: `/patient/doctors?serviceId=72daa0a5-f266-42c3-9f3f-80db23aeb934` (`General Consultation (30 mins)`) | 1) `Manage Services` modal showed `Dr. Somchai Prasert (Lead)` with 3 of 4 services assigned (`Comprehensive Health Checkup`, `Flu Vaccination`, `General Consultation`). Duplicate `POST` returned **HTTP `409 (Conflict)`** with `{"success":false,"error":{"code":"DUPLICATE_ASSIGNMENT","message":"Doctor is already assigned to this service."}}`.<br>2) Patient Portal `/patient/doctors?serviceId=72daa0a5-f266-42c3-9f3f-80db23aeb934` filtered `Find a Doctor` by `General Consultation (30 mins)` and listed the 2 active assigned doctors (`Dr. Somchai Prasert` and `Dr. Somchai Prasert (Lead)`) with their service chips. | **`PASS`** | `EV-UAT-05A`, `EV-UAT-05B` |
| **6th · `UAT-AP-04`** | **State Persistence & Logout Revocation**<br>`F-007`, `F-001` (`AC-F007-01`, `AC-F001-01`) | `6b73bfdb`<br>`s96ba5182-00005-ch9` | `2026-11-24 22:51:31 ICT` (`04A`)<br>`2026-11-24 22:52:14 ICT` (`04B`) | **Lead:** Pawarisa Thongchua (`67070501032`)<br>**Co-Tester:** Norawit Mahaprom (`67070501026`) | `admin@appointly.local` at `/admin/settings`: `clinicName: "Appointly Executive Care Centre"`, `timezone: "Asia/Bangkok"`, `15 minutes`, `24` hours -> `Save Settings` -> `Ctrl+F5` -> `Log out` -> `GET /api/v1/auth/me` | 1) After `Save Settings` and hard refresh (`Ctrl+F5`), `/admin/settings` retained `"Appointly Executive Care Centre"`, `"Asia/Bangkok"`, `"15 minutes"`, and `"24"`. `GET /api/v1/settings/public` returned the exact same persisted values.<br>2) Clicking `Log out` redirected to `/login`; `GET /api/v1/auth/me` immediately returned **HTTP `401 (Unauthorized)`** with `{"success":false,"error":{"code":"UNAUTHORIZED","message":"Authentication token is required."}}`.<br>3) **AuditLog observability note (`OBS-AP-02`):** Appointly Sprint 1 exposes no Admin UI or API endpoint to view `AuditLog` entries, so the `CLINIC_SETTINGS_UPDATED` DB row could not be independently verified from the user-facing app. | **`PASS`** *(with AuditLog non-observability note)* | `EV-UAT-04A`, `EV-UAT-04B` |
| **7th (Exp.) · `UAT-AP-07`** | **Exploratory (`F-002` Patient Profile Validation)**<br>`GET/PUT /api/v1/patients/me` | `6b73bfdb`<br>`s96ba5182-00005-ch9` | `2026-11-24 23:13:24 ICT` (`07A`)<br>`2026-11-24 23:14:00 ICT` (`07B`)<br>`2026-11-24 23:34:17 ICT` (`07C`) | **Lead:** Norawit Mahaprom (`67070501026`)<br>**Co-Tester:** Pawarisa Thongchua (`67070501032`) | `patient@appointly.local` at `/patient/profile`:<br>1) Phone: `0212345678`<br>2) DOB picker + blank Full Name & Phone<br>3) API `PUT /api/v1/patients/me` (`fullName: '   '`, `phoneNumber: '0812345678'`, `dateOfBirth: '2030-01-01'`) | 1) Invalid phone `0212345678` triggered inline error `"Enter a valid phone number, e.g. 0812345678 or +66812345678."`. Blank fields triggered `"Full name is required."` and `"Phone number is required."`.<br>2) DOB calendar picker disabled today (`24 Nov 2026`) and future dates.<br>3) Direct API `PUT /api/v1/patients/me` with blank name & future DOB `2030-01-01` returned **HTTP `400 (Bad Request)`** (`{success: false, error: {...}}`). Backend correctly enforced validation. | **`PASS`** | `EV-UAT-07A`, `EV-UAT-07B`, `EV-UAT-07C` |
| **8th (Exp.) · `UAT-AP-08`** | **Exploratory (`F-003` Deactivate Doctor Visibility)**<br>`PATCH /api/v1/admin/doctors/:id/status`, `GET /api/v1/doctors` | `6b73bfdb`<br>`s96ba5182-00005-ch9` | `2026-11-24 23:16:27 ICT` | **Lead:** Norawit Mahaprom (`67070501026`)<br>**Co-Tester:** Pawarisa Thongchua (`67070501032`) | 1) `admin@appointly.local`: deactivated `Dr. Somchai Prasert` (`INACTIVE`)<br>2) `patient@appointly.local`: opened `/patient/doctors` (`All services`) | `/patient/doctors` rendered only `Dr. Somchai Prasert (Lead)` (`Internal Medicine`); the deactivated `Dr. Somchai Prasert` (`General Practice`) was completely hidden from the patient-facing doctor directory. | **`PASS`** | `EV-UAT-08` |
| **9th (Exp.) · `UAT-AP-09`** | **Exploratory (`F-006` Schedule Exceptions & Inverted Shift)**<br>`PUT /api/v1/doctors/me/schedule`, `POST /api/v1/doctors/me/exceptions` (`AC-F006-03`) | `6b73bfdb`<br>`s96ba5182-00005-ch9` | `2026-11-24 23:18:06 ICT` (`09A`)<br>`2026-11-24 23:20:08 ICT` (`09B`)<br>`2026-11-24 23:36:43 ICT` (`09C`)<br>`2026-11-24 23:37:12 ICT` (`09D`)<br>`2026-11-24 23:39:20 ICT` (`09E`) | **Lead:** Norawit Mahaprom (`67070501026`)<br>**Co-Tester:** Pawarisa Thongchua (`67070501032`) | `doctor@appointly.local`:<br>1) Duplicate full-day Holiday on `2026-12-31`<br>2) Inverted shift `04:00 PM` -> `10:00 AM`<br>3) API `POST /api/v1/doctors/me/exceptions` with past `exceptionDate: '2020-01-01'`<br>4) Partial-day Holiday `2026-12-31` `13:00–17:00` (`Full day` unchecked, `"UAT-F-006-Test"`) | 1) **Passed guards:** Inverted shift (`04:00 PM–10:00 AM`) and inverted partial-day times were blocked (`"End time must be after start time."`); UI date picker disabled past dates.<br>2) **Defect `DEF-AP-02` (Duplicate/Overlapping Exceptions):** Both a duplicate full-day `Holiday` (`Thu, 31 Dec 2026`) AND an overlapping partial-day `Holiday` (`Thu, 31 Dec 2026 · 13:00–17:00 · UAT-F-006-Test`) were accepted (`3` conflicting rows for `2026-12-31`).<br>3) **Defect `DEF-AP-03` (Past-Date API Bypass):** Direct `POST /api/v1/doctors/me/exceptions` with `2020-01-01` returned **HTTP `201 Created`** (`Schedule exception created successfully.`) and persisted `Wed, 1 Jan 2020 · Holiday · Full day · Past date edge test` on `/doctor/schedule`. | **`FAIL`** *(Uncovered **2 Major Defects**: **`DEF-AP-02`** & **`DEF-AP-03`**)* | `EV-UAT-09A`..`09E` |
| **10th (Exp.) · `UAT-AP-10`** | **Exploratory (`F-004` Service Duration Lower Boundary)**<br>`POST /api/v1/admin/services` (`AC-F004-03`) | `6b73bfdb`<br>`s96ba5182-00005-ch9` | `2026-11-24 23:40:44 ICT` (`10A`)<br>`2026-11-24 23:41:30 ICT` (`10B`) | **Lead:** Norawit Mahaprom (`67070501026`)<br>**Co-Tester:** Pawarisa Thongchua (`67070501032`) | `admin@appointly.local`:<br>1) UI modal `F-004-Service-Duration-Test`, Duration `0`<br>2) API `POST /api/v1/admin/services` (`serviceName: 'Zero Min Edge'`, `durationMinutes: 0`) | 1) UI modal rendered red border and `"Duration must be between 1 and 480 minutes."` (negative numbers also blocked).<br>2) Console API call returned **HTTP `400 (Bad Request)`** (`{success: false, error: {...}}`). Lower boundary (`>= 1` min) enforced cleanly. | **`PASS`** | `EV-UAT-10A`, `EV-UAT-10B` |
| **11th (Exp.) · `UAT-AP-11`** | **Exploratory (`F-007` Clinic Settings Boundaries)**<br>`/admin/settings` UI validation (`AC-F007-01`) | `6b73bfdb`<br>`s96ba5182-00005-ch9` | `2026-11-24 23:43:30 ICT` | **Lead:** Norawit Mahaprom (`67070501026`)<br>**Co-Tester:** Pawarisa Thongchua (`67070501032`) | `admin@appointly.local` at `/admin/settings`: `Cancellation cutoff (hours)` = `-5`, `Fixed start interval` = `5 minutes`, `Timezone` = `Asia/Singapore` | Entering `-5` highlighted `Cancellation cutoff` in red with `"Enter a whole number of hours, 0 or more."`; `Timezone` restricts entries via an IANA LoV selector (direct API mutation intentionally skipped to preserve live clinic settings). | **`PASS`** | `EV-UAT-11` |

---

## 4. Detailed Case-by-Case Execution Observations & Console Captures

### 4.1 Case 1st: `UAT-AP-03` — Role-Based Access Control (RBAC) Denial & Inactive Account Rejection
* **Lead Tester:** Norawit Mahaprom (`67070501026`) · **Co-Tester:** Pawarisa Thongchua (`67070501032`)
* **Execution Timestamps (ICT):** `2026-11-24 22:16:37 ICT` (`EV-UAT-03A`) & `2026-11-24 22:20:30 ICT` (`EV-UAT-03B`)
* **Tested URL & Revision:** `https://s96ba5182-4d7hbszvwq-as.a.run.app` (`s96ba5182-00005-ch9`, commit `6b73bfdbf029343e4af3268d72e9364fbab12f52`)
* **Observed UI Behavior:**
  - Signing in with `inactive@appointly.local` stayed on `/login` and displayed the red alert banner: `"Account Suspended: Your account is currently inactive. Please contact the clinic administrator."` (`EV-UAT-03A`).
  - Signing in as `patient@appointly.local` and navigating directly to `/admin/settings` redirected immediately to `https://s96ba5182-4d7hbszvwq-as.a.run.app/unauthorized` displaying `"403 — Access Denied"` and `"Your current account role (PATIENT) does not have authorization to view this resource."` with `"Go to My Portal"` and `"Switch Account"` buttons (`EV-UAT-03B`).
* **Observed API / DevTools Console Output (`EV-UAT-03B`):**
  ```text
  PATCH https://s96ba5182-4d7hbszvwq-as.a.run.app/api/v1/admin/settings 403 (Forbidden)
  === UAT-AP-03 PATIENT PRIVILEGE ESCALATION RESULT ===
  Timestamp ICT: 2026-11-24 22:20:30
  Status Code: 403
  Error Code : FORBIDDEN
  Message    : Access forbidden: Role 'PATIENT' lacks permission for this resource.
  ```
* **Protected State Verification:** Confirmed subsequently in `UAT-AP-04` that clinic settings were not mutated to `"Unauthorized Name Mutation"`.
* **Verdict:** **`PASS`**

---

### 4.2 Case 2nd: `UAT-AP-02` — Schedule Overlap Conflict & Service Duration Boundaries
* **Lead Tester:** Pawarisa Thongchua (`67070501032`) · **Co-Tester:** Norawit Mahaprom (`67070501026`)
* **Execution Timestamps (ICT):** `2026-11-24 22:24:50 ICT` (`EV-UAT-02A`) & `2026-11-24 22:28:08 ICT` (`EV-UAT-02B`)
* **Tested URL & Revision:** `https://s96ba5182-4d7hbszvwq-as.a.run.app` (`s96ba5182-00005-ch9`, commit `6b73bfdbf029343e4af3268d72e9364fbab12f52`)
* **Observed UI Behavior:**
  - On `/doctor/schedule` (`Dr. Somchai Prasert`), setting overlapping Monday time slots (`09:00 AM–01:00 PM` and `12:00 AM–04:00 PM`) displayed the red error banner `"Fix 1 time slot before saving: shifts need an end after the start and must not overlap."` and inline red error `"Overlaps with 00:00–16:00."` (`EV-UAT-02A`).
  - On `/admin/services` (`Add New Service` modal with Name `"UAT Test"`, Description `"UAT-AP-02 part B test"`), entering `500` in `Duration (minutes)` rendered inline red validation `"Duration must be between 1 and 480 minutes."` (`EV-UAT-02B`).
* **Observed API / DevTools Console Output (`EV-UAT-02A` & `EV-UAT-02B`):**
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
* **Verdict:** **`PASS`**

---

### 4.3 Case 3rd: `UAT-AP-01` — Doctor Self-Schedule Split-Shift Configuration
* **Lead Tester:** Norawit Mahaprom (`67070501026`) · **Co-Tester:** Pawarisa Thongchua (`67070501032`)
* **Execution Timestamp (ICT):** `2026-11-24 22:40:03 ICT` (`EV-UAT-01`)
* **Tested URL & Revision:** `https://s96ba5182-4d7hbszvwq-as.a.run.app/doctor/schedule` (`s96ba5182-00005-ch9`, commit `6b73bfdbf029343e4af3268d72e9364fbab12f52`)
* **Observed UI Behavior:**
  - Upon login as `doctor@appointly.local`, the Doctor Portal loaded `/doctor/schedule` showing `Dr. Somchai Prasert` (`doctor@appointly.local`).
  - **Precondition Observation (`OBS-AP-01`):** Seeded Monday shifts already defaulted to `09:00 AM–12:00 PM` and `01:00 PM–05:00 PM`, causing the `Save Schedule` button to remain disabled (`dirty`-state guard) until a value was altered. To execute a genuine `PUT` persistence save, the tester updated Shift 1 to `08:30 AM–12:00 PM` and saved, then restored Shift 1 to `09:00 AM–12:00 PM` (with Shift 2 `01:00 PM–05:00 PM`) and clicked `Save Schedule`.
  - Saving displayed the green confirmation banner `"Weekly schedule saved successfully."` and returned `Save Schedule` to its clean/disabled state.
* **Observed API / DevTools Console Output (`EV-UAT-01`):**
  ```text
  === UAT-AP-01 MONDAY SHIFTS === 2026-11-24 22:40:03
  (index) | day      | start   | end     | active
  0       | 'Monday' | '09:00' | '12:00' | true
  1       | 'Monday' | '13:00' | '17:00' | true
  ```
* **Verdict:** **`PASS`** *(logged minor UAT precondition/format observation `OBS-AP-01` for Team `TH-017`)*

---

### 4.4 Case 4th: `UAT-AP-06` — Doctor Holiday & Schedule Exception Overrides
* **Lead Tester:** Pawarisa Thongchua (`67070501032`) · **Co-Tester:** Norawit Mahaprom (`67070501026`)
* **Execution Timestamp (ICT):** `2026-11-24 22:44:52 ICT` (initial `401` observation) & `2026-11-24 22:45:02 ICT` (`EV-UAT-06`)
* **Tested URL & Revision:** `https://s96ba5182-4d7hbszvwq-as.a.run.app/doctor/schedule` (`s96ba5182-00005-ch9`, commit `6b73bfdbf029343e4af3268d72e9364fbab12f52`)
* **Observed UI & Session Behavior:**
  - **Idle Access-Token Expiry Finding (`DEF-AP-01`):** While remaining on `/doctor/schedule` after ~15–20 minutes of session age, clicking `Add Exception` (`POST /api/v1/doctors/me/exceptions`) and querying `GET /api/v1/doctors/me/schedule` at `22:44:52` both returned `401 (Unauthorized)` without silently refreshing via the `refresh_token` cookie or redirecting the user to `/login`.
  - After establishing a fresh doctor session, submitting Date `2026-12-31`, Type `Holiday`, `Full day` checked, and Reason `New Year Holiday - Clinic Closed` displayed the green banner `"Holiday added for Thu, 31 Dec 2026."` and appended the entry `Thu, 31 Dec 2026 · Holiday · Full day · New Year Holiday - Clinic Closed` below the form (`EV-UAT-06`).
* **Observed API / DevTools Console Output (`EV-UAT-06`):**
  ```text
  // At 22:44:52 (expired idle session on /doctor/schedule):
  GET https://s96ba5182-4d7hbszvwq-as.a.run.app/api/v1/doctors/me/schedule 401 (Unauthorized)
  POST https://s96ba5182-4d7hbszvwq-as.a.run.app/api/v1/doctors/me/exceptions 401 (Unauthorized)

  // At 22:45:02 (after re-authentication):
  === UAT-AP-06 REGISTERED EXCEPTIONS === 2026-11-24 22:45:02
  (index) | date                   | type      | reason                | fullDay
  0       | '2026-12-31T00:00:...' | 'HOLIDAY' | 'New Year Holiday...' | true
  ```
* **Verdict:** **`PASS`** *(logged session-expiry refresh finding `DEF-AP-01` for Team `TH-017`)*

---

### 4.5 Case 5th: `UAT-AP-05` — Doctor-Service Assignment & Dynamic Patient Directory Filtering
* **Pair Testers:** Norawit Mahaprom (`67070501026` — Admin API) & Pawarisa Thongchua (`67070501032` — Patient Portal)
* **Execution Timestamps (ICT):** `2026-11-24 22:48:48 ICT` (`EV-UAT-05A`) & `2026-11-24 22:50:01 ICT` (`EV-UAT-05B`)
* **Tested URL & Revision:** `https://s96ba5182-4d7hbszvwq-as.a.run.app/admin/doctors` & `/patient/doctors?serviceId=72daa0a5-f266-42c3-9f3f-80db23aeb934` (`s96ba5182-00005-ch9`)
* **Observed UI Behavior:**
  - On `/admin/doctors`, opening `Manage Services` for `Dr. Somchai Prasert (Lead)` displayed `3 of 4 services assigned` (`Comprehensive Health Checkup`, `Flu Vaccination`, `General Consultation` as `Assigned`, and `Consultation` as `Not assigned`) (`EV-UAT-05A`).
  - On the Patient Portal (`Arisa Wongsuwan`, `patient@appointly.local`), selecting `General Consultation (30 mins)` navigated to `/patient/doctors?serviceId=72daa0a5-f266-42c3-9f3f-80db23aeb934`, displaying both active doctors assigned to `General Consultation` (`Dr. Somchai Prasert` — General Practice, and `Dr. Somchai Prasert (Lead)` — Internal Medicine) with their service duration chips (`EV-UAT-05B`).
* **Observed API / DevTools Console Output (`EV-UAT-05A`):**
  ```text
  Testing assignment: Doctor Dr. Somchai Prasert (Lead) (fd848770-67bb-4126-9aba-91f76cb9d59b) <-> Service Comprehensive Health Checkup (316aee65-e768-4d1f-a1ff-8db6303b0dda)
  POST https://s96ba5182-4d7hbszvwq-as.a.run.app/api/v1/admin/doctors/fd848770-67bb-4126-9aba-91f76cb9d59b/services 409 (Conflict)
  === UAT-AP-05 DUPLICATE ASSIGNMENT CHECK === 2026-11-24 22:48:48
  Status Code (Expected 409): 409
  Response: {"success":false,"error":{"code":"DUPLICATE_ASSIGNMENT","message":"Doctor is already assigned to this service."}}
  ```
* **Verdict:** **`PASS`**

---

### 4.6 Case 6th: `UAT-AP-04` — State Persistence, Audit Trail & Session Token Revocation
* **Lead Tester:** Pawarisa Thongchua (`67070501032`) · **Co-Tester:** Norawit Mahaprom (`67070501026`)
* **Execution Timestamps (ICT):** `2026-11-24 22:51:31 ICT` (`EV-UAT-04A`) & `2026-11-24 22:52:14 ICT` (`EV-UAT-04B`)
* **Tested URL & Revision:** `https://s96ba5182-4d7hbszvwq-as.a.run.app/admin/settings` & `/login` (`s96ba5182-00005-ch9`)
* **Observed UI Behavior:**
  - Updated `Clinic name` to `Appointly Executive Care Centre` (with `Timezone: Asia/Bangkok`, `Fixed start interval: 15 minutes`, `Cancellation cutoff (hours): 24`), clicked `Save Settings`, and performed a hard refresh (`Ctrl+F5`). All four persisted settings remained rendered in the form (`EV-UAT-04A`).
  - Clicking `Log out` redirected to `https://s96ba5182-4d7hbszvwq-as.a.run.app/login` and cleared session cookies (`EV-UAT-04B`).
* **Observed API / DevTools Console Output (`EV-UAT-04A` & `EV-UAT-04B`):**
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
* **Observability Limitation (`OBS-AP-02`):** Team `TH-017`'s `UAT-AP-04` expected result references a PostgreSQL `AuditLog` row (`CLINIC_SETTINGS_UPDATED`), which cannot be inspected through the deployed user-facing UI or public/admin API without direct database access.
* **Verdict:** **`PASS`** *(settings persistence & logout revocation verified; AuditLog verification noted as not directly observable via UI/API)*

---

### 4.7 Exploratory Case 7th: `UAT-AP-07` — Patient Profile Phone Validation, Blank Fields & Future DOB API Bypass (`F-002`)
* **Lead Tester:** Norawit Mahaprom (`67070501026`) · **Co-Tester:** Pawarisa Thongchua (`67070501032`)
* **Execution Timestamps (ICT):** `2026-11-24 23:13:24 ICT` (`EV-UAT-07A`), `2026-11-24 23:14:00 ICT` (`EV-UAT-07B`), `2026-11-24 23:34:17 ICT` (`EV-UAT-07C`)
* **Tested URL & Revision:** `https://s96ba5182-4d7hbszvwq-as.a.run.app/patient/profile` (`s96ba5182-00005-ch9`, commit `6b73bfdbf029343e4af3268d72e9364fbab12f52`)
* **Observed UI & Backend Behavior:**
  - **Phone Format Validation (`EV-UAT-07A`):** On `My Profile` (`Arisa Wongsuwan`, `patient@appointly.local`), entering non-mobile landline `0212345678` highlighted the input red and rendered `"Enter a valid phone number, e.g. 0812345678 or +66812345678."`.
  - **Blank Field & Future DOB Prevention (`EV-UAT-07B`, `EV-UAT-07C`):** Clearing `Full Name` and `Phone Number` rendered inline red validation `"Full name is required."` and `"Phone number is required."`. The `Date of Birth` calendar picker disabled today (`24 Nov 2026`) and all future dates (`25 Nov 2026` onward; maximum selectable date `23 Nov 2026`).
  - **Direct Backend API Check (`EV-UAT-07C`):**
    ```text
    PUT https://s96ba5182-4d7hbszvwq-as.a.run.app/api/v1/patients/me 400 (Bad Request)
    Profile Edge Status: 400 {success: false, error: {...}}
    ```
    Submitting `{ fullName: '   ', phoneNumber: '0812345678', dateOfBirth: '2030-01-01' }` directly to the backend was rejected with **HTTP `400 Bad Request`**.
* **Verdict:** **`PASS`** *(both UI and backend API validation verified)*

---

### 4.8 Exploratory Case 8th: `UAT-AP-08` — Deactivated Doctor Visibility in Patient Directory (`F-003`)
* **Lead Tester:** Norawit Mahaprom (`67070501026`) · **Co-Tester:** Pawarisa Thongchua (`67070501032`)
* **Execution Timestamp (ICT):** `2026-11-24 23:16:27 ICT` (`EV-UAT-08`)
* **Tested URL & Revision:** `https://s96ba5182-4d7hbszvwq-as.a.run.app/patient/doctors` (`s96ba5182-00005-ch9`, commit `6b73bfdbf029343e4af3268d72e9364fbab12f52`)
* **Observed UI Behavior:**
  - After deactivating `Dr. Somchai Prasert` via Admin governance (`admin@appointly.local`), signing in as `patient@appointly.local` and opening `Find a Doctor` (`/patient/doctors` with `Filter by service: All services`) rendered only `Dr. Somchai Prasert (Lead)` (`Internal Medicine`). The deactivated doctor (`Dr. Somchai Prasert`, `General Practice`) was completely excluded from the patient-facing directory (`EV-UAT-08`).
* **Verdict:** **`PASS`**

---

### 4.9 Exploratory Case 9th: `UAT-AP-09` — Schedule Inverted Shift, Past Holiday API Bypass, Duplicate Full-Day & Overlapping Partial-Day Holidays (`F-006`)
* **Lead Tester:** Norawit Mahaprom (`67070501026`) · **Co-Tester:** Pawarisa Thongchua (`67070501032`)
* **Execution Timestamps (ICT):** `2026-11-24 23:18:06 ICT` (`09A`), `23:20:08 ICT` (`09B`), `23:36:43 ICT` (`09C`), `23:37:12 ICT` (`09D`), `23:39:20 ICT` (`09E`)
* **Tested URL & Revision:** `https://s96ba5182-4d7hbszvwq-as.a.run.app/doctor/schedule` (`s96ba5182-00005-ch9`, commit `6b73bfdbf029343e4af3268d72e9364fbab12f52`)
* **Observed UI & API Behavior:**
  - **Inverted Shift & UI Past Date Guards (`EV-UAT-09B`):** Setting Monday Shift 1 to Start `04:00 PM` (`16:00`) and End `10:00 AM` (`10:00`) displayed red banner `"Fix 1 time slot before saving: shifts need an end after the start and must not overlap."` and inline error `"End time must be after start time."`. Inverted partial-day exception times were also blocked in the UI, and past dates were grayed out in the UI date picker.
  - **Defect `DEF-AP-02` — Duplicate Full-Day & Overlapping Partial-Day Holidays (`EV-UAT-09A`, `EV-UAT-09E`):**
    1. Submitting a second `Full day` `Holiday` on `Thu, 31 Dec 2026` (`New Year Holiday - Clinic Closed`) succeeded (`"Holiday added for Thu, 31 Dec 2026."`) and persisted **two identical full-day rows** (`EV-UAT-09A`).
    2. Unchecking `Full day` and adding a partial-day `Holiday` (`13:00–17:00`, `"UAT-F-006-Test"`) on the same already full-day-blocked date `Thu, 31 Dec 2026` also succeeded, resulting in **three overlapping `Holiday` rows on `Thu, 31 Dec 2026`** (`EV-UAT-09E`).
  - **Defect `DEF-AP-03` — Past-Date Schedule Exception API Bypass (`EV-UAT-09C`, `EV-UAT-09D`):**
    ```text
    // Executed on /doctor/schedule as DOCTOR_USER:
    fetch('/api/v1/doctors/me/exceptions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ exceptionDate: '2020-01-01', exceptionType: 'HOLIDAY', startTime: null, endTime: null, reason: 'Past date edge test' })
    })
    Past Holiday Edge Status: 201 {success: true, data: {...}, message: 'Schedule exception created successfully.'}
    ```
    Upon page reload (`EV-UAT-09D`), the past-date exception **`Wed, 1 Jan 2020 · Holiday · Full day · Past date edge test`** appeared persisted in the list — proving past-date enforcement exists only in the HTML date picker and is missing from the backend API.
* **Verdict:** **`FAIL`** *(Inverted shifts blocked, **but 2 Major Defects uncovered: `DEF-AP-02` & `DEF-AP-03`**)*

---

### 4.10 Exploratory Case 10th: `UAT-AP-10` — Service Duration Lower Boundary (`0` & Negative Minutes) (`F-004`)
* **Lead Tester:** Norawit Mahaprom (`67070501026`) · **Co-Tester:** Pawarisa Thongchua (`67070501032`)
* **Execution Timestamps (ICT):** `2026-11-24 23:40:44 ICT` (`EV-UAT-10A`) & `2026-11-24 23:41:30 ICT` (`EV-UAT-10B`)
* **Tested URL & Revision:** `https://s96ba5182-4d7hbszvwq-as.a.run.app/admin/services` (`s96ba5182-00005-ch9`, commit `6b73bfdbf029343e4af3268d72e9364fbab12f52`)
* **Observed UI & API Behavior:**
  - In `Add New Service` (`F-004-Service-Duration-Test`, Duration `0`), the modal highlighted Duration in red with `"Duration must be between 1 and 480 minutes."` (`EV-UAT-10A`). Negative values were likewise rejected.
  - Direct Console API `POST /api/v1/admin/services` (`durationMinutes: 0`) returned **HTTP `400 (Bad Request)`** (`Duration 0 Edge Status: 400 {success: false, error: {...}}`) (`EV-UAT-10B`).
* **Verdict:** **`PASS`**

---

### 4.11 Exploratory Case 11th: `UAT-AP-11` — Clinic Settings Negative Cutoff & Timezone Boundaries (`F-007`)
* **Lead Tester:** Norawit Mahaprom (`67070501026`) · **Co-Tester:** Pawarisa Thongchua (`67070501032`)
* **Execution Timestamp (ICT):** `2026-11-24 23:43:30 ICT` (`EV-UAT-11`)
* **Tested URL & Revision:** `https://s96ba5182-4d7hbszvwq-as.a.run.app/admin/settings` (`s96ba5182-00005-ch9`, commit `6b73bfdbf029343e4af3268d72e9364fbab12f52`)
* **Observed UI Behavior:**
  - Entering `-5` in `Cancellation cutoff (hours)` highlighted the field red and displayed inline validation `"Enter a whole number of hours, 0 or more."` (`EV-UAT-11`).
  - `Timezone` enforces selection from a controlled List of Values (LoV) of valid IANA identifiers (e.g. `Asia/Singapore` / `Asia/Bangkok`), preventing arbitrary invalid timezone text input in the UI.
* **Verdict:** **`PASS`**

---

## 5. Coverage Adequacy Review & Exploratory Sprint 1 Execution Outcomes (Per Instructor Clarification)

Per Lab 6 Handout §3.2 and the instructor's clarification (*"The UAT Team should not simply execute the test cases supplied by the Developer Team. You should also check whether those cases adequately cover the important Sprint 1 requirements and acceptance criteria, and suggest additional cases where necessary"*), Team `TH-045_P2` audited Team `TH-017`'s 6 supplied cases against their declared Sprint 1 scope (`F-001`–`F-007`) and **executed 5 exploratory cases (`UAT-AP-07`–`11`)**:

| Sprint 1 Requirement Area (`TH-017` §2.1) | Covered by Supplied `UAT-AP-01`..`06`? | Exploratory Action & Result (`TH-045_P2`) |
| :--- | :---: | :--- |
| **`F-002` Patient Profile Self-Service (`GET/PUT /api/v1/patients/me`)** — mandatory full name, Thai mobile format `0[689]\d{8}`, past DOB (`dateOfBirth < CURRENT_DATE`) | **No** *(only RBAC in `UAT-AP-03`)* | **Executed as `UAT-AP-07` (`PASS` UI + API):** Verified UI rejects `0212345678` & blank fields (`EV-UAT-07A`, `07C`), picker disables today/future DOBs (`EV-UAT-07B`), and `PUT /api/v1/patients/me` rejects blank name + `2030-01-01` with `400 Bad Request` (`EV-UAT-07C`). |
| **`F-003` Doctor Profile Status Toggle (`PATCH /api/v1/admin/doctors/:id/status`)** | **Partial** *(deactivation not exercised)* | **Executed as `UAT-AP-08` (`PASS`):** Deactivated `Dr. Somchai Prasert` via Admin and verified exclusion from `/patient/doctors` (`EV-UAT-08`). |
| **`F-004` Service Duration Lower Boundary (`1 <= duration_minutes <= 480`)** | **Partial** *(upper `481` only in `UAT-AP-02`)* | **Executed as `UAT-AP-10` (`PASS` UI + API):** Verified UI & `POST /api/v1/admin/services` reject `durationMinutes: 0` / negative (`400 Bad Request`, `EV-UAT-10A`, `10B`). |
| **`F-006` Schedule Exceptions & Inverted Shifts (`endTime <= startTime`, past-date API bypass, duplicate/overlapping holiday exceptions)** | **Partial** *(overlap only in `UAT-AP-02`)* | **Executed as `UAT-AP-09` (`FAIL` -> `DEF-AP-02` & `DEF-AP-03`):** Inverted shifts and UI past dates blocked (`EV-UAT-09B`), **but duplicate full-day (`EV-UAT-09A`) & overlapping partial-day (`EV-UAT-09E`) holidays on `2026-12-31` succeeded, and `POST /api/v1/doctors/me/exceptions` with `2020-01-01` bypassed the UI picker with `201 Created` (`EV-UAT-09C`, `09D`)**. |
| **`F-007` Clinic Settings Cutoff & Timezone Boundaries** | **Partial** *(happy path only in `UAT-AP-04`)* | **Executed as `UAT-AP-11` (`PASS` on UI):** Negative cutoff `-5` blocked inline; timezone governed by valid IANA LoV (`EV-UAT-11`). |
| **`F-001` Idle Access Token Refresh / Expiry UX** | **Uncovered** *(observed `401` in `UAT-AP-06`)* | **Observed in `UAT-AP-06` (`DEF-AP-01`):** Idle expired `access_token` failed `POST /api/v1/doctors/me/exceptions` & `GET /api/v1/doctors/me/schedule` with `401` without silent refresh or redirect (`EV-UAT-06`). |

---

## 6. Outgoing Findings Summary for Team `TH-017` (Cross-Reference to `L6-3` / Issue `#44`)

All `6` supplied UAT cases (`UAT-AP-01`–`06`) passed their primary checks and `4` of `5` exploratory cases (`UAT-AP-07`, `08`, `10`, `11`) passed, while exploratory case **`UAT-AP-09` failed** due to two Major defects (**`DEF-AP-02`** and **`DEF-AP-03`**). Together with **`DEF-AP-01`** (Minor) and two minor observations (`OBS-AP-01`, `OBS-AP-02`), all findings are filed for Team `TH-017` in [`docs/labs/lab-06/defect-triage.md`](./defect-triage.md):

| Finding ID | Linked Case & AC | Classification / Severity | Summary of Observed vs. Expected Behavior | Evidence Ref |
| :---: | :--- | :---: | :--- | :---: |
| **`DEF-AP-02`** | `UAT-AP-09` *(Exploratory)* / `UAT-AP-06` (`F-006` / `AC-F006-03`) | **Major Defect** *(Duplicate & overlapping schedule exceptions)* | Doctor can submit multiple identical full-day `HOLIDAY` exceptions (`Thu, 31 Dec 2026`) **and** additional overlapping partial-day `HOLIDAY` exceptions (`13:00–17:00`) on a date already blocked full-day without `409 Conflict` / `422 Unprocessable Entity` rejection, persisting 3 conflicting rows for `2026-12-31`. | [`EV-UAT-09A`](../../evidence/lab-06/l6-2/F-006-duplicate-holiday.png)<br>[`EV-UAT-09E`](../../evidence/lab-06/l6-2/F-006-dup-holiday-partial-time.png) |
| **`DEF-AP-03`** | `UAT-AP-09` *(Exploratory)* / `UAT-AP-06` (`F-006` / `AC-F006-03`) | **Major Defect** *(Missing server-side past-date validation)* | Past holiday dates are blocked only in the frontend HTML date picker; sending `POST /api/v1/doctors/me/exceptions` directly with past `exceptionDate: "2020-01-01"` returns **HTTP `201 Created`** and persists `Wed, 1 Jan 2020 · Holiday · Full day · Past date edge test` on `/doctor/schedule`. | [`EV-UAT-09C`](../../evidence/lab-06/l6-2/F-006-API-adding-past-holidays-1.png)<br>[`EV-UAT-09D`](../../evidence/lab-06/l6-2/F-006-API-adding-past-holidays-2.png) |
| **`DEF-AP-01`** | `UAT-AP-06` (`F-001` / `F-006`) | **Minor Defect** *(Session expiry / refresh UX)* | After ~15–20 min idle on `/doctor/schedule`, clicking `Add Exception` (`POST /api/v1/doctors/me/exceptions`) and querying `/api/v1/doctors/me/schedule` failed with HTTP `401 (Unauthorized)` at `22:44:52` without silently refreshing the session via `refresh_token` or redirecting the user to `/login`. | [`EV-UAT-06`](../../evidence/lab-06/l6-2/04-uat-ap-06-holiday-exception.png) |
| **`OBS-AP-01`** | `UAT-AP-01` (`F-006` / `AC-F006-01`) | **Minor Observation** *(Test-plan precondition & time-format mismatch)* | Seeded Monday schedule already defaults to `09:00–12:00` & `13:00–17:00`, keeping `Save Schedule` disabled until modified; API also returns `HH:MM` (`'09:00'`) instead of `HH:MM:SS` (`'09:00:00'`) stated in `UAT-AP-01` expected results. | [`EV-UAT-01`](../../evidence/lab-06/l6-2/03-uat-ap-01-doctor-split-shift.png) |
| **`OBS-AP-02`** | `UAT-AP-04` (`F-007` / `AC-F007-01`) | **Minor Observation** *(UAT observability limitation)* | `UAT-AP-04` expects verification of the `CLINIC_SETTINGS_UPDATED` `AuditLog` entry, but Sprint 1 provides no Admin UI or API endpoint for the independent UAT team to inspect `AuditLog` entries. | [`EV-UAT-04A`](../../evidence/lab-06/l6-2/06a-uat-ap-04-settings-refresh.png) |
