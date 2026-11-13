import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { Role } from '@prisma/client';
import { AuthService, TokenPayload } from '../services/auth.service.js';
import { getJwtSecret } from '../config/jwt.js';

export interface AuthenticatedRequest extends Request {
  user?: TokenPayload;
}

export async function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({
      error: {
        code: 'UNAUTHENTICATED',
        message: 'Authentication token is missing or malformed',
      },
    });
    return;
  }

  const token = authHeader.substring(7).trim();

  let secret: string;
  try {
    secret = getJwtSecret();
  } catch (_err) {
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Authentication configuration error',
      },
    });
    return;
  }

  let decoded: TokenPayload;
  try {
    decoded = jwt.verify(token, secret) as TokenPayload;
  } catch (_err) {
    res.status(401).json({
      error: {
        code: 'INVALID_TOKEN',
        message: 'Token is invalid or expired',
      },
    });
    return;
  }

  const isRevoked = await AuthService.isRevoked(decoded.jti);
  if (isRevoked) {
    res.status(401).json({
      error: {
        code: 'TOKEN_REVOKED',
        message: 'Token has been revoked',
      },
    });
    return;
  }

  const userProfile = await AuthService.getUserProfile(decoded.userId);
  if (!userProfile) {
    res.status(403).json({
      error: {
        code: 'ACCOUNT_INACTIVE',
        message: 'User account is inactive or not found',
      },
    });
    return;
  }

  req.user = decoded;
  next();
}

export function requireRole(allowedRoles: Role | Role[]) {
  const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        error: {
          code: 'UNAUTHENTICATED',
          message: 'Authentication required',
        },
      });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({
        error: {
          code: 'FORBIDDEN_ROLE',
          message: `Access denied for role ${req.user.role}`,
        },
      });
      return;
    }

    next();
  };
}

