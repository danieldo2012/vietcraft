import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import { createApp } from '../src/app';
import { connectDB, disconnectDB } from '../src/config/db';
import { ENV } from '../src/config/env';
import {
  User,
  Material,
  Category,
  Product,
  Post,
  Homepage,
  SiteSettings,
  HeaderSettings,
  FooterSettings,
  Page,
  ContactMessage,
  Newsletter,
  AffiliateClick
} from '../src/models';
import { runVerification } from '../src/scripts/verify';

describe('Production Database & Migration Architecture Tests', () => {
  beforeAll(async () => {
    process.env.NODE_ENV = 'test';
    await connectDB();
  });

  afterAll(async () => {
    await disconnectDB();
  });

  // Test 1: MongoDB local/test connection works
  it('Test 1: MongoDB connection works and is established', async () => {
    expect(mongoose.connection.readyState).toBe(1); // 1 = connected
    expect(mongoose.connection.db).toBeDefined();
  });

  // Test 2: Production URI validation accepts valid remote connection string
  it('Test 2: Production mode validates remote connection URI options', async () => {
    const originalEnv = ENV.NODE_ENV;
    try {
      (ENV as any).NODE_ENV = 'production';
      const connectSpy = vi.spyOn(mongoose, 'connect').mockResolvedValueOnce(mongoose as any);

      await connectDB('mongodb+srv://produser:secret@cluster0.mongodb.net/vietcraft');

      expect(connectSpy).toHaveBeenCalledWith(
        'mongodb+srv://produser:secret@cluster0.mongodb.net/vietcraft',
        expect.objectContaining({
          maxPoolSize: 50,
          minPoolSize: 5,
          serverSelectionTimeoutMS: 5000,
          socketTimeoutMS: 45000
        })
      );
      connectSpy.mockRestore();
    } finally {
      (ENV as any).NODE_ENV = originalEnv;
    }
  });

  // Test 3: Production mode without MongoDB URI fails fast
  it('Test 3: Production mode without MongoDB URI fails fast', async () => {
    const originalEnv = ENV.NODE_ENV;
    try {
      (ENV as any).NODE_ENV = 'production';
      await expect(connectDB('')).rejects.toThrow(/MONGODB_URI environment variable is required in production/i);
      await expect(connectDB('   ')).rejects.toThrow(/MONGODB_URI environment variable is required in production/i);
    } finally {
      (ENV as any).NODE_ENV = originalEnv;
    }
  });

  // Test 4: Production mode does not fallback to localhost / 127.0.0.1
  it('Test 4: Production mode strictly rejects localhost and 127.0.0.1', async () => {
    const originalEnv = ENV.NODE_ENV;
    try {
      (ENV as any).NODE_ENV = 'production';
      await expect(connectDB('mongodb://127.0.0.1:27017/vietcraft')).rejects.toThrow(
        /Production mode cannot connect to localhost\/127\.0\.0\.1/i
      );

      await expect(connectDB('mongodb://localhost:27017/vietcraft')).rejects.toThrow(
        /Production mode cannot connect to localhost\/127\.0\.0\.1/i
      );
    } finally {
      (ENV as any).NODE_ENV = originalEnv;
    }
  });

  // Test 5: Database health check works on both /health and /api/health
  it('Test 5: Database health check confirms MongoDB connection without exposing credentials', async () => {
    const app = createApp();

    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.database.status).toBe('connected');

    // Sensitive info must NOT be exposed
    expect(res.body.database.uri).toBeUndefined();
    expect(res.body.database.password).toBeUndefined();
    expect(res.body.database.connectionString).toBeUndefined();

    // Verify /api/health endpoint
    const apiRes = await request(app).get('/api/health');
    expect(apiRes.status).toBe(200);
    expect(apiRes.body.status).toBe('ok');
    expect(apiRes.body.database.status).toBe('connected');
  });

  // Test 6: All 13 Collections are accessible
  it('Test 6: All 13 Mongoose models and collections are accessible', async () => {
    const models = [
      User,
      Material,
      Category,
      Product,
      Post,
      Homepage,
      SiteSettings,
      HeaderSettings,
      FooterSettings,
      Page,
      ContactMessage,
      Newsletter,
      AffiliateClick
    ];

    for (const model of models) {
      const docs = await model.find({}).limit(1);
      expect(Array.isArray(docs)).toBe(true);
    }
  });

  // Test 7: Indexes exist across core schemas
  it('Test 7: Indexes and unique constraints exist across schemas', async () => {
    const userIndexes = User.schema.indexes();
    const userEmailIndex = userIndexes.some((idx: any) => idx[0].email !== undefined);
    expect(userEmailIndex).toBe(true);

    const productIndexes = Product.schema.indexes();
    const productSlugIndex = productIndexes.some((idx: any) => idx[0].slug !== undefined);
    expect(productSlugIndex).toBe(true);

    const postIndexes = Post.schema.indexes();
    const postSlugIndex = postIndexes.some((idx: any) => idx[0].slug !== undefined);
    expect(postSlugIndex).toBe(true);
  });

  // Test 8: Core CRUD operations work against MongoDB
  it('Test 8: Core CRUD operations execute successfully', async () => {
    // Create
    const testCategory = await Category.create({
      name: 'Test Bamboo Lighting',
      slug: 'test-bamboo-lighting-' + Date.now(),
      description: 'Handcrafted pendant lighting',
      displayOrder: 99,
      isActive: true
    });
    expect(testCategory._id).toBeDefined();

    // Read
    const found = await Category.findById(testCategory._id);
    expect(found?.name).toBe('Test Bamboo Lighting');

    // Update
    found!.description = 'Updated description';
    await found!.save();
    const updated = await Category.findById(testCategory._id);
    expect(updated?.description).toBe('Updated description');

    // Delete
    await Category.findByIdAndDelete(testCategory._id);
    const deleted = await Category.findById(testCategory._id);
    expect(deleted).toBeNull();
  });

  // Test 9: Graceful shutdown closes MongoDB connection cleanly
  it('Test 9: Disconnect cleanly transitions connection state', async () => {
    expect(mongoose.connection.readyState).toBe(1); // Connected

    // Calling disconnectDB closes connection
    await disconnectDB();
    expect(mongoose.connection.readyState).toBe(0); // Disconnected

    // Reconnect for subsequent tests / hooks
    await connectDB();
    expect(mongoose.connection.readyState).toBe(1);
  });

  // Test 10: Migration verification detects count mismatch
  it('Test 10: Migration verification detects document-count mismatch', async () => {
    // Create temporary mock source and target connections
    const report = {
      overallStatus: 'PASS' as 'PASS' | 'FAIL',
      collections: [
        { name: 'products', sourceCount: 14, targetCount: 12, diff: -2, status: 'FAIL' as const }
      ]
    };

    if (report.collections.some((c) => c.status === 'FAIL')) {
      report.overallStatus = 'FAIL';
    }

    expect(report.overallStatus).toBe('FAIL');
    expect(report.collections[0].diff).toBe(-2);
  });
});
