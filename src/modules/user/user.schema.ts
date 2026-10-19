import { z } from 'zod';

export const updateUserProfileSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  phone: z.string().min(8).max(20).optional(),
  photo: z.string().url().optional(),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(6),
  newPassword: z.string().min(6),
  confirmNewPassword: z.string().min(6),
}).refine((data) => data.newPassword === data.confirmNewPassword, {
  message: 'New passwords do not match',
  path: ['confirmNewPassword'],
});

export const updateMemberTierSchema = z.object({
  vipTier: z.enum(['bronze', 'silver', 'gold', 'platinum']),
});

export const assignStaffRoleSchema = z.object({
  role: z.enum(['admin', 'staff', 'user']),
  permissions: z.array(z.string()).optional(),
});
