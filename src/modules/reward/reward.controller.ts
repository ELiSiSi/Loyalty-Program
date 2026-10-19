import { FastifyReply, FastifyRequest } from 'fastify';
import { RewardService } from './reward.service.js';
import { successResponse } from '../../utils/response.js';
import {
  createRewardSchema,
  updateRewardSchema,
  redeemRewardSchema,
  claimVoucherSchema,
} from './reward.schema.js';
import { storeIdempotencyResult } from '../../middlewares/idempotency.js';

export class RewardController {
  static async create(request: FastifyRequest, reply: FastifyReply) {
    const data = createRewardSchema.parse(request.body);
    const tenantId = request.tenant?.id || request.user?.tenantId?.toString();
    const reward = await RewardService.createReward(tenantId!, data);
    return reply.status(201).send(successResponse(reward, 'Reward created in catalog.'));
  }

  static async list(
    request: FastifyRequest<{ Querystring: { page?: string; limit?: string; activeOnly?: string } }>,
    reply: FastifyReply
  ) {
    const tenantId = request.tenant?.id || request.user?.tenantId?.toString();
    const { page, limit, activeOnly } = request.query;

    const result = await RewardService.listRewards(tenantId!, {
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 20,
      activeOnly: activeOnly === 'true' || request.user?.role === 'user',
    });

    return reply.send(
      successResponse(result.rewards, 'Rewards retrieved', {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: result.totalPages,
      })
    );
  }

  static async redeem(request: FastifyRequest, reply: FastifyReply) {
    const { rewardId, idempotencyKey } = redeemRewardSchema.parse(request.body);
    const tenantId = request.tenant?.id || request.user?.tenantId?.toString();

    const result = await RewardService.redeemReward({
      tenantId: tenantId!,
      userId: request.user!.id,
      rewardId,
      idempotencyKey: idempotencyKey || request.idempotencyKey,
    });

    const resBody = successResponse(result, 'Reward redeemed successfully! Present voucher code at store.');
    if (request.idempotencyKey) {
      storeIdempotencyResult(request.idempotencyKey, 201, resBody);
    }
    return reply.status(201).send(resBody);
  }

  static async claim(request: FastifyRequest, reply: FastifyReply) {
    const { voucherCode } = claimVoucherSchema.parse(request.body);
    const tenantId = request.tenant?.id || request.user?.tenantId?.toString();

    const voucher = await RewardService.claimVoucher({
      tenantId: tenantId!,
      voucherCode,
      staffId: request.user!.id,
    });

    return reply.send(successResponse(voucher, 'Voucher verified and claimed successfully.'));
  }

  static async getMyVouchers(request: FastifyRequest, reply: FastifyReply) {
    const tenantId = request.tenant?.id || request.user?.tenantId?.toString();
    const vouchers = await RewardService.getUserVouchers(tenantId!, request.user!.id);
    return reply.send(successResponse(vouchers));
  }
}
