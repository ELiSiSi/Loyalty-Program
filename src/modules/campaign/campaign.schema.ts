import { z } from 'zod';

export const createCampaignSchema = z.object({
  title: z.string().min(3, 'Campaign title must be at least 3 characters'),
  description: z.string().optional(),
  type: z.enum(['POINTS_MULTIPLIER', 'FLAT_BONUS', 'CATEGORY_BONUS']).default('POINTS_MULTIPLIER'),
  value: z.number().positive('Campaign value must be greater than zero'),
  startsAt: z.string().datetime().or(z.date()),
  endsAt: z.string().datetime().or(z.date()),
  minimumSpend: z.number().min(0).default(0),
  eligibleTiers: z.array(z.string()).default(['bronze', 'silver', 'gold', 'platinum']),
  applicableCategories: z.array(z.string()).default([]),
  maxBudgetPoints: z.number().positive().optional(),
});

export const updateCampaignSchema = createCampaignSchema.partial().extend({
  isActive: z.boolean().optional(),
});
