import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { StorageProvider } from '../storage/storageProvider.js';

const JWT_SECRET = process.env.JWT_SECRET;

const getJWTSecret = (): string => {
  if (!JWT_SECRET) {
    throw new Error('JWT_SECRET is not configured');
  }

  return JWT_SECRET;
};

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    fullName: string;
    mobileNumber: string;
  };
}

export const requireAuth = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader =
      req.headers.authorization;

    if (
      !authHeader ||
      !authHeader.startsWith('Bearer ')
    ) {
      res.status(401).json({
        success: false,
        message:
          'Authentication token missing or invalid format',
      });
      return;
    }

    const token =
      authHeader.split(' ')[1];

    if (!token) {
      res.status(401).json({
        success: false,
        message: 'No token provided',
      });
      return;
    }

    let decoded: any;

    try {
      decoded = jwt.verify(
        token,
        getJWTSecret()
      );
    } catch (err) {
      res.status(401).json({
        success: false,
        message:
          'Invalid or expired token',
      });
      return;
    }

    if (
      !decoded ||
      !decoded.userId
    ) {
      res.status(401).json({
        success: false,
        message:
          'Malformed token payload',
      });
      return;
    }

    const user =
      await StorageProvider.findUserById(
        decoded.userId
      );

    if (!user) {
      res.status(401).json({
        success: false,
        message:
          'User belonging to this token no longer exists',
      });
      return;
    }

    req.user = {
      id: user._id,
      email: user.email,
      fullName: user.fullName,
      mobileNumber: user.mobileNumber,
    };

    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      message:
        'Internal authentication error',
    });
  }
};
