import { z } from 'zod';

export const earnPointsSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  amount: z.number().int().positive('Point amount must be a positive integer'),
  referenceType: z.enum(['ORDER', 'BOOKING', 'CAMPAIGN', 'REWARD', 'COUPON', 'ADMIN']).default('ORDER'),
  referenceId: z.string().optional(),
  description: z.string().min(3, 'Description must be at least 3 characters'),
  idempotencyKey: z.string().optional(),
});

export const redeemPointsSchema = z.object({
  userId: z.string().optional(), // optional if user is redeeming for themselves
  amount: z.number().int().positive('Redemption amount must be a positive integer'),
  referenceType: z.enum(['ORDER', 'BOOKING', 'CAMPAIGN', 'REWARD', 'COUPON', 'ADMIN']).default('REWARD'),
  referenceId: z.string().optional(),
  description: z.string().min(3, 'Description is required'),
  idempotencyKey: z.string().optional(),
});

export const adjustPointsSchema = z.object({
  userId: z.string().min(1, 'Target user ID is required'),
  amount: z.number().int().refine((val) => val !== 0, 'Adjustment amount cannot be zero'),
  reason: z.string().min(5, 'A clear reason for point adjustment is required'),
});

export const calculatePointsSchema = z.object({
  orderAmount: z.number().positive(),
  userId: z.string().optional(),
  categoryId: z.string().optional(),
});
