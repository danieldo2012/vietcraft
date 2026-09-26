import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';
import { sendError } from '../utils/response';

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  logger.error(`Error processing ${req.method} ${req.url}:`, err);

  // Mongoose CastError (e.g. invalid ObjectId)
  if (err.name === 'CastError') {
    sendError(res, `Invalid format for field: ${err.path}`, 400);
    return;
  }

  // Mongoose Duplicate Key Error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    sendError(res, `A record with this ${field} already exists.`, 409);
    return;
  }

  // Mongoose Validation Error
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors || {}).map((e: any) => ({
      field: e.path,
      message: e.message
    }));
    sendError(res, 'Validation error', 400, errors);
    return;
  }

  // JSON Body Parse Error
  if (err.type === 'entity.parse.failed') {
    sendError(res, 'Malformed JSON in request body', 400);
    return;
  }

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal server error';

  sendError(res, message, statusCode);
};
