import { FastifyInstance } from 'fastify';
import { BookingController } from './booking.controller.js';
import { authenticate } from '../../middlewares/authenticate.js';
import { restrictTo } from '../../middlewares/authorize.js';
import { resolveTenantContext } from '../../middlewares/tenantContext.js';

export async function bookingRoutes(app: FastifyInstance) {
  // Member creates a booking / reservation
  app.post('/', {
    preHandler: [authenticate, resolveTenantContext],
    schema: {
      tags: ['Bookings'],
      summary: 'Create reservation with optional coupon or loyalty points discount',
      security: [{ bearerAuth: [] }, { tenantHeader: [] }],
    },
    handler: BookingController.create,
  });

  // List bookings (Member sees own, Staff/Admin sees tenant bookings)
  app.get('/', {
    preHandler: [authenticate, resolveTenantContext],
    schema: {
      tags: ['Bookings'],
      summary: 'List bookings with status filter and pagination',
      security: [{ bearerAuth: [] }, { tenantHeader: [] }],
    },
    handler: BookingController.list,
  });

  // Confirm booking payment (Staff/Admin/Payment gateway)
  app.patch('/:id/confirm', {
    preHandler: [authenticate, resolveTenantContext, restrictTo('superAdmin', 'admin', 'staff')],
    schema: {
      tags: ['Bookings'],
      summary: 'Confirm reservation payment (Staff/Admin)',
      security: [{ bearerAuth: [] }, { tenantHeader: [] }],
    },
    handler: BookingController.confirm,
  });

  // Complete booking (releases earned loyalty points to customer!)
  app.patch('/:id/complete', {
    preHandler: [authenticate, resolveTenantContext, restrictTo('superAdmin', 'admin', 'staff')],
    schema: {
      tags: ['Bookings'],
      summary: 'Mark booking completed and release earned loyalty points (Staff/Admin)',
      security: [{ bearerAuth: [] }, { tenantHeader: [] }],
    },
    handler: BookingController.complete,
  });

  // Cancel booking (refunds points if used)
  app.patch('/:id/cancel', {
    preHandler: [authenticate, resolveTenantContext],
    schema: {
      tags: ['Bookings'],
      summary: 'Cancel booking and automatically refund points if used',
      security: [{ bearerAuth: [] }, { tenantHeader: [] }],
    },
    handler: BookingController.cancel,
  });
}
