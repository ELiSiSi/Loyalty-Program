import { FastifyInstance } from 'fastify';
import { CampaignController } from './campaign.controller.js';
import { authenticate } from '../../middlewares/authenticate.js';
import { restrictTo } from '../../middlewares/authorize.js';
import { resolveTenantContext } from '../../middlewares/tenantContext.js';

export async function campaignRoutes(app: FastifyInstance) {
  // List campaigns (Member views active campaigns, Admin views all)
  app.get('/', {
    preHandler: [authenticate, resolveTenantContext],
    schema: {
      tags: ['Campaigns'],
      summary: 'List promotional campaigns and bonus rules',
      security: [{ bearerAuth: [] }, { tenantHeader: [] }],
    },
    handler: CampaignController.list,
  });

  app.get('/:id', {
    preHandler: [authenticate, resolveTenantContext],
    schema: {
      tags: ['Campaigns'],
      summary: 'Get details of a specific campaign',
      security: [{ bearerAuth: [] }, { tenantHeader: [] }],
    },
    handler: CampaignController.getById,
  });

  // Admin campaign management
  app.post('/', {
    preHandler: [authenticate, resolveTenantContext, restrictTo('superAdmin', 'admin')],
    schema: {
      tags: ['Campaigns'],
      summary: 'Create and launch a new loyalty campaign (Admin)',
      security: [{ bearerAuth: [] }, { tenantHeader: [] }],
    },
    handler: CampaignController.create,
  });

  app.patch('/:id', {
    preHandler: [authenticate, resolveTenantContext, restrictTo('superAdmin', 'admin')],
    schema: {
      tags: ['Campaigns'],
      summary: 'Update or pause an existing campaign (Admin)',
      security: [{ bearerAuth: [] }, { tenantHeader: [] }],
    },
    handler: CampaignController.update,
  });

  app.delete('/:id', {
    preHandler: [authenticate, resolveTenantContext, restrictTo('superAdmin', 'admin')],
    schema: {
      tags: ['Campaigns'],
      summary: 'Delete a campaign (Admin)',
      security: [{ bearerAuth: [] }, { tenantHeader: [] }],
    },
    handler: CampaignController.delete,
  });
}
