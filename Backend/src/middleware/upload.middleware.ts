import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/ApiError';

// Multer memory storage

const storage = multer.memoryStorage();

const fileFilter = (_req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new ApiError(400, 'Only JPEG, PNG, WebP, and AVIF images are allowed', 'INVALID_FILE_TYPE'));
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 10,
  },
});

// Upload buffer to Cloudinary
const uploadToCloudinary = (
  buffer: Buffer,
  folder: string,
): Promise<{ url: string; publicId: string }> =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: `shopsphere/${folder}`,
        transformation: [
          { width: 1200, height: 1200, crop: 'limit' },
          { quality: 'auto', fetch_format: 'auto' },
        ],
      },
      (error, result) => {
        if (error || !result) return reject(error ?? new Error('Cloudinary upload failed'));
        resolve({ url: result.secure_url, publicId: result.public_id });
      },
    );
    stream.end(buffer);
  });

export const processImages =
  (folder = 'media') =>
  async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      // Handle both single and array uploads
      const files = req.files ? (req.files as Express.Multer.File[]) : req.file ? [req.file] : [];

      if (!files.length) {
        (req as any).uploadedFiles = [];
        return next();
      }

      const results = await Promise.all(
        files.map((file) => uploadToCloudinary(file.buffer, folder)),
      );
      (req as any).uploadedFiles = results;
      next();
    } catch (err) {
      next(err);
    }
  };
