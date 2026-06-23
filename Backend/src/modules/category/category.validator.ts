import { z } from 'zod';
// Validators
export const createCategorySchema = z.object({
  name: z.string().min(2).max(80).trim(),
  description: z.string().max(500).optional(),
  parent: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/)
    .optional(),
  image: z.string().url().optional(),
  icon: z.string().optional(),
  sortOrder: z.number().int().default(0),
  hasVariants: z.boolean().default(false),
  variantAttributes: z.array(z.enum(['size', 'color'])).default([]),
});

export const updateCategorySchema = createCategorySchema.partial();
