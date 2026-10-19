import { z } from 'zod';

export const createRewardSchema = z.object({
  title: z.string().min(2),
  description: z.string().optional(),
  pointsCost: z.number().int().positive(),
  stockQuantity: z.number().int().min(0).default(100),
  image: z.string().url().optional(),
  expiryDays: z.number().int().min(1).default(30),
});

export const updateRewardSchema = createRewardSchema.partial().extend({
  isActive: z.boolean().optional(),
});

export const redeemRewardSchema = z.object({
  rewardId: z.string().min(1),
  idempotencyKey: z.string().optional(),
});

export const claimVoucherSchema = z.object({
  voucherCode: z.string().min(3),
});
