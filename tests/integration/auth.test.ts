import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { connectTestDb, clearTestDb, disconnectTestDb, createTestToken, isDbConnected } from '../helpers/testDatabase.js';
import { buildApp } from '../../src/app.js';
import { TenantModel } from '../../src/modules/tenant/tenant.model.js';
import { FastifyInstance } from 'fastify';

describe('Auth & RBAC Integration Tests', () => {
  let app: FastifyInstance;
  let tenant: any;

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
      name: 'Rehletna Travel',
      slug: 'rehletna',
      code: 'reh123',
      category: 'Travel & Tourism',
    });
  });

  it('verifies Fastify application boots and exposes /health endpoint', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/health',
    });

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);
    expect(body.status).toBe('UP');
    expect(body.framework).toBe('Fastify');
    expect(body.version).toBe('2.0.0');
  });

  it('registers a new member under a tenant and returns JWT tokens', async () => {
    if (!isDbConnected) return;

    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/register',
      payload: {
        name: 'Sarah Connor',
        email: 'sarah@terminator.com',
        password: 'passwordSecure123',
        tenantSlug: 'rehletna',
      },
    });

    expect(res.statusCode).toBe(201);
    const body = JSON.parse(res.body);
    expect(body.success).toBe(true);
    expect(body.data.user.email).toBe('sarah@terminator.com');
    expect(body.data.user.role).toBe('user');
    expect(body.data.tokens.accessToken).toBeDefined();
    expect(body.data.tokens.refreshToken).toBeDefined();
  });

  it('authenticates member and validates credentials', async () => {
    if (!isDbConnected) return;

    // Register
    await app.inject({
      method: 'POST',
      url: '/api/v1/auth/register',
      payload: {
        name: 'John Doe',
        email: 'john@doe.com',
        password: 'secretPassword123',
        tenantSlug: 'rehletna',
      },
    });

    // Login with valid credentials
    const validLogin = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/login',
      payload: {
        email: 'john@doe.com',
        password: 'secretPassword123',
      },
    });

    expect(validLogin.statusCode).toBe(200);
    const body = JSON.parse(validLogin.body);
    expect(body.success).toBe(true);
    expect(body.data.tokens.accessToken).toBeDefined();

    // Login with wrong password
    const wrongLogin = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/login',
      payload: {
        email: 'john@doe.com',
        password: 'wrongPassword',
      },
    });

    expect(wrongLogin.statusCode).toBe(401);
  });
});
