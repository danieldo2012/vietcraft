import express, { Application, Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import path from 'path';
import fs from 'fs';
import { ENV } from './config/env';
import routes from './routes';
import { errorHandler } from './middleware/errorHandler';
import { sendError } from './utils/response';

export const createApp = (): Application => {
  const app = express();

  // Ensure uploads directory exists
  const uploadDir = path.resolve(__dirname, '../uploads');
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  // Security headers
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' }
    })
  );

  // CORS configuration
  const allowedOrigins = [
    ENV.CLIENT_URL,
    ENV.ADMIN_URL,
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:3000',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:5174'
  ];

  app.use(
    cors({
      origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps, curl, server-to-server)
        if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          callback(null, true); // Permissive in dev, tighten in production if required
        }
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
    })
  );

  // Body parsers
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));
  app.use(cookieParser());

  // Logging
  if (ENV.NODE_ENV !== 'test') {
    app.use(morgan('dev'));
  }

  // Static uploads
  app.use('/uploads', express.static(uploadDir));

  // Database-aware Health check (mounted on /health and /api/health)
  const healthCheckHandler = (_req: Request, res: Response) => {
    const readyState = mongoose.connection.readyState;
    const dbStatusMap: Record<number, string> = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting'
    };
    const dbStatus = dbStatusMap[readyState] || 'unknown';
    const isHealthy = readyState === 1;

    res.status(isHealthy ? 200 : 503).json({
      status: isHealthy ? 'ok' : 'degraded',
      service: 'vietcraft-api',
      timestamp: new Date().toISOString(),
      database: {
        status: dbStatus
      }
    });
  };

  app.get('/health', healthCheckHandler);
  app.get('/api/health', healthCheckHandler);

  // Master API router
  app.use('/api', routes);

  // 404 Route handler
  app.use((req: Request, res: Response) => {
    sendError(res, `Route not found: ${req.method} ${req.originalUrl}`, 404);
  });

  // Centralized Error handler
  app.use(errorHandler);

  return app;
};
