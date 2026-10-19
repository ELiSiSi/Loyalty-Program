import mongoose, { Schema, Document, Types } from 'mongoose';
import { FastifyInstance } from 'fastify';
import { successResponse } from '../../utils/response.js';
import { authenticate } from '../../middlewares/authenticate.js';
import { restrictTo } from '../../middlewares/authorize.js';
import { resolveTenantContext } from '../../middlewares/tenantContext.js';
import { PointsService } from '../points/points.service.js';

export interface IPayment extends Document {
  _id: Types.ObjectId;
  tenantId: Types.ObjectId;
  userId: Types.ObjectId;
  bookingId?: Types.ObjectId;
  amount: number;
  currency: string;
  paymentMethod: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  pointsAccrued: number;
  transactionRef: string;
  createdAt: Date;
  updatedAt: Date;
}

const paymentSchema = new Schema<IPayment>(
  {
    tenantId: {
      type: Schema.Types.ObjectId,
      ref: 'Tenant',
      required: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    bookingId: {
      type: Schema.Types.ObjectId,
      ref: 'Booking',
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      default: 'SAR',
    },
    paymentMethod: {
      type: String,
      default: 'credit_card',
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'refunded'],
      default: 'completed',
      index: true,
    },
    pointsAccrued: {
      type: Number,
      default: 0,
    },
    transactionRef: {
      type: String,
      unique: true,
      required: true,
    },
  },
  {
    timestamps: true,
    collection: 'payments',
  }
);

paymentSchema.index({ tenantId: 1, userId: 1 });

export const PaymentModel =
  mongoose.models.Payment || mongoose.model<IPayment>('Payment', paymentSchema);

export async function paymentRoutes(app: FastifyInstance) {
  // Record payment and accrue loyalty points
  app.post('/', {
    preHandler: [authenticate, resolveTenantContext],
    schema: {
      tags: ['Payments'],
      summary: 'Record payment transaction and automatically credit loyalty points',
      security: [{ bearerAuth: [] }, { tenantHeader: [] }],
    },
    handler: async (request, reply) => {
      const tenantId = request.tenant?.id || request.user?.tenantId?.toString();
      const body = request.body as any;

      const calc = await PointsService.calculateOrderPoints({
        tenantId: tenantId!,
        orderAmount: body.amount,
        userId: request.user!.id,
      });

      const payment = await PaymentModel.create({
        tenantId,
        userId: request.user!.id,
        bookingId: body.bookingId,
        amount: body.amount,
        currency: body.currency || request.tenant?.currency || 'SAR',
        paymentMethod: body.paymentMethod || 'card',
        status: 'completed',
        pointsAccrued: calc.totalPoints,
        transactionRef: body.transactionRef || `TXN-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      });

      if (calc.totalPoints > 0) {
        await PointsService.earnPoints({
          tenantId: tenantId!,
          userId: request.user!.id,
          amount: calc.totalPoints,
          referenceType: 'ORDER',
          referenceId: payment._id.toString(),
          description: `Points accrued from payment #${payment.transactionRef}`,
        });
      }

      return reply.status(201).send(
        successResponse({ payment, pointsAccrued: calc.totalPoints }, 'Payment processed and loyalty points issued.')
      );
    },
  });

  // List user's payments
  app.get('/my-payments', {
    preHandler: [authenticate, resolveTenantContext],
    schema: {
      tags: ['Payments'],
      summary: 'Get current customer payment transaction history',
      security: [{ bearerAuth: [] }, { tenantHeader: [] }],
    },
    handler: async (request, reply) => {
      const tenantId = request.tenant?.id || request.user?.tenantId?.toString();
      const payments = await PaymentModel.find({ tenantId, userId: request.user!.id }).sort({ createdAt: -1 });
      return reply.send(successResponse(payments));
    },
  });
}
