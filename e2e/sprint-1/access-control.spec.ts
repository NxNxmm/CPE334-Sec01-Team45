import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';

const screenshotDir = path.resolve(process.cwd(), 'docs/sprints/sprint-1/evidence/screenshots');

test.describe('E2E-01-03: Access Control & Role Segregation (Borrower Forbidden from Custodian Desk)', () => {
  test.beforeAll(() => {
    fs.mkdirSync(screenshotDir, { recursive: true });
  });

  test('Enforces 401 on unauthenticated access and 403 FORBIDDEN_ROLE when Borrower attempts Custodian operations', async ({ page, request }) => {
    await page.setViewportSize({ width: 1280, height: 800 });

    // 1. Unauthenticated request to custodian queue returns 401 UNAUTHENTICATED
    const unauthRes = await request.get('/api/v1/custodian/requests');
    expect(unauthRes.status()).toBe(401);
    const unauthBody = await unauthRes.json();
    expect(unauthBody.error.code).toBe('UNAUTHENTICATED');

    // 2. Log in as Borrower via UI
    await page.goto('/');
    await page.getByLabel(/email address/i).fill('borrower@cpe.kmutt.ac.th');
    await page.getByLabel(/password/i).fill('Password123!');
    await page.getByRole('button', { name: /sign in/i }).click();

    await expect(page.getByRole('heading', { name: /department equipment catalog/i })).toBeVisible();

    // 3. Verify Borrower UI strictly renders Borrower Portal and never exposes Custodian Desk
    await expect(page.getByText('BORROWER', { exact: true })).toBeVisible();
    await expect(page.getByRole('heading', { name: /custodian triage & checkout desk/i })).toHaveCount(0);

    // 4. Attempt direct navigation to /custodian/desk as Borrower -> remains scoped to Borrower Portal
    await page.goto('/custodian/desk');
    await expect(page.getByRole('heading', { name: /department equipment catalog/i })).toBeVisible();
    await expect(page.getByRole('heading', { name: /custodian triage & checkout desk/i })).toHaveCount(0);

    // 5. Verify backend role guard rejects Borrower token on both Custodian endpoints with HTTP 403 FORBIDDEN_ROLE
    const token = await page.evaluate(() => localStorage.getItem('equipflow_token'));
    expect(token).toBeTruthy();

    const queueRes = await request.get('/api/v1/custodian/requests', {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(queueRes.status()).toBe(403);
    const queueBody = await queueRes.json();
    expect(queueBody.error.code).toBe('FORBIDDEN_ROLE');

    const checkoutRes = await request.post('/api/v1/custodian/checkouts', {
      headers: { Authorization: `Bearer ${token}` },
      data: { requestId: 'seed_request_checked_out' },
    });
    expect(checkoutRes.status()).toBe(403);
    const checkoutBody = await checkoutRes.json();
    expect(checkoutBody.error.code).toBe('FORBIDDEN_ROLE');

    await page.screenshot({ path: path.join(screenshotDir, '09-access-control-borrower-boundary.png'), fullPage: true });
  });
});

