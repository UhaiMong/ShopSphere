"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.mediaService = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const Category_model_1 = require("../../models/Category.model");
const ApiError_1 = require("../../utils/ApiError");
const ApiResponse_1 = require("../../utils/ApiResponse");
const cloudinary_1 = require("../../config/cloudinary");
const Media_model_1 = require("../../models/Media.model");
exports.mediaService = {
    // Get All media
    async getAll(query) {
        const { page, limit, category, search } = query;
        const filter = {};
        if (category) {
            const cat = await Category_model_1.Category.findOne({
                $or: [{ _id: mongoose_1.default.isValidObjectId(category) ? category : null }],
            });
            if (cat) {
                filter.category = {
                    $in: await Category_model_1.Category.find({
                        $or: [{ _id: cat._id }, { ancestors: cat._id }],
                    }).distinct('_id'),
                };
            }
        }
        if (search) {
            filter.$text = { $search: search };
        }
        const skip = (page - 1) * limit;
        const [media, total] = await Promise.all([
            Media_model_1.Media.find(filter).populate('category', 'title').skip(skip).limit(limit).lean(),
            Media_model_1.Media.countDocuments(filter),
        ]);
        return {
            media,
            pagination: (0, ApiResponse_1.getPaginationMeta)(total, page, limit),
        };
    },
    // create New media
    async create(data, imgURL, publicId, fileSize) {
        const category = await Category_model_1.Category.findById(data.category);
        if (!category)
            throw ApiError_1.ApiError.notFound('Category');
        const media = await Media_model_1.Media.create({
            ...data,
            imgURL,
            publicId,
            fileSize,
        });
        return media.toObject();
    },
    async updateByPatch(id, data, newImage) {
        const media = await Media_model_1.Media.findById(id);
        if (!media)
            throw ApiError_1.ApiError.notFound('Media');
        if (data.category) {
            const category = await Category_model_1.Category.findById(data.category);
            if (!category)
                throw ApiError_1.ApiError.notFound('Category');
        }
        if (newImage) {
            // Delete old image from Cloudinary before replacing
            if (media.publicId) {
                await cloudinary_1.cloudinary.uploader.destroy(media.publicId);
            }
            media.imgURL = newImage.url;
            media.publicId = newImage.publicId;
            media.fileSize = newImage.fileSize;
        }
        Object.assign(media, data);
        await media.save();
        return media.toObject();
    },
    // softDelete
    async softDelete(id) {
        const media = await Media_model_1.Media.findByIdAndUpdate(id, { isActive: false });
        if (!media)
            throw ApiError_1.ApiError.notFound('Media');
    },
    // Restore
    async reStore(id) {
        const meda = await Media_model_1.Media.findByIdAndUpdate(id, { isActive: true });
        if (!meda)
            throw ApiError_1.ApiError.notFound('Media');
    },
    // Delete media
    async deleteMedia(mediaId) {
        const media = await Media_model_1.Media.findById(mediaId);
        if (!media)
            throw ApiError_1.ApiError.notFound('Media');
        // Cloudinary public_id is already stored — use it directly
        const publicId = media.publicId;
        // Delete from Cloudinary first; if it fails, DB stays intact
        const cloudResult = await cloudinary_1.cloudinary.uploader.destroy(publicId);
        if (cloudResult.result !== 'ok' && cloudResult.result !== 'not found') {
            throw ApiError_1.ApiError.badRequest(`Cloudinary deletion failed: ${cloudResult.result}`);
        }
        await media.deleteOne();
    },
};
//# sourceMappingURL=media.service.js.map