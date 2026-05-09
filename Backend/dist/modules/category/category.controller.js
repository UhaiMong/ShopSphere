"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.categoryRouter = void 0;
const express_1 = require("express");
const Category_model_1 = require("../../models/Category.model");
const ApiResponse_1 = require("../../utils/ApiResponse");
const ApiError_1 = require("../../utils/ApiError");
const catchAsync_1 = require("../../utils/catchAsync");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const zod_1 = require("zod");
const validate_middleware_1 = require("../../middleware/validate.middleware");
// Validators
const createCategorySchema = zod_1.z.object({
    name: zod_1.z.string().min(2).max(80).trim(),
    description: zod_1.z.string().max(500).optional(),
    parent: zod_1.z
        .string()
        .regex(/^[0-9a-fA-F]{24}$/)
        .optional(),
    image: zod_1.z.string().url().optional(),
    icon: zod_1.z.string().optional(),
    sortOrder: zod_1.z.number().int().default(0),
});
const updateCategorySchema = createCategorySchema.partial();
// Service helpers
const buildAncestors = async (parentId) => {
    if (!parentId)
        return [];
    const parent = await Category_model_1.Category.findById(parentId);
    if (!parent)
        throw ApiError_1.ApiError.badRequest("Parent category not found");
    return [...parent.ancestors.map(String), parentId];
};
//  Controller
const categoryController = {
    // GET /categories  — full tree (flat list, frontend builds tree)
    getAll: (0, catchAsync_1.catchAsync)(async (_req, res) => {
        const categories = await Category_model_1.Category.find({ isActive: true })
            .sort({ sortOrder: 1, name: 1 })
            .lean();
        ApiResponse_1.ApiResponse.success(res, categories);
    }),
    // GET /categories/:slug  — single category + direct children
    getOne: (0, catchAsync_1.catchAsync)(async (req, res) => {
        const category = await Category_model_1.Category.findOne({
            slug: req.params.slug,
            isActive: true,
        })
            .populate("children")
            .lean();
        if (!category)
            throw ApiError_1.ApiError.notFound("Category");
        ApiResponse_1.ApiResponse.success(res, category);
    }),
    // POST /categories  (admin)
    create: (0, catchAsync_1.catchAsync)(async (req, res) => {
        const { parent, ...rest } = req.body;
        const ancestors = await buildAncestors(parent);
        const category = await Category_model_1.Category.create({
            ...rest,
            parent: parent ?? null,
            ancestors,
        });
        ApiResponse_1.ApiResponse.created(res, category, "Category created successfully");
    }),
    // PUT /categories/:id  (admin)
    update: (0, catchAsync_1.catchAsync)(async (req, res) => {
        const { parent, ...rest } = req.body;
        const category = await Category_model_1.Category.findById(req.params.id);
        if (!category)
            throw ApiError_1.ApiError.notFound("Category");
        Object.assign(category, rest);
        if (parent !== undefined) {
            const ancestors = await buildAncestors(parent);
            category.parent = parent
                ? new (require("mongoose").Types.ObjectId)(parent)
                : null;
            category.ancestors = ancestors;
        }
        await category.save();
        ApiResponse_1.ApiResponse.success(res, category, "Category updated");
    }),
    // DELETE /categories/:id  (admin)
    remove: (0, catchAsync_1.catchAsync)(async (req, res) => {
        const category = await Category_model_1.Category.findById(req.params.id);
        if (!category)
            throw ApiError_1.ApiError.notFound("Category");
        // Prevent deletion if children exist
        const childCount = await Category_model_1.Category.countDocuments({ parent: req.params.id });
        if (childCount > 0) {
            throw ApiError_1.ApiError.badRequest("Cannot delete a category that has sub-categories. Remove sub-categories first.");
        }
        category.isActive = false;
        await category.save();
        ApiResponse_1.ApiResponse.success(res, null, "Category deleted");
    }),
};
// Router
exports.categoryRouter = (0, express_1.Router)();
exports.categoryRouter.get("/", categoryController.getAll);
exports.categoryRouter.get("/:slug", categoryController.getOne);
exports.categoryRouter.post("/", auth_middleware_1.protect, (0, auth_middleware_1.requireRole)("admin", "superadmin"), (0, validate_middleware_1.validate)(createCategorySchema), categoryController.create);
exports.categoryRouter.put("/:id", auth_middleware_1.protect, (0, auth_middleware_1.requireRole)("admin", "superadmin"), (0, validate_middleware_1.validate)(updateCategorySchema), categoryController.update);
exports.categoryRouter.delete("/:id", auth_middleware_1.protect, (0, auth_middleware_1.requireRole)("admin", "superadmin"), categoryController.remove);
//# sourceMappingURL=category.controller.js.map