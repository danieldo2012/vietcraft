import { describe, it, expect, vi } from 'vitest';
import request from 'supertest';
import path from 'path';
import fs from 'fs';
import jwt from 'jsonwebtoken';
import { createApp } from '../src/app';
import { ENV } from '../src/config/env';
import {
  LocalStorageProvider,
  CloudinaryStorageProvider,
  StorageService,
  storageService
} from '../src/services/StorageService';
import { v2 as cloudinary } from 'cloudinary';

const app = createApp();

// Generate tokens directly via JWT secret - no MongoMemoryServer required
const adminToken = jwt.sign(
  { userId: '65f1a2b3c4d5e6f7a8b9c0d1', email: 'admin@vietcraft.com', role: 'admin' },
  ENV.JWT_SECRET,
  { expiresIn: '1h' }
);

// Sample valid image buffers with correct magic bytes
const VALID_PNG_BUFFER = Buffer.from([
  0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
  0x00, 0x00, 0x00, 0x0d, 0x49, 0x48, 0x44, 0x52,
  0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
  0x08, 0x06, 0x00, 0x00, 0x00, 0x1f, 0x15, 0xc4, 0x89
]);

const VALID_JPEG_BUFFER = Buffer.from([
  0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46,
  0x49, 0x46, 0x00, 0x01, 0x01, 0x01, 0x00, 0x60,
  0x00, 0x60, 0x00, 0x00, 0xff, 0xdb
]);

describe('1. LocalStorageProvider', () => {
  const localProvider = new LocalStorageProvider();
  let uploadedPublicId: string;

  it('should upload image buffer to local storage directory', async () => {
    const mockFile: Express.Multer.File = {
      fieldname: 'image',
      originalname: 'artisan-vase.png',
      encoding: '7bit',
      mimetype: 'image/png',
      buffer: VALID_PNG_BUFFER,
      size: VALID_PNG_BUFFER.length,
      destination: '',
      filename: '',
      path: '',
      stream: null as any
    };

    const result = await localProvider.upload(mockFile);

    expect(result).toBeDefined();
    expect(result.url).toMatch(/^\/uploads\/\d+-artisan-vase\.png$/);
    expect(result.publicId).toMatch(/^\d+-artisan-vase\.png$/);
    expect(result.provider).toBe('local');
    expect(result.format).toBe('png');
    expect(result.bytes).toBe(VALID_PNG_BUFFER.length);

    uploadedPublicId = result.publicId;

    // Verify file exists on disk in uploads directory
    const expectedPath = path.resolve(__dirname, '../uploads', uploadedPublicId);
    expect(fs.existsSync(expectedPath)).toBe(true);
  });

  it('should delete existing uploaded file from local storage', async () => {
    expect(uploadedPublicId).toBeDefined();
    const deleted = await localProvider.delete(uploadedPublicId);
    expect(deleted).toBe(true);

    const expectedPath = path.resolve(__dirname, '../uploads', uploadedPublicId);
    expect(fs.existsSync(expectedPath)).toBe(false);
  });

  it('should return false when deleting non-existent local file', async () => {
    const deleted = await localProvider.delete('non-existent-file-12345.png');
    expect(deleted).toBe(false);
  });

  it('should generate correct public URL', () => {
    const url = localProvider.getPublicUrl('test-sample.jpg');
    expect(url).toBe('/uploads/test-sample.jpg');
  });
});

describe('2. CloudinaryStorageProvider (Mocked)', () => {
  it('should upload image stream to Cloudinary and return secure URL', async () => {
    const cloudinaryProvider = new CloudinaryStorageProvider();

    // Mock isConfigured to true for test
    vi.spyOn(cloudinaryProvider, 'isConfigured').mockReturnValue(true);

    // Mock cloudinary.uploader.upload_stream
    const mockUploadResponse = {
      secure_url: 'https://res.cloudinary.com/vietcraft/image/upload/v1711382400/vietcraft/artisan-tray.webp',
      url: 'http://res.cloudinary.com/vietcraft/image/upload/v1711382400/vietcraft/artisan-tray.webp',
      public_id: 'vietcraft/artisan-tray',
      format: 'webp',
      bytes: 42100,
      width: 1200,
      height: 800
    };

    const uploadStreamSpy = vi.spyOn(cloudinary.uploader, 'upload_stream').mockImplementation((options: any, callback: any) => {
      // Verify automatic format and quality transformations are specified
      expect(options.folder).toBe('vietcraft');
      expect(options.transformation).toEqual([{ quality: 'auto', fetch_format: 'auto' }]);

      // Simulate stream end event calling callback
      const streamMock: any = {
        end: vi.fn((_buf: Buffer) => {
          callback(null, mockUploadResponse);
        })
      };
      return streamMock;
    });

    const mockFile: Express.Multer.File = {
      fieldname: 'image',
      originalname: 'artisan-tray.jpg',
      encoding: '7bit',
      mimetype: 'image/jpeg',
      buffer: VALID_JPEG_BUFFER,
      size: VALID_JPEG_BUFFER.length,
      destination: '',
      filename: '',
      path: '',
      stream: null as any
    };

    const result = await cloudinaryProvider.upload(mockFile);

    expect(result.url).toBe(mockUploadResponse.secure_url);
    expect(result.publicId).toBe('vietcraft/artisan-tray');
    expect(result.provider).toBe('cloudinary');
    expect(result.format).toBe('webp');
    expect(result.width).toBe(1200);
    expect(result.height).toBe(800);

    uploadStreamSpy.mockRestore();
  });

  it('should delete asset from Cloudinary via public_id', async () => {
    const cloudinaryProvider = new CloudinaryStorageProvider();
    vi.spyOn(cloudinaryProvider, 'isConfigured').mockReturnValue(true);

    const destroySpy = vi.spyOn(cloudinary.uploader, 'destroy').mockResolvedValue({
      result: 'ok'
    });

    const deleted = await cloudinaryProvider.delete('vietcraft/artisan-tray');
    expect(deleted).toBe(true);
    expect(destroySpy).toHaveBeenCalledWith('vietcraft/artisan-tray', { resource_type: 'image' });

    destroySpy.mockRestore();
  });

  it('should safely refuse to delete external URLs like Unsplash without error', async () => {
    const cloudinaryProvider = new CloudinaryStorageProvider();
    vi.spyOn(cloudinaryProvider, 'isConfigured').mockReturnValue(true);

    const destroySpy = vi.spyOn(cloudinary.uploader, 'destroy');

    const result = await cloudinaryProvider.delete('https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80');
    expect(result).toBe(false);
    expect(destroySpy).not.toHaveBeenCalled();
  });
});

