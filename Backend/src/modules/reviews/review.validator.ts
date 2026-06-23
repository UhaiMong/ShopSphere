import { z } from 'zod';
// REVIEWS

export const createReviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  title: z.string().max(100).trim().optional(),
  body: z.string().min(10).max(2000).trim(),
});
