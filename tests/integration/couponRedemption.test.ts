import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { connectTestDb, clearTestDb, disconnectTestDb, createTestToken, isDbConnected } from '../helpers/testDatabase.js';
import { buildApp } from '../../src/app.js';
import { TenantModel } from '../../src/modules/tenant/tenant.model.js';
import { UserModel } from '../../src/modules/user/user.model.js';
import { FastifyInstance } from 'fastify';

describe('Coupons & Rewards Redemption Lifecycle Tests', () => {
  let app: FastifyInstance;
  let tenant: any;
  let admin: any;
  let customer: any;
  let adminToken: string;
  let customerToken: string;

  beforeAll(async () => {
    await connectTestDb();
    app = await buildApp();
    await app.ready();
  });

  afterAll(async () => {
    if (app) await app.close();
    if (isDbConnected) {
      await clearTestDb();
      await disconnectTestDb();
    }
  });

  beforeEach(async () => {
    if (!isDbConnected) return;
    await clearTestDb();

    tenant = await TenantModel.create({
      name: 'Coffee Club SaaS',
      slug: 'coffee-club',
      code: 'coffee99',
      category: 'Food & Beverage',
    });

    admin = await UserModel.create({
      name: 'Store Manager',
      email: 'manager@coffee.com',
      password: 'password123',
      role: 'admin',
      tenantId: tenant._id,
      company: tenant._id,
    });

    customer = await UserModel.create({
      name: 'Coffee Lover',
      email: 'lover@coffee.com',
      password: 'password123',
      role: 'user',
      tenantId: tenant._id,
      company: tenant._id,
      availablePoints: 500,
      totalPoints: 500,
      lifetimePoints: 500,
    });

    adminToken = createTestToken({
      id: admin._id.toString(),
      role: 'admin',
      tenantId: tenant._id.toString(),
    });

    customerToken = createTestToken({
      id: customer._id.toString(),
      role: 'user',
      tenantId: tenant._id.toString(),
    });
  });

  it('allows admin to create a coupon and validates discount amount correctly', async () => {
    if (!isDbConnected) return;

    // 1. Create 20% discount coupon
    const createRes = await app.inject({
      method: 'POST',
      url: '/api/v1/coupons',
      headers: {
        authorization: `Bearer ${adminToken}`,
        'x-tenant-id': tenant._id.toString(),
      },
      payload: {
        code: 'SAVE20',
        discountType: 'PERCENTAGE',
        discount: 20,
        minSpend: 50,
        maxDiscount: 50,
        startsAt: new Date(Date.now() - 3600000).toISOString(),
        expiresAt: new Date(Date.now() + 86400000).toISOString(),
      },
    });

    expect(createRes.statusCode).toBe(201);

    // 2. Validate coupon on 200 order
    const validateRes = await app.inject({
      method: 'POST',
      url: '/api/v1/coupons/validate',
      headers: {
        authorization: `Bearer ${customerToken}`,
        'x-tenant-id': tenant._id.toString(),
      },
      payload: {
        code: 'SAVE20',
        orderAmount: 200,
      },
    });

    expect(validateRes.statusCode).toBe(200);
    const body = JSON.parse(validateRes.body);
    expect(body.success).toBe(true);
    expect(body.data.discountAmount).toBe(40);
    expect(body.data.finalAmount).toBe(160);
  });
});
