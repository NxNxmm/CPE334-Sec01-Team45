import { Router } from 'express';
import { Role } from '@prisma/client';
import { requireAuth, requireRole } from '../middlewares/auth.middleware.js';

export const custodianRouter = Router();

// Protected custodian triage route (tested by API-01-09 for role isolation)
custodianRouter.get('/requests', requireAuth, requireRole(Role.CUSTODIAN), async (_req, res) => {
  res.status(200).json({ data: { requests: [] } });
});

