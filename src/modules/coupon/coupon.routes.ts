import { FastifyInstance } from 'fastify';
import { CouponController } from './coupon.controller.js';
import { authenticate } from '../../middlewares/authenticate.js';
import { restrictTo } from '../../middlewares/authorize.js';
import { resolveTenantContext } from '../../middlewares/tenantContext.js';

export async function couponRoutes(app: FastifyInstance) {
  // Validate coupon (Customer checkout or POS)
  app.post('/validate', {
    preHandler: [authenticate, resolveTenantContext],
    schema: {
      tags: ['Coupons'],
      summary: 'Validate coupon code against order amount and dates',
      security: [{ bearerAuth: [] }, { tenantHeader: [] }],
    },
    handler: CouponController.validate,
  });

  // List coupons
  app.get('/', {
    preHandler: [authenticate, resolveTenantContext],
    schema: {
      tags: ['Coupons'],
      summary: 'List tenant discount coupons',
      security: [{ bearerAuth: [] }, { tenantHeader: [] }],
    },
    handler: CouponController.list,
  });

  // Admin coupon management
  app.post('/', {
    preHandler: [authenticate, resolveTenantContext, restrictTo('superAdmin', 'admin')],
    schema: {
      tags: ['Coupons'],
      summary: 'Create a new coupon code (Admin)',
      security: [{ bearerAuth: [] }, { tenantHeader: [] }],
    },
    handler: CouponController.create,
  });

  app.delete('/:id', {
    preHandler: [authenticate, resolveTenantContext, restrictTo('superAdmin', 'admin')],
    schema: {
      tags: ['Coupons'],
      summary: 'Delete coupon (Admin)',
      security: [{ bearerAuth: [] }, { tenantHeader: [] }],
    },
    handler: CouponController.delete,
  });
}
