import { test, expect } from '@playwright/test';
import { PrismaClient, ItemCondition, ItemStatus, RequestStatus, LoanStatus, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';
import fs from 'node:fs';
import path from 'node:path';

const prisma = new PrismaClient({
  datasources: {
    db: { url: process.env.DATABASE_URL ?? 'file:./test.db' },
  },
});
const screenshotDir = path.resolve(process.cwd(), 'docs/sprints/sprint-1/evidence/screenshots');

test.describe('E2E-01-01: Full Domain Journey (Borrower Request to Custodian Checkout)', () => {
  const createdLoanIds: string[] = [];
  const createdRequestIds: string[] = [];
  const createdItemIds: string[] = [];
  const createdUserIds: string[] = [];

  let testBorrowerEmail = '';
  let testBorrowerStudentId = '';
  let testItemId = '';
  const testAssetTag = 'CPE-E2E-001';
  const testItemName = 'Tektronix TBS1052C Digital Oscilloscope';

  test.beforeAll(async () => {
    fs.mkdirSync(screenshotDir, { recursive: true });
    await prisma.$connect();

    // Create dedicated test borrower for this E2E scenario (never mutating shared seeded accounts)
    const uniqueSuffix = Date.now().toString().slice(-6);
    testBorrowerEmail = `e2e.journey.${uniqueSuffix}@cpe.kmutt.ac.th`;
    testBorrowerStudentId = `6707059${uniqueSuffix.slice(-4)}`;
    const passwordHash = await bcrypt.hash('Password123!', 10);

    const borrower = await prisma.user.create({
      data: {
        email: testBorrowerEmail,
        passwordHash,
        fullName: 'E2E Journey Student',
        studentOrStaffId: testBorrowerStudentId,
        role: Role.BORROWER,
      },
    });
    createdUserIds.push(borrower.id);

    // Create dedicated test equipment item for this scenario (never mutating shared seeded items)
    const item = await prisma.equipmentItem.create({
      data: {
        assetTag: testAssetTag,
        serialNumber: `SN-E2E-JRN-${uniqueSuffix}`,
        name: testItemName,
        category: 'Measurement',
        modelNumber: 'TBS1052C',
        description: 'Dedicated E2E test digital storage oscilloscope.',
        condition: ItemCondition.GOOD,
        status: ItemStatus.AVAILABLE,
      },
    });
    testItemId = item.id;
    createdItemIds.push(item.id);
  });

  test.afterAll(async () => {
    // Clean up strictly the records created by this scenario in reverse dependency order
    if (createdLoanIds.length > 0) {
      await prisma.loan.deleteMany({ where: { id: { in: createdLoanIds } } });
    }
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

  test('Borrower logs in, requests available item, Custodian logs in, checks out item, and DB persists 7-day loan', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/');

    // 1. Login screen rendered
    await expect(page.getByRole('heading', { name: /equipflow/i })).toBeVisible();
    await page.screenshot({ path: path.join(screenshotDir, '01-login-view.png'), fullPage: true });

    // Sign in as the dedicated test borrower
    await page.getByLabel(/email address/i).fill(testBorrowerEmail);
    await page.getByLabel(/password/i).fill('Password123!');
    await page.getByRole('button', { name: /sign in/i }).click();

    // 2. Borrower sees Equipment Catalog & active quota 0 / 3
    await expect(page.getByRole('heading', { name: /department equipment catalog/i })).toBeVisible();
    await expect(page.getByText(/0 \/ 3/)).toBeVisible();
    await page.screenshot({ path: path.join(screenshotDir, '02-borrower-catalog.png'), fullPage: true });

    // 3. Open Request Modal for dedicated item Tektronix TBS1052C Digital Oscilloscope (CPE-E2E-001)
    await page.getByRole('button', { name: new RegExp(`request to borrow ${testItemName}`, 'i') }).click();
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();

    await dialog.getByLabel(/academic purpose/i).fill('E2E Sprint 1 Lab Signal Verification');
    await page.screenshot({ path: path.join(screenshotDir, '03-borrower-request-modal.png') });

    await dialog.getByRole('button', { name: /confirm request/i }).click();
    await expect(dialog.getByText(/request submitted successfully/i)).toBeVisible();
    await dialog.getByRole('button', { name: /^close$/i }).click();

    // Record created request ID for targeted cleanup
    const createdReq = await prisma.borrowRequest.findFirst({
      where: { itemId: testItemId },
    });
    expect(createdReq).not.toBeNull();
    createdRequestIds.push(createdReq!.id);

    // Verify quota pill updated to 1 / 3
    await expect(page.getByText(/1 \/ 3/)).toBeVisible();

    // 4. Navigate to My Requests & Active Loans view
    await page.getByRole('button', { name: /my requests/i }).click();
    await expect(page.getByRole('heading', { name: /my requests & active loans/i })).toBeVisible();
    await expect(page.getByText(testAssetTag)).toBeVisible();
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
    await expect(page.getByText(testAssetTag)).toBeVisible();
    await expect(page.getByText('E2E Journey Student')).toBeVisible();
    await page.screenshot({ path: path.join(screenshotDir, '05-custodian-triage-queue.png'), fullPage: true });

    // 7. Click Approve & Checkout on CPE-E2E-001 row
    const requestRow = page.locator('tr', { hasText: testAssetTag });
    await requestRow.getByRole('button', { name: /approve & checkout/i }).click();

    const checkoutDialog = page.getByRole('dialog', { name: /confirm physical checkout/i });
    await expect(checkoutDialog).toBeVisible();
    await expect(checkoutDialog.getByText(/7 days from checkout/i)).toBeVisible();
    await checkoutDialog.getByLabel(/checkout staff notes/i).fill(`Verified student ID ${testBorrowerStudentId}; probes included.`);
    await page.screenshot({ path: path.join(screenshotDir, '06-custodian-checkout-modal.png') });

    await checkoutDialog.getByRole('button', { name: /confirm physical checkout/i }).click();

    // 8. Verify checkout confirmation banner & Active Loans Monitor table
    await expect(page.getByText(new RegExp(`checkout recorded for ${testAssetTag}`, 'i'))).toBeVisible();
    const activeLoansSection = page.locator('section[aria-labelledby="department-active-loans-title"]');
    await expect(activeLoansSection.getByRole('cell', { name: testAssetTag })).toBeVisible();
    await page.screenshot({ path: path.join(screenshotDir, '07-custodian-active-loans.png'), fullPage: true });

    // 9. Verify persisted database records (Item = CHECKED_OUT, Request = APPROVED, Loan = ACTIVE with 7-day dueDate)
    const dbItem = await prisma.equipmentItem.findUnique({ where: { id: testItemId } });
    expect(dbItem?.status).toBe(ItemStatus.CHECKED_OUT);

    const dbLoan = await prisma.loan.findFirst({
      where: { itemId: testItemId, status: LoanStatus.ACTIVE },
      include: { request: true, custodian: true },
    });
    expect(dbLoan).not.toBeNull();
    createdLoanIds.push(dbLoan!.id);
    expect(dbLoan?.request?.status).toBe(RequestStatus.APPROVED);
    expect(dbLoan?.custodian.email).toBe('custodian@cpe.kmutt.ac.th');

    const diffMs = new Date(dbLoan!.dueDate).getTime() - new Date(dbLoan!.checkedOutAt).getTime();
    expect(diffMs).toBe(7 * 24 * 60 * 60 * 1000);
  });
});
