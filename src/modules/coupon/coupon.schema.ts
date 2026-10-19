import { z } from 'zod';

export const createCouponSchema = z.object({
  code: z.string().min(3).max(20).toUpperCase(),
  discountType: z.enum(['PERCENTAGE', 'FIXED', 'POINTS_REDUCTION']).default('PERCENTAGE'),
  discount: z.number().positive(),
  minSpend: z.number().min(0).default(0),
  maxDiscount: z.number().positive().optional(),
  startsAt: z.string().datetime().or(z.date()),
  expiresAt: z.string().datetime().or(z.date()),
  maxUses: z.number().int().positive().default(1000),
});

export const updateCouponSchema = createCouponSchema.partial().extend({
  isActive: z.boolean().optional(),
});

export const validateCouponSchema = z.object({
  code: z.string().min(1),
  orderAmount: z.number().positive(),
});
