import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { connectTestDb, clearTestDb, disconnectTestDb, createTestToken, isDbConnected } from '../helpers/testDatabase.js';
import { buildApp } from '../../src/app.js';
import { TenantModel } from '../../src/modules/tenant/tenant.model.js';
import { UserModel } from '../../src/modules/user/user.model.js';
import { FastifyInstance } from 'fastify';

describe('Multi-Tenant SaaS Isolation & Security Guard', () => {
  let app: FastifyInstance;
  let tenantA: any;
  let tenantB: any;
  let adminA: any;
  let tokenAdminA: string;

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

    tenantA = await TenantModel.create({
      name: 'Tenant Alpha Stores',
      slug: 'tenant-alpha',
      code: 'alpha101',
      category: 'Electronics',
    });

    tenantB = await TenantModel.create({
      name: 'Tenant Beta Fashion',
      slug: 'tenant-beta',
      code: 'beta202',
      category: 'Apparel',
    });

    adminA = await UserModel.create({
      name: 'Admin Alpha',
      email: 'admin@alpha.com',
      password: 'password123',
      role: 'admin',
      tenantId: tenantA._id,
      company: tenantA._id,
    });

    tokenAdminA = createTestToken({
      id: adminA._id.toString(),
      role: 'admin',
      tenantId: tenantA._id.toString(),
    });

    await UserModel.create({
      name: 'Member Alpha 1',
      email: 'm1@alpha.com',
      password: 'password123',
      tenantId: tenantA._id,
      company: tenantA._id,
    });

    await UserModel.create({
      name: 'Member Beta 1',
      email: 'm1@beta.com',
      password: 'password123',
      tenantId: tenantB._id,
      company: tenantB._id,
    });
  });

  it('rejects cross-tenant access and protects tenant boundary', async () => {
    if (!isDbConnected) return;

    const res = await app.inject({
      method: 'GET',
      url: '/api/v1/users',
      headers: {
        authorization: `Bearer ${tokenAdminA}`,
        'x-tenant-id': tenantB._id.toString(), // Tampering attempt
      },
    });

    expect(res.statusCode).toBe(403);
    const body = JSON.parse(res.body);
    expect(body.success).toBe(false);
    expect(body.message).toContain('Cross-tenant violation');
  });
});
