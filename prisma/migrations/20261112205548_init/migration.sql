-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "studentOrStaffId" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'BORROWER',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "RevokedToken" (
    "jti" TEXT NOT NULL PRIMARY KEY,
    "expiresAt" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "EquipmentItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "assetTag" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "modelNumber" TEXT,
    "serialNumber" TEXT NOT NULL,
    "description" TEXT,
    "condition" TEXT NOT NULL DEFAULT 'GOOD',
    "status" TEXT NOT NULL DEFAULT 'AVAILABLE',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "BorrowRequest" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "borrowerId" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "requestNote" TEXT,
    "rejectionReason" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "BorrowRequest_borrowerId_fkey" FOREIGN KEY ("borrowerId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "BorrowRequest_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "EquipmentItem" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Loan" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "requestId" TEXT,
    "itemId" TEXT NOT NULL,
    "borrowerId" TEXT NOT NULL,
    "custodianId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "checkedOutAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dueDate" DATETIME NOT NULL,
    "returnedAt" DATETIME,
    "checkoutNotes" TEXT,
    "returnNotes" TEXT,
    "returnCondition" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Loan_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "BorrowRequest" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Loan_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "EquipmentItem" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Loan_borrowerId_fkey" FOREIGN KEY ("borrowerId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Loan_custodianId_fkey" FOREIGN KEY ("custodianId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "details" TEXT,
    "performedById" TEXT NOT NULL,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AuditLog_performedById_fkey" FOREIGN KEY ("performedById") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "AuditLog_entityId_fkey" FOREIGN KEY ("entityId") REFERENCES "EquipmentItem" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_studentOrStaffId_key" ON "User"("studentOrStaffId");

-- CreateIndex
CREATE UNIQUE INDEX "EquipmentItem_assetTag_key" ON "EquipmentItem"("assetTag");

-- CreateIndex
CREATE UNIQUE INDEX "EquipmentItem_serialNumber_key" ON "EquipmentItem"("serialNumber");

-- CreateIndex
CREATE INDEX "EquipmentItem_status_idx" ON "EquipmentItem"("status");

-- CreateIndex
CREATE INDEX "EquipmentItem_category_idx" ON "EquipmentItem"("category");

-- CreateIndex
CREATE INDEX "BorrowRequest_borrowerId_idx" ON "BorrowRequest"("borrowerId");

-- CreateIndex
CREATE INDEX "BorrowRequest_itemId_idx" ON "BorrowRequest"("itemId");

-- CreateIndex
CREATE INDEX "BorrowRequest_status_idx" ON "BorrowRequest"("status");

-- CreateIndex
CREATE UNIQUE INDEX "Loan_requestId_key" ON "Loan"("requestId");

-- CreateIndex
CREATE INDEX "Loan_borrowerId_idx" ON "Loan"("borrowerId");

-- CreateIndex
CREATE INDEX "Loan_custodianId_idx" ON "Loan"("custodianId");

-- CreateIndex
CREATE INDEX "Loan_itemId_idx" ON "Loan"("itemId");

-- CreateIndex
CREATE INDEX "Loan_status_idx" ON "Loan"("status");

-- CreateIndex
CREATE INDEX "AuditLog_entityType_entityId_idx" ON "AuditLog"("entityType", "entityId");
