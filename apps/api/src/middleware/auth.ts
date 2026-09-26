import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UserRole } from '@vietcraft/shared';
import { ENV } from '../config/env';
import { sendError } from '../utils/response';

export interface AuthPayload {
  userId: string;
  email: string;
  role: UserRole;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthPayload;
}

export const authenticate = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  let token: string | undefined;

  // Check Bearer token in header
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  } else if (req.cookies && req.cookies.access_token) {
    // Check cookie
    token = req.cookies.access_token;
  }

  if (!token) {
    sendError(res, 'Authentication required. No token provided.', 401);
    return;
  }

  try {
    const decoded = jwt.verify(token, ENV.JWT_SECRET) as AuthPayload;
    req.user = decoded;
    next();
  } catch (error) {
    sendError(res, 'Invalid or expired token.', 401);
    return;
  }
};

export const requireRole = (allowedRoles: UserRole | UserRole[]) => {
  const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      sendError(res, 'Authentication required.', 401);
      return;
    }

    if (!roles.includes(req.user.role)) {
      sendError(res, 'Forbidden. Insufficient permissions.', 403);
      return;
    }

    next();
  };
};

export const optionalAuthenticate = (req: AuthenticatedRequest, _res: Response, next: NextFunction): void => {
  let token: string | undefined;

  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  } else if (req.cookies && req.cookies.access_token) {
    token = req.cookies.access_token;
  }

  if (token) {
    try {
      const decoded = jwt.verify(token, ENV.JWT_SECRET) as AuthPayload;
      req.user = decoded;
    } catch {
      // Continue without user if token is invalid
    }
  }

  next();
};
