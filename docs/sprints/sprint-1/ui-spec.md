# Sprint 1 UI Specification
**EquipFlow Ocean Blue & Warm Sand Design System**

**Document ID:** `UI-SPEC-SPRINT-01`  
**Version:** `1.1.0`  
**Status:** Draft  
**Target Release:** `v0.1.0-sprint1`  

---

## 1. Design System & Visual Language

EquipFlow features the **Ocean Palette Design System**, inspired by deep maritime tones paired with a warm coastal sand contrast. The visual language blends authoritative deep ocean blues with vibrant wave accents, sky aqua focus cues, and an elegant warm sand tone (`#EFDBCB`) for prominent contrast highlights, callout cards, and status alerts across desktop, tablet, and mobile displays.

### 1.1 Ocean Color Tokens Palette

| Token Name | Hex Code | Visual Role & Usage |
|---|---|---|
| `--color-ocean-deep` | `#345DA7` | **Primary Brand Blue**: Top navigation header, primary CTA buttons (`.btn-primary`), primary headers |
| `--color-ocean-wave` | `#3B8AC4` | **Cerulean Wave**: Button hover states (`.btn-primary:hover`), active tab indicators, interactive links |
| `--color-ocean-aqua` | `#4BB4DE` | **Sky Aqua**: Keyboard focus rings (`:focus-visible`), info badges, progress indicators |
| `--color-ocean-sand` | `#EFDBCB` | **Warm Sand (Contrasting Accent)**: High-contrast callout boxes, quota badges, pending alerts, accent cards |
| `--color-ocean-sand-dark` | `#5A3816` | High-contrast dark amber-brown text used on Sand surfaces (WCAG AA ratio $\ge 5.2:1$) |
| `--color-navy-dark` | `#1E2D42` | Deep maritime navy dark container backgrounds, footer, modal headers |
| `--color-page-bg` | `#F4F7FB` | Soft oceanic off-white page background to eliminate eye strain |
| `--color-surface` | `#FFFFFF` | Card surfaces, modal dialog bodies, table container panels |
| `--color-surface-subtle` | `#EBF2F7` | Soft sea-mist tint for table headers, read-only field containers, subtle cards |
| `--color-text-primary` | `#1A2838` | Deep charcoal-navy text for headers and high-contrast readable copy |
| `--color-text-secondary` | `#53687E` | Muted oceanic slate text for metadata, subtitles, timestamps, column headers |
| `--color-border-neutral` | `#D2DEE9` | 1px neutral borders for cards, table dividers, form field boundaries |
| `--color-border-focus` | `#4BB4DE` | 2px accessible focus ring in vibrant sky aqua |
| `--color-error-bg` | `#FEE2E2` | Validation error alert background |
| `--color-error-text` | `#991B1B` | High-contrast dark red error message text |
| `--color-error-border` | `#DC2626` | 1px red border applied to invalid input controls |

### 1.2 Status Badges (With Non-Color Cues)
Every status indicator combines distinct color tokens from the Ocean palette with an explicit textual label and semantic icon to guarantee accessibility under WCAG 2.1 AA guidelines:

| State | Badge Class | Visual Background / Text | Non-Color Icon & Label Cue |
|---|---|---|---|
| **Available** | `.badge-avail` | Seafoam Green (`#D2EFE0` / `#0C6839`) | 🟢 `Available` |
| **Reserved** | `.badge-res` | Warm Sand Accent (`#EFDBCB` / `#5A3816`) | 🟡 `Reserved` |
| **Checked Out** | `.badge-out` | Oceanic Blue (`#DBEAFE` / `#1E40AF`) | 🔵 `Checked Out` |
| **Maintenance** | `.badge-maint` | Soft Coral Red (`#FEE2E2` / `#991B1B`) | 🔴 `Maintenance` |
| **Pending Request** | `.badge-pending`| Warm Sand Accent (`#EFDBCB` / `#5A3816`) | ⏳ `Pending Approval` |
| **Active Loan** | `.badge-active` | Deep Ocean Tint (`#E1EDF8` / `#234E8E`) | 📦 `Active Loan` |

---

## 2. Borrower Portal UI Specification

### 2.1 Login View (`/login`)
* **Layout:** Centered card (maximum width `450px`) on a soft `--color-page-bg` (`#F4F7FB`) backdrop.
* **Header:**
  * Background: Deep Ocean Blue (`#345DA7`) with crisp white typography.
  * Application Title: **EquipFlow — CPE Hardware Lending**.
  * Subtitle: `Department of Computer Engineering`.
