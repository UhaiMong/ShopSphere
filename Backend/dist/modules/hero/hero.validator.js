"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updageHeroSchema = exports.createHeroSchema = void 0;
// product.validator.ts
const zod_1 = require("zod");
exports.createHeroSchema = zod_1.z.object({
    title: zod_1.z.string().min(2).max(200).trim(),
    subtitle: zod_1.z.string().min(2).max(200).trim(),
    offer: zod_1.z.string().max(100).optional(),
    ctaText: zod_1.z.string().max(100).optional(),
    ctaLink: zod_1.z.string().url().trim(),
    backgroundImage: zod_1.z.string().url().trim(),
    isActive: zod_1.z.boolean().default(true),
});
exports.updageHeroSchema = exports.createHeroSchema.partial();
//# sourceMappingURL=hero.validator.js.map