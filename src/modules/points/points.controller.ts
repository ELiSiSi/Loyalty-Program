import { FastifyReply, FastifyRequest } from 'fastify';
import { PointsService } from './points.service.js';
import { successResponse } from '../../utils/response.js';
import {
  earnPointsSchema,
  redeemPointsSchema,
  adjustPointsSchema,
  calculatePointsSchema,
} from './points.schema.js';
import { storeIdempotencyResult } from '../../middlewares/idempotency.js';

export class PointsController {
  static async earn(request: FastifyRequest, reply: FastifyReply) {
    const data = earnPointsSchema.parse(request.body);
    const tenantId = request.tenant?.id || request.user?.tenantId?.toString();

    const result = await PointsService.earnPoints({
      ...data,
      tenantId: tenantId!,
      idempotencyKey: data.idempotencyKey || request.idempotencyKey,
      actorId: request.user?.id,
    });

    const resBody = successResponse(result, 'Points successfully credited.');
    if (request.idempotencyKey) {
      storeIdempotencyResult(request.idempotencyKey, 201, resBody);
    }
    return reply.status(201).send(resBody);
  }

  static async redeem(request: FastifyRequest, reply: FastifyReply) {
    const data = redeemPointsSchema.parse(request.body);
    const tenantId = request.tenant?.id || request.user?.tenantId?.toString();
    const targetUserId = data.userId || request.user!.id;

    const result = await PointsService.redeemPoints({
      ...data,
      tenantId: tenantId!,
      userId: targetUserId,
      idempotencyKey: data.idempotencyKey || request.idempotencyKey,
      actorId: request.user?.id,
    });

    const resBody = successResponse(result, 'Points successfully redeemed.');
    if (request.idempotencyKey) {
      storeIdempotencyResult(request.idempotencyKey, 200, resBody);
    }
    return reply.send(resBody);
  }

  static async adjust(request: FastifyRequest, reply: FastifyReply) {
    const data = adjustPointsSchema.parse(request.body);
    const tenantId = request.tenant?.id || request.user?.tenantId?.toString();

    const result = await PointsService.adjustPoints({
      tenantId: tenantId!,
      userId: data.userId,
      amount: data.amount,
      reason: data.reason,
      actorId: request.user!.id,
    });

    return reply.send(successResponse(result, 'Points adjusted successfully by staff.'));
  }

  static async calculate(request: FastifyRequest, reply: FastifyReply) {
    const data = calculatePointsSchema.parse(request.body);
    const tenantId = request.tenant?.id || request.user?.tenantId?.toString();

    const result = await PointsService.calculateOrderPoints({
      tenantId: tenantId!,
      orderAmount: data.orderAmount,
      userId: data.userId || request.user?.id,
    });

    return reply.send(successResponse(result));
  }

  static async getMyHistory(
    request: FastifyRequest<{ Querystring: { page?: string; limit?: string; type?: string } }>,
    reply: FastifyReply
  ) {
    const tenantId = request.tenant?.id || request.user?.tenantId?.toString();
    const { page, limit, type } = request.query;

    const result = await PointsService.getUserLedger({
      tenantId: tenantId!,
      userId: request.user!.id,
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 20,
      type,
    });

    return reply.send(
      successResponse(result.transactions, 'Point history retrieved', {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: result.totalPages,
      })
    );
  }

  static async getUserHistory(
    request: FastifyRequest<{ Params: { userId: string }; Querystring: { page?: string; limit?: string; type?: string } }>,
    reply: FastifyReply
  ) {
    const tenantId = request.tenant?.id || request.user?.tenantId?.toString();
    const { page, limit, type } = request.query;

    const result = await PointsService.getUserLedger({
      tenantId: tenantId!,
      userId: request.params.userId,
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 20,
      type,
    });

    return reply.send(
      successResponse(result.transactions, 'User point history retrieved', {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: result.totalPages,
      })
    );
  }
}
