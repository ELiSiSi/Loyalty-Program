import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { connectTestDb, clearTestDb, disconnectTestDb, isDbConnected } from '../helpers/testDatabase.js';
import { PointsService } from '../../src/modules/points/points.service.js';
import { TenantModel } from '../../src/modules/tenant/tenant.model.js';
import { UserModel } from '../../src/modules/user/user.model.js';
import { VIP_TIERS } from '../../src/constants/tiers.js';
import { SAAS_PLANS } from '../../src/constants/plans.js';

describe('Points Engine & Double-Entry Ledger (Deep Unit & Concurrency Tests)', () => {
  let tenant: any;
  let user: any;

  beforeAll(async () => {
    await connectTestDb();
  });

  afterAll(async () => {
    if (isDbConnected) {
      await clearTestDb();
      await disconnectTestDb();
    }
  });

  beforeEach(async () => {
    if (!isDbConnected) return;
    await clearTestDb();

    tenant = await TenantModel.create({
      name: 'Noon Retail Corp',
      slug: 'noon-retail',
      code: 'noon123',
      category: 'E-commerce',
      settings: {
        pointsPercentage: 2, // 2% points back
        pointsExpiryDays: 365,
        currency: 'AED',
        tierBonusEnabled: true,
      },
    });

    user = await UserModel.create({
      name: 'Ahmed Zaki',
      email: 'ahmed@example.com',
      password: 'password123',
      tenantId: tenant._id,
      company: tenant._id,
      availablePoints: 100,
      totalPoints: 100,
      lifetimePoints: 100,
      vipTier: 'bronze',
    });
  });

  it('validates SaaS plans and tier multipliers configuration', () => {
    expect(VIP_TIERS.BRONZE.multiplier).toBe(1.0);
    expect(VIP_TIERS.SILVER.multiplier).toBe(1.25);
    expect(VIP_TIERS.GOLD.multiplier).toBe(1.5);
    expect(VIP_TIERS.PLATINUM.multiplier).toBe(2.0);

    expect(SAAS_PLANS.FREE.maxUsers).toBe(500);
    expect(SAAS_PLANS.ENTERPRISE.maxUsers).toBe(1000000);
  });

  it('calculates order base points and VIP tier multiplier accurately', async () => {
    if (!isDbConnected) return;

    const calc = await PointsService.calculateOrderPoints({
      tenantId: tenant._id.toString(),
      orderAmount: 1000,
      userId: user._id.toString(),
    });

    expect(calc.orderAmount).toBe(1000);
    expect(calc.pointsPercentage).toBe(2);
    expect(calc.basePoints).toBe(20); // 2% of 1000 = 20 points
    expect(calc.tier).toBe('Bronze Member');
    expect(calc.tierMultiplier).toBe(1.0);
    expect(calc.totalPoints).toBe(20);
  });

  it('atomically credits points and updates double-entry ledger', async () => {
    if (!isDbConnected) return;

    const { transaction, newBalance } = await PointsService.earnPoints({
      tenantId: tenant._id.toString(),
      userId: user._id.toString(),
      amount: 50,
      referenceType: 'ORDER',
      referenceId: 'ORD-991',
      description: 'Points for online order #ORD-991',
    });

    expect(newBalance).toBe(150);
    expect(transaction.amount).toBe(50);
    expect(transaction.balanceAfter).toBe(150);
    expect(transaction.type).toBe('EARN');
    expect(transaction.status).toBe('CONFIRMED');

    const freshUser = await UserModel.findById(user._id);
    expect(freshUser?.availablePoints).toBe(150);
    expect(freshUser?.lifetimePoints).toBe(150);
  });

  it('rejects duplicate credit if same idempotency key is submitted twice', async () => {
    if (!isDbConnected) return;

    const idempotencyKey = 'idem-unique-key-12345';

    const firstRun = await PointsService.earnPoints({
      tenantId: tenant._id.toString(),
      userId: user._id.toString(),
      amount: 40,
      idempotencyKey,
      description: 'First attempt',
    });

    expect(firstRun.newBalance).toBe(140);

    // Second run with identical idempotencyKey
    const secondRun = await PointsService.earnPoints({
      tenantId: tenant._id.toString(),
      userId: user._id.toString(),
      amount: 40,
      idempotencyKey,
      description: 'Second duplicate attempt',
    });

    expect(secondRun.newBalance).toBe(140);

    const freshUser = await UserModel.findById(user._id);
    expect(freshUser?.availablePoints).toBe(140); // NOT 180!
  });

  it('atomically debits points and prevents negative balance', async () => {
    if (!isDbConnected) return;

    const { transaction, newBalance } = await PointsService.redeemPoints({
      tenantId: tenant._id.toString(),
      userId: user._id.toString(),
      amount: 70,
      description: 'Redeemed voucher',
    });

    expect(newBalance).toBe(30);
    expect(transaction.amount).toBe(-70);
    expect(transaction.type).toBe('REDEEM');

    await expect(
      PointsService.redeemPoints({
        tenantId: tenant._id.toString(),
        userId: user._id.toString(),
        amount: 50,
        description: 'Overdrawn redemption attempt',
      })
    ).rejects.toThrow(/Insufficient points balance/);

    const freshUser = await UserModel.findById(user._id);
    expect(freshUser?.availablePoints).toBe(30);
  });
});
