import { Response } from 'express';

export interface MetaData {
  page?: number;
  limit?: number;
  total?: number;
  totalPages?: number;
  [key: string]: any;
}

export const sendSuccess = <T>(
  res: Response,
  data: T,
  message = 'Operation successful',
  statusCode = 200,
  meta?: MetaData
) => {
  return res.status(statusCode).json({
    success: true,
    data,
    message,
    ...(meta ? { meta } : {})
  });
};

export const sendError = (
  res: Response,
  message = 'An error occurred',
  statusCode = 500,
  errors?: any
) => {
  return res.status(statusCode).json({
    success: false,
    data: null,
    message,
    ...(errors ? { errors } : {})
  });
};
