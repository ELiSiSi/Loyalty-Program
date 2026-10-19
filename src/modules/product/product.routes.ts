import { FastifyInstance } from 'fastify';
import { ProductModel } from './product.model.js';
import { successResponse } from '../../utils/response.js';
import { authenticate } from '../../middlewares/authenticate.js';
import { restrictTo } from '../../middlewares/authorize.js';
import { resolveTenantContext } from '../../middlewares/tenantContext.js';
import { NotFoundError } from '../../errors/appError.js';

export async function productRoutes(app: FastifyInstance) {
  // List products
  app.get('/', {
    preHandler: [authenticate, resolveTenantContext],
    schema: {
      tags: ['Products'],
      summary: 'List products and catalog items with point allocations',
      security: [{ bearerAuth: [] }, { tenantHeader: [] }],
    },
    handler: async (request, reply) => {
      const tenantId = request.tenant?.id || request.user?.tenantId?.toString();
      const products = await ProductModel.find({ tenantId, isActive: true }).sort({ createdAt: -1 });
      return reply.send(successResponse(products));
    },
  });

  // Create product (Admin)
  app.post('/', {
    preHandler: [authenticate, resolveTenantContext, restrictTo('superAdmin', 'admin')],
    schema: {
      tags: ['Products'],
      summary: 'Add a new product to catalog (Admin)',
      security: [{ bearerAuth: [] }, { tenantHeader: [] }],
    },
    handler: async (request, reply) => {
      const tenantId = request.tenant?.id || request.user?.tenantId?.toString();
      const product = await ProductModel.create({
        ...(request.body as any),
        tenantId,
        company: tenantId,
      });
      return reply.status(201).send(successResponse(product, 'Product created successfully.'));
    },
  });

  // Delete product (Admin)
  app.delete('/:id', {
    preHandler: [authenticate, resolveTenantContext, restrictTo('superAdmin', 'admin')],
    schema: {
      tags: ['Products'],
      summary: 'Delete product from catalog (Admin)',
      security: [{ bearerAuth: [] }, { tenantHeader: [] }],
    },
    handler: async (request, reply) => {
      const tenantId = request.tenant?.id || request.user?.tenantId?.toString();
      const deleted = await ProductModel.findOneAndDelete({ _id: (request.params as any).id, tenantId });
      if (!deleted) throw new NotFoundError('Product not found.');
      return reply.send(successResponse(null, 'Product deleted successfully.'));
    },
  });
}
