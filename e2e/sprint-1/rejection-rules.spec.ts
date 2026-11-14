import { test, expect } from '@playwright/test';
import { PrismaClient, ItemCondition, ItemStatus, RequestStatus, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';
import fs from 'node:fs';
import path from 'node:path';

const prisma = new PrismaClient({
  datasources: {
    db: { url: process.env.DATABASE_URL ?? 'file:./test.db' },
  },
});
const screenshotDir = path.resolve(process.cwd(), 'docs/sprints/sprint-1/evidence/screenshots');

test.describe('E2E-01-02: Meaningful Business Rule Rejection (Duplicate Booking / Checkout & Quota)', () => {
  const createdRequestIds: string[] = [];
  const createdItemIds: string[] = [];
  const createdUserIds: string[] = [];

  let primaryBorrowerEmail = '';
  let competingBorrowerId = '';
  let dedicatedItemId = '';
  const dedicatedItemName = 'Keysight E36311A DC Power Supply';

  test.beforeAll(async () => {
    fs.mkdirSync(screenshotDir, { recursive: true });
    await prisma.$connect();

    // Create dedicated test borrowers and a dedicated equipment item so seeded data is never mutated
    const suffix = Date.now().toString().slice(-6);
    const passwordHash = await bcrypt.hash('Password123!', 10);

    primaryBorrowerEmail = `e2e.rej1.${suffix}@cpe.kmutt.ac.th`;
    const borrower1 = await prisma.user.create({
      data: {
        email: primaryBorrowerEmail,
        passwordHash,
        fullName: 'E2E Rejection Borrower One',
        studentOrStaffId: `6707058${suffix.slice(-4)}`,
        role: Role.BORROWER,
      },
    });
    createdUserIds.push(borrower1.id);

    const borrower2 = await prisma.user.create({
      data: {
        email: `e2e.rej2.${suffix}@cpe.kmutt.ac.th`,
        passwordHash,
        fullName: 'E2E Rejection Borrower Two',
        studentOrStaffId: `6707057${suffix.slice(-4)}`,
        role: Role.BORROWER,
      },
    });
    competingBorrowerId = borrower2.id;
    createdUserIds.push(borrower2.id);

    const item = await prisma.equipmentItem.create({
      data: {
        assetTag: 'CPE-E2E-REJ',
        serialNumber: `SN-E2E-REJ-${suffix}`,
        name: dedicatedItemName,
        category: 'Power Supply',
        modelNumber: 'E36311A',
        description: 'Dedicated E2E test triple-output programmable DC power supply.',
        condition: ItemCondition.GOOD,
        status: ItemStatus.AVAILABLE,
      },
    });
    dedicatedItemId = item.id;
    createdItemIds.push(item.id);
  });

  test.afterAll(async () => {
    // Clean up strictly the records created by this scenario
    if (createdRequestIds.length > 0) {
      await prisma.borrowRequest.deleteMany({ where: { id: { in: createdRequestIds } } });
    }
    if (createdItemIds.length > 0) {
      await prisma.equipmentItem.deleteMany({ where: { id: { in: createdItemIds } } });
    }
    if (createdUserIds.length > 0) {
      await prisma.user.deleteMany({ where: { id: { in: createdUserIds } } });
    }
    await prisma.$disconnect();
  });

  test('Disables occupied equipment on catalog and surfaces human-readable rejection banner on conflict', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/');

    // Sign in as the dedicated test borrower
    await page.getByLabel(/email address/i).fill(primaryBorrowerEmail);
    await page.getByLabel(/password/i).fill('Password123!');
    await page.getByRole('button', { name: /sign in/i }).click();

    await expect(page.getByRole('heading', { name: /department equipment catalog/i })).toBeVisible();

    // 1. Read-only check on pre-seeded CHECKED_OUT item (CPE-RPI-002) and MAINTENANCE item (CPE-LOG-001)
    const checkedOutBtn = page.getByRole('button', { name: /request to borrow raspberry pi 4 model b 8gb/i });
    await expect(checkedOutBtn).toBeDisabled();
    await expect(checkedOutBtn).toHaveText('Checked Out');

    const maintenanceBtn = page.getByRole('button', { name: /request to borrow saleae logic 8 usb analyzer/i });
    await expect(maintenanceBtn).toBeDisabled();
    await expect(maintenanceBtn).toHaveText('Maintenance');

    // 2. Simulate concurrent reservation conflict on the dedicated test item (CPE-E2E-REJ)
    await page.getByRole('button', { name: new RegExp(`request to borrow ${dedicatedItemName}`, 'i') }).click();
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();

    // Competing reservation occurs on the dedicated test item before Confirm Request is clicked
    const competingRequest = await prisma.borrowRequest.create({
      data: {
        borrowerId: competingBorrowerId,
        itemId: dedicatedItemId,
        status: RequestStatus.PENDING,
        requestNote: 'Competing reservation on dedicated E2E item',
      },
    });
    createdRequestIds.push(competingRequest.id);

    await prisma.equipmentItem.update({
      where: { id: dedicatedItemId },
      data: { status: ItemStatus.RESERVED },
    });

    await dialog.getByRole('button', { name: /confirm request/i }).click();

    // Verify human-readable conflict error alert is displayed inside the modal
    const alertBanner = dialog.getByRole('alert');
    await expect(alertBanner).toBeVisible();
    await expect(alertBanner).toContainText(/reserved|checked out/i);
    await page.screenshot({ path: path.join(screenshotDir, '08-rejection-conflict-banner.png') });
  });
});
