"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Product = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const slugify_1 = __importDefault(require("slugify"));
// Variant Sub-Schema
const variantSchema = new mongoose_1.Schema({
    sku: { type: String, required: true, trim: true },
    color: String,
    size: String,
    stock: { type: Number, required: true, min: 0, default: 0 },
    price: { type: Number, min: 0 },
    images: [String],
}, { _id: true });
// Product Schema
const productSchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: [true, 'Product name is required'],
        trim: true,
        maxlength: [200, 'Product name must not exceed 200 characters'],
    },
    slug: { type: String, unique: true, lowercase: true },
    description: {
        type: String,
        required: [true, 'Description is required'],
        maxlength: [5000, 'Description must not exceed 5000 characters'],
    },
    shortDescription: {
        type: String,
        maxlength: [300, 'Short description must not exceed 300 characters'],
    },
    price: {
        type: Number,
        required: [true, 'Price is required'],
        min: [0, 'Price cannot be negative'],
    },
    comparePrice: {
        type: Number,
        min: 0,
        validate: {
            validator: function (v) {
                return !v || v > this.price;
            },
            message: 'Compare price must be greater than the selling price',
        },
    },
    category: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Category',
        required: [true, 'Category is required'],
        index: true,
    },
    brand: { type: String, trim: true },
    images: { type: [String], default: [] },
    thumbnail: String,
    variants: { type: [variantSchema], default: [] },
    stock: {
        type: Number,
        required: true,
        min: [0, 'Stock cannot be negative'],
        default: 0,
    },
    sku: { type: String, trim: true, sparse: true },
    tags: { type: [String], default: [], index: true },
    avgRating: { type: Number, default: 0, min: 0, max: 5 },
    reviewCount: { type: Number, default: 0, min: 0 },
    isFeatured: { type: Boolean, default: false, index: true },
    isActive: { type: Boolean, default: true, index: true },
    weight: Number,
    dimensions: {
        length: Number,
        width: Number,
        height: Number,
    },
    soldCount: { type: Number, default: 0 },
}, {
    timestamps: true,
    versionKey: '__v',
    toJSON: { virtuals: true },
});
// Virtual: discount percentage
productSchema.virtual('discountPercentage').get(function () {
    if (!this.comparePrice || this.comparePrice <= this.price)
        return 0;
    return Math.round(((this.comparePrice - this.price) / this.comparePrice) * 100);
});
// Virtual: inStock
productSchema.virtual('inStock').get(function () {
    return this.stock > 0;
});
// Pre-save: auto-slug + thumbnail
productSchema.pre('save', async function (next) {
    // Slug generation
    if (this.isModified('name') || this.isNew) {
        let baseSlug = (0, slugify_1.default)(this.name, { lower: true, strict: true });
        let slug = baseSlug;
        let counter = 1;
        while (await exports.Product.exists({ slug, _id: { $ne: this._id } })) {
            slug = `${baseSlug}-${counter++}`;
        }
        this.slug = slug;
    }
    // Auto-set thumbnail from first image
    if (this.isModified('images') && this.images.length > 0) {
        this.thumbnail = this.images[0];
    }
    next();
});
//  Static: recalculate avgRating
productSchema.statics.recalculateRating = async function (productId) {
    const Review = mongoose_1.default.model('Review');
    const stats = await Review.aggregate([
        {
            $match: {
                product: new mongoose_1.default.Types.ObjectId(productId),
                isApproved: true,
            },
        },
        {
            $group: {
                _id: '$product',
                avgRating: { $avg: '$rating' },
                count: { $sum: 1 },
            },
        },
    ]);
    if (stats.length > 0) {
        await this.findByIdAndUpdate(productId, {
            avgRating: Math.round(stats[0].avgRating * 10) / 10,
            reviewCount: stats[0].count,
        });
    }
    else {
        await this.findByIdAndUpdate(productId, { avgRating: 0, reviewCount: 0 });
    }
};
// Indexes
productSchema.index({ name: 'text', description: 'text', tags: 'text' });
productSchema.index({ isActive: 1, price: 1 });
productSchema.index({ isActive: 1, isFeatured: 1 });
productSchema.index({ isActive: 1, avgRating: -1 });
productSchema.index({ isActive: 1, soldCount: -1 });
productSchema.index({ isActive: 1, createdAt: -1 });
// Model
exports.Product = mongoose_1.default.model('Product', productSchema);
//# sourceMappingURL=Product.model.js.map