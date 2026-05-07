"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.singleMediaQuerySchema = exports.mediaQuerySchema = exports.updatMediaSchema = exports.createMediaSchema = void 0;
const zod_1 = require("zod");
exports.createMediaSchema = zod_1.z.object({
    title: zod_1.z.string().min(2).max(200).trim(),
    alt: zod_1.z.string().min(2).max(200),
    category: zod_1.z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid category ID'),
    isActive: zod_1.z.boolean().default(true),
});
exports.updatMediaSchema = exports.createMediaSchema.partial();
exports.mediaQuerySchema = zod_1.z.object({
    page: zod_1.z.coerce.number().int().positive().default(1),
    limit: zod_1.z.coerce.number().int().min(1).max(50).default(20),
    category: zod_1.z.string().optional(),
    search: zod_1.z.string().optional(),
});
exports.singleMediaQuerySchema = zod_1.z.object({
    title: zod_1.z.string().optional(),
    category: zod_1.z.string().optional(),
});
//# sourceMappingURL=media.validator.js.map