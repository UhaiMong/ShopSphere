import { z } from "zod";

export const createProductSchema = z.object({
  name: z.string().min(2).max(200).trim(),
  description: z.string().min(10).max(5000),
  shortDescription: z.string().max(300).optional(),
  price: z.number().int().positive("Price must be a positive integer (cents)"),
  comparePrice: z.number().int().positive().optional(),
  category: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid category ID"),
  brand: z.string().max(80).optional(),
  stock: z.number().int().min(0).default(0),
  sku: z.string().optional(),
  tags: z.array(z.string()).default([]),
  isFeatured: z.boolean().default(false),
  weight: z.number().positive().optional(),
});

export const updateProductSchema = createProductSchema.partial();

export const productQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
  category: z.string().optional(),
  brand: z.string().optional(),
  minPrice: z.coerce.number().int().min(0).optional(),
  maxPrice: z.coerce.number().int().min(0).optional(),
  inStock: z.coerce.boolean().optional(),
  isFeatured: z.coerce.boolean().optional(),
  search: z.string().max(100).optional(),
  sort: z
    .enum(["price_asc", "price_desc", "rating", "newest", "popular"])
    .default("newest"),
  tags: z.string().optional(),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type ProductQuery = z.infer<typeof productQuerySchema>;
