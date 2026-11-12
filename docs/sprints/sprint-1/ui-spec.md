# Sprint 1 UI Specification

**EquipFlow Blue Matcha Design System**

**Document ID:** `UI-SPEC-SPRINT-01`  
**Version:** `1.2.1`  
**Status:** Draft  
**Target Release:** `v0.1.0-sprint1`  

---

## 1. Design System & Visual Language

EquipFlow features the **Blue Matcha Design System**, blending calming marine depth with earthy matcha botanical accents and creamy porcelain clarity. The visual language unites **Deep Ocean** navy structure, vibrant **Matcha Green** availability indicators, a soothing **Vanilla Milk** canvas, **Airy Blue** interactive cues, and **Frozen Aqua** subtle surface tints across desktop, tablet, and mobile displays.

### 1.1 Blue Matcha Color Tokens Palette

| Token Name | Hex Code | Visual Role & Component Usage |
| --- | --- | --- |
| `--color-deep-ocean` | `#31465A` | **Primary Brand & Structure**: Top navbar header, primary buttons (`.btn-primary`), primary headers, modal titles |
| `--color-matcha-green` | `#C7DFA3` | **Matcha Accent & Success**: `AVAILABLE` status badges, quota progress bar fill, success highlights |
| `--color-vanilla-milk` | `#FFFDF7` | **Warm Canvas & Surfaces**: Application page background (`body`), card surfaces, modal body background |
| `--color-airy-blue` | `#89B9E6` | **Interactive Accent & Status**: Button hover (`.btn-primary:hover`), active tab indicators, `RESERVED` status badge |
| `--color-frozen-aqua` | `#D9F0FF` | **Subtle Surface & Triage**: Table headers, read-only field surfaces, demo callout box, `CHECKED_OUT` badge |
| `--color-focus-ring` | `#31465A` | **High-Contrast Focus Indicator**: 2px solid Deep Ocean outline (`outline-offset: 2px`) for keyboard focus on light surfaces |
| `--color-focus-ring-dark` | `#FFFDF7` | **Inverted Focus Indicator**: 2px solid Vanilla Milk outline on dark surfaces (e.g. Deep Ocean navbar) |
| `--color-deep-ocean-dark` | `#1C2A37` | High-contrast deep slate text for body copy and headings on Vanilla Milk |
| `--color-muted-slate` | `#586D82` | Secondary text, field helper labels, timestamps, table column subtitles |
| `--color-border-subtle` | `#DCE8F2` | 1px soft neutral border for cards, table dividers, form field boundaries |
| `--color-error-bg` | `#FEE2E2` | Validation error alert background |
| `--color-error-text` | `#991B1B` | High-contrast dark crimson error text |
| `--color-error-border` | `#DC2626` | 1px red border applied to invalid input controls |


### 1.2 Text & Non-Text Contrast Compliance (WCAG 2.1 AA / AAA)

#### 1.2.1 Text Contrast Evaluation (WCAG 2.1 SC 1.4.3)

Every foreground/background color pair in the Blue Matcha palette is mathematically evaluated and verified under WCAG 2.1 relative luminance standards:

| Foreground Color | Background Color | Evaluated Ratio | WCAG 2.1 Level | UI Application & Context |
| --- | --- | :---: | :---: | --- |
| White (`#FFFFFF`) | Deep Ocean (`#31465A`) | **9.75:1** | **AAA** ($\ge 7.0:1$) | Top navbar title, primary button label (`.btn-primary`), modal header text |
| Deep Ocean (`#31465A`) | Vanilla Milk (`#FFFDF7`) | **9.58:1** | **AAA** ($\ge 7.0:1$) | Page body text, card titles, form labels, table body content |
| Deep Ocean (`#31465A`) | Frozen Aqua (`#D9F0FF`) | **8.29:1** | **AAA** ($\ge 7.0:1$) | Table headers (`th`), callout credentials card, `CHECKED_OUT` badge text |
| Deep Ocean (`#31465A`) | Matcha Green (`#C7DFA3`) | **6.74:1** | **AA** ($\ge 4.5:1$) | `AVAILABLE` status badge text, quota progress counter badge |
| Deep Ocean (`#31465A`) | Airy Blue (`#89B9E6`) | **4.71:1** | **AA** ($\ge 4.5:1$) | `RESERVED` status badge text, active tab indicators |
| Deep Ocean Dark (`#1C2A37`) | Vanilla Milk (`#FFFDF7`) | **14.38:1** | **AAA** ($\ge 7.0:1$) | Primary headings, high-contrast body text |
| Muted Slate (`#586D82`) | Vanilla Milk (`#FFFDF7`) | **5.26:1** | **AA** ($\ge 4.5:1$) | Field helper labels, timestamps, table column subtitles |
| Dark Crimson (`#991B1B`) | Soft Coral Red (`#FEE2E2`) | **6.80:1** | **AA** ($\ge 4.5:1$) | Form validation error alerts, maintenance badge text |

