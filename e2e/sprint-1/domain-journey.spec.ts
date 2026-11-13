import { test, expect } from '@playwright/test';
import { PrismaClient, ItemStatus, RequestStatus, LoanStatus } from '@prisma/client';
import fs from 'node:fs';
import path from 'node:path';

const prisma = new PrismaClient();
const screenshotDir = path.resolve(process.cwd(), 'docs/sprints/sprint-1/evidence/screenshots');

test.describe('E2E-01-01: Full Domain Journey (Borrower Request to Custodian Checkout)', () => {
  const targetAssetTag = 'CPE-OSC-001';

  test.beforeAll(async () => {
    fs.mkdirSync(screenshotDir, { recursive: true });
    await prisma.$connect();

    // Ensure CPE-OSC-001 starts clean as AVAILABLE and borrower1 has clean state for this item
    const item = await prisma.equipmentItem.findUnique({ where: { assetTag: targetAssetTag } });
    if (item) {
      await prisma.loan.deleteMany({ where: { itemId: item.id } });
      await prisma.borrowRequest.deleteMany({ where: { itemId: item.id } });
      await prisma.equipmentItem.update({
        where: { id: item.id },
        data: { status: ItemStatus.AVAILABLE },
      });
    }

    // Ensure borrower1 has 0 pending requests/loans before journey starts
    const borrower1 = await prisma.user.findUnique({ where: { email: 'borrower@cpe.kmutt.ac.th' } });
    if (borrower1) {
      await prisma.loan.deleteMany({ where: { borrowerId: borrower1.id } });
      await prisma.borrowRequest.deleteMany({ where: { borrowerId: borrower1.id } });
    }
  });

  test.afterAll(async () => {
    // Restore CPE-OSC-001 to AVAILABLE so database stays clean after test
    const item = await prisma.equipmentItem.findUnique({ where: { assetTag: targetAssetTag } });
    if (item) {
      await prisma.loan.deleteMany({ where: { itemId: item.id } });
      await prisma.borrowRequest.deleteMany({ where: { itemId: item.id } });
      await prisma.equipmentItem.update({
        where: { id: item.id },
        data: { status: ItemStatus.AVAILABLE },
      });
    }
    await prisma.$disconnect();
  });

  test('Borrower logs in, requests available item, Custodian logs in, checks out item, and DB persists 7-day loan', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/');

    // 1. Login screen rendered
    await expect(page.getByRole('heading', { name: /equipflow/i })).toBeVisible();
    await page.screenshot({ path: path.join(screenshotDir, '01-login-view.png'), fullPage: true });

    // Sign in as Borrower 1
    await page.getByLabel(/email address/i).fill('borrower@cpe.kmutt.ac.th');
    await page.getByLabel(/password/i).fill('Password123!');
    await page.getByRole('button', { name: /sign in/i }).click();

    // 2. Borrower sees Equipment Catalog & active quota 0 / 3
    await expect(page.getByRole('heading', { name: /department equipment catalog/i })).toBeVisible();
    await expect(page.getByText(/0 \/ 3/)).toBeVisible();
    await page.screenshot({ path: path.join(screenshotDir, '02-borrower-catalog.png'), fullPage: true });

    // 3. Open Request Modal for Rigol DS1054Z Digital Oscilloscope (CPE-OSC-001)
    await page.getByRole('button', { name: /request to borrow rigol ds1054z digital oscilloscope/i }).click();
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();

    await dialog.getByLabel(/academic purpose/i).fill('E2E Sprint 1 Lab Signal Verification');
    await page.screenshot({ path: path.join(screenshotDir, '03-borrower-request-modal.png') });

    await dialog.getByRole('button', { name: /confirm request/i }).click();
    await expect(dialog.getByText(/request submitted successfully/i)).toBeVisible();
    await dialog.getByRole('button', { name: /^close$/i }).click();

    // Verify quota pill updated to 1 / 3
    await expect(page.getByText(/1 \/ 3/)).toBeVisible();

    // 4. Navigate to My Requests & Active Loans view
    await page.getByRole('button', { name: /my requests/i }).click();
    await expect(page.getByRole('heading', { name: /my requests & active loans/i })).toBeVisible();
    await expect(page.getByText('CPE-OSC-001')).toBeVisible();
    await expect(page.getByText('E2E Sprint 1 Lab Signal Verification')).toBeVisible();
    await page.screenshot({ path: path.join(screenshotDir, '04-borrower-my-requests.png'), fullPage: true });

    // 5. Sign Out as Borrower
    await page.getByRole('button', { name: /sign out/i }).click();
    await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible();

    // 6. Sign in as Custodian
    await page.getByLabel(/email address/i).fill('custodian@cpe.kmutt.ac.th');
    await page.getByLabel(/password/i).fill('Password123!');
    await page.getByRole('button', { name: /sign in/i }).click();

    await expect(page.getByRole('heading', { name: /custodian triage & checkout desk/i })).toBeVisible();
    await expect(page.getByText('CPE-OSC-001')).toBeVisible();
    await expect(page.getByText('Student Borrower One')).toBeVisible();
    await page.screenshot({ path: path.join(screenshotDir, '05-custodian-triage-queue.png'), fullPage: true });

    // 7. Click Approve & Checkout on CPE-OSC-001 row
    const requestRow = page.locator('tr', { hasText: 'CPE-OSC-001' });
    await requestRow.getByRole('button', { name: /approve & checkout/i }).click();

    const checkoutDialog = page.getByRole('dialog', { name: /confirm physical checkout/i });
    await expect(checkoutDialog).toBeVisible();
    await expect(checkoutDialog.getByText(/7 days from checkout/i)).toBeVisible();
    await checkoutDialog.getByLabel(/checkout staff notes/i).fill('Verified student ID 67070501001; probes included.');
    await page.screenshot({ path: path.join(screenshotDir, '06-custodian-checkout-modal.png') });

    await checkoutDialog.getByRole('button', { name: /confirm physical checkout/i }).click();

    // 8. Verify checkout confirmation banner & Active Loans Monitor table
    await expect(page.getByText(/checkout recorded for cpe-osc-001/i)).toBeVisible();
    const activeLoansSection = page.locator('section[aria-labelledby="department-active-loans-title"]');
    await expect(activeLoansSection.getByRole('cell', { name: 'CPE-OSC-001' })).toBeVisible();
    await page.screenshot({ path: path.join(screenshotDir, '07-custodian-active-loans.png'), fullPage: true });

    // 9. Verify persisted database records (Item = CHECKED_OUT, Request = APPROVED, Loan = ACTIVE with 7-day dueDate)
    const dbItem = await prisma.equipmentItem.findUnique({ where: { assetTag: targetAssetTag } });
    expect(dbItem?.status).toBe(ItemStatus.CHECKED_OUT);

    const dbLoan = await prisma.loan.findFirst({
      where: { itemId: dbItem!.id, status: LoanStatus.ACTIVE },
      include: { request: true, custodian: true },
    });
    expect(dbLoan).not.toBeNull();
    expect(dbLoan?.request?.status).toBe(RequestStatus.APPROVED);
    expect(dbLoan?.custodian.email).toBe('custodian@cpe.kmutt.ac.th');

    const diffMs = new Date(dbLoan!.dueDate).getTime() - new Date(dbLoan!.checkedOutAt).getTime();
    expect(diffMs).toBe(7 * 24 * 60 * 60 * 1000);
  });
});