* **Form Controls:**
  * Input: `Email Address` (`type="email"`, required, autofocus).
  * Input: `Password` (`type="password"`, required).
  * Primary Button: `"Sign In"` (`background: #345DA7`, hover: `#3B8AC4`, text: white). Disables and renders spinner (`"Signing in..."`) while request is in-flight.
* **Warm Sand Contrast Callout (`#EFDBCB`):**
  * Below the login form, a high-contrast card with `background: #EFDBCB; border: 1px solid #DFCCBA; color: #5A3816;` displaying the local development credentials:
    * Borrower: `borrower@cpe.kmutt.ac.th` / `Password123!`
    * Custodian: `custodian@cpe.kmutt.ac.th` / `Password123!`
* **Error Handling:** If authentication fails, renders a dismissible red alert banner: `"Invalid email or password."`.

### 2.2 Top Navigation Bar (Global)
* **Visual Style:**
  * Background: Deep Ocean Blue (`#345DA7`) with a subtle 2px bottom border in Sky Aqua (`#4BB4DE`).
  * Brand Logo: White text with bold font.
  * Active Navigation Links: Highlighted in Cerulean Wave (`#3B8AC4`) with a white underline.
* **User Identity Section:**
  * Authenticated user's `fullName` rendered in white.
  * Role Badge rendered in **Warm Sand Accent** (`background: #EFDBCB; color: #5A3816; font-weight: bold;`) showing `[Borrower]` or `[Custodian]`.
  * `"Logout"` Button: Outlined white button with hover fill.

### 2.3 Equipment Catalog View (`/catalog`)
* **Header Area:**
  * Title: `Department Equipment Catalog` (`color: #1A2838`).
  * Subtitle: `Browse real-time hardware availability and submit borrowing requests.`
  * Right Action: **Active Quota Counter Pill** styled in Warm Sand Accent:
    ```html
    <span class="badge" style="background-color: #EFDBCB; color: #5A3816; font-size: 0.95rem;">
      📋 My Active Items: <strong>X / 3</strong>
    </span>
    ```
* **Equipment Card Grid:**
  * Responsive card layout (`background: #FFFFFF; border: 1px solid #D2DEE9; border-radius: 8px;`).
  * **Card Header:** Asset Tag in deep navy text and real-time status badge (`.badge-avail`, `.badge-res`, etc.).
  * **Card Body:** Equipment Title (e.g. `Rigol DS1054Z Digital Oscilloscope`), Category, Model, Condition.
  * **Card Footer:**
    * `"View Details"` button (outlined Cerulean `#3B8AC4`).
    * `"Request Item"` button:
      * Active state: Deep Ocean Blue (`#345DA7`, hover `#3B8AC4`) when status is `AVAILABLE` and Borrower Active Quota $< 3$.
      * Disabled state: Soft gray (`#E2E8F0`) with explicit text: `"Reserved"`, `"Checked Out"`, or `"Limit Reached (3/3)"`.
* **Equipment Detail & Request Modal:**
  * Modal header styled in Deep Ocean Navy (`#1E2D42`) with white text.
  * Displays specifications, manufacturer serial number, and condition.
  * Optional Textarea: `"Academic Purpose / Course Project Notes"` (max 250 characters).
  * Action: `"Confirm Request"` button (`#345DA7`). Disables immediately on click to prevent duplicate submissions.

### 2.4 My Requests & Loans View (`/my-requests`)
* Accessible to Borrowers from top navigation.
* **Quota Progress Banner:**
  * Card styled with a Warm Sand accent border (`border-left: 4px solid #EFDBCB;`).
  * Progress Bar: Track in `#EBF2F7`, filled bar in Deep Ocean Blue (`#345DA7`) indicating active load (e.g. `1 of 3 items in use`).
* **Active Loans Section:**
  * Table headers styled with subtle blue-gray tint (`#EBF2F7`).
  * Columns: `Asset Tag`, `Equipment Name`, `Checked Out At`, `Due Date`, `Status`.
  * `Due Date` highlighted in bold with a clock cue.
* **Pending Requests Section:**
  * Columns: `Asset Tag`, `Equipment Name`, `Requested Date`, `Purpose Notes`, `Status`.
  * Status rendered with Warm Sand badge (`.badge-pending`).
* **Empty State:**
  * Illustrative empty state card with soft blue tint: `"You have no active loans or requests. Browse the catalog to borrow equipment."` with a primary button linking to `/catalog`.

---

## 3. Custodian Operations Desk UI Specification

