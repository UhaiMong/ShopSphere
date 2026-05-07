"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.productQuerySchema = exports.updateProductSchema = exports.createProductSchema = void 0;
// product.validator.ts
const zod_1 = require("zod");
exports.createProductSchema = zod_1.z.object({
    name: zod_1.z.string().min(2).max(200).trim(),
    description: zod_1.z.string().min(10).max(5000),
    shortDescription: zod_1.z.string().max(300).optional(),
    price: zod_1.z.coerce.number().int().positive('Price must be a positive integer (paisa)'),
    comparePrice: zod_1.z.coerce.number().int().positive().optional(),
    stock: zod_1.z.coerce.number().int().min(0).default(0),
    category: zod_1.z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid category ID'),
    brand: zod_1.z.string().max(80).optional(),
    sku: zod_1.z
        .string()
        .transform((v) => (v?.trim() === '' ? undefined : v?.trim()))
        .optional(),
    tags: zod_1.z.array(zod_1.z.string()).default([]),
    isFeatured: zod_1.z.boolean().default(false),
    isActive: zod_1.z.boolean().default(true),
    weight: zod_1.z.coerce.number().positive().optional(),
    images: zod_1.z.array(zod_1.z.string().url()).default([]),
});
exports.updateProductSchema = exports.createProductSchema.partial();
exports.productQuerySchema = zod_1.z.object({
    page: zod_1.z.coerce.number().int().positive().default(1),
    limit: zod_1.z.coerce.number().int().min(1).max(50).default(20),
    category: zod_1.z.string().optional(),
    brand: zod_1.z.string().optional(),
    minPrice: zod_1.z.coerce.number().int().min(0).optional(),
    maxPrice: zod_1.z.coerce.number().int().min(0).optional(),
    inStock: zod_1.z.coerce.boolean().optional(),
    isFeatured: zod_1.z.coerce.boolean().optional(),
    search: zod_1.z.string().max(100).optional(),
    sort: zod_1.z.enum(['price_asc', 'price_desc', 'rating', 'newest', 'popular']).default('newest'),
    tags: zod_1.z.string().optional(),
});
//# sourceMappingURL=product.validator.js.map