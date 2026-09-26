import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { ENV } from '../config/env';
import { sendError, sendSuccess } from '../utils/response';
import { AuthenticatedRequest } from '../middleware/auth';

const generateTokens = (userId: string, email: string, role: string) => {
  const token = jwt.sign({ userId, email, role }, ENV.JWT_SECRET, {
    expiresIn: ENV.JWT_EXPIRES_IN as any
  });
  const refreshToken = jwt.sign({ userId, email, role }, ENV.JWT_REFRESH_SECRET, {
    expiresIn: ENV.JWT_REFRESH_EXPIRES_IN as any
  });
  return { token, refreshToken };
};

export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password +passwordHash');
    if (!user) {
      sendError(res, 'Invalid email or password', 401);
      return;
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      sendError(res, 'Invalid email or password', 401);
      return;
    }

    user.lastLoginAt = new Date();
    if (!user.password && user.passwordHash) {
      user.password = user.passwordHash;
    }
    await user.save();

    const { token, refreshToken } = generateTokens(user._id.toString(), user.email, user.role);

    // Set HTTP-only cookie for refresh token
    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: ENV.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    sendSuccess(res, {
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar
      }
    }, 'Login successful');
  } catch (error) {
    next(error);
  }
};

export const refresh = async (req: Request, res: Response): Promise<void> => {
  const refreshToken = req.cookies?.refresh_token || req.body?.refreshToken;

  if (!refreshToken) {
    sendError(res, 'Refresh token required', 401);
    return;
  }

  try {
    const decoded = jwt.verify(refreshToken, ENV.JWT_REFRESH_SECRET) as any;
    const user = await User.findById(decoded.userId);
    if (!user) {
      sendError(res, 'User not found', 401);
      return;
    }

    const { token, refreshToken: newRefreshToken } = generateTokens(
      user._id.toString(),
      user.email,
      user.role
    );

    res.cookie('refresh_token', newRefreshToken, {
      httpOnly: true,
      secure: ENV.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    sendSuccess(res, {
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar
      }
    }, 'Token refreshed');
  } catch (error) {
    sendError(res, 'Invalid or expired refresh token', 401);
  }
};

export const logout = async (req: Request, res: Response): Promise<void> => {
  res.clearCookie('refresh_token');
  res.clearCookie('access_token');
  sendSuccess(res, null, 'Logged out successfully');
};

export const getMe = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      sendError(res, 'Unauthorized', 401);
      return;
    }

    const user = await User.findById(req.user.userId);
    if (!user) {
      sendError(res, 'User not found', 404);
      return;
    }

    sendSuccess(res, {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      lastLoginAt: user.lastLoginAt
    }, 'User profile retrieved');
  } catch (error) {
    next(error);
  }
};
