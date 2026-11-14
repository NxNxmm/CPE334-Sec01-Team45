# Sprint 1 REST API Specification
**EquipFlow Hardware Inventory & Borrowing Endpoints**

**Document ID:** `API-SPEC-SPRINT-01`
**Version:** `1.0.0`
**Status:** Approved (Verified `v0.1.0-sprint1`)
**Target Release:** `v0.1.0-sprint1`

---

## 1. Overview & General Conventions

This document specifies the authoritative REST API contract for EquipFlow Sprint 1. All endpoints adhere to standard HTTP semantics, consume and produce JSON payloads, enforce stateless JWT authentication via Bearer tokens, and apply strict role-based access control.

### 1.1 Authentication & Authorization
* **Bearer Token Identification:** Authenticated requests must pass the JWT token in the HTTP Authorization header:
  ```http
  Authorization: Bearer <jwt-token>
  ```
* **Roles:**
  * `BORROWER`: Department student, faculty, or researcher borrowing equipment.
  * `CUSTODIAN`: Department laboratory technician / equipment administrator.
* **HTTP Status Code Conventions:**
  * `200 OK`: Request succeeded.
  * `201 Created`: Resource successfully created.
  * `400 Bad Request`: Payload validation failure or business quota violation (`EXCEEDS_ACTIVE_QUOTA`).
  * `401 Unauthorized`: Missing, expired, malformed, or revoked token.
  * `403 Forbidden`: Authenticated user lacks required role or is attempting cross-borrower access.
  * `404 Not Found`: Target resource does not exist.
  * `409 Conflict`: Concurrency conflict (e.g. concurrent checkout of the same asset).
  * `500 Internal Server Error`: Unhandled server exception.

### 1.2 Standard Error Response Shape
All error responses across all endpoints adhere strictly to a standardized JSON error envelope:
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE_STRING",
    "message": "Human-readable description of the error condition.",
    "details": null
  },
  "meta": {
    "timestamp": "2026-11-12T18:00:00.000Z"
  }
}
```

### 1.3 Absence of DELETE Endpoints
In accordance with inventory tracking integrity and course specifications, **no DELETE endpoints exist** in Sprint 1 (`DELETE /api/v1/items/:id` and `DELETE /api/v1/requests/:id` are not implemented). Items transition through operational states (`AVAILABLE`, `RESERVED`, `CHECKED_OUT`, `MAINTENANCE`), and borrowing records form an append-only audit trail.

---

## 2. Authentication Endpoints

### 2.1 User Login
Authenticates registered department credentials and issues a signed JWT Bearer token.

* **Method:** `POST`
* **Path:** `/api/v1/auth/login`
* **Allowed Roles:** Public / Anonymous
* **Request Headers:** `Content-Type: application/json`

#### Request Body
```json
{
  "email": "borrower@cpe.kmutt.ac.th",
  "password": "Password123!"
}
```

#### Success Response: `200 OK`
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "usr_cuid001",
      "email": "borrower@cpe.kmutt.ac.th",
      "fullName": "Student Borrower One",
      "studentOrStaffId": "67070501001",
      "role": "BORROWER"
    }
  },
  "meta": {
    "timestamp": "2026-11-12T18:00:00.000Z"
  }
}
```

#### Error Responses
* `401 Unauthorized`:
  ```json
  {
    "success": false,
    "error": {
      "code": "INVALID_CREDENTIALS",
      "message": "Invalid email or password."
    },
    "meta": { "timestamp": "2026-11-12T18:00:00.000Z" }
  }
  ```

---

### 2.2 Get Current User Identity
Retrieves the profile and role of the currently authenticated user.

* **Method:** `GET`
* **Path:** `/api/v1/auth/me`
* **Allowed Roles:** `BORROWER`, `CUSTODIAN`
* **Request Headers:** `Authorization: Bearer <token>`

