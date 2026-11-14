import { Response, Router } from 'express';
import { Role } from '@prisma/client';
import { AuthenticatedRequest, requireAuth, requireRole } from '../middlewares/auth.middleware.js';
import { CustodianService } from '../services/custodian.service.js';

export const custodianRouter = Router();

custodianRouter.get('/requests', requireAuth, requireRole(Role.CUSTODIAN), async (_req, res) => {
  try {
    const data = await CustodianService.getDeskData();
    res.status(200).json({
      success: true,
      data,
      meta: { total: data.requests.length, timestamp: new Date().toISOString() },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: error.message || 'Unable to retrieve the custodian queue.' },
      meta: { timestamp: new Date().toISOString() },
    });
  }
});

custodianRouter.post('/checkouts', requireAuth, requireRole(Role.CUSTODIAN), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { requestId, checkoutNotes } = req.body ?? {};
    const loan = await CustodianService.checkout(requestId, req.user!.userId, checkoutNotes);
    res.status(201).json({
      success: true,
      data: loan,
      meta: { timestamp: new Date().toISOString() },
    });
  } catch (error: any) {
    const status = error.status || 500;
    const code = error.code || 'INTERNAL_ERROR';
    const message = error.message || 'An unexpected error occurred processing checkout.';
    res.status(status).json({
      success: false,
      error: { code, message },
      meta: { timestamp: new Date().toISOString() },
    });
  }
});

