import { FastifyReply, FastifyRequest } from 'fastify';
import { UserService } from './user.service.js';
import { successResponse } from '../../utils/response.js';
import { updateUserProfileSchema, updateMemberTierSchema } from './user.schema.js';

export class UserController {
  static async getMe(request: FastifyRequest, reply: FastifyReply) {
    const user = await UserService.getUserById(request.user!.id);
    return reply.send(successResponse(user));
  }

  static async updateMe(request: FastifyRequest, reply: FastifyReply) {
    const validatedData = updateUserProfileSchema.parse(request.body);
    const updated = await UserService.updateProfile(request.user!.id, validatedData);
    return reply.send(successResponse(updated, 'Profile updated successfully.'));
  }

  static async listMembers(
    request: FastifyRequest<{ Querystring: { page?: string; limit?: string; search?: string; tier?: string; role?: string } }>,
    reply: FastifyReply
  ) {
    const tenantId = request.tenant?.id || request.user?.tenantId?.toString();
    const { page, limit, search, tier, role } = request.query;

    const result = await UserService.listMembersByTenant(tenantId!, {
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 20,
      search,
      tier,
      role,
    });

    return reply.send(
      successResponse(result.members, 'Members retrieved successfully', {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: result.totalPages,
      })
    );
  }

  static async getMemberDetails(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const user = await UserService.getUserById(request.params.id);
    return reply.send(successResponse(user));
  }

  static async setTier(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const { vipTier } = updateMemberTierSchema.parse(request.body);
    const user = await UserService.getUserById(request.params.id);
    user.vipTier = vipTier as any;
    await user.save({ validateBeforeSave: false });
    return reply.send(successResponse(user, `Member tier manually updated to ${vipTier}.`));
  }

  static async toggleStatus(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const user = await UserService.getUserById(request.params.id);
    const updated = await UserService.setUserStatus(user._id.toString(), !user.is_active);
    return reply.send(successResponse(updated, `User status updated to ${updated.is_active ? 'active' : 'inactive'}.`));
  }

  static async getMembershipCard(request: FastifyRequest, reply: FastifyReply) {
    const user = await UserService.getUserById(request.user!.id);
    const tenantId = request.tenant?.id || user.tenantId?.toString() || 'global';

    const cardPayload = {
      type: 'LOYALTY_MEMBER_CARD',
      memberId: user._id.toString(),
      email: user.email,
      tenantId,
      tier: user.vipTier,
      issuedAt: new Date().toISOString(),
    };

    const { QrCodeService } = await import('../../utils/qrcode.js');
    const qrDataUrl = await QrCodeService.generateDataUrl(cardPayload);

    return reply.send(
      successResponse(
        {
          memberId: user._id.toString(),
          name: user.name,
          email: user.email,
          vipTier: user.vipTier,
          availablePoints: user.availablePoints,
          tenantName: (user.tenantId as any)?.name || 'Loyalty Partner',
          qrCode: qrDataUrl,
        },
        'Digital membership card generated.'
      )
    );
  }
}
