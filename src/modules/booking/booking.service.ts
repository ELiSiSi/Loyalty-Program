import { BookingModel } from './booking.model.js';
import { IBooking, BookingStatus } from './booking.types.js';
import { CouponService } from '../coupon/coupon.service.js';
import { PointsService } from '../points/points.service.js';
import { NotFoundError, BadRequestError } from '../../errors/appError.js';
import { WebhookService } from '../webhook/webhook.service.js';

export class BookingService {
  static async createBooking(params: {
    tenantId: string;
    userId: string;
    bookingType: string;
    productId?: string;
    quantity: number;
    totalPrice: number;
    couponCode?: string;
    usedPoints: number;
    notes?: string;
    holdDurationMinutes: number;
  }): Promise<IBooking> {
    const { tenantId, userId, bookingType, productId, quantity, totalPrice, couponCode, usedPoints, notes, holdDurationMinutes } = params;

    let discountAmount = 0;
    let couponId: string | undefined;

    // Validate Coupon
    if (couponCode) {
      const couponResult = await CouponService.validateCoupon(tenantId, couponCode, totalPrice);
      discountAmount = couponResult.discountAmount;
      couponId = couponResult.couponId;
    }

    // Points redemption deduction
    if (usedPoints > 0) {
      await PointsService.redeemPoints({
        tenantId,
        userId,
        amount: usedPoints,
        referenceType: 'BOOKING',
        description: `Points applied as discount on booking (${bookingType})`,
      });
    }

    const finalPrice = Math.max(0, totalPrice - discountAmount - (usedPoints / 10)); // e.g. 10 points = 1 currency unit

    // Calculate potential points to be earned upon completion
    const calc = await PointsService.calculateOrderPoints({
      tenantId,
      orderAmount: finalPrice,
      userId,
    });
    const earnedPoints = calc.totalPoints;

    const holdExpiresAt = new Date(Date.now() + holdDurationMinutes * 60 * 1000);

    const booking = await BookingModel.create({
      tenantId,
      userId,
      bookingType,
      productId,
      quantity,
      totalPrice,
      discountAmount,
      usedPoints,
      finalPrice,
      earnedPoints,
      bookingStatus: 'pending',
      paymentStatus: 'pending',
      holdExpiresAt,
      notes,
    });

    if (couponId) {
      await CouponService.recordCouponUsage(tenantId, couponId);
    }

    // Emit SaaS Webhook event
    WebhookService.dispatchEvent(tenantId, 'booking.created', {
      bookingId: booking._id.toString(),
      userId,
      finalPrice,
      bookingStatus: 'pending',
    }).catch(() => {});

    return booking;
  }

  static async confirmBooking(tenantId: string, bookingId: string): Promise<IBooking> {
    const booking = await BookingModel.findOne({ _id: bookingId, tenantId });
    if (!booking) throw new NotFoundError('Booking not found.');

    if (booking.bookingStatus === 'cancelled' || booking.bookingStatus === 'expired') {
      throw new BadRequestError(`Cannot confirm a ${booking.bookingStatus} booking.`);
    }

    booking.bookingStatus = 'confirmed';
    booking.paymentStatus = 'paid';
    await booking.save();

    return booking;
  }

  static async completeBooking(tenantId: string, bookingId: string): Promise<IBooking> {
    const booking = await BookingModel.findOne({ _id: bookingId, tenantId });
    if (!booking) throw new NotFoundError('Booking not found.');

    if (booking.bookingStatus === 'completed') {
      return booking;
    }

    booking.bookingStatus = 'completed';
    booking.completedAt = new Date();
    await booking.save();

    // Award the earned points to the customer
    if (booking.earnedPoints > 0) {
      await PointsService.earnPoints({
        tenantId,
        userId: booking.userId.toString(),
        amount: booking.earnedPoints,
        referenceType: 'BOOKING',
        referenceId: booking._id.toString(),
        description: `Loyalty points awarded for completing booking #${booking._id.toString().slice(-6)}`,
      });
    }

    WebhookService.dispatchEvent(tenantId, 'booking.completed', {
      bookingId: booking._id.toString(),
      userId: booking.userId.toString(),
      earnedPoints: booking.earnedPoints,
    }).catch(() => {});

    return booking;
  }

  static async cancelBooking(tenantId: string, bookingId: string, reason?: string): Promise<IBooking> {
    const booking = await BookingModel.findOne({ _id: bookingId, tenantId });
    if (!booking) throw new NotFoundError('Booking not found.');

    if (booking.bookingStatus === 'completed') {
      throw new BadRequestError('Completed bookings cannot be cancelled.');
    }

    if (booking.bookingStatus === 'cancelled') {
      return booking;
    }

    booking.bookingStatus = 'cancelled';
    if (reason) booking.notes = `${booking.notes || ''} [Cancelled: ${reason}]`;
    await booking.save();

    // If customer redeemed points on booking, refund them back
    if (booking.usedPoints > 0) {
      await PointsService.earnPoints({
        tenantId,
        userId: booking.userId.toString(),
        amount: booking.usedPoints,
        referenceType: 'BOOKING',
        referenceId: booking._id.toString(),
        description: `Refund of ${booking.usedPoints} points from cancelled booking #${booking._id.toString().slice(-6)}`,
      });
    }

    return booking;
  }

  static async listBookings(tenantId: string, options: { page?: number; limit?: number; userId?: string; status?: string }) {
    const page = Math.max(1, options.page || 1);
    const limit = Math.min(100, Math.max(1, options.limit || 20));
    const skip = (page - 1) * limit;

    const query: any = { tenantId };
    if (options.userId) query.userId = options.userId;
    if (options.status) query.bookingStatus = options.status;

    const [bookings, total] = await Promise.all([
      BookingModel.find(query).skip(skip).limit(limit).sort({ createdAt: -1 }),
      BookingModel.countDocuments(query),
    ]);

    return {
      bookings,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Background worker to release unpaid reservations past hold expiration
   */
  static async autoCancelExpiredBookings(): Promise<number> {
    const now = new Date();
    const expiredBookings = await BookingModel.find({
      bookingStatus: 'pending',
      paymentStatus: 'pending',
      holdExpiresAt: { $lt: now },
    }).limit(50);

    let count = 0;
    for (const booking of expiredBookings) {
      booking.bookingStatus = 'expired';
      await booking.save();

      // Refund held points if any
      if (booking.usedPoints > 0) {
        await PointsService.earnPoints({
          tenantId: booking.tenantId.toString(),
          userId: booking.userId.toString(),
          amount: booking.usedPoints,
          referenceType: 'BOOKING',
          referenceId: booking._id.toString(),
          description: `Refund points for expired reservation #${booking._id.toString().slice(-6)}`,
        });
      }
      count++;
    }

    return count;
  }
}
