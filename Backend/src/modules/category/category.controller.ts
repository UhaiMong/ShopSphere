import { Router, Request, Response } from "express";
import { Category } from "../../models/Category.model";
import { ApiResponse } from "../../utils/ApiResponse";
import { ApiError } from "../../utils/ApiError";
import { catchAsync } from "../../utils/catchAsync";
import { protect, requireRole } from "../../middleware/auth.middleware";
import { z } from "zod";
import { validate } from "../../middleware/validate.middleware";

// Validators
const createCategorySchema = z.object({
  name: z.string().min(2).max(80).trim(),
  description: z.string().max(500).optional(),
  parent: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/)
    .optional(),
  image: z.string().url().optional(),
  icon: z.string().optional(),
  sortOrder: z.number().int().default(0),
});

const updateCategorySchema = createCategorySchema.partial();

// Service helpers
const buildAncestors = async (parentId?: string): Promise<string[]> => {
  if (!parentId) return [];
  const parent = await Category.findById(parentId);
  if (!parent) throw ApiError.badRequest("Parent category not found");
  return [...parent.ancestors.map(String), parentId];
};

//  Controller
const categoryController = {
  // GET /categories  — full tree (flat list, frontend builds tree)
  getAll: catchAsync(async (_req: Request, res: Response) => {
    const categories = await Category.find({ isActive: true })
      .sort({ sortOrder: 1, name: 1 })
      .lean();
    ApiResponse.success(res, categories);
  }),

  // GET /categories/:slug  — single category + direct children
  getOne: catchAsync(async (req: Request, res: Response) => {
    const category = await Category.findOne({
      slug: req.params.slug,
      isActive: true,
    })
      .populate("children")
      .lean();
    if (!category) throw ApiError.notFound("Category");
    ApiResponse.success(res, category);
  }),

  // POST /categories  (admin)
  create: catchAsync(async (req: Request, res: Response) => {
    const { parent, ...rest } = req.body as z.infer<
      typeof createCategorySchema
    >;
    const ancestors = await buildAncestors(parent);
    const category = await Category.create({
      ...rest,
      parent: parent ?? null,
      ancestors,
    });
    ApiResponse.created(res, category, "Category created successfully");
  }),

  // PUT /categories/:id  (admin)
  update: catchAsync(async (req: Request, res: Response) => {
    const { parent, ...rest } = req.body as z.infer<
      typeof updateCategorySchema
    >;
    const category = await Category.findById(req.params.id);
    if (!category) throw ApiError.notFound("Category");

    Object.assign(category, rest);
    if (parent !== undefined) {
      const ancestors = await buildAncestors(parent);
      category.parent = parent
        ? new (require("mongoose").Types.ObjectId)(parent)
        : null;
      category.ancestors = ancestors as any;
    }
    await category.save();
    ApiResponse.success(res, category, "Category updated");
  }),

  // DELETE /categories/:id  (admin)
  remove: catchAsync(async (req: Request, res: Response) => {
    const category = await Category.findById(req.params.id);
    if (!category) throw ApiError.notFound("Category");

    // Prevent deletion if children exist
    const childCount = await Category.countDocuments({ parent: req.params.id });
    if (childCount > 0) {
      throw ApiError.badRequest(
        "Cannot delete a category that has sub-categories. Remove sub-categories first.",
      );
    }

    category.isActive = false;
    await category.save();
    ApiResponse.success(res, null, "Category deleted");
  }),
};

// Router
export const categoryRouter = Router();

categoryRouter.get("/", categoryController.getAll);
categoryRouter.get("/:slug", categoryController.getOne);

categoryRouter.post(
  "/",
  protect,
  requireRole("admin", "superadmin"),
  validate(createCategorySchema),
  categoryController.create,
);
categoryRouter.put(
  "/:id",
  protect,
  requireRole("admin", "superadmin"),
  validate(updateCategorySchema),
  categoryController.update,
);
categoryRouter.delete(
  "/:id",
  protect,
  requireRole("admin", "superadmin"),
  categoryController.remove,
);
