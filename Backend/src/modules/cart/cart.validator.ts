import { z } from 'zod';
// Validators
export const addItemSchema = z.object({
  productId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid product ID'),
  quantity: z.number().int().min(1).max(100).default(1),
  variantId: z.string().optional(),
});

export const updateItemSchema = z.object({
  quantity: z.number().int().min(1).max(100),
});
