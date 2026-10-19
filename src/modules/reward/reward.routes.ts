import { FastifyInstance } from 'fastify';
import { RewardController } from './reward.controller.js';
import { authenticate } from '../../middlewares/authenticate.js';
import { restrictTo } from '../../middlewares/authorize.js';
import { resolveTenantContext } from '../../middlewares/tenantContext.js';

export async function rewardRoutes(app: FastifyInstance) {
  // Browse rewards catalog
  app.get('/', {
    preHandler: [authenticate, resolveTenantContext],
    schema: {
      tags: ['Rewards & Gifts'],
      summary: 'Browse tenant rewards catalog with point requirements',
      security: [{ bearerAuth: [] }, { tenantHeader: [] }],
    },
    handler: RewardController.list,
  });

  // Member redeems a reward for points
  app.post('/redeem', {
    preHandler: [authenticate, resolveTenantContext],
    schema: {
      tags: ['Rewards & Gifts'],
      summary: 'Redeem reward using accumulated loyalty points',
      description: 'Deducts points from balance, decrements stock, and generates digital voucher code.',
      security: [{ bearerAuth: [] }, { tenantHeader: [] }, { idempotencyHeader: [] }],
    },
    handler: RewardController.redeem,
  });

  // View member's issued vouchers
  app.get('/my-vouchers', {
    preHandler: [authenticate, resolveTenantContext],
    schema: {
      tags: ['Rewards & Gifts'],
      summary: 'Get list of redeemed vouchers for current member',
      security: [{ bearerAuth: [] }, { tenantHeader: [] }],
    },
    handler: RewardController.getMyVouchers,
  });

  // Staff / Cashier claims customer voucher
  app.post('/claim', {
    preHandler: [authenticate, resolveTenantContext, restrictTo('superAdmin', 'admin', 'staff')],
    schema: {
      tags: ['Rewards & Gifts'],
      summary: 'Verify and claim voucher code (Store Staff / POS)',
      security: [{ bearerAuth: [] }, { tenantHeader: [] }],
    },
    handler: RewardController.claim,
  });

  // Admin manages rewards
  app.post('/', {
    preHandler: [authenticate, resolveTenantContext, restrictTo('superAdmin', 'admin')],
    schema: {
      tags: ['Rewards & Gifts'],
      summary: 'Add a new reward to catalog (Admin)',
      security: [{ bearerAuth: [] }, { tenantHeader: [] }],
    },
    handler: RewardController.create,
  });
}
