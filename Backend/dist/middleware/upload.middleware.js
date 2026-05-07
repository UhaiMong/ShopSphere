"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.processImages = exports.upload = void 0;
const multer_1 = __importDefault(require("multer"));
const cloudinary_1 = require("cloudinary");
const ApiError_1 = require("../utils/ApiError");
// Multer memory storage
const storage = multer_1.default.memoryStorage();
const fileFilter = (_req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];
    if (allowed.includes(file.mimetype)) {
        cb(null, true);
    }
    else {
        cb(new ApiError_1.ApiError(400, 'Only JPEG, PNG, WebP, and AVIF images are allowed', 'INVALID_FILE_TYPE'));
    }
};
exports.upload = (0, multer_1.default)({
    storage,
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024,
        files: 10,
    },
});
// Upload buffer to Cloudinary
const uploadToCloudinary = (buffer, folder) => new Promise((resolve, reject) => {
    const stream = cloudinary_1.v2.uploader.upload_stream({
        folder: `shopsphere/${folder}`,
        transformation: [
            { width: 1200, height: 1200, crop: 'limit' },
            { quality: 'auto', fetch_format: 'auto' },
        ],
    }, (error, result) => {
        if (error || !result)
            return reject(error ?? new Error('Cloudinary upload failed'));
        resolve({ url: result.secure_url, publicId: result.public_id });
    });
    stream.end(buffer);
});
const processImages = (folder = 'media') => async (req, _res, next) => {
    try {
        // Handle both single and array uploads
        const files = req.files ? req.files : req.file ? [req.file] : [];
        if (!files.length) {
            req.uploadedFiles = [];
            return next();
        }
        const results = await Promise.all(files.map((file) => uploadToCloudinary(file.buffer, folder)));
        req.uploadedFiles = results;
        next();
    }
    catch (err) {
        next(err);
    }
};
exports.processImages = processImages;
//# sourceMappingURL=upload.middleware.js.map