#### Success Response: `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "usr_cuid001",
    "email": "borrower@cpe.kmutt.ac.th",
    "fullName": "Student Borrower One",
    "studentOrStaffId": "67070501001",
    "role": "BORROWER"
  },
  "meta": {
    "timestamp": "2026-11-12T18:00:00.000Z"
  }
}
```

#### Error Responses
* `401 Unauthorized` (Token missing, expired, or revoked):
  ```json
  {
    "success": false,
    "error": {
      "code": "TOKEN_REVOKED",
      "message": "This session has been logged out."
    },
    "meta": { "timestamp": "2026-11-12T18:00:00.000Z" }
  }
  ```

---

### 2.3 User Logout & Per-Token Revocation
Invalidates the current session's Bearer token on the server side by persisting its `jti` to the `RevokedToken` table.

* **Method:** `POST`
* **Path:** `/api/v1/auth/logout`
* **Allowed Roles:** `BORROWER`, `CUSTODIAN`
* **Request Headers:** `Authorization: Bearer <token>`

#### Success Response: `200 OK`
```json
{
  "success": true,
  "data": {
    "message": "Logged out successfully."
  },
  "meta": {
    "timestamp": "2026-11-12T18:00:00.000Z"
  }
}
```

---

## 3. Equipment Catalog Endpoints

### 3.1 List Equipment Catalog
Returns all serialized equipment assets with real-time availability statuses.

* **Method:** `GET`
* **Path:** `/api/v1/items`
* **Allowed Roles:** `BORROWER`, `CUSTODIAN`
* **Request Headers:** `Authorization: Bearer <token>`

#### Success Response: `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": "itm_cuid001",
      "assetTag": "CPE-OSC-001",
      "name": "Rigol DS1054Z Digital Oscilloscope",
      "category": "Measurement",
      "modelNumber": "DS1054Z",
      "condition": "GOOD",
      "status": "AVAILABLE"
    },
    {
      "id": "itm_cuid002",
      "assetTag": "CPE-RPI-001",
      "name": "Raspberry Pi 4 Model B (4GB)",
      "category": "Microcontrollers",
      "modelNumber": "RPI4-4GB",
      "condition": "GOOD",
      "status": "CHECKED_OUT"
    }
  ],
  "meta": {
    "total": 2,
    "timestamp": "2026-11-12T18:00:00.000Z"
  }
}
```

---

### 3.2 Get Equipment Item Detail
Returns complete technical specifications, manufacturer serial number, and physical condition.

* **Method:** `GET`
* **Path:** `/api/v1/items/:id`
* **Allowed Roles:** `BORROWER`, `CUSTODIAN`
* **Request Headers:** `Authorization: Bearer <token>`

#### Success Response: `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "itm_cuid001",
    "assetTag": "CPE-OSC-001",
    "name": "Rigol DS1054Z Digital Oscilloscope",
    "category": "Measurement",
    "modelNumber": "DS1054Z",
    "serialNumber": "DS1ZA223400192",
    "description": "50MHz, 4 Channels, 1GSa/s digital storage oscilloscope with probes.",
    "condition": "GOOD",
    "status": "AVAILABLE",
    "createdAt": "2026-11-01T08:00:00.000Z"
  },
  "meta": {
    "timestamp": "2026-11-12T18:00:00.000Z"
  }
}
```

#### Error Responses
* `404 Not Found`:
  ```json
  {
    "success": false,
    "error": {
      "code": "ITEM_NOT_FOUND",
      "message": "Equipment asset with ID non_existent_id was not found."
    },
    "meta": { "timestamp": "2026-11-12T18:00:00.000Z" }
  }
  ```

---

## 4. Borrower Request Endpoints

### 4.1 Submit Borrow Request
Submits a reservation request for an available equipment item. The request is processed inside an atomic transaction: verifies item is `AVAILABLE`, verifies borrower active quota $< 3$, transitions item status to `RESERVED`, and creates a `BorrowRequest` in `PENDING` status.

* **Method:** `POST`
* **Path:** `/api/v1/requests`
* **Allowed Roles:** `BORROWER` (Borrowers only)
* **Request Headers:** `Authorization: Bearer <token>`, `Content-Type: application/json`

#### Request Body
```json
{
  "itemId": "itm_cuid001",
  "requestNote": "Needed for CPE334 Lab hardware demonstration"
}
```

#### Success Response: `201 Created`
```json
{
  "success": true,
  "data": {
    "id": "req_cuid101",
    "borrowerId": "usr_cuid001",
    "itemId": "itm_cuid001",
    "status": "PENDING",
    "requestNote": "Needed for CPE334 Lab hardware demonstration",
    "createdAt": "2026-11-12T18:30:00.000Z",
    "item": {
      "assetTag": "CPE-OSC-001",
      "name": "Rigol DS1054Z Digital Oscilloscope",
      "status": "RESERVED"
    }
  },
  "meta": {
    "timestamp": "2026-11-12T18:30:00.000Z"
  }
}
```

#### Error Responses
* `400 Bad Request` (Item not available):
  ```json
  {
    "success": false,
    "error": {
      "code": "ITEM_NOT_AVAILABLE",
      "message": "Equipment item CPE-OSC-001 is already reserved or checked out."
    },
    "meta": { "timestamp": "2026-11-12T18:30:00.000Z" }
  }
  ```
* `400 Bad Request` (Active quota exceeded):
  ```json
  {
    "success": false,
    "error": {
      "code": "EXCEEDS_ACTIVE_QUOTA",
      "message": "Cannot submit request: active loans and requests combined cannot exceed 3."
    },
    "meta": { "timestamp": "2026-11-12T18:30:00.000Z" }
  }
  ```
* `403 Forbidden` (Custodian attempting borrower request):
  ```json
  {
    "success": false,
    "error": {
      "code": "FORBIDDEN_ROLE",
      "message": "Borrow requests can only be submitted by Borrower accounts."
    },
    "meta": { "timestamp": "2026-11-12T18:30:00.000Z" }
  }
  ```

---

### 4.2 Get My Requests & Loans
Retrieves the authenticated borrower's personal pending requests and active loans. Strictly isolated to `req.user.userId`.

* **Method:** `GET`
* **Path:** `/api/v1/requests/my`
* **Allowed Roles:** `BORROWER` (Borrowers only)
* **Request Headers:** `Authorization: Bearer <token>`

#### Success Response: `200 OK`
```json
{
  "success": true,
  "data": {
    "requests": [
      {
        "id": "req_cuid101",
        "itemId": "itm_cuid001",
        "status": "PENDING",
        "requestNote": "Needed for CPE334 Lab hardware demonstration",
        "createdAt": "2026-11-12T18:30:00.000Z",
        "item": {
          "assetTag": "CPE-OSC-001",
          "name": "Rigol DS1054Z Digital Oscilloscope",
          "category": "Measurement"
        }
      }
    ],
    "activeLoans": [
      {
        "id": "loan_cuid201",
        "itemId": "itm_cuid002",
        "status": "ACTIVE",
        "checkedOutAt": "2026-11-10T10:00:00.000Z",
        "dueDate": "2026-11-17T10:00:00.000Z",
        "item": {
          "assetTag": "CPE-RPI-002",
          "name": "Raspberry Pi 4 Model B (8GB)",
          "category": "Microcontrollers"
        }
      }
    ],
    "activeQuota": {
      "current": 2,
      "maximum": 3
    }
  },
  "meta": {
    "timestamp": "2026-11-12T18:30:00.000Z"
  }
}
```

---

## 5. Custodian Operations Endpoints

### 5.1 List Pending Requests Triage Queue
Retrieves all pending borrow requests across all borrowers, ordered chronologically, and active department loans for the custodian monitor.

* **Method:** `GET`
* **Path:** `/api/v1/custodian/requests`
* **Allowed Roles:** `CUSTODIAN` (Custodians only)
* **Request Headers:** `Authorization: Bearer <token>`

#### Success Response: `200 OK`
```json
{
  "success": true,
  "data": {
    "requests": [
      {
        "id": "req_cuid101",
        "status": "PENDING",
        "requestNote": "Needed for CPE334 Lab hardware demonstration",
        "createdAt": "2026-11-12T18:30:00.000Z",
        "borrower": {
          "id": "usr_cuid001",
          "fullName": "Student Borrower One",
          "studentOrStaffId": "67070501001",
          "email": "borrower@cpe.kmutt.ac.th"
        },
        "item": {
          "id": "itm_cuid001",
          "assetTag": "CPE-OSC-001",
          "name": "Rigol DS1054Z Digital Oscilloscope",
          "category": "Measurement",
          "status": "RESERVED"
        }
      }
    ],
    "activeLoans": [
      {
        "id": "loan_cuid201",
        "checkedOutAt": "2026-11-12T18:40:00.000Z",
        "dueDate": "2026-11-19T18:40:00.000Z",
        "borrower": { "fullName": "Student Borrower One", "studentOrStaffId": "67070501001" },
        "custodian": { "fullName": "CPE Lab Custodian", "studentOrStaffId": "STAFF-001" },
        "item": { "assetTag": "CPE-OSC-001", "name": "Rigol DS1054Z Digital Oscilloscope" }
      }
    ]
  },
  "meta": {
    "total": 1,
    "timestamp": "2026-11-12T18:35:00.000Z"
  }
}
```

#### Error Responses
* `403 Forbidden` (Borrower accessing custodian triage):
  ```json
  {
    "success": false,
    "error": {
      "code": "FORBIDDEN_ROLE",
      "message": "Access denied: requires CUSTODIAN role."
    },
    "meta": { "timestamp": "2026-11-12T18:35:00.000Z" }
  }
  ```

---

### 5.2 Execute Equipment Checkout
Records the physical handover of equipment against a pending request. Executed inside an atomic transaction: validates request is `PENDING`, validates item is `RESERVED`, conditionally transitions both records, sets request to `APPROVED`, creates an active `Loan` record, calculates `dueDate = checkedOutAt + 7 days`, and records `custodianId` from the authenticated session.

* **Method:** `POST`
* **Path:** `/api/v1/custodian/checkouts`
* **Allowed Roles:** `CUSTODIAN` (Custodians only)
* **Request Headers:** `Authorization: Bearer <token>`, `Content-Type: application/json`

#### Request Body
```json
{
  "requestId": "req_cuid101",
  "checkoutNotes": "Verified student ID card. Handed over with power cord."
}
```

#### Success Response: `201 Created`
```json
{
  "success": true,
  "data": {
    "id": "loan_cuid201",
    "requestId": "req_cuid101",
    "itemId": "itm_cuid001",
    "borrowerId": "usr_cuid001",
    "custodianId": "usr_cuid999",
    "status": "ACTIVE",
    "checkedOutAt": "2026-11-12T18:40:00.000Z",
    "dueDate": "2026-11-19T18:40:00.000Z",
    "checkoutNotes": "Verified student ID card. Handed over with power cord.",
    "item": {
      "assetTag": "CPE-OSC-001",
      "name": "Rigol DS1054Z Digital Oscilloscope",
      "status": "CHECKED_OUT"
    }
  },
  "meta": {
    "timestamp": "2026-11-12T18:40:00.000Z"
  }
}
```

#### Error Responses
* `409 Conflict` (Concurrent checkout attempt or item state changed):
  ```json
  {
    "success": false,
    "error": {
      "code": "CONCURRENT_CHECKOUT_CONFLICT",
      "message": "Checkout failed: the request is not pending or item is not reserved."
    },
    "meta": { "timestamp": "2026-11-12T18:40:00.000Z" }
  }
  ```
* `403 Forbidden` (Borrower attempting checkout):
  ```json
  {
    "success": false,
    "error": {
      "code": "FORBIDDEN_ROLE",
      "message": "Access denied: requires CUSTODIAN role."
    },
    "meta": { "timestamp": "2026-11-12T18:40:00.000Z" }
  }
  ```

