import { Router, Response } from 'express';
import { Role } from '@prisma/client';
import { requireAuth, requireRole, AuthenticatedRequest } from '../middlewares/auth.middleware.js';
import { RequestService } from '../services/request.service.js';

export const requestRouter = Router();

// Submit a new borrow request (Borrowers only)
requestRouter.post('/', requireAuth, requireRole(Role.BORROWER), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { itemId, requestNote } = req.body ?? {};
    const newRequest = await RequestService.submitBorrowRequest(
      req.user!.userId,
      itemId,
      requestNote
    );

    res.status(201).json({
      success: true,
      data: newRequest,
      meta: { timestamp: new Date().toISOString() },
    });
  } catch (error: any) {
    const status = error.status || 500;
    const code = error.code || 'INTERNAL_ERROR';
    const message = error.message || 'An unexpected error occurred processing borrow request.';
    res.status(status).json({
      success: false,
      error: { code, message },
      meta: { timestamp: new Date().toISOString() },
    });
  }
});

// Get personal borrow requests and active loans (Borrowers only)
requestRouter.get('/my', requireAuth, requireRole(Role.BORROWER), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const data = await RequestService.getBorrowerRequestsAndLoans(req.user!.userId);
    res.status(200).json({
      success: true,
      data,
      meta: { timestamp: new Date().toISOString() },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: error.message || 'Unable to retrieve requests and loans.' },
      meta: { timestamp: new Date().toISOString() },
    });
  }
});

