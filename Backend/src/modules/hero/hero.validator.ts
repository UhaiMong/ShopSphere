// product.validator.ts
import { z } from 'zod';

export const createHeroSchema = z.object({
  title: z.string().min(2).max(200).trim(),
  subtitle: z.string().min(2).max(200).trim(),
  offer: z.string().max(100).optional(),
  ctaText: z.string().max(100).optional(),
  ctaLink: z.string().url().trim(),
  backgroundImage: z.string().url().trim(),
  isActive: z.boolean().default(true),
});

export const updageHeroSchema = createHeroSchema.partial();

export type CreateHeroInput = z.infer<typeof createHeroSchema>;
export type UpdateHeroInput = z.infer<typeof updageHeroSchema>;
