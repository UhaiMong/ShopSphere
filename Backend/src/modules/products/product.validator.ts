// product.validator.ts
import { z } from 'zod';

const productVariantSchema = z.object({
  sku: z.string().min(1).trim(),
  color: z.string().optional(),
  size: z.string().optional(),
  stock: z.coerce.number().int().min(0).default(0),
  price: z.coerce.number().int().positive().optional(),
  images: z.array(z.string().url()).default([]),
});

export const createProductSchema = z.object({
  name: z.string().min(2).max(200).trim(),
  description: z.string().min(10).max(5000),
  shortDescription: z.string().max(300).optional(),

  price: z.coerce.number().int().positive('Price must be a positive integer (paisa)'),
  comparePrice: z.coerce.number().int().positive().optional(),
  stock: z.coerce.number().int().min(0).default(0),

  category: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid category ID'),
  brand: z.string().max(80).optional(),
  sku: z
    .string()
    .transform((v) => (v?.trim() === '' ? undefined : v?.trim()))
    .optional(),

  tags: z.array(z.string()).default([]),
  isFeatured: z.boolean().default(false),
  isActive: z.boolean().default(true),
  weight: z.coerce.number().positive().optional(),

  variants: z.array(productVariantSchema).default([]),
  images: z.array(z.string().url()).default([]),
});

export const updateProductSchema = createProductSchema.partial().extend({
  variants: z.array(productVariantSchema).optional(),
});

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
  sort: z.enum(['price_asc', 'price_desc', 'rating', 'newest', 'popular']).default('newest'),
  tags: z.string().optional(),
  isActive: z.coerce.boolean().optional(),
  page_size: z.coerce.number().int().min(1).max(100).optional(), // alias some frontends use
});

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type ProductQuery = z.infer<typeof productQuerySchema>;
