import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import request from 'supertest';
import { ItemCondition, ItemStatus, PrismaClient, RequestStatus, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { app } from '../../src/app.js';

const prisma = new PrismaClient();
let borrowerToken = '';
let custodianToken = '';
let borrowerId = '';
let custodianId = '';
let borrowerFullName = '';
let borrowerStudentId = '';
const itemIds: string[] = [];
const requestIds: string[] = [];
const loanIds: string[] = [];
const userIds: string[] = [];

describe('Sprint 1 - Custodian Checkout (Feature F-04)', () => {
  beforeAll(async () => {
    await prisma.$connect();
    const borrowerEmail = `checkout-test-${Date.now()}-${Math.random().toString(16).slice(2, 7)}@cpe.kmutt.ac.th`;
    const passwordHash = await bcrypt.hash('Password123!', 10);
    const borrower = await prisma.user.create({
      data: {
        email: borrowerEmail,
        passwordHash,
        fullName: 'Checkout Test Borrower',
        studentOrStaffId: `STU-CHK-${Date.now()}-${Math.random().toString(16).slice(2, 7)}`,
        role: Role.BORROWER,
      },
    });
    userIds.push(borrower.id);
    borrowerId = borrower.id;
    borrowerFullName = borrower.fullName;
    borrowerStudentId = borrower.studentOrStaffId;

    const [borrowerLogin, custodianLogin] = await Promise.all([
      request(app).post('/api/v1/auth/login').send({ email: borrowerEmail, password: 'Password123!' }),
      request(app).post('/api/v1/auth/login').send({ email: 'custodian@cpe.kmutt.ac.th', password: 'Password123!' }),
    ]);
    borrowerToken = borrowerLogin.body.data.token;
    custodianToken = custodianLogin.body.data.token;
    custodianId = custodianLogin.body.data.user.id;
  });

  afterAll(async () => {
    if (loanIds.length) await prisma.loan.deleteMany({ where: { id: { in: loanIds } } });
    if (requestIds.length) await prisma.borrowRequest.deleteMany({ where: { id: { in: requestIds } } });
    if (itemIds.length) await prisma.equipmentItem.deleteMany({ where: { id: { in: itemIds } } });
    if (userIds.length) await prisma.user.deleteMany({ where: { id: { in: userIds } } });
    await prisma.$disconnect();
  });

  async function createPendingRequest(tag: string) {
    const suffix = `${tag}-${Date.now()}-${Math.random().toString(16).slice(2, 7)}`;
    const item = await prisma.equipmentItem.create({
      data: {
        assetTag: `TEST-CHK-${suffix}`,
        serialNumber: `SN-CHK-${suffix}`,
        name: `Checkout Test ${tag}`,
        category: 'Testing',
        condition: ItemCondition.GOOD,
        status: ItemStatus.RESERVED,
      },
    });
    itemIds.push(item.id);
    const borrowRequest = await prisma.borrowRequest.create({
      data: { borrowerId, itemId: item.id, status: RequestStatus.PENDING, requestNote: `Purpose ${tag}` },
    });
    requestIds.push(borrowRequest.id);
    return { item, borrowRequest };
  }

  it('API-01-20: returns pending requests with borrower and item details, plus active loans', async () => {
    const { item, borrowRequest } = await createPendingRequest('QUEUE');
    const response = await request(app).get('/api/v1/custodian/requests').set('Authorization', `Bearer ${custodianToken}`);

    expect(response.status).toBe(200);
    expect(response.body.data.requests).toEqual(expect.arrayContaining([
      expect.objectContaining({
        id: borrowRequest.id,
        status: 'PENDING',
        requestNote: 'Purpose QUEUE',
        borrower: expect.objectContaining({ id: borrowerId, fullName: borrowerFullName, studentOrStaffId: borrowerStudentId }),
        item: expect.objectContaining({ id: item.id, assetTag: item.assetTag, name: item.name, status: 'RESERVED' }),
      }),
    ]));
    expect(Array.isArray(response.body.data.activeLoans)).toBe(true);
  });

  it('API-01-21..23: checks out a pending request with a seven-day due date and authenticated custodian attribution', async () => {
    const { item, borrowRequest } = await createPendingRequest('SUCCESS');
    const response = await request(app)
      .post('/api/v1/custodian/checkouts')
      .set('Authorization', `Bearer ${custodianToken}`)
      .send({ requestId: borrowRequest.id, checkoutNotes: 'ID verified', custodianId: 'client-supplied-id' });

    expect(response.status).toBe(201);
    expect(response.body.data).toMatchObject({ requestId: borrowRequest.id, itemId: item.id, borrowerId, custodianId, status: 'ACTIVE', checkoutNotes: 'ID verified' });
    expect(new Date(response.body.data.dueDate).getTime() - new Date(response.body.data.checkedOutAt).getTime()).toBe(7 * 24 * 60 * 60 * 1000);
    loanIds.push(response.body.data.id);
    const [savedRequest, savedItem, savedLoan] = await Promise.all([
      prisma.borrowRequest.findUnique({ where: { id: borrowRequest.id } }),
      prisma.equipmentItem.findUnique({ where: { id: item.id } }),
      prisma.loan.findUnique({ where: { id: response.body.data.id } }),
    ]);
    expect(savedRequest?.status).toBe('APPROVED');
    expect(savedItem?.status).toBe('CHECKED_OUT');
    expect(savedLoan?.custodianId).toBe(custodianId);
  });

  it('API-01-24: rejects a duplicate checkout with CONCURRENT_CHECKOUT_CONFLICT', async () => {
    const { borrowRequest } = await createPendingRequest('DUPLICATE');
    const payload = { requestId: borrowRequest.id };
    const first = await request(app).post('/api/v1/custodian/checkouts').set('Authorization', `Bearer ${custodianToken}`).send(payload);
    expect(first.status).toBe(201);
    loanIds.push(first.body.data.id);

    const second = await request(app).post('/api/v1/custodian/checkouts').set('Authorization', `Bearer ${custodianToken}`).send(payload);
    expect(second.status).toBe(409);
    expect(second.body.error.code).toBe('CONCURRENT_CHECKOUT_CONFLICT');
  });

  it('API-01-25: allows only one of two concurrent checkouts for the same request', async () => {
    const { borrowRequest } = await createPendingRequest('RACE');
    const payload = { requestId: borrowRequest.id };
    const responses = await Promise.all([
      request(app).post('/api/v1/custodian/checkouts').set('Authorization', `Bearer ${custodianToken}`).send(payload),
      request(app).post('/api/v1/custodian/checkouts').set('Authorization', `Bearer ${custodianToken}`).send(payload),
    ]);

    expect(responses.map(({ status }) => status).sort()).toEqual([201, 409]);
    const success = responses.find(({ status }) => status === 201)!;
    const conflict = responses.find(({ status }) => status === 409)!;
    loanIds.push(success.body.data.id);
    expect(conflict.body.error.code).toBe('CONCURRENT_CHECKOUT_CONFLICT');
    expect(await prisma.loan.count({ where: { requestId: borrowRequest.id } })).toBe(1);
  });

  it('API-01-26: forbids borrower checkout attempts', async () => {
    const { borrowRequest } = await createPendingRequest('ROLE');
    const response = await request(app)
      .post('/api/v1/custodian/checkouts')
      .set('Authorization', `Bearer ${borrowerToken}`)
      .send({ requestId: borrowRequest.id });

    expect(response.status).toBe(403);
    expect(response.body.error.code).toBe('FORBIDDEN_ROLE');
  });
});
