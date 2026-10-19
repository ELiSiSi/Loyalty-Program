import { FastifyInstance } from 'fastify';
import { UserController } from './user.controller.js';
import { authenticate } from '../../middlewares/authenticate.js';
import { restrictTo } from '../../middlewares/authorize.js';
import { resolveTenantContext } from '../../middlewares/tenantContext.js';

export async function userRoutes(app: FastifyInstance) {
  // Member's own profile
  app.get('/me', {
    preHandler: [authenticate],
    schema: {
      tags: ['Users'],
      summary: 'Get current logged-in user profile, tier, and points balance',
      security: [{ bearerAuth: [] }],
    },
    handler: UserController.getMe,
  });

  app.patch('/me', {
    preHandler: [authenticate],
    schema: {
      tags: ['Users'],
      summary: 'Update current user personal details',
      security: [{ bearerAuth: [] }],
    },
    handler: UserController.updateMe,
  });

  app.get('/me/card', {
    preHandler: [authenticate],
    schema: {
      tags: ['Users'],
      summary: 'Get digital membership card with live QR Code for in-store scanning',
      security: [{ bearerAuth: [] }],
    },
    handler: UserController.getMembershipCard,
  });

  // Tenant Admin / Staff managing members
  app.get('/', {
    preHandler: [authenticate, resolveTenantContext, restrictTo('superAdmin', 'admin', 'staff')],
    schema: {
      tags: ['Users'],
      summary: 'List tenant members with filtering, search, and pagination',
      security: [{ bearerAuth: [] }, { tenantHeader: [] }],
    },
    handler: UserController.listMembers,
  });

  app.get('/:id', {
    preHandler: [authenticate, resolveTenantContext, restrictTo('superAdmin', 'admin', 'staff')],
    schema: {
      tags: ['Users'],
      summary: 'Get specific member details and balance',
      security: [{ bearerAuth: [] }, { tenantHeader: [] }],
    },
    handler: UserController.getMemberDetails,
  });

  app.patch('/:id/tier', {
    preHandler: [authenticate, resolveTenantContext, restrictTo('superAdmin', 'admin')],
    schema: {
      tags: ['Users'],
      summary: 'Manually adjust member VIP tier (Admin)',
      security: [{ bearerAuth: [] }, { tenantHeader: [] }],
    },
    handler: UserController.setTier,
  });

  app.patch('/:id/status', {
    preHandler: [authenticate, resolveTenantContext, restrictTo('superAdmin', 'admin')],
    schema: {
      tags: ['Users'],
      summary: 'Toggle member active/inactive status (Admin)',
      security: [{ bearerAuth: [] }, { tenantHeader: [] }],
    },
    handler: UserController.toggleStatus,
  });
}
