import path from 'path';

export const ALLOWED_IMAGE_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/avif',
  'image/gif',
  'image/svg+xml'
];

export const ALLOWED_IMAGE_EXTENSIONS = [
  '.jpg',
  '.jpeg',
  '.png',
  '.webp',
  '.avif',
  '.gif',
  '.svg'
];

export const MAX_IMAGE_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export interface ImageValidationResult {
  valid: boolean;
  error?: string;
  detectedFormat?: string;
}

/**
 * Validates file buffer magic bytes to ensure the content matches an allowed image format.
 * Prevents file disguising (e.g. executable or script renamed to .jpg).
 */
export function validateImageMagicBytes(buffer: Buffer): { valid: boolean; format?: string } {
  if (!buffer || buffer.length < 4) {
    return { valid: false };
  }

  // 1. JPEG: FF D8 FF
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return { valid: true, format: 'jpeg' };
  }

  // 2. PNG: 89 50 4E 47 0D 0A 1A 0A
  if (
    buffer.length >= 8 &&
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a
  ) {
    return { valid: true, format: 'png' };
  }

  // 3. GIF: 47 49 46 38 (GIF8)
  if (
    buffer[0] === 0x47 &&
    buffer[1] === 0x49 &&
    buffer[2] === 0x46 &&
    buffer[3] === 0x38
  ) {
    return { valid: true, format: 'gif' };
  }

  // 4. WebP: RIFF (4 bytes) + size (4 bytes) + WEBP (4 bytes)
  if (
    buffer.length >= 12 &&
    buffer[0] === 0x52 &&
    buffer[1] === 0x49 &&
    buffer[2] === 0x46 &&
    buffer[3] === 0x46 &&
    buffer[8] === 0x57 &&
    buffer[9] === 0x45 &&
    buffer[10] === 0x42 &&
    buffer[11] === 0x50
  ) {
    return { valid: true, format: 'webp' };
  }

  // 5. AVIF: 4 bytes size + 'ftyp' (4 bytes) + 'avif' / 'avis' / 'mif1'
  if (buffer.length >= 12) {
    const ftyp = buffer.toString('ascii', 4, 8);
    if (ftyp === 'ftyp') {
      const brand = buffer.toString('ascii', 8, 12);
      if (['avif', 'avis', 'mif1', 'msf1'].includes(brand)) {
        return { valid: true, format: 'avif' };
      }
    }
  }

  // 6. SVG: XML or SVG tag in header
  const headerStr = buffer.slice(0, Math.min(buffer.length, 1024)).toString('utf8').trim();
  if (
    headerStr.startsWith('<?xml') ||
    headerStr.startsWith('<svg') ||
    headerStr.includes('<svg')
  ) {
    return { valid: true, format: 'svg' };
  }

  return { valid: false };
}

/**
 * Validates an uploaded Express.Multer file against extension, MIME type, file size, and magic bytes.
 */
export function validateImageFile(file: Express.Multer.File): ImageValidationResult {
  if (!file) {
    return { valid: false, error: 'No image file provided' };
  }

  // Check file size
  if (file.size > MAX_IMAGE_FILE_SIZE) {
    return {
      valid: false,
      error: `File size exceeds the 10MB limit. Received: ${(file.size / (1024 * 1024)).toFixed(2)}MB`
    };
  }

  // Check file extension
  const ext = path.extname(file.originalname).toLowerCase();
  if (!ALLOWED_IMAGE_EXTENSIONS.includes(ext)) {
    return {
      valid: false,
      error: `Invalid file extension '${ext}'. Allowed extensions: ${ALLOWED_IMAGE_EXTENSIONS.join(', ')}`
    };
  }

  // Check MIME type
  if (!ALLOWED_IMAGE_MIME_TYPES.includes(file.mimetype)) {
    return {
      valid: false,
      error: `Invalid MIME type '${file.mimetype}'. Allowed MIME types: ${ALLOWED_IMAGE_MIME_TYPES.join(', ')}`
    };
  }

  // Check buffer magic bytes if buffer is present
  if (file.buffer && file.buffer.length > 0) {
    const magicCheck = validateImageMagicBytes(file.buffer);
    if (!magicCheck.valid) {
      return {
        valid: false,
        error: 'File content does not match an allowed image signature (JPEG, PNG, WebP, AVIF, GIF, SVG). File rejected for security reasons.'
      };
    }
    return { valid: true, detectedFormat: magicCheck.format };
  }

  return { valid: true };
}
