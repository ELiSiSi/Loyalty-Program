import { FastifyReply, FastifyRequest } from 'fastify';
import { CouponService } from './coupon.service.js';
import { successResponse } from '../../utils/response.js';
import { createCouponSchema, validateCouponSchema } from './coupon.schema.js';

export class CouponController {
  static async create(request: FastifyRequest, reply: FastifyReply) {
    const data = createCouponSchema.parse(request.body);
    const tenantId = request.tenant?.id || request.user?.tenantId?.toString();
    const coupon = await CouponService.createCoupon(tenantId!, data);
    return reply.status(201).send(successResponse(coupon, 'Coupon created successfully.'));
  }

  static async validate(request: FastifyRequest, reply: FastifyReply) {
    const { code, orderAmount } = validateCouponSchema.parse(request.body);
    const tenantId = request.tenant?.id || request.user?.tenantId?.toString();
    const result = await CouponService.validateCoupon(tenantId!, code, orderAmount);
    return reply.send(successResponse(result, 'Coupon is valid.'));
  }

  static async list(
    request: FastifyRequest<{ Querystring: { page?: string; limit?: string } }>,
    reply: FastifyReply
  ) {
    const tenantId = request.tenant?.id || request.user?.tenantId?.toString();
    const { page, limit } = request.query;

    const result = await CouponService.listCoupons(tenantId!, {
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 20,
    });

    return reply.send(
      successResponse(result.coupons, 'Coupons listed successfully', {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: result.totalPages,
      })
    );
  }

  static async delete(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const tenantId = request.tenant?.id || request.user?.tenantId?.toString();
    await CouponService.deleteCoupon(tenantId!, request.params.id);
    return reply.send(successResponse(null, 'Coupon deleted successfully.'));
  }
}