#### 1.2.2 Non-Text Contrast Evaluation for Focus Indicators & UI Components (WCAG 2.1 SC 1.4.11 $\ge 3:1$)

Per WCAG 2.1 Success Criterion 1.4.11 (Non-text Contrast), visual focus indicators and active interactive control boundaries must achieve at least **3:1** contrast against adjacent background colors.

> [!NOTE] Focus Indicator Contrast Evaluation
> While Airy Blue (`#89B9E6`, $L=0.45729$) provides an elegant interactive accent, its contrast against light surfaces fails SC 1.4.11:
>
> - Against Vanilla Milk (`#FFFDF7`): **2.03:1** (Fails $\ge 3:1$)
> - Against Pure White (`#FFFFFF`): **2.07:1** (Fails $\ge 3:1$)
> - Against Frozen Aqua (`#D9F0FF`): **1.76:1** (Fails $\ge 3:1$)
>
> Therefore, EquipFlow designates **Deep Ocean (`#31465A`)** as the primary focus indicator token (`--color-focus-ring: #31465A`), providing outstanding contrast on all light UI surfaces. For elements on dark backgrounds (such as the top navigation bar), **Vanilla Milk (`#FFFDF7`)** or a high-contrast dual-tone ring is applied.

| Focus Ring Token / Color | Adjacent Surface | Evaluated Ratio | WCAG 2.1 SC 1.4.11 ($\ge 3:1$) | Context & Component Usage |
| --- | --- | :---: | :---: | --- |
| Deep Ocean (`#31465A`) | Vanilla Milk (`#FFFDF7`) | **9.58:1** | **Pass** (Exceeds 3:1) | Input fields, card buttons, general page `:focus-visible` |
| Deep Ocean (`#31465A`) | Pure White (`#FFFFFF`) | **9.75:1** | **Pass** (Exceeds 3:1) | Equipment cards, modal dialog inputs, table actions |
| Deep Ocean (`#31465A`) | Frozen Aqua (`#D9F0FF`) | **8.29:1** | **Pass** (Exceeds 3:1) | Triage table rows, callout interactive links |
| Deep Ocean (`#31465A`) | Matcha Green (`#C7DFA3`) | **6.74:1** | **Pass** (Exceeds 3:1) | Quota pill, status badges |
| Deep Ocean (`#31465A`) | Airy Blue (`#89B9E6`) | **4.71:1** | **Pass** (Exceeds 3:1) | Action buttons, tab controls |
| Vanilla Milk (`#FFFDF7`) | Deep Ocean Navbar (`#31465A`) | **9.58:1** | **Pass** (Exceeds 3:1) | Top navbar links and logout button `:focus-visible` |
| Airy Blue (`#89B9E6`) | Deep Ocean Navbar (`#31465A`) | **4.71:1** | **Pass** (Exceeds 3:1) | Top navbar active states and focus rings on dark nav |

### 1.3 Status Badges (With Non-Color Cues)

Every status indicator combines distinct Blue Matcha color tokens with an explicit textual label and semantic icon to guarantee accessibility under WCAG 2.1 AA guidelines:

| State | Badge Class | Visual Background / Text | Non-Color Icon & Label Cue |
| --- | --- | --- | --- |
| **Available** | `.badge-avail` | Matcha Green (`#C7DFA3` / text `#31465A`) | 🟢 `Available` |
| **Reserved** | `.badge-res` | Airy Blue (`#89B9E6` / text `#31465A`) | 🟡 `Reserved` |
| **Checked Out** | `.badge-out` | Frozen Aqua (`#D9F0FF` / text `#31465A`) | 🔵 `Checked Out` |
| **Maintenance** | `.badge-maint` | Soft Coral Red (`#FEE2E2` / text `#991B1B`) | 🔴 `Maintenance` |
| **Pending Request** | `.badge-pending` | Airy Blue (`#89B9E6` / text `#31465A`) | ⏳ `Pending Approval` |
| **Active Loan** | `.badge-active` | Frozen Aqua (`#D9F0FF` / text `#31465A`) | 📦 `Active Loan` |

---

## 2. Borrower Portal UI Specification

### 2.1 Login View (`/login`)

* **Layout:** Centered card (maximum width `450px`) on a warm Vanilla Milk backdrop (`#FFFDF7`).
- **Header Area:**
  - Background: Deep Ocean (`#31465A`) with crisp white typography.
  - Application Title: **EquipFlow — CPE Hardware Lending**.
  - Subtitle: `Department of Computer Engineering`.
