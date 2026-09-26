import { Request, Response } from 'express';
import { storageService } from '../services/StorageService';
import { sendError, sendSuccess } from '../utils/response';
import { validateImageFile } from '../utils/imageValidator';

export const uploadImage = async (req: Request, res: Response): Promise<void> => {
  if (!req.file) {
    sendError(res, 'No file uploaded', 400);
    return;
  }

  // Rigorous validation: extension, MIME type, size, and buffer magic bytes
  const validation = validateImageFile(req.file);
  if (!validation.valid) {
    sendError(res, validation.error || 'Invalid image file', 400);
    return;
  }

  try {
    const result = await storageService.upload(req.file);
    sendSuccess(res, result, 'Image uploaded successfully', 201);
  } catch (error: any) {
    console.error('[UploadController] Upload failed:', error);
    sendError(res, error.message || 'Image upload failed', 500);
  }
};

export const deleteImage = async (req: Request, res: Response): Promise<void> => {
  const publicId = req.params.publicId || req.body?.publicId || (req.query?.publicId as string);

  if (!publicId) {
    sendError(res, 'Image publicId is required', 400);
    return;
  }

  try {
    const success = await storageService.delete(publicId);
    sendSuccess(
      res,
      { deleted: success, publicId },
      success ? 'Image deleted successfully' : 'Image not found or not managed by active storage provider',
      200
    );
  } catch (error: any) {
    console.error('[UploadController] Delete failed:', error);
    sendError(res, error.message || 'Image deletion failed', 500);
  }
};
