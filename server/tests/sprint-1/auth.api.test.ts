import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { PrismaClient } from '@prisma/client';
import { app } from '../../src/app.js';

const prisma = new PrismaClient();

describe('Sprint 1 - Authentication & Role Identity (Feature F-01)', () => {
  beforeAll(async () => {
    await prisma.$connect();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('API-01-01: User login with valid email and password', () => {
    it('should return HTTP 200 with signed JWT Bearer token and sanitized user profile', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'borrower@cpe.kmutt.ac.th',
          password: 'Password123!',
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('token');
      expect(typeof response.body.data.token).toBe('string');
      expect(response.body.data).toHaveProperty('user');
      expect(response.body.data.user.email).toBe('borrower@cpe.kmutt.ac.th');
      expect(response.body.data.user.role).toBe('BORROWER');
      expect(response.body.data.user).not.toHaveProperty('passwordHash');
    });
  });

  describe('API-01-02: User login with invalid password', () => {
    it('should return HTTP 401 with error code INVALID_CREDENTIALS', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'borrower@cpe.kmutt.ac.th',
          password: 'WrongPassword!',
        });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error.code).toBe('INVALID_CREDENTIALS');
      expect(response.body.error).toHaveProperty('message');
    });
  });

  describe('API-01-03: User login with non-existent email', () => {
    it('should return HTTP 401 with error code INVALID_CREDENTIALS', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'nonexistent@cpe.kmutt.ac.th',
          password: 'Password123!',
        });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error.code).toBe('INVALID_CREDENTIALS');
    });
  });

  describe('API-01-04: Fetch authenticated identity via GET /api/v1/auth/me', () => {
    it('should return HTTP 200 with matching authenticated user ID, email, and role', async () => {
      const loginRes = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'custodian@cpe.kmutt.ac.th',
          password: 'Password123!',
        });

      const token = loginRes.body.data.token;

      const meRes = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${token}`);

      expect(meRes.status).toBe(200);
      expect(meRes.body).toHaveProperty('data');
      expect(meRes.body.data.user.email).toBe('custodian@cpe.kmutt.ac.th');
      expect(meRes.body.data.user.role).toBe('CUSTODIAN');
      expect(meRes.body.data.user).not.toHaveProperty('passwordHash');
    });
  });

  describe('API-01-05: User logout via POST /api/v1/auth/logout', () => {
    it('should return HTTP 200 and persist token jti to RevokedToken table', async () => {
      const loginRes = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'borrower@cpe.kmutt.ac.th',
          password: 'Password123!',
        });

      const token = loginRes.body.data.token;

      const logoutRes = await request(app)
        .post('/api/v1/auth/logout')
        .set('Authorization', `Bearer ${token}`);

      expect(logoutRes.status).toBe(200);
      expect(logoutRes.body.data.message).toBe('Logged out successfully');

      // Check RevokedToken table
      const revokedTokens = await prisma.revokedToken.findMany();
      expect(revokedTokens.length).toBeGreaterThan(0);
    });
  });

  describe('API-01-06: Request protected endpoint using revoked token', () => {
    it('should return HTTP 401 Unauthorized with code TOKEN_REVOKED', async () => {
      const loginRes = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'borrower@cpe.kmutt.ac.th',
          password: 'Password123!',
        });

      const token = loginRes.body.data.token;

      // Logout to revoke
      await request(app)
        .post('/api/v1/auth/logout')
        .set('Authorization', `Bearer ${token}`);

      // Attempt to access /api/v1/auth/me with revoked token
      const meRes = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${token}`);

      expect(meRes.status).toBe(401);
      expect(meRes.body.error.code).toBe('TOKEN_REVOKED');
    });
  });

  describe('API-01-07: Two concurrent sessions for same user; logout Session 1', () => {
    it('should invalidate Session 1 (401) while concurrent Session 2 continues to return 200', async () => {
      // Login Session 1
      const session1 = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'borrower2@cpe.kmutt.ac.th',
          password: 'Password123!',
        });
      const token1 = session1.body.data.token;

      // Login Session 2
      const session2 = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'borrower2@cpe.kmutt.ac.th',
          password: 'Password123!',
        });
      const token2 = session2.body.data.token;

      expect(token1).not.toBe(token2);

      // Logout Session 1
      await request(app)
        .post('/api/v1/auth/logout')
        .set('Authorization', `Bearer ${token1}`);

      // Session 1 must be rejected
      const res1 = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${token1}`);
      expect(res1.status).toBe(401);
      expect(res1.body.error.code).toBe('TOKEN_REVOKED');

      // Session 2 must remain valid
      const res2 = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${token2}`);
      expect(res2.status).toBe(200);
      expect(res2.body.data.user.email).toBe('borrower2@cpe.kmutt.ac.th');
    });
  });

  describe('API-01-08: Request protected endpoint without Authorization header', () => {
    it('should return HTTP 401 Unauthorized with code UNAUTHENTICATED', async () => {
      const response = await request(app).get('/api/v1/auth/me');

      expect(response.status).toBe(401);
      expect(response.body.error.code).toBe('UNAUTHENTICATED');
    });
  });

  describe('API-01-09: Borrower attempts to access custodian endpoint', () => {
    it('should return HTTP 403 Forbidden with code FORBIDDEN_ROLE', async () => {
      const loginRes = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'borrower@cpe.kmutt.ac.th',
          password: 'Password123!',
        });
      const token = loginRes.body.data.token;

      const response = await request(app)
        .get('/api/v1/custodian/requests')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(403);
      expect(response.body.error.code).toBe('FORBIDDEN_ROLE');
    });
  });

  describe('API-01-10: Verify password hashing in database', () => {
    it('should store passwordHash beginning with $2a$ or $2b$ with salt rounds >= 10', async () => {
      const user = await prisma.user.findUnique({
        where: { email: 'borrower@cpe.kmutt.ac.th' },
      });

      expect(user).toBeDefined();
      expect(user?.passwordHash).toMatch(/^\$2[ab]\$\d{2}\$/);

      // Extract salt rounds from hash format $2a$12$...
      const rounds = parseInt(user!.passwordHash.split('$')[2], 10);
      expect(rounds).toBeGreaterThanOrEqual(10);
    });
  });

  describe('Regression: JWT signing-key fail-closed configuration', () => {
    const originalSecret = process.env.JWT_SECRET;

    it('should throw an error in getJwtSecret when JWT_SECRET is undefined, empty, or whitespace', async () => {
      const { getJwtSecret } = await import('../../src/config/jwt.js');

      // Test undefined
      delete process.env.JWT_SECRET;
      expect(() => getJwtSecret()).toThrow(/JWT_SECRET.*missing/i);

      // Test empty string
      process.env.JWT_SECRET = '';
      expect(() => getJwtSecret()).toThrow(/JWT_SECRET.*missing/i);

      // Test whitespace
      process.env.JWT_SECRET = '   ';
      expect(() => getJwtSecret()).toThrow(/JWT_SECRET.*missing/i);

      // Restore
      process.env.JWT_SECRET = originalSecret;
    });

    it('should fail closed (HTTP 500) on login attempt when JWT_SECRET is missing, never issuing a token', async () => {
      delete process.env.JWT_SECRET;

      try {
        const response = await request(app)
          .post('/api/v1/auth/login')
          .send({
            email: 'borrower@cpe.kmutt.ac.th',
            password: 'Password123!',
          });

        expect(response.status).toBe(500);
        expect(response.body).toHaveProperty('error');
        expect(response.body.error.code).toBe('INTERNAL_ERROR');
        expect(response.body).not.toHaveProperty('data');
      } finally {
        process.env.JWT_SECRET = originalSecret;
      }
    });

    it('should fail closed (HTTP 500) on token verification in requireAuth when JWT_SECRET is missing', async () => {
      // First obtain a valid token while JWT_SECRET is present
      const loginRes = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'borrower@cpe.kmutt.ac.th',
          password: 'Password123!',
        });
      const validToken = loginRes.body.data.token;

      // Delete secret to simulate missing configuration during verification
      delete process.env.JWT_SECRET;

      try {
        const response = await request(app)
          .get('/api/v1/auth/me')
          .set('Authorization', `Bearer ${validToken}`);

        expect(response.status).toBe(500);
        expect(response.body).toHaveProperty('error');
        expect(response.body.error.code).toBe('INTERNAL_ERROR');
        expect(response.body.error.message).toBe('Authentication configuration error');
      } finally {
        process.env.JWT_SECRET = originalSecret;
      }
    });
  });
});

