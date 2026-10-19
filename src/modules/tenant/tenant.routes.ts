import { FastifyInstance } from 'fastify';
import { TenantController } from './tenant.controller.js';
import { authenticate } from '../../middlewares/authenticate.js';
import { restrictTo } from '../../middlewares/authorize.js';
import { resolveTenantContext } from '../../middlewares/tenantContext.js';

export async function tenantRoutes(app: FastifyInstance) {
  // Public or SuperAdmin to register a new tenant
  app.post('/', {
    preHandler: [authenticate, restrictTo('superAdmin')],
    schema: {
      tags: ['Tenant'],
      summary: 'Register a new Tenant/Company (Super Admin)',
      security: [{ bearerAuth: [] }],
    },
    handler: TenantController.createTenant,
  });

  // Get current tenant from context
  app.get('/current', {
    preHandler: [authenticate, resolveTenantContext],
    schema: {
      tags: ['Tenant'],
      summary: 'Get active tenant context profile & settings',
      security: [{ bearerAuth: [] }, { tenantHeader: [] }],
    },
    handler: TenantController.getCurrentTenant,
  });

  // List all tenants (SuperAdmin only)
  app.get('/', {
    preHandler: [authenticate, restrictTo('superAdmin')],
    schema: {
      tags: ['Tenant'],
      summary: 'List all SaaS tenants with pagination and filtering',
      security: [{ bearerAuth: [] }],
    },
    handler: TenantController.listTenants,
  });

  // Get tenant by ID
  app.get('/:id', {
    preHandler: [authenticate],
    schema: {
      tags: ['Tenant'],
      summary: 'Get tenant details by ID',
      security: [{ bearerAuth: [] }],
    },
    handler: TenantController.getTenant,
  });

  // Update tenant configuration
  app.patch('/:id', {
    preHandler: [authenticate, restrictTo('superAdmin', 'admin')],
    schema: {
      tags: ['Tenant'],
      summary: 'Update tenant branding, rules, or currency',
      security: [{ bearerAuth: [] }],
    },
    handler: TenantController.updateTenant,
  });

  // Change tenant subscription plan
  app.patch('/:id/plan', {
    preHandler: [authenticate, restrictTo('superAdmin')],
    schema: {
      tags: ['Tenant'],
      summary: 'Change tenant SaaS plan tier and quota limits',
      security: [{ bearerAuth: [] }],
    },
    handler: TenantController.changePlan,
  });
}