- **Form Controls:**
  - Input: `Email Address` (`type="email"`, required, autofocus).
  - Input: `Password` (`type="password"`, required).
  - Primary Button: `"Sign In"` (`background: #31465A`, hover: `#89B9E6`, text: white). Disables and renders spinner (`"Signing in..."`) while request is in-flight.
- **Frozen Aqua Callout Box (`#D9F0FF`):**
  - Below the login form, a prominent callout card styled with `background: #D9F0FF; border: 1px solid #B8E0FC; color: #31465A;` displaying local development credentials:
    - Borrower: `borrower@cpe.kmutt.ac.th` / `Password123!`
    - Custodian: `custodian@cpe.kmutt.ac.th` / `Password123!`
- **Error Handling:** If authentication fails, renders a dismissible red alert banner: `"Invalid email or password."`.

### 2.2 Top Navigation Bar (Global)

* **Visual Style:**
  - Background: Deep Ocean (`#31465A`) with a subtle 2px bottom border in Airy Blue (`#89B9E6`).
  - Brand Logo: White text with bold font.
  - Active Navigation Links: Highlighted in Airy Blue (`#89B9E6`) with an active underline.
- **User Identity Section:**
  - Authenticated user's `fullName` rendered in white.
  - Role Badge rendered in **Matcha Green** (`background: #C7DFA3; color: #31465A; font-weight: bold;`) showing `[Borrower]` or `[Custodian]`.
  - `"Logout"` Button: Outlined white button with hover fill.

### 2.3 Equipment Catalog View (`/catalog`)

* **Header Area:**
  - Title: `Department Equipment Catalog` (`color: #31465A`).
  - Subtitle: `Browse real-time hardware availability and submit borrowing requests.`
  - Right Action: **Active Quota Pill** styled in Matcha Green:

    ```html
    <span class="badge" style="background-color: #C7DFA3; color: #31465A; font-size: 0.95rem;">
      📋 My Active Items: <strong>X / 3</strong>
    </span>
    ```

* **Equipment Card Grid:**
  - Responsive card layout (`background: #FFFFFF; border: 1px solid #DCE8F2; border-radius: 8px;`).
  - **Card Header:** Asset Tag in Deep Ocean text and real-time status badge (`.badge-avail`, `.badge-res`, etc.).
  - **Card Body:** Equipment Title (e.g. `Rigol DS1054Z Digital Oscilloscope`), Category, Model, Condition.
  - **Card Footer:**
    - `"View Details"` button (outlined Airy Blue `#89B9E6`, text `#31465A`).
    - `"Request Item"` button:
      - Active state: Deep Ocean (`#31465A`, hover `#89B9E6`) when status is `AVAILABLE` and Borrower Active Quota $< 3$.
      - Disabled state: Soft gray (`#E2E8F0`) with explicit text: `"Reserved"`, `"Checked Out"`, or `"Limit Reached (3/3)"`.
- **Equipment Detail & Request Modal:**
  - Modal header styled in Deep Ocean (`#31465A`) with white text.
  - Displays specifications, manufacturer serial number, and condition.
  - Optional Textarea: `"Academic Purpose / Course Project Notes"` (max 250 characters).
  - Action: `"Confirm Request"` button (`#31465A`). Disables immediately on click to prevent duplicate submissions.

### 2.4 My Requests & Loans View (`/my-requests`)

* Accessible to Borrowers from top navigation.
- **Quota Progress Banner:**
  - Card styled with a Matcha Green accent border (`border-left: 4px solid #C7DFA3;`).
  - Progress Bar: Track in Frozen Aqua (`#D9F0FF`), filled bar in Matcha Green (`#C7DFA3`) indicating active load (e.g. `1 of 3 items in use`).
- **Active Loans Section:**
  - Table headers styled with Frozen Aqua tint (`#D9F0FF`, text `#31465A`).
  - Columns: `Asset Tag`, `Equipment Name`, `Checked Out At`, `Due Date`, `Status`.
  - `Due Date` highlighted in bold with a clock cue.
- **Pending Requests Section:**
  - Columns: `Asset Tag`, `Equipment Name`, `Requested Date`, `Purpose Notes`, `Status`.
  - Status rendered with Airy Blue badge (`.badge-pending`).
- **Empty State:**
  - Illustrative empty state card with Frozen Aqua tint: `"You have no active loans or requests. Browse the catalog to borrow equipment."` with a primary button linking to `/catalog`.

---

## 3. Custodian Operations Desk UI Specification

### 3.1 Custodian Desk View (`/custodian/desk`)

* **Access Boundary:** Restricted strictly to users authenticated with role `CUSTODIAN`. Borrowers attempting access are redirected with an unauthorized toast notice.
- **Header Area:**
  - Title: `Custodian Triage & Checkout Desk` (`color: #31465A`).
  - Subtitle: `Review student requests, verify physical custody, and record checkouts.`
  - Right Action: `"Refresh Queue"` button (Airy Blue `#89B9E6` with sync icon).
