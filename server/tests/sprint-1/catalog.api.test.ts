import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import request from 'supertest';
import { PrismaClient, ItemCondition, ItemStatus } from '@prisma/client';
import { app } from '../../src/app.js';

const prisma = new PrismaClient();
const assetTag = 'TEST-CATALOG-001';
let borrowerToken = '';
let custodianToken = '';
let itemId = '';

describe('Sprint 1 - Serialized Equipment Catalog (Feature F-02)', () => {
  beforeAll(async () => {
    await prisma.$connect();
    const [borrowerLogin, custodianLogin] = await Promise.all([
      request(app).post('/api/v1/auth/login').send({ email: 'borrower@cpe.kmutt.ac.th', password: 'Password123!' }),
      request(app).post('/api/v1/auth/login').send({ email: 'custodian@cpe.kmutt.ac.th', password: 'Password123!' }),
    ]);
    borrowerToken = borrowerLogin.body.data.token;
    custodianToken = custodianLogin.body.data.token;

    const item = await prisma.equipmentItem.upsert({
      where: { assetTag },
      update: { name: 'Catalog Test Oscilloscope', category: 'Measurement', modelNumber: 'TEST-100', serialNumber: 'TEST-SERIAL-001', description: 'A test instrument.', condition: ItemCondition.FAIR, status: ItemStatus.AVAILABLE },
      create: { assetTag, name: 'Catalog Test Oscilloscope', category: 'Measurement', modelNumber: 'TEST-100', serialNumber: 'TEST-SERIAL-001', description: 'A test instrument.', condition: ItemCondition.FAIR, status: ItemStatus.AVAILABLE },
    });
    itemId = item.id;
  });

  afterAll(async () => {
    await prisma.equipmentItem.deleteMany({ where: { assetTag } });
    await prisma.$disconnect();
  });

  it('API-01-11: lists serialized catalog entries and current status for authenticated borrowers', async () => {
    const response = await request(app).get('/api/v1/items').set('Authorization', `Bearer ${borrowerToken}`);

    expect(response.status).toBe(200);
    expect(response.body.data).toEqual(expect.arrayContaining([
      expect.objectContaining({ id: itemId, assetTag, name: 'Catalog Test Oscilloscope', category: 'Measurement', modelNumber: 'TEST-100', condition: 'FAIR', status: 'AVAILABLE' }),
    ]));
    expect(response.body.meta.total).toBeGreaterThan(0);
  });

  it('API-01-12: returns complete equipment details to authenticated custodians', async () => {
    const response = await request(app).get(`/api/v1/items/${itemId}`).set('Authorization', `Bearer ${custodianToken}`);

    expect(response.status).toBe(200);
    expect(response.body.data).toMatchObject({
      id: itemId, assetTag, serialNumber: 'TEST-SERIAL-001', description: 'A test instrument.', condition: 'FAIR', status: 'AVAILABLE',
    });
    expect(response.body.data).toHaveProperty('createdAt');
  });

  it('API-01-13: returns ITEM_NOT_FOUND for an unknown item ID', async () => {
    const response = await request(app).get('/api/v1/items/does-not-exist').set('Authorization', `Bearer ${borrowerToken}`);

    expect(response.status).toBe(404);
    expect(response.body.success).toBe(false);
    expect(response.body.error.code).toBe('ITEM_NOT_FOUND');
  });

  it('requires authentication for catalog access', async () => {
    const response = await request(app).get('/api/v1/items');

    expect(response.status).toBe(401);
    expect(response.body.error.code).toBe('UNAUTHENTICATED');
  });
});