### 3.1 Custodian Desk View (`/custodian/desk`)
* **Access Boundary:** Restricted strictly to users authenticated with role `CUSTODIAN`. Borrowers attempting access are redirected with an unauthorized toast notice.
* **Header Area:**
  * Title: `Custodian Triage & Checkout Desk` (`color: #1A2838`).
  * Subtitle: `Review student requests, verify physical custody, and record checkouts.`
  * Right Action: `"Refresh Queue"` button (Cerulean Wave `#3B8AC4` with sync icon).
* **Triage Work Area:**
  1. **Pending Requests Queue (Primary Work Table):**
     * Columns: `Requested Time`, `Student Name`, `Student ID`, `Asset Tag`, `Equipment Name`, `Notes`, `Action`.
     * Student ID styled as a subtle code badge.
     * Action Column: Primary button `"Approve & Checkout"` (`background: #345DA7`, hover `#3B8AC4`, text: white).
     * Clicking `"Approve & Checkout"` opens the **Checkout Confirmation Modal**.
  2. **Active Loans Monitor:**
     * Summarizes all currently checked out items across the department.
     * Columns: `Asset Tag`, `Equipment Name`, `Borrower Name`, `Checked Out At`, `Due Date` (7-day deadline), `Accountable Custodian`.

### 3.2 Checkout Confirmation Modal
* Modal header styled in Deep Ocean Navy (`#1E2D42`) with white text.
* Displays verified Borrower identity: `Student Borrower One (67070501001)`.
* Displays verified Equipment identity: `CPE-OSC-001 (Rigol DS1054Z)`.
* **7-Day Deadline Callout:**
  * Boxed callout styled in **Warm Sand Accent** (`background: #EFDBCB; color: #5A3816; border: 1px solid #DFCCBA; border-radius: 6px; padding: 12px;`):
    * `📅 Scheduled Due Date: 19 November 2026 (7 days from today)`
* Optional Input: `Checkout Staff Notes` (e.g. "Verified student ID card. Handed over with power cord.").
* Action Buttons: `"Cancel"` and `"Confirm Physical Checkout"`.
* Submit Button states: Disables immediately on click and displays `"Processing checkout..."` to prevent duplicate submissions.

---

## 4. Responsive Breakpoints & Accessibility

### 4.1 Responsive Layout Rules

| Viewport | Screen Width | Layout Adjustments |
|---|---|---|
| **Desktop** | $\ge 1024$px | 3-column equipment card grid on `/catalog`. Full data tables with all columns visible on `/custodian/desk` and `/my-requests`. |
| **Tablet** | $768$px to $1023$px | 2-column equipment card grid. Tables remain full width with horizontally scrollable container if needed. |
| **Mobile** | $< 768$px | 1-column stacked equipment cards. Top navbar collapses into accessible hamburger menu. Tables display essential columns (`Asset Tag`, `Status`, `Action`) with secondary details stacked vertically. |

### 4.2 Accessibility Standards (WCAG 2.1 AA)
* **Keyboard Navigation:** All interactive elements (`<button>`, `<a>`, `<input>`, `<select>`) support tab navigation in natural DOM order.
* **Visible Focus Rings:** High-contrast 2px focus ring (`--color-border-focus: #4BB4DE`) in sky aqua applied to active elements upon keyboard `:focus-visible`.
* **Zero Horizontal Scroll:** Pages contain zero horizontal scrollbar at standard viewport widths (375px, 768px, 1280px).
* **Non-Color Dependency:** All status indicators accompany color badges with explicit text labels and semantic icons.
* **Color Contrast:** Text on Warm Sand (`#EFDBCB`) uses `--color-ocean-sand-dark: #5A3816` achieving a contrast ratio of $5.2:1$, exceeding WCAG AA minimum ($4.5:1$).

---

## 5. Shared Form, Error & Loading Behaviors

1. **Button Debounce & Loading Spinners:** All mutating submit buttons disable upon click and render an inline loading spinner to eliminate duplicate submissions caused by rapid clicks.
2. **Form Value Preservation:** Client validation failures retain all user-entered form data (e.g., purpose notes, checkout remarks) across recoverable validation errors.
3. **API Failure Feedback:** If a backend request fails with HTTP 400, 401, 403, or 409, the UI traps the JSON error envelope and displays the human-readable `error.message` in a dismissible alert banner.
4. **Skeleton Placeholders:** Initial page loads query APIs asynchronously while rendering pulsing ocean-tinted skeleton cards (`#EBF2F7`) to prevent Cumulative Layout Shift (CLS).