- **Triage Work Area:**
  1. **Pending Requests Queue (Primary Work Table):**
     - Columns: `Requested Time`, `Student Name`, `Student ID`, `Asset Tag`, `Equipment Name`, `Notes`, `Action`.
     - Table header styled in Frozen Aqua (`#D9F0FF`, text `#31465A`).
     - Student ID styled as a subtle code badge.
     - Action Column: Primary button `"Approve & Checkout"` (`background: #31465A`, hover `#89B9E6`, text: white).
     - Clicking `"Approve & Checkout"` opens the **Checkout Confirmation Modal**.
  2. **Active Loans Monitor:**
     - Summarizes all currently checked out items across the department.
     - Columns: `Asset Tag`, `Equipment Name`, `Borrower Name`, `Checked Out At`, `Due Date` (7-day deadline), `Accountable Custodian`.

### 3.2 Checkout Confirmation Modal

* Modal header styled in Deep Ocean (`#31465A`) with white text.
- Displays verified Borrower identity: `Student Borrower One (67070501001)`.
- Displays verified Equipment identity: `CPE-OSC-001 (Rigol DS1054Z)`.
- **7-Day Deadline Callout:**
  - Boxed callout styled in **Frozen Aqua Accent** (`background: #D9F0FF; color: #31465A; border: 1px solid #B8E0FC; border-radius: 6px; padding: 12px;`):
    - `📅 Scheduled Due Date: 19 November 2026 (7 days from today)`
- Optional Input: `Checkout Staff Notes` (e.g. "Verified student ID card. Handed over with power cord.").
- Action Buttons: `"Cancel"` and `"Confirm Physical Checkout"`.
- Submit Button states: Disables immediately on click and displays `"Processing checkout..."` to prevent duplicate submissions.

---

## 4. Responsive Breakpoints & Accessibility

### 4.1 Responsive Layout Rules

| Viewport | Screen Width | Layout Adjustments |
| --- | --- | --- |
| **Desktop** | $\ge 1024$px | 3-column equipment card grid on `/catalog`. Full data tables with all columns visible on `/custodian/desk` and `/my-requests`. |
| **Tablet** | $768$px to $1023$px | 2-column equipment card grid. Tables remain full width with horizontally scrollable container if needed. |
| **Mobile** | $< 768$px | 1-column stacked equipment cards. Top navbar collapses into accessible hamburger menu. Tables display essential columns (`Asset Tag`, `Status`, `Action`) with secondary details stacked vertically. |

### 4.2 Accessibility Standards (WCAG 2.1 AA)

* **Keyboard Navigation:** All interactive elements (`<button>`, `<a>`, `<input>`, `<select>`) support tab navigation in natural DOM order.
- **Visible Focus Rings:** High-contrast 2px solid focus ring in Deep Ocean (`--color-focus-ring: #31465A`, `outline: 2px solid #31465A; outline-offset: 2px;`) applied to active elements upon keyboard `:focus-visible` across all light surfaces (yielding **9.58:1** against Vanilla Milk `#FFFDF7`, **9.75:1** against White `#FFFFFF`, and **8.29:1** against Frozen Aqua `#D9F0FF`, strictly satisfying WCAG 2.1 SC 1.4.11 $\ge 3:1$). For interactive elements located on dark surfaces (such as top navbar links), an inverted focus ring in Vanilla Milk (`--color-focus-ring-dark: #FFFDF7`, **9.58:1**) or dual-tone outline is applied.
- **Zero Horizontal Scroll:** Pages contain zero horizontal scrollbar at standard viewport widths (375px, 768px, 1280px).
- **Non-Color Dependency:** All status indicators accompany color badges with explicit text labels and semantic icons.
- **Color Contrast:** All body and header text pairs achieve contrast ratios $\ge 4.5:1$ (AA) and $\ge 7:1$ (AAA), fully certified in Section 1.2.

---

## 5. Shared Form, Error & Loading Behaviors

1. **Button Debounce & Loading Spinners:** All mutating submit buttons disable upon click and render an inline loading spinner to eliminate duplicate submissions caused by rapid clicks.
2. **Form Value Preservation:** Client validation failures retain all user-entered form data (e.g., purpose notes, checkout remarks) across recoverable validation errors.
3. **API Failure Feedback:** If a backend request fails with HTTP 400, 401, 403, or 409, the UI traps the JSON error envelope and displays the human-readable `error.message` in a dismissible alert banner.
4. **Skeleton Placeholders:** Initial page loads query APIs asynchronously while rendering pulsing Frozen Aqua skeleton cards (`#D9F0FF`) to prevent Cumulative Layout Shift (CLS).
