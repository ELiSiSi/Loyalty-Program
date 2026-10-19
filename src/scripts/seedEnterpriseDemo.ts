import mongoose from 'mongoose';
import { connectDatabase, disconnectDatabase } from '../config/database.js';
import { TenantModel } from '../modules/tenant/tenant.model.js';
import { UserModel } from '../modules/user/user.model.js';
import { CampaignModel } from '../modules/campaign/campaign.model.js';
import { CouponModel } from '../modules/coupon/coupon.model.js';
import { RewardModel } from '../modules/reward/reward.model.js';
import { PointsService } from '../modules/points/points.service.js';

async function seedEnterpriseDemo() {
  console.log('🌱 Starting Enterprise SaaS Seeding...');
  await connectDatabase();

  // Clear existing demo data
  await Promise.all([
    TenantModel.deleteMany({}),
    UserModel.deleteMany({}),
    CampaignModel.deleteMany({}),
    CouponModel.deleteMany({}),
    RewardModel.deleteMany({}),
  ]);

  // 1. Create Global Super Admin
  const superAdmin = await UserModel.create({
    name: 'SaaS Platform Owner',
    email: 'superadmin@loyaltyplatform.io',
    password: 'SuperAdmin123!',
    role: 'superAdmin',
    is_active: true,
  });
  console.log(`👑 Super Admin created: ${superAdmin.email}`);

  // 2. Create Tenant 1: Noon Superstore (Enterprise Tier)
  const tenantNoon = await TenantModel.create({
    name: 'Noon Superstore LLC',
    slug: 'noon',
    code: 'noon888',
    category: 'E-commerce & Retail',
    logo: 'https://res.cloudinary.com/dr0xirap5/image/upload/v1782557156/uploads/general/noon_logo.png',
    plan: 'enterprise',
    status: 'active',
    settings: {
      currency: 'AED',
      pointsPercentage: 2, // 2% points back
      pointsExpiryDays: 365,
      tierBonusEnabled: true,
    },
    limits: {
      maxUsers: 1000000,
      maxCampaigns: 500,
      monthlyTransactionLimit: 5000000,
    },
    owner: superAdmin._id,
  });
  console.log(`🏢 Tenant 1 Created: ${tenantNoon.name} (Slug: ${tenantNoon.slug})`);

  // 3. Create Tenant Admin for Noon
  const noonAdmin = await UserModel.create({
    name: 'Noon Loyalty Director',
    email: 'admin@noon.com',
    password: 'NoonAdmin123!',
    role: 'admin',
    tenantId: tenantNoon._id,
    company: tenantNoon._id,
  });

  // 4. Create VIP Members under Noon
  const memberGold = await UserModel.create({
    name: 'Sultan Al-Mansoor',
    email: 'sultan@gold.com',
    password: 'Password123!',
    role: 'user',
    tenantId: tenantNoon._id,
    company: tenantNoon._id,
    vipTier: 'gold',
    availablePoints: 12500,
    totalPoints: 12500,
    lifetimePoints: 14000,
  });

  const memberSilver = await UserModel.create({
    name: 'Layla Mahmoud',
    email: 'layla@silver.com',
    password: 'Password123!',
    role: 'user',
    tenantId: tenantNoon._id,
    company: tenantNoon._id,
    vipTier: 'silver',
    availablePoints: 3400,
    totalPoints: 3400,
    lifetimePoints: 4200,
  });

  // 5. Create Promotional Campaign (Double Points Weekend)
  await CampaignModel.create({
    tenantId: tenantNoon._id,
    title: 'Weekend 2X Double Points Extravaganza',
    description: 'Earn double loyalty points on all electronics and fashion purchases this weekend.',
    type: 'POINTS_MULTIPLIER',
    value: 2.0,
    startsAt: new Date(Date.now() - 24 * 3600 * 1000),
    endsAt: new Date(Date.now() + 7 * 24 * 3600 * 1000),
    isActive: true,
    minimumSpend: 100,
    eligibleTiers: ['bronze', 'silver', 'gold', 'platinum'],
  });

  // 6. Create Coupons
  await CouponModel.create({
    tenantId: tenantNoon._id,
    code: 'NOONVIP20',
    discountType: 'PERCENTAGE',
    discount: 20,
    minSpend: 200,
    maxDiscount: 100,
    startsAt: new Date(),
    expiresAt: new Date(Date.now() + 30 * 24 * 3600 * 1000),
    maxUses: 5000,
  });

  // 7. Create Rewards Catalog
  await RewardModel.create([
    {
      tenantId: tenantNoon._id,
      title: '100 AED Noon Shopping E-Gift Card',
      description: 'Instant 100 AED discount voucher for use across noon.com',
      pointsCost: 2000,
      stockQuantity: 150,
      expiryDays: 90,
    },
    {
      tenantId: tenantNoon._id,
      title: 'Free Express Priority Shipping Pass (1 Month)',
      description: 'Get free same-day and next-day delivery on all noon orders',
      pointsCost: 800,
      stockQuantity: 500,
      expiryDays: 30,
    },
  ]);

  // 8. Record initial ledger transactions for demo
  await PointsService.earnPoints({
    tenantId: tenantNoon._id.toString(),
    userId: memberGold._id.toString(),
    amount: 1500,
    referenceType: 'ORDER',
    referenceId: 'ORD-DEMO-001',
    description: 'Welcome loyalty reward & initial purchase',
  });

  console.log('✅ Enterprise SaaS Demo Seed Completed Successfully!');
  console.log(`
  Super Admin Credentials:
  - Email:    superadmin@loyaltyplatform.io
  - Password: SuperAdmin123!

  Tenant Admin (Noon):
  - Email:    admin@noon.com
  - Password: NoonAdmin123!
  - Tenant:   x-tenant-slug: noon

  VIP Gold Member:
  - Email:    sultan@gold.com
  - Password: Password123!
  `);

  await disconnectDatabase();
}

seedEnterpriseDemo().catch((err) => {
  console.error('Seed error:', err);
  process.exit(1);
});
