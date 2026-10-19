import { FastifyReply, FastifyRequest } from 'fastify';
import { BookingService } from './booking.service.js';
import { successResponse } from '../../utils/response.js';
import { createBookingSchema } from './booking.schema.js';

export class BookingController {
  static async create(request: FastifyRequest, reply: FastifyReply) {
    const data = createBookingSchema.parse(request.body);
    const tenantId = request.tenant?.id || request.user?.tenantId?.toString();

    const booking = await BookingService.createBooking({
      tenantId: tenantId!,
      userId: request.user!.id,
      ...data,
    });

    return reply.status(201).send(successResponse(booking, 'Booking created and slot temporarily held.'));
  }

  static async confirm(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const tenantId = request.tenant?.id || request.user?.tenantId?.toString();
    const booking = await BookingService.confirmBooking(tenantId!, request.params.id);
    return reply.send(successResponse(booking, 'Booking confirmed.'));
  }

  static async complete(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const tenantId = request.tenant?.id || request.user?.tenantId?.toString();
    const booking = await BookingService.completeBooking(tenantId!, request.params.id);
    return reply.send(successResponse(booking, 'Booking marked completed and loyalty points issued.'));
  }

  static async cancel(request: FastifyRequest<{ Params: { id: string }; Body: { reason?: string } }>, reply: FastifyReply) {
    const tenantId = request.tenant?.id || request.user?.tenantId?.toString();
    const booking = await BookingService.cancelBooking(tenantId!, request.params.id, request.body?.reason);
    return reply.send(successResponse(booking, 'Booking cancelled.'));
  }

  static async list(
    request: FastifyRequest<{ Querystring: { page?: string; limit?: string; status?: string; all?: string } }>,
    reply: FastifyReply
  ) {
    const tenantId = request.tenant?.id || request.user?.tenantId?.toString();
    const { page, limit, status, all } = request.query;

    const isStaffOrAdmin = request.user?.role === 'admin' || request.user?.role === 'staff' || request.user?.role === 'superAdmin';
    const userIdFilter = isStaffOrAdmin && all === 'true' ? undefined : request.user!.id;

    const result = await BookingService.listBookings(tenantId!, {
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 20,
      userId: userIdFilter,
      status,
    });

    return reply.send(
      successResponse(result.bookings, 'Bookings listed', {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: result.totalPages,
      })
    );
  }
}
