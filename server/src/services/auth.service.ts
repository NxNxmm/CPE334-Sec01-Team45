import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Role } from '@prisma/client';
import { prisma } from '../prisma.js';
import { getJwtSecret } from '../config/jwt.js';

export interface TokenPayload {
  userId: string;
  role: Role;
  email: string;
  jti: string;
  iat?: number;
  exp?: number;
}

export interface SanitizedUser {
  id: string;
  email: string;
  fullName: string;
  studentOrStaffId: string;
  role: Role;
}

export class AuthService {
  static async login(email: string, password: string): Promise<{ token: string; user: SanitizedUser }> {
    if (!email || !password) {
      throw { status: 400, code: 'INVALID_CREDENTIALS', message: 'Email and password are required' };
    }

    const user = await prisma.user.findUnique({
      where: { email: email.trim().toLowerCase() },
    });

    if (!user) {
      throw { status: 401, code: 'INVALID_CREDENTIALS', message: 'Invalid email or password' };
    }

    if (!user.isActive) {
      throw { status: 403, code: 'ACCOUNT_INACTIVE', message: 'User account is inactive' };
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      throw { status: 401, code: 'INVALID_CREDENTIALS', message: 'Invalid email or password' };
    }

    const jti = crypto.randomUUID();
    const payload: TokenPayload = {
      userId: user.id,
      role: user.role,
      email: user.email,
      jti,
    };

    const token = jwt.sign(payload, getJwtSecret(), { expiresIn: '24h' });

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        studentOrStaffId: user.studentOrStaffId,
        role: user.role,
      },
    };
  }

  static async logout(jti: string, exp?: number): Promise<void> {
    const expiresAt = exp ? new Date(exp * 1000) : new Date(Date.now() + 24 * 60 * 60 * 1000);
    await prisma.revokedToken.upsert({
      where: { jti },
      update: { expiresAt },
      create: { jti, expiresAt },
    });
  }

  static async isRevoked(jti: string): Promise<boolean> {
    const record = await prisma.revokedToken.findUnique({
      where: { jti },
    });
    return Boolean(record);
  }

  static async getUserProfile(userId: string): Promise<SanitizedUser | null> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        fullName: true,
        studentOrStaffId: true,
        role: true,
        isActive: true,
      },
    });

    if (!user || !user.isActive) {
      return null;
    }

    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      studentOrStaffId: user.studentOrStaffId,
      role: user.role,
    };
  }
}

