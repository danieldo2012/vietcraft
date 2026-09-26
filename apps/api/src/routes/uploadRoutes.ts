import { Router, Request, Response, NextFunction } from 'express';
import multer from 'multer';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { uploadImage, deleteImage } from '../controllers/uploadController';
import { authenticate, requireRole } from '../middleware/auth';
import { sendError } from '../utils/response';
import { ALLOWED_IMAGE_MIME_TYPES, ALLOWED_IMAGE_EXTENSIONS, MAX_IMAGE_FILE_SIZE } from '../utils/imageValidator';
import { ENV } from '../config/env';

const router = Router();

// Rate limiting for image uploads to prevent abuse (disabled during testing)
const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 upload requests per window
  message: {
    success: false,
    message: 'Too many upload requests. Please try again later.'
  },
  skip: () => ENV.NODE_ENV === 'test'
});

// Configure Multer with memory storage, file size limits and MIME filters
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: MAX_IMAGE_FILE_SIZE
  },
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const isAllowedMime = ALLOWED_IMAGE_MIME_TYPES.includes(file.mimetype);
    const isAllowedExt = ALLOWED_IMAGE_EXTENSIONS.includes(ext);

    if (isAllowedMime && isAllowedExt) {
      cb(null, true);
    } else {
      cb(
        new Error(
          `Invalid file type. Only image files (JPEG, PNG, WebP, AVIF, GIF, SVG) are allowed.`
        )
      );
    }
  }
});

// Multer error handling wrapper to ensure 400 Bad Request on file limit or filter errors
const multerUploadMiddleware = (req: Request, res: Response, next: NextFunction) => {
  upload.single('image')(req, res, (err: any) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return sendError(res, 'File size exceeds 10MB limit.', 400);
      }
      return sendError(res, `Upload failed: ${err.message}`, 400);
    } else if (err) {
      return sendError(res, err.message || 'Invalid image upload', 400);
    }
    next();
  });
};

// Route: POST /api/upload
// Requires authentication & admin/editor role
router.post(
  '/',
  uploadLimiter,
  authenticate,
  requireRole(['admin', 'editor']),
  multerUploadMiddleware,
  uploadImage
);

// Route: DELETE /api/upload/:publicId(*)
// Requires authentication & admin/editor role
router.delete(
  '/:publicId(*)',
  authenticate,
  requireRole(['admin', 'editor']),
  deleteImage
);

// Route: DELETE /api/upload (with { publicId } in body or query)
router.delete(
  '/',
  authenticate,
  requireRole(['admin', 'editor']),
  deleteImage
);

export default router;
