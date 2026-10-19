import { Types } from 'mongoose';

export type UserRole = 'superAdmin' | 'admin' | 'staff' | 'user';

export type TenantPlan = 'free' | 'starter' | 'growth' | 'enterprise';

export type TenantStatus = 'active' | 'suspended' | 'trial' | 'cancelled';

export interface IUserPayload {
  _id: string | Types.ObjectId;
  id: string;
  name?: string;
  email: string;
  role: UserRole;
  tenantId?: string | Types.ObjectId;
  company?: string | Types.ObjectId;
  permissions?: string[];
  is_active: boolean;
}

export interface ITenantContext {
  _id: string | Types.ObjectId;
  id: string;
  name: string;
  slug: string;
  plan: TenantPlan;
  status: TenantStatus;
  pointsPercentage: number;
  pointsExpiryDays: number;
  currency: string;
  limits: {
    maxUsers: number;
    maxCampaigns: number;
    monthlyTransactionLimit: number;
  };
}

declare module 'fastify' {
  interface FastifyRequest {
    user?: IUserPayload;
    tenant?: ITenantContext;
    idempotencyKey?: string;
  }
}
