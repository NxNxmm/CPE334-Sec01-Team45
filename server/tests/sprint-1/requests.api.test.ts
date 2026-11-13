import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { PrismaClient, ItemStatus, ItemCondition, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { app } from '../../src/app.js';

const prisma = new PrismaClient();

describe('Sprint 1 - Borrower Requests & Data Isolation (Feature F-03)', () => {
  let borrower1Token = '';
  let borrower2Token = '';
  let borrower1Id = '';
  let borrower2Id = '';
  const createdItemIds: string[] = [];
  const createdRequestIds: string[] = [];
  const createdUserIds: string[] = [];

  beforeAll(async () => {
    await prisma.$connect();

    // Authenticate Borrower 1 & Borrower 2
    const [login1, login2] = await Promise.all([
      request(app).post('/api/v1/auth/login').send({
        email: 'borrower@cpe.kmutt.ac.th',
        password: 'Password123!',
      }),
      request(app).post('/api/v1/auth/login').send({
        email: 'borrower2@cpe.kmutt.ac.th',
        password: 'Password123!',
      }),
    ]);

    borrower1Token = login1.body.data.token;
    borrower1Id = login1.body.data.user.id;
    borrower2Token = login2.body.data.token;
    borrower2Id = login2.body.data.user.id;
  });

  afterAll(async () => {
    // Cleanup in reverse dependency order
    if (createdRequestIds.length > 0) {
      await prisma.borrowRequest.deleteMany({
        where: { id: { in: createdRequestIds } },
      });
    }
    if (createdItemIds.length > 0) {
      await prisma.equipmentItem.deleteMany({
        where: { id: { in: createdItemIds } },
      });
    }
    if (createdUserIds.length > 0) {
      await prisma.user.deleteMany({
        where: { id: { in: createdUserIds } },
      });
    }
    await prisma.$disconnect();
  });

  async function createTestItem(tagSuffix: string, status: ItemStatus = ItemStatus.AVAILABLE) {
    const assetTag = `TEST-REQ-${tagSuffix}-${Date.now().toString().slice(-6)}`;
    const serialNumber = `SN-REQ-${tagSuffix}-${Date.now().toString().slice(-6)}`;
    const item = await prisma.equipmentItem.create({
      data: {
        assetTag,
        serialNumber,
        name: `Test Equipment ${tagSuffix}`,
        category: 'Testing',
        condition: ItemCondition.GOOD,
        status,
      },
    });
    createdItemIds.push(item.id);
    return item;
  }

  describe('API-01-14: Borrower submits request for AVAILABLE item', () => {
    it('should return HTTP 201, create PENDING request, and transition item to RESERVED', async () => {
      const item = await createTestItem('AVAIL');

      const response = await request(app)
        .post('/api/v1/requests')
        .set('Authorization', `Bearer ${borrower1Token}`)
        .send({
          itemId: item.id,
          requestNote: 'Course project lab work',
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data.status).toBe('PENDING');
      expect(response.body.data.itemId).toBe(item.id);
      expect(response.body.data.borrowerId).toBe(borrower1Id);
      expect(response.body.data.requestNote).toBe('Course project lab work');
      createdRequestIds.push(response.body.data.id);

      // Verify item status in database updated to RESERVED
      const updatedItem = await prisma.equipmentItem.findUnique({
        where: { id: item.id },
      });
      expect(updatedItem?.status).toBe(ItemStatus.RESERVED);
    });
  });

  describe('API-01-15: Borrower submits request for RESERVED or CHECKED_OUT item', () => {
    it('should return HTTP 400 Bad Request with code ITEM_NOT_AVAILABLE', async () => {
      const item = await createTestItem('RES', ItemStatus.RESERVED);

      const response = await request(app)
        .post('/api/v1/requests')
        .set('Authorization', `Bearer ${borrower1Token}`)
        .send({
          itemId: item.id,
        });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('ITEM_NOT_AVAILABLE');

      // Verify status remains RESERVED
      const unchangedItem = await prisma.equipmentItem.findUnique({
        where: { id: item.id },
      });
      expect(unchangedItem?.status).toBe(ItemStatus.RESERVED);
    });
  });

  describe('API-01-16: Borrower submits request when active quota >= 3', () => {
    it('should reject with HTTP 400 EXCEEDS_ACTIVE_QUOTA and create no request', async () => {
      // Create a dedicated borrower for quota test
      const email = `quota-user-${Date.now()}@cpe.kmutt.ac.th`;
      const passwordHash = await bcrypt.hash('Password123!', 10);
      const quotaUser = await prisma.user.create({
        data: {
          email,
          passwordHash,
          fullName: 'Quota Limit Tester',
          studentOrStaffId: `STU-Q-${Date.now().toString().slice(-6)}`,
          role: Role.BORROWER,
        },
      });
      createdUserIds.push(quotaUser.id);

      const login = await request(app).post('/api/v1/auth/login').send({
        email,
        password: 'Password123!',
      });
      const token = login.body.data.token;

      // Fill quota up to 3 items
      for (let i = 1; i <= 3; i++) {
        const item = await createTestItem(`QFILL-${i}`);
        const res = await request(app)
          .post('/api/v1/requests')
          .set('Authorization', `Bearer ${token}`)
          .send({ itemId: item.id });
        expect(res.status).toBe(201);
        createdRequestIds.push(res.body.data.id);
      }

      // Attempt 4th request -> must fail with 400 EXCEEDS_ACTIVE_QUOTA
      const excessItem = await createTestItem('QEXCESS');
      const excessRes = await request(app)
        .post('/api/v1/requests')
        .set('Authorization', `Bearer ${token}`)
        .send({ itemId: excessItem.id });

      expect(excessRes.status).toBe(400);
      expect(excessRes.body.error.code).toBe('EXCEEDS_ACTIVE_QUOTA');

      // Ensure item remains AVAILABLE
      const checkItem = await prisma.equipmentItem.findUnique({
        where: { id: excessItem.id },
      });
      expect(checkItem?.status).toBe(ItemStatus.AVAILABLE);
    });
  });

  describe('API-01-17: Concurrent requests for the same available item', () => {
    it('should allow exactly 1 request to succeed (HTTP 201) and reject competitor with HTTP 409 Conflict', async () => {
      const contestedItem = await createTestItem('CONCURRENT');

      // Fire 2 concurrent requests for the exact same item from different borrowers
      const [resA, resB] = await Promise.all([
        request(app)
          .post('/api/v1/requests')
          .set('Authorization', `Bearer ${borrower1Token}`)
          .send({ itemId: contestedItem.id, requestNote: 'Borrower 1 competing' }),
        request(app)
          .post('/api/v1/requests')
          .set('Authorization', `Bearer ${borrower2Token}`)
          .send({ itemId: contestedItem.id, requestNote: 'Borrower 2 competing' }),
      ]);

      const statuses = [resA.status, resB.status].sort();
      expect(statuses).toEqual([201, 409]);

      const successRes = resA.status === 201 ? resA : resB;
      const conflictRes = resA.status === 409 ? resA : resB;

      createdRequestIds.push(successRes.body.data.id);
      expect(conflictRes.body.error.code).toBe('CONCURRENT_REQUEST_CONFLICT');

      // Item should be RESERVED
      const item = await prisma.equipmentItem.findUnique({
        where: { id: contestedItem.id },
      });
      expect(item?.status).toBe(ItemStatus.RESERVED);
    });
  });

  describe('API-01-18: Borrower queries personal requests via GET /api/v1/requests/my', () => {
    it('should return HTTP 200 with personal requests, active loans, and active quota calculation', async () => {
      const response = await request(app)
        .get('/api/v1/requests/my')
        .set('Authorization', `Bearer ${borrower1Token}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('requests');
      expect(response.body.data).toHaveProperty('loans');
      expect(response.body.data).toHaveProperty('quota');

      const { quota, requests } = response.body.data;
      expect(quota.maxQuota).toBe(3);
      expect(quota.activeQuota).toBe(requests.length + response.body.data.loans.length);
    });
  });

  describe('API-01-19: Cross-borrower data isolation check', () => {
    it('should isolate Borrower 1 and Borrower 2 personal data completely', async () => {
      // Borrower 2 has a pre-seeded active loan for CPE-RPI-002
      const res1 = await request(app)
        .get('/api/v1/requests/my')
        .set('Authorization', `Bearer ${borrower1Token}`);

      const res2 = await request(app)
        .get('/api/v1/requests/my')
        .set('Authorization', `Bearer ${borrower2Token}`);

      expect(res1.status).toBe(200);
      expect(res2.status).toBe(200);

      const res1RequestBorrowerIds = res1.body.data.requests.map((r: any) => r.borrowerId);
      const res1LoanBorrowerIds = res1.body.data.loans.map((l: any) => l.borrowerId);

      // All returned records for Borrower 1 must strictly belong to Borrower 1
      res1RequestBorrowerIds.forEach((id: string) => expect(id).toBe(borrower1Id));
      res1LoanBorrowerIds.forEach((id: string) => expect(id).toBe(borrower1Id));

      // Borrower 1 cannot see Borrower 2's pre-seeded active loan
      const b2LoanIds = res2.body.data.loans.map((l: any) => l.id);
      expect(b2LoanIds.length).toBeGreaterThan(0);
      res1LoanBorrowerIds.forEach((id: string) => {
        expect(b2LoanIds).not.toContain(id);
      });
    });
  });

  describe('API-01-27: Concurrent requests from same borrower exceeding quota', () => {
    it('should allow exactly 1 request to succeed when quota starts at 2, rejecting 2nd with 400 EXCEEDS_ACTIVE_QUOTA', async () => {
      // Create user with quota = 2
      const email = `quota-race-${Date.now()}@cpe.kmutt.ac.th`;
      const passwordHash = await bcrypt.hash('Password123!', 10);
      const raceUser = await prisma.user.create({
        data: {
          email,
          passwordHash,
          fullName: 'Quota Race Tester',
          studentOrStaffId: `STU-R-${Date.now().toString().slice(-6)}`,
          role: Role.BORROWER,
        },
      });
      createdUserIds.push(raceUser.id);

      const login = await request(app).post('/api/v1/auth/login').send({
        email,
        password: 'Password123!',
      });
      const token = login.body.data.token;

      // Fill 2 slots
      for (let i = 1; i <= 2; i++) {
        const item = await createTestItem(`RACEFILL-${i}`);
        const res = await request(app)
          .post('/api/v1/requests')
          .set('Authorization', `Bearer ${token}`)
          .send({ itemId: item.id });
        expect(res.status).toBe(201);
        createdRequestIds.push(res.body.data.id);
      }

      // Now quota = 2 (remaining = 1). Submit 2 requests simultaneously for 2 DIFFERENT items!
      const itemA = await createTestItem('RACE-ITEM-A');
      const itemB = await createTestItem('RACE-ITEM-B');

      const [resA, resB] = await Promise.all([
        request(app)
          .post('/api/v1/requests')
          .set('Authorization', `Bearer ${token}`)
          .send({ itemId: itemA.id }),
        request(app)
          .post('/api/v1/requests')
          .set('Authorization', `Bearer ${token}`)
          .send({ itemId: itemB.id }),
      ]);

      const statuses = [resA.status, resB.status].sort();
      // Exactly 1 must succeed (201) and 1 must fail with quota breach (400)
      expect(statuses).toEqual([201, 400]);

      const successRes = resA.status === 201 ? resA : resB;
      const failedRes = resA.status === 400 ? resA : resB;

      createdRequestIds.push(successRes.body.data.id);
      expect(failedRes.body.error.code).toBe('EXCEEDS_ACTIVE_QUOTA');

      // Verify DB state: borrower has exactly 3 PENDING requests total,
      // and among itemA/itemB exactly one is RESERVED and one remains AVAILABLE.
      const finalPendingCount = await prisma.borrowRequest.count({
        where: { borrowerId: raceUser.id, status: 'PENDING' },
      });
      expect(finalPendingCount).toBe(3);

      const [finalItemA, finalItemB] = await Promise.all([
        prisma.equipmentItem.findUnique({ where: { id: itemA.id } }),
        prisma.equipmentItem.findUnique({ where: { id: itemB.id } }),
      ]);
      const finalItemStatuses = [finalItemA?.status, finalItemB?.status].sort();
      expect(finalItemStatuses).toEqual([ItemStatus.AVAILABLE, ItemStatus.RESERVED]);
    });
  });
});

