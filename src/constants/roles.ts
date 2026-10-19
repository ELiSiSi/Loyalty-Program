export const ROLES = {
  SUPER_ADMIN: 'superAdmin',
  ADMIN: 'admin',       // Company/Tenant Admin
  STAFF: 'staff',       // Cashier / Branch Store staff
  USER: 'user',         // Customer / Loyalty Member
} as const;

export type RoleType = typeof ROLES[keyof typeof ROLES];
