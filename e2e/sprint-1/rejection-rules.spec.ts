import { test, expect } from '@playwright/test';
import { PrismaClient, ItemStatus, RequestStatus } from '@prisma/client';
import fs from 'node:fs';
import path from 'node:path';

const prisma = new PrismaClient();
const screenshotDir = path.resolve(process.cwd(), 'docs/sprints/sprint-1/evidence/screenshots');

test.describe('E2E-01-02: Meaningful Business Rule Rejection (Duplicate Booking / Checkout & Quota)', () => {
  test.beforeAll(async () => {
    fs.mkdirSync(screenshotDir, { recursive: true });
    await prisma.$connect();
  });

  test.afterAll(async () => {
    await prisma.$disconnect();
  });

  test('Disables occupied equipment on catalog and surfaces human-readable rejection banner on conflict', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/');

    // Sign in as Borrower 1
    await page.getByLabel(/email address/i).fill('borrower@cpe.kmutt.ac.th');
    await page.getByLabel(/password/i).fill('Password123!');
    await page.getByRole('button', { name: /sign in/i }).click();

    await expect(page.getByRole('heading', { name: /department equipment catalog/i })).toBeVisible();

    // 1. Verify pre-seeded CHECKED_OUT item (CPE-RPI-002) and MAINTENANCE item (CPE-LOG-001) have disabled request buttons
    const checkedOutBtn = page.getByRole('button', { name: /request to borrow raspberry pi 4 model b 8gb/i });
    await expect(checkedOutBtn).toBeDisabled();
    await expect(checkedOutBtn).toHaveText('Checked Out');

    const maintenanceBtn = page.getByRole('button', { name: /request to borrow saleae logic 8 usb analyzer/i });
    await expect(maintenanceBtn).toBeDisabled();
    await expect(maintenanceBtn).toHaveText('Maintenance');

    // 2. Simulate concurrent reservation conflict:
    // Borrower opens request modal on an AVAILABLE item (CPE-OSC-002),
    // while another transaction reserves it in the database before Confirm Request is clicked.
    const targetItem = await prisma.equipmentItem.findUnique({ where: { assetTag: 'CPE-OSC-002' } });
    expect(targetItem).not.toBeNull();
    await prisma.equipmentItem.update({
      where: { id: targetItem!.id },
      data: { status: ItemStatus.AVAILABLE },
    });

    await page.reload();
    await page.getByRole('button', { name: /request to borrow keysight infiniivision dsox1204a/i }).click();
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();

    // Background reservation occurs before borrower clicks Confirm Request
    const borrower2 = await prisma.user.findUnique({ where: { email: 'borrower2@cpe.kmutt.ac.th' } });
    const competingRequest = await prisma.borrowRequest.create({
      data: {
        borrowerId: borrower2!.id,
        itemId: targetItem!.id,
        status: RequestStatus.PENDING,
        requestNote: 'Competing reservation',
      },
    });
    await prisma.equipmentItem.update({
      where: { id: targetItem!.id },
      data: { status: ItemStatus.RESERVED },
    });

    try {
      await dialog.getByRole('button', { name: /confirm request/i }).click();

      // Verify human-readable conflict error alert is displayed inside the modal
      const alertBanner = dialog.getByRole('alert');
      await expect(alertBanner).toBeVisible();
      await expect(alertBanner).toContainText(/reserved|checked out/i);
      await page.screenshot({ path: path.join(screenshotDir, '08-rejection-conflict-banner.png') });
    } finally {
      // Cleanup competing request and restore item status
      await prisma.borrowRequest.delete({ where: { id: competingRequest.id } }).catch(() => {});
      await prisma.equipmentItem.update({
        where: { id: targetItem!.id },
        data: { status: ItemStatus.AVAILABLE },
      });
    }
  });
});

