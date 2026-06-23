import { z } from 'zod';
// Validators
export const updateProfileSchema = z.object({
  name: z.string().min(2).max(60).trim().optional(),
  phone: z
    .string()
    .regex(/^\+?[\d\s\-()]{7,15}$/)
    .optional(),
});

export const addressSchema = z.object({
  label: z.string().max(20).optional(),
  fullName: z.string().min(2),
  phone: z.string().min(7),
  addressLine1: z.string().min(5),
  addressLine2: z.string().optional(),
  city: z.string().min(2),
  state: z.string().optional(),
  postalCode: z.string().min(4),
  country: z.string().min(2).default('BD'),
  isDefault: z.boolean().default(false),
});
