import { z } from 'zod';

export const createBookingSchema = z.object({
  bookingType: z.string().default('service'),
  productId: z.string().optional(),
  quantity: z.number().int().positive().default(1),
  totalPrice: z.number().positive(),
  couponCode: z.string().optional(),
  usedPoints: z.number().int().min(0).default(0),
  notes: z.string().optional(),
  holdDurationMinutes: z.number().int().min(5).max(1440).default(30), // default 30 mins hold
});

export const updateBookingStatusSchema = z.object({
  status: z.enum(['pending', 'confirmed', 'completed', 'cancelled', 'expired']),
});
