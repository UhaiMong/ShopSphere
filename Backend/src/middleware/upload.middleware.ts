import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/ApiError";

// ─── Multer memory storage
// Files are held in memory as Buffer, then streamed to Cloudinary.
// Never written to disk → safe for serverless and containerized environments.

const storage = multer.memoryStorage();

const fileFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback,
) => {
  const allowed = ["image/jpeg", "image/png", "image/webp", "image/avif"];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new ApiError(
        400,
        "Only JPEG, PNG, WebP, and AVIF images are allowed",
        "INVALID_FILE_TYPE",
      ),
    );
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB per file
    files: 10, // Max 10 images per product
  },
});

// ─── Upload buffer to Cloudinary
const uploadToCloudinary = (buffer: Buffer, folder: string): Promise<string> =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: `shopsphere/${folder}`,
        transformation: [
          { width: 1200, height: 1200, crop: "limit" },
          { quality: "auto", fetch_format: "auto" },
        ],
      },
      (error, result) => {
        if (error || !result)
          return reject(error ?? new Error("Cloudinary upload failed"));
        resolve(result.secure_url);
      },
    );
    stream.end(buffer);
  });

// ─── Middleware: process uploaded files → Cloudinary URLs
// Attaches `req.uploadedUrls` (string[]) for downstream controllers.

export const processImages =
  (folder = "products") =>
  async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      const files = req.files as Express.Multer.File[] | undefined;
      if (!files || files.length === 0) {
        (req as Request & { uploadedUrls: string[] }).uploadedUrls = [];
        return next();
      }

      const urls = await Promise.all(
        files.map((file) => uploadToCloudinary(file.buffer, folder)),
      );

      (req as Request & { uploadedUrls: string[] }).uploadedUrls = urls;
      next();
    } catch (err) {
      next(err);
    }
  };
