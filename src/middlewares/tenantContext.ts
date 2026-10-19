import { FastifyReply, FastifyRequest } from 'fastify';
import mongoose from 'mongoose';
import { BadRequestError, ForbiddenError, NotFoundError } from '../errors/appError.js';
import { TenantModel } from '../modules/tenant/tenant.model.js';
import { ITenantContext } from '../types/index.js';

export const resolveTenantContext = async (
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> => {
  const tenantIdHeader = request.headers['x-tenant-id'] as string | undefined;
  const tenantSlugHeader = request.headers['x-tenant-slug'] as string | undefined;

  let query: any = null;

  if (tenantIdHeader) {
    if (mongoose.Types.ObjectId.isValid(tenantIdHeader)) {
      query = { _id: tenantIdHeader };
    } else {
      query = { code: tenantIdHeader.toLowerCase() };
    }
  } else if (tenantSlugHeader) {
    query = { slug: tenantSlugHeader.toLowerCase() };
  } else if (request.hostname) {
    const parts = request.hostname.split('.');
    if (parts.length > 2) {
      const sub = parts[0].toLowerCase();
      if (!['api', 'www', 'app', 'localhost'].includes(sub)) {
        query = { slug: sub };
      }
    }
  }

  if (!query && (request.user?.tenantId || request.user?.company)) {
    const userTenant = request.user.tenantId || request.user.company;
    query = { _id: userTenant };
  }

  // If no tenant specified and user is Super Admin, allow proceeding without tenant context
  if (!query) {
    if (request.user?.role === 'superAdmin') {
      return;
    }
    throw new BadRequestError(
      'Missing tenant context. Please provide x-tenant-id or x-tenant-slug header.'
    );
  }

  const tenant = await TenantModel.findOne(query);

  if (!tenant) {
    throw new NotFoundError('Tenant/Company not found or invalid identifier provided.');
  }

  if (tenant.status === 'suspended') {
    throw new ForbiddenError(
      'Tenant subscription is currently suspended. Please contact platform administration.'
    );
  }

  if (tenant.status === 'cancelled') {
    throw new ForbiddenError('Tenant account has been cancelled.');
  }

  // Cross-tenant protection: If user is admin/staff of tenant A, forbid accessing tenant B
  if (
    request.user &&
    request.user.role !== 'superAdmin' &&
    request.user.tenantId &&
    request.user.tenantId.toString() !== tenant._id.toString()
  ) {
    throw new ForbiddenError('Cross-tenant violation: You cannot access resources outside your tenant.');
  }

  request.tenant = {
    _id: tenant._id,
    id: tenant._id.toString(),
    name: tenant.name,
    slug: tenant.slug,
    plan: tenant.plan,
    status: tenant.status,
    pointsPercentage: tenant.settings?.pointsPercentage ?? 1,
    pointsExpiryDays: tenant.settings?.pointsExpiryDays ?? 365,
    currency: tenant.settings?.currency ?? 'SAR',
    limits: {
      maxUsers: tenant.limits?.maxUsers ?? 1000,
      maxCampaigns: tenant.limits?.maxCampaigns ?? 10,
      monthlyTransactionLimit: tenant.limits?.monthlyTransactionLimit ?? 10000,
    },
  };
};
