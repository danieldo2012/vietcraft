import dotenv from 'dotenv';
import path from 'path';

// Load .env from workspace root if available, otherwise from apps/api
dotenv.config({ path: path.resolve(__dirname, '../../../../.env') });
dotenv.config();

const isProduction = (process.env.NODE_ENV || 'development') === 'production';
const defaultMongoUri = isProduction ? '' : 'mongodb://127.0.0.1:27017/vietcraft';

export const ENV = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  IS_PRODUCTION: isProduction,
  PORT: parseInt(process.env.PORT || '5000', 10),
  MONGODB_URI: process.env.MONGODB_URI || defaultMongoUri,
  JWT_SECRET: process.env.JWT_SECRET || 'vietcraft_super_secret_jwt_key_development_only',
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || 'vietcraft_super_secret_refresh_jwt_key_development_only',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '1h',
  JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',
  ADMIN_URL: process.env.ADMIN_URL || 'http://localhost:5174',
  STORAGE_PROVIDER: process.env.STORAGE_PROVIDER || 'local',
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME || '',
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY || '',
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET || '',
  AMAZON_ASSOCIATE_TAG: process.env.AMAZON_ASSOCIATE_TAG || 'vietcraft-20',
  AMAZON_API_KEY: process.env.AMAZON_API_KEY || '',
  AMAZON_API_SECRET: process.env.AMAZON_API_SECRET || '',
  AMAZON_REGION: process.env.AMAZON_REGION || 'us-east-1',
  EMAIL_PROVIDER_API_KEY: process.env.EMAIL_PROVIDER_API_KEY || '',
  CONTACT_RECEIVER_EMAIL: process.env.CONTACT_RECEIVER_EMAIL || 'hello@vietcraft.com',
  INITIAL_ADMIN_NAME: process.env.INITIAL_ADMIN_NAME || 'VietCraft Admin',
  INITIAL_ADMIN_EMAIL: process.env.INITIAL_ADMIN_EMAIL || 'admin@vietcraft.com',
  INITIAL_ADMIN_PASSWORD: process.env.INITIAL_ADMIN_PASSWORD || 'AdminSecurePassword123!'
};
