import { Router, Response } from 'express';
import { AuthService } from '../services/auth.service.js';
import { requireAuth, AuthenticatedRequest } from '../middlewares/auth.middleware.js';

export const authRouter = Router();

authRouter.post('/login', async (req, res: Response) => {
  try {
    const { email, password } = req.body ?? {};
    const result = await AuthService.login(email, password);
    res.status(200).json({ data: result });
  } catch (error: any) {
    const status = error.status || 500;
    const code = error.code || 'INTERNAL_ERROR';
    const message = error.message || 'An unexpected error occurred';
    res.status(status).json({ error: { code, message } });
  }
});

authRouter.get('/me', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const profile = await AuthService.getUserProfile(req.user!.userId);
    if (!profile) {
      res.status(404).json({ error: { code: 'USER_NOT_FOUND', message: 'User profile not found' } });
      return;
    }
    res.status(200).json({ data: { user: profile } });
  } catch (error: any) {
    res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: error.message } });
  }
});

authRouter.post('/logout', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    await AuthService.logout(req.user!.jti, req.user!.exp);
    res.status(200).json({ data: { message: 'Logged out successfully' } });
  } catch (error: any) {
    res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: error.message } });
  }
});

