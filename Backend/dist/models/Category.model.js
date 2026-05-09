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
exports.Category = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const slugify_1 = __importDefault(require("slugify"));
// Schema
const categorySchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: [true, 'Category name is required'],
        trim: true,
        maxlength: [80, 'Name must not exceed 80 characters'],
    },
    slug: {
        type: String,
        unique: true,
        lowercase: true,
    },
    description: String,
    image: String,
    icon: String,
    parent: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Category',
        default: null,
    },
    // Materialized path: stores all ancestor IDs for efficient subtree queries.
    // e.g. Electronics → Mobile → Smartphones  has ancestors: [Electronics._id, Mobile._id]
    // To find all products in "Electronics" (incl sub-categories):
    //   { ancestors: electronicsId } OR { _id: electronicsId }
    ancestors: [{ type: mongoose_1.Schema.Types.ObjectId, ref: 'Category' }],
    isActive: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 },
}, {
    timestamps: true,
    versionKey: false,
    toJSON: { virtuals: true },
});
// Virtual: children (populated on demand)
categorySchema.virtual('children', {
    ref: 'Category',
    localField: '_id',
    foreignField: 'parent',
});
// Pre-save: auto-generate slug
categorySchema.pre('save', async function (next) {
    if (this.isModified('name') || this.isNew) {
        let baseSlug = (0, slugify_1.default)(this.name, { lower: true, strict: true });
        let slug = baseSlug;
        let counter = 1;
        // Ensure uniqueness
        while (await exports.Category.exists({ slug, _id: { $ne: this._id } })) {
            slug = `${baseSlug}-${counter++}`;
        }
        this.slug = slug;
    }
    next();
});
// Indexes
categorySchema.index({ parent: 1, isActive: 1 });
categorySchema.index({ ancestors: 1 });
// Model
exports.Category = mongoose_1.default.model('Category', categorySchema);
//# sourceMappingURL=Category.model.js.map