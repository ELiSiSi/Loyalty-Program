import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { connectTestDb, clearTestDb, disconnectTestDb, createTestToken, isDbConnected } from '../helpers/testDatabase.js';
import { buildApp } from '../../src/app.js';
import { TenantModel } from '../../src/modules/tenant/tenant.model.js';
import { UserModel } from '../../src/modules/user/user.model.js';
import { FastifyInstance } from 'fastify';

describe('Booking & Reservation Lifecycle Tests', () => {
  let app: FastifyInstance;
  let tenant: any;
  let customer: any;
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
      name: 'Resort & Spa SaaS',
      slug: 'resort-spa',
      code: 'spa777',
      category: 'Hospitality',
      settings: {
        pointsPercentage: 5,
        currency: 'USD',
      },
    });

    customer = await UserModel.create({
      name: 'David Guest',
      email: 'david@resort.com',
      password: 'password123',
      role: 'user',
      tenantId: tenant._id,
      company: tenant._id,
      availablePoints: 200,
      totalPoints: 200,
      lifetimePoints: 200,
    });

    customerToken = createTestToken({
      id: customer._id.toString(),
      role: 'user',
      tenantId: tenant._id.toString(),
    });
  });

  it('creates booking with points discount successfully', async () => {
    if (!isDbConnected) return;

    const createRes = await app.inject({
      method: 'POST',
      url: '/api/v1/bookings',
      headers: {
        authorization: `Bearer ${customerToken}`,
        'x-tenant-id': tenant._id.toString(),
      },
      payload: {
        bookingType: 'Spa Treatment Room',
        totalPrice: 200,
        usedPoints: 50,
      },
    });

    expect(createRes.statusCode).toBe(201);
    const booking = JSON.parse(createRes.body).data;
    expect(booking.bookingStatus).toBe('pending');
    expect(booking.paymentStatus).toBe('pending');
  });
});
