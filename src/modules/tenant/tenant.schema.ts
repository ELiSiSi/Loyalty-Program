import { z } from 'zod';

export const createTenantSchema = z.object({
  name: z.string().min(2, 'Tenant name must be at least 2 characters').max(100),
  slug: z.string().min(2).max(50).regex(/^[a-z0-9-]+$/, 'Slug must be alphanumeric with hyphens').optional(),
  category: z.string().min(2).default('Retail'),
  logo: z.string().url().optional(),
  plan: z.enum(['free', 'starter', 'growth', 'enterprise']).default('free'),
  currency: z.string().min(2).max(5).default('SAR'),
  pointsPercentage: z.number().min(0.1).max(50).default(1),
  pointsExpiryDays: z.number().min(30).max(1825).default(365),
});

export const updateTenantSchema = createTenantSchema.partial();

export const updateTenantPlanSchema = z.object({
  plan: z.enum(['free', 'starter', 'growth', 'enterprise']),
});
