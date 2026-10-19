import { FastifyInstance } from 'fastify';
import { PointsController } from './points.controller.js';
import { authenticate } from '../../middlewares/authenticate.js';
import { restrictTo } from '../../middlewares/authorize.js';
import { resolveTenantContext } from '../../middlewares/tenantContext.js';
import { requireIdempotency } from '../../middlewares/idempotency.js';

export async function pointsRoutes(app: FastifyInstance) {
  // Earn points (Staff / Admin POS or verified system)
  app.post('/earn', {
    preHandler: [authenticate, resolveTenantContext, restrictTo('superAdmin', 'admin', 'staff')],
    schema: {
      tags: ['Points & Ledger'],
      summary: 'Credit points to customer (Cashier / POS integration)',
      description: 'Records an atomic earn transaction in the double-entry points ledger and checks VIP tier progression.',
      security: [{ bearerAuth: [] }, { tenantHeader: [] }, { idempotencyHeader: [] }],
    },
    handler: PointsController.earn,
  });

  // Redeem points (Member or Staff on behalf of Member)
  app.post('/redeem', {
    preHandler: [authenticate, resolveTenantContext],
    schema: {
      tags: ['Points & Ledger'],
      summary: 'Debit points from balance (Member redemption or POS checkout)',
      description: 'Conditionally debits points ensuring available balance never drops below zero.',
      security: [{ bearerAuth: [] }, { tenantHeader: [] }, { idempotencyHeader: [] }],
    },
    handler: PointsController.redeem,
  });

  // Adjust points manually (Admin / Manager only)
  app.post('/adjust', {
    preHandler: [authenticate, resolveTenantContext, restrictTo('superAdmin', 'admin')],
    schema: {
      tags: ['Points & Ledger'],
      summary: 'Manually adjust customer points with audit reason (Admin)',
      security: [{ bearerAuth: [] }, { tenantHeader: [] }],
    },
    handler: PointsController.adjust,
  });

  // Smart points calculation preview
  app.post('/calculate', {
    preHandler: [authenticate, resolveTenantContext],
    schema: {
      tags: ['Points & Ledger'],
      summary: 'Simulate/Calculate points preview for an order amount',
      description: 'Applies tenant point rules, VIP tier multipliers, and promotional bonuses.',
      security: [{ bearerAuth: [] }, { tenantHeader: [] }],
    },
    handler: PointsController.calculate,
  });

  // Current customer's points ledger history
  app.get('/my-history', {
    preHandler: [authenticate, resolveTenantContext],
    schema: {
      tags: ['Points & Ledger'],
      summary: 'Get current member points transaction ledger with pagination',
      security: [{ bearerAuth: [] }, { tenantHeader: [] }],
    },
    handler: PointsController.getMyHistory,
  });

  // Staff/Admin lookup of specific customer's ledger
  app.get('/user/:userId', {
    preHandler: [authenticate, resolveTenantContext, restrictTo('superAdmin', 'admin', 'staff')],
    schema: {
      tags: ['Points & Ledger'],
      summary: 'Get specific customer points ledger history (Staff/Admin)',
      security: [{ bearerAuth: [] }, { tenantHeader: [] }],
    },
    handler: PointsController.getUserHistory,
  });
}
