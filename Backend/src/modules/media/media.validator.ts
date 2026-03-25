import { z } from 'zod';

export const createMediaSchema = z.object({
  title: z.string().min(2).max(200).trim(),
  alt: z.string().min(2).max(200),
  category: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid category ID'),
  isActive: z.boolean().default(true),
});

export const updatMediaSchema = createMediaSchema.partial();

export const mediaQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
  category: z.string().optional(),
});

export type CreateMediaInput = z.infer<typeof createMediaSchema>;
export type UpdateMediaInput = z.infer<typeof updatMediaSchema>;
export type MediaQuery = z.infer<typeof mediaQuerySchema>;