describe('3. StorageService provider switching', () => {
  it('should delegate to current provider and allow dynamic provider swapping', async () => {
    const mockProvider = {
      upload: vi.fn().mockResolvedValue({
        url: 'https://cdn.example.com/custom.webp',
        publicId: 'custom-123',
        provider: 'local' as const
      }),
      delete: vi.fn().mockResolvedValue(true),
      getPublicUrl: vi.fn().mockReturnValue('https://cdn.example.com/custom.webp')
    };

    const customService = new StorageService(mockProvider);
    expect(customService.getProvider()).toBe(mockProvider);

    const mockFile = { buffer: VALID_PNG_BUFFER } as any;
    const res = await customService.upload(mockFile);

    expect(mockProvider.upload).toHaveBeenCalledWith(mockFile, undefined);
    expect(res.url).toBe('https://cdn.example.com/custom.webp');

    await customService.delete('custom-123');
    expect(mockProvider.delete).toHaveBeenCalledWith('custom-123');
  });
});

describe('4. Upload API Endpoint (POST /api/upload)', () => {
  it('should return 401 when uploading without authentication', async () => {
    const res = await request(app)
      .post('/api/upload')
      .attach('image', VALID_PNG_BUFFER, 'test.png');

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('should return 400 when no file is uploaded', async () => {
    const res = await request(app)
      .post('/api/upload')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/No file uploaded/i);
  });

  it('should accept valid PNG image upload from authenticated admin', async () => {
    const res = await request(app)
      .post('/api/upload')
      .set('Authorization', `Bearer ${adminToken}`)
      .attach('image', VALID_PNG_BUFFER, 'artisanal-lantern.png');

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.url).toMatch(/^\/uploads\/\d+-artisanal-lantern\.png$/);
    expect(res.body.data.publicId).toBeDefined();

    // Clean up created file
    await storageService.delete(res.body.data.publicId);
  });

  it('should accept valid JPEG image upload from authenticated admin', async () => {
    const res = await request(app)
      .post('/api/upload')
      .set('Authorization', `Bearer ${adminToken}`)
      .attach('image', VALID_JPEG_BUFFER, 'bamboo-basket.jpg');

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.url).toMatch(/^\/uploads\/\d+-bamboo-basket\.jpg$/);

    // Clean up created file
    await storageService.delete(res.body.data.publicId);
  });

  it('should reject unpermitted file extensions (.txt)', async () => {
    const textBuffer = Buffer.from('Plain text content');
    const res = await request(app)
      .post('/api/upload')
      .set('Authorization', `Bearer ${adminToken}`)
      .attach('image', textBuffer, 'notes.txt');

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/Invalid file type|Only image files/i);
  });

  it('should reject disguised files where buffer content does not match image signatures', async () => {
    // Malicious file: plain text pretending to be a JPG
    const fakeImageBuffer = Buffer.from('<?php echo "Not a real image"; ?>');
    const res = await request(app)
      .post('/api/upload')
      .set('Authorization', `Bearer ${adminToken}`)
      .attach('image', fakeImageBuffer, 'fake.jpg');

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/signature|security/i);
  });
});

describe('5. Delete API Endpoint (DELETE /api/upload/:publicId)', () => {
  it('should return 401 when deleting image without authentication', async () => {
    const res = await request(app)
      .delete('/api/upload/test-image.jpg');

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('should allow authenticated admin to delete image', async () => {
    // First upload an image to delete
    const uploadRes = await request(app)
      .post('/api/upload')
      .set('Authorization', `Bearer ${adminToken}`)
      .attach('image', VALID_PNG_BUFFER, 'to-delete.png');

    expect(uploadRes.status).toBe(201);
    const publicId = uploadRes.body.data.publicId;

    // Delete it via DELETE /api/upload/:publicId
    const deleteRes = await request(app)
      .delete(`/api/upload/${publicId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(deleteRes.status).toBe(200);
    expect(deleteRes.body.success).toBe(true);
    expect(deleteRes.body.data.deleted).toBe(true);
  });
});
