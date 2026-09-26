import fs from 'fs';
import path from 'path';
import { v2 as cloudinary, UploadApiOptions, UploadApiResponse } from 'cloudinary';
import { ENV } from '../config/env';

export interface StorageUploadResult {
  url: string;
  publicId: string;
  provider: 'local' | 'cloudinary';
  format?: string;
  bytes?: number;
  width?: number;
  height?: number;
}

export interface IStorageProvider {
  upload(file: Express.Multer.File, options?: { folder?: string }): Promise<StorageUploadResult>;
  delete(publicId: string): Promise<boolean>;
  getPublicUrl(publicId: string, options?: Record<string, any>): string;
}

export class LocalStorageProvider implements IStorageProvider {
  private uploadDir: string;

  constructor(customUploadDir?: string) {
    this.uploadDir = customUploadDir || path.resolve(__dirname, '../../uploads');
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  async upload(file: Express.Multer.File): Promise<StorageUploadResult> {
    const rawExt = path.extname(file.originalname).toLowerCase() || '.jpg';
    const baseName = path.basename(file.originalname, rawExt).replace(/[^a-zA-Z0-9.-]/g, '_');
    const filename = `${Date.now()}-${baseName}${rawExt}`;
    const destination = path.join(this.uploadDir, filename);

    if (file.buffer) {
      fs.writeFileSync(destination, file.buffer);
    } else if (file.path && fs.existsSync(file.path)) {
      fs.copyFileSync(file.path, destination);
      try {
        fs.unlinkSync(file.path);
      } catch {
        // Ignore unlink error for temporary file
      }
    } else {
      throw new Error('No file buffer or path provided for local upload');
    }

    const url = `/uploads/${filename}`;
    return {
      url,
      publicId: filename,
      provider: 'local',
      format: rawExt.replace('.', ''),
      bytes: file.size || (file.buffer ? file.buffer.length : 0)
    };
  }

  async delete(publicId: string): Promise<boolean> {
    if (!publicId) return false;
    // Prevent directory traversal attacks and strip query params or leading /uploads/
    const cleanId = publicId.replace(/^\/?uploads\//, '').split('?')[0];
    const safeFilename = path.basename(cleanId);
    const filePath = path.join(this.uploadDir, safeFilename);

    if (fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
        return true;
      } catch (err) {
        console.error(`[LocalStorageProvider] Failed to delete file ${filePath}:`, err);
        return false;
      }
    }
    return false;
  }

  getPublicUrl(publicId: string): string {
    const cleanId = publicId.replace(/^\/?uploads\//, '');
    return `/uploads/${cleanId}`;
  }
}

export class CloudinaryStorageProvider implements IStorageProvider {
  private configured: boolean = false;

  constructor() {
    this.init();
  }

  private init(): void {
    if (this.isConfigured()) {
      cloudinary.config({
        cloud_name: ENV.CLOUDINARY_CLOUD_NAME,
        api_key: ENV.CLOUDINARY_API_KEY,
        api_secret: ENV.CLOUDINARY_API_SECRET,
        secure: true
      });
      this.configured = true;
    }
  }

  isConfigured(): boolean {
    return Boolean(
      ENV.CLOUDINARY_CLOUD_NAME &&
      ENV.CLOUDINARY_API_KEY &&
      ENV.CLOUDINARY_API_SECRET
    );
  }

  async upload(file: Express.Multer.File, options?: { folder?: string }): Promise<StorageUploadResult> {
    if (!this.isConfigured()) {
      throw new Error(
        'Cloudinary is not configured. Please define CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET.'
      );
    }

    if (!file.buffer) {
      throw new Error('File buffer is empty or missing');
    }

    const uploadOptions: UploadApiOptions = {
      folder: options?.folder || 'vietcraft',
      resource_type: 'image',
      // Automatic modern format delivery (WebP/AVIF) and quality compression
      transformation: [
        {
          quality: 'auto',
          fetch_format: 'auto'
        }
      ]
    };

    const result = await new Promise<UploadApiResponse>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(uploadOptions, (error, uploadResult) => {
        if (error) {
          return reject(error);
        }
        if (!uploadResult) {
          return reject(new Error('Cloudinary returned empty upload response'));
        }
        resolve(uploadResult);
      });
      stream.end(file.buffer);
    });

    return {
      url: result.secure_url || result.url,
      publicId: result.public_id,
      provider: 'cloudinary',
      format: result.format,
      bytes: result.bytes,
      width: result.width,
      height: result.height
    };
  }

  async delete(publicId: string): Promise<boolean> {
    if (!publicId) return false;
    if (!this.isConfigured()) {
      console.warn('[CloudinaryStorageProvider] Delete skipped: Cloudinary credentials not configured.');
      return false;
    }

    // Never attempt to delete external media (e.g., Unsplash, raw HTTP URLs from other domains)
    if (publicId.startsWith('http://') || publicId.startsWith('https://')) {
      if (!publicId.includes('res.cloudinary.com')) {
        // External third-party URL (e.g. Unsplash) - safe no-op
        return false;
      }
      // Extract Cloudinary public_id from URL
      const extracted = this.extractPublicIdFromUrl(publicId);
      if (!extracted) return false;
      publicId = extracted;
    }

    try {
      const res = await cloudinary.uploader.destroy(publicId, { resource_type: 'image' });
      return res.result === 'ok' || res.result === 'not found';
    } catch (err) {
      console.error(`[CloudinaryStorageProvider] Failed to delete asset ${publicId}:`, err);
      return false;
    }
  }

  getPublicUrl(publicId: string, options?: Record<string, any>): string {
    return cloudinary.url(publicId, {
      secure: true,
      quality: 'auto',
      fetch_format: 'auto',
      ...options
    });
  }

  private extractPublicIdFromUrl(url: string): string | null {
    try {
      const parts = url.split('/upload/');
      if (parts.length < 2) return null;
      // Strip version number like v1234567/ if present
      const afterUpload = parts[1].replace(/^v\d+\//, '');
      // Strip extension (.jpg, .png, etc.)
      const publicIdWithExt = afterUpload.split('?')[0];
      const lastDot = publicIdWithExt.lastIndexOf('.');
      return lastDot !== -1 ? publicIdWithExt.substring(0, lastDot) : publicIdWithExt;
    } catch {
      return null;
    }
  }
}

export class StorageService {
  private provider: IStorageProvider;

  constructor(provider?: IStorageProvider) {
    this.provider = provider || getStorageProvider();
  }

  setProvider(provider: IStorageProvider): void {
    this.provider = provider;
  }

  getProvider(): IStorageProvider {
    return this.provider;
  }

  async upload(file: Express.Multer.File, options?: { folder?: string }): Promise<StorageUploadResult> {
    return this.provider.upload(file, options);
  }

  async delete(publicId: string): Promise<boolean> {
    return this.provider.delete(publicId);
  }

  getPublicUrl(publicId: string, options?: Record<string, any>): string {
    return this.provider.getPublicUrl(publicId, options);
  }
}

export const getStorageProvider = (providerType?: string): IStorageProvider => {
  const selected = (providerType || ENV.STORAGE_PROVIDER || 'local').toLowerCase();
  if (selected === 'cloudinary') {
    return new CloudinaryStorageProvider();
  }
  return new LocalStorageProvider();
};

export const storageService = new StorageService();
