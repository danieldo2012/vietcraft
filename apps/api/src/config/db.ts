import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import fs from 'fs';
import { ENV } from './env';

let mongod: MongoMemoryServer | null = null;
let mongooseListenersAttached = false;

const attachMongooseListeners = () => {
  if (mongooseListenersAttached) return;

  mongoose.connection.on('connected', () => {
    if (ENV.NODE_ENV !== 'test') {
      console.log('[Database] MongoDB connection established.');
    }
  });

  mongoose.connection.on('error', (err) => {
    console.error('[Database] MongoDB connection error:', err.message);
  });

  mongoose.connection.on('disconnected', () => {
    if (ENV.NODE_ENV !== 'test') {
      console.warn('[Database] MongoDB connection disconnected.');
    }
  });

  mongoose.connection.on('reconnected', () => {
    if (ENV.NODE_ENV !== 'test') {
      console.log('[Database] MongoDB reconnected.');
    }
  });

  mongooseListenersAttached = true;
};

export const connectDB = async (customUri?: string): Promise<void> => {
  attachMongooseListeners();
  const uri = customUri !== undefined ? customUri : ENV.MONGODB_URI;

  try {
    // 1. Test Environment: In-memory MongoDB
    if (ENV.NODE_ENV === 'test') {
      const commonPaths = [
        'C:\\Program Files\\MongoDB\\Server\\8.3\\bin\\mongod.exe',
        'C:\\Program Files\\MongoDB\\Server\\8.0\\bin\\mongod.exe',
        'C:\\Program Files\\MongoDB\\Server\\7.0\\bin\\mongod.exe'
      ];
      if (!process.env.MONGOMS_SYSTEM_BINARY) {
        for (const p of commonPaths) {
          if (fs.existsSync(p)) {
            process.env.MONGOMS_SYSTEM_BINARY = p;
            break;
          }
        }
      }

      mongod = await MongoMemoryServer.create();
      const testUri = mongod.getUri();
      await mongoose.connect(testUri);
      return;
    }

    // 2. Production Environment: Strict Validation, No Fallback to Localhost
    if (ENV.NODE_ENV === 'production') {
      if (!uri || uri.trim() === '') {
        throw new Error(
          '[Database] FATAL: MONGODB_URI environment variable is required in production mode.'
        );
      }

      if (!uri.startsWith('mongodb://') && !uri.startsWith('mongodb+srv://')) {
        throw new Error(
          '[Database] FATAL: MONGODB_URI must be a valid MongoDB connection string starting with mongodb:// or mongodb+srv://.'
        );
      }

      if (uri.includes('127.0.0.1') || uri.includes('localhost')) {
        throw new Error(
          '[Database] FATAL: Production mode cannot connect to localhost/127.0.0.1. A valid MongoDB Atlas connection string is required.'
        );
      }

      try {
        await mongoose.connect(uri, {
          serverSelectionTimeoutMS: 5000,
          socketTimeoutMS: 45000,
          maxPoolSize: 50,
          minPoolSize: 5,
          heartbeatFrequencyMS: 10000
        });
        console.log('[Database] Production MongoDB successfully connected.');
        return;
      } catch (err: any) {
        console.error('[Database] FATAL: Production database connection failed:', err.message);
        throw new Error(`Production database connection failed: ${err.message}`);
      }
    }

    // 3. Development Environment: Connect to local MongoDB with in-memory fallback
    try {
      await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 5000,
        maxPoolSize: 20
      });
      const sanitized = uri.replace(/\/\/[^:]+:[^@]+@/, '//***:***@');
      console.log(`[Database] MongoDB successfully connected to ${sanitized}`);
    } catch (err: any) {
      console.warn(
        `[Database] Could not connect to local MongoDB at ${uri}. Falling back to in-memory MongoDB for local development.`
      );
      mongod = await MongoMemoryServer.create();
      const devMemoryUri = mongod.getUri();
      await mongoose.connect(devMemoryUri);
      console.log(`[Database] In-memory MongoDB successfully initialized at: ${devMemoryUri}`);
    }
  } catch (error) {
    console.error('[Database] Fatal database connection error:', error);
    throw error;
  }
};

export const disconnectDB = async (): Promise<void> => {
  try {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
    }
    if (mongod) {
      await mongod.stop();
      mongod = null;
    }
    if (ENV.NODE_ENV !== 'test') {
      console.log('[Database] MongoDB connection closed');
    }
  } catch (error) {
    console.error('[Database] Error during database disconnect:', error);
  }
};
