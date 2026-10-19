import { FastifyInstance } from 'fastify';
import { WebhookController } from './webhook.controller.js';
import { authenticate } from '../../middlewares/authenticate.js';
import { restrictTo } from '../../middlewares/authorize.js';
import { resolveTenantContext } from '../../middlewares/tenantContext.js';

export async function webhookRoutes(app: FastifyInstance) {
  app.post('/', {
    preHandler: [authenticate, resolveTenantContext, restrictTo('superAdmin', 'admin')],
    schema: {
      tags: ['Webhooks'],
      summary: 'Register an outbound webhook endpoint (Admin)',
      description: 'Subscribe your e-commerce platform or POS to loyalty events with HMAC-SHA256 signature verification.',
      security: [{ bearerAuth: [] }, { tenantHeader: [] }],
    },
    handler: WebhookController.register,
  });

  app.get('/', {
    preHandler: [authenticate, resolveTenantContext, restrictTo('superAdmin', 'admin')],
    schema: {
      tags: ['Webhooks'],
      summary: 'List active webhook subscriptions (Admin)',
      security: [{ bearerAuth: [] }, { tenantHeader: [] }],
    },
    handler: WebhookController.list,
  });

  app.delete('/:id', {
    preHandler: [authenticate, resolveTenantContext, restrictTo('superAdmin', 'admin')],
    schema: {
      tags: ['Webhooks'],
      summary: 'Delete webhook subscription (Admin)',
      security: [{ bearerAuth: [] }, { tenantHeader: [] }],
    },
    handler: WebhookController.delete,
  });
}
