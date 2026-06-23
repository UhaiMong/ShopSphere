import { z } from 'zod';
// Validators
export const addressSchema = z.object({
  fullName: z.string().min(2),
  phone: z.string().min(7),
  addressLine1: z.string().min(5),
  addressLine2: z.string().optional(),
  city: z.string().min(2),
  state: z.string().optional(),
  postalCode: z.string().min(4),
  country: z.string().min(2).default('BD'),
});

export const createOrderSchema = z.object({
  shippingAddress: addressSchema,
  paymentMethod: z.enum(['stripe', 'sslcommerz', 'paypal', 'cod']),
  notes: z.string().max(500).optional(),
});

export const updateOrderStatusSchema = z.object({
  status: z.enum([
    'pending',
    'confirmed',
    'processing',
    'shipped',
    'delivered',
    'cancelled',
    'refunded',
  ]),
  note: z.string().max(300).optional(),
});
