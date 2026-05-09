"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.productService = void 0;
// product.service.ts
const mongoose_1 = __importDefault(require("mongoose"));
const Product_model_1 = require("../../models/Product.model");
const Category_model_1 = require("../../models/Category.model");
const ApiError_1 = require("../../utils/ApiError");
const ApiResponse_1 = require("../../utils/ApiResponse");
const cloudinary_1 = require("../../config/cloudinary");
// Sort Map
const SORT_MAP = {
    price_asc: { price: 1 },
    price_desc: { price: -1 },
    rating: { avgRating: -1 },
    newest: { createdAt: -1 },
    popular: { soldCount: -1 },
};
exports.productService = {
    // getAll
    async getAll(query) {
        const { page, limit, category, brand, minPrice, maxPrice, inStock, isFeatured, search, sort, tags, } = query;
        const filter = { isActive: true };
        if (category) {
            const cat = await Category_model_1.Category.findOne({
                $or: [{ _id: mongoose_1.default.isValidObjectId(category) ? category : null }, { slug: category }],
            });
            if (cat) {
                filter.category = {
                    $in: await Category_model_1.Category.find({
                        $or: [{ _id: cat._id }, { ancestors: cat._id }],
                    }).distinct('_id'),
                };
            }
        }
        if (brand)
            filter.brand = new RegExp(brand, 'i');
        if (minPrice !== undefined)
            filter.price = { ...filter.price, $gte: minPrice };
        if (maxPrice !== undefined)
            filter.price = { ...filter.price, $lte: maxPrice };
        if (inStock)
            filter.stock = { $gt: 0 };
        if (isFeatured !== undefined)
            filter.isFeatured = isFeatured;
        if (tags)
            filter.tags = { $in: tags.split(',').map((t) => t.trim()) };
        if (search) {
            filter.$text = { $search: search };
        }
        const skip = (page - 1) * limit;
        const sortObj = SORT_MAP[sort] ?? SORT_MAP.newest;
        const scoreProjection = search ? { score: { $meta: 'textScore' } } : {};
        const scoreSortField = search
            ? { score: { $meta: 'textScore' } }
            : undefined;
        const [products, total] = await Promise.all([
            Product_model_1.Product.find(filter, scoreProjection)
                .populate('category', 'name slug')
                .sort({ ...(scoreSortField ?? {}), ...sortObj })
                .skip(skip)
                .limit(limit)
                .lean(),
            Product_model_1.Product.countDocuments(filter),
        ]);
        return {
            products,
            pagination: (0, ApiResponse_1.getPaginationMeta)(total, page, limit),
        };
    },
    // getById
    async getById(idOrSlug) {
        const isObjectId = mongoose_1.default.isValidObjectId(idOrSlug);
        const filter = isObjectId
            ? { _id: idOrSlug, isActive: true }
            : { slug: idOrSlug, isActive: true };
        const product = await Product_model_1.Product.findOne(filter)
            .populate('category', 'name slug ancestors')
            .lean();
        if (!product)
            throw ApiError_1.ApiError.notFound('Product');
        return product;
    },
    // getFeatured
    async getFeatured(limit = 8) {
        return Product_model_1.Product.find({ isActive: true, isFeatured: true })
            .sort({ createdAt: -1 })
            .limit(limit)
            .populate('category', 'name slug')
            .lean();
    },
    // getRelated
    async getRelated(productId, limit = 6) {
        const product = await Product_model_1.Product.findById(productId).lean();
        if (!product)
            return [];
        return Product_model_1.Product.find({
            _id: { $ne: productId },
            category: product.category,
            isActive: true,
        })
            .sort({ avgRating: -1, soldCount: -1 })
            .limit(limit)
            .lean();
    },
    // create
    async create(data, imageUrls) {
        const category = await Category_model_1.Category.findById(data.category);
        if (!category)
            throw ApiError_1.ApiError.badRequest('Category not found');
        const product = await Product_model_1.Product.create({
            ...data,
            images: imageUrls,
        });
        return product.toObject();
    },
    // update by PUT
    async update(id, data, incomingImages) {
        const product = await Product_model_1.Product.findById(id);
        if (!product)
            throw ApiError_1.ApiError.notFound('Product');
        if (data.category) {
            const category = await Category_model_1.Category.findById(data.category);
            if (!category)
                throw ApiError_1.ApiError.badRequest('Category not found');
        }
        Object.assign(product, data);
        if (incomingImages !== undefined) {
            // Deduplicate just in case, then replace
            product.images = [...new Set(incomingImages)];
        }
        await product.save();
        return product.toObject();
    },
    // updateStock by PATCH
    async updateStock(id, quantity) {
        const product = await Product_model_1.Product.findById(id);
        if (!product)
            throw ApiError_1.ApiError.notFound('Product');
        if (product.stock + quantity < 0) {
            throw ApiError_1.ApiError.badRequest('Insufficient stock');
        }
        product.stock += quantity;
        await product.save();
        return product.toObject();
    },
    // softDelete
    async softDelete(id) {
        const product = await Product_model_1.Product.findByIdAndUpdate(id, { isActive: false });
        if (!product)
            throw ApiError_1.ApiError.notFound('Product');
    },
    // deleteImage
    async deleteImage(productId, imageUrl) {
        const product = await Product_model_1.Product.findById(productId);
        if (!product)
            throw ApiError_1.ApiError.notFound('Product');
        const publicId = imageUrl.split('/').slice(-2).join('/').split('.')[0];
        try {
            await cloudinary_1.cloudinary.uploader.destroy(`shopsphere/products/${publicId}`);
        }
        catch {
            // Log but don't fail if Cloudinary delete fails
        }
        product.images = product.images.filter((img) => img !== imageUrl);
        await product.save();
        return product.toObject();
    },
};
//# sourceMappingURL=product.service.js.map