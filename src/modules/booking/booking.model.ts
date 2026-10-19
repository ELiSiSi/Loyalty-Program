import mongoose, { Schema } from 'mongoose';
import { IBooking } from './booking.types.js';

const bookingSchema = new Schema<IBooking>(
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
    bookingType: {
      type: String,
      default: 'reservation',
      trim: true,
    },
    productId: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
    },
    quantity: {
      type: Number,
      default: 1,
      min: 1,
    },
    totalPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    discountAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    usedPoints: {
      type: Number,
      default: 0,
      min: 0,
    },
    finalPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    earnedPoints: {
      type: Number,
      default: 0,
      min: 0,
    },
    bookingStatus: {
      type: String,
      enum: ['pending', 'confirmed', 'completed', 'cancelled', 'expired'],
      default: 'pending',
      index: true,
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'refunded'],
      default: 'pending',
      index: true,
    },
    holdExpiresAt: {
      type: Date,
      required: true,
      index: true,
    },
    completedAt: Date,
    notes: String,
  },
  {
    timestamps: true,
    collection: 'bookings',
  }
);

bookingSchema.index({ tenantId: 1, userId: 1, createdAt: -1 });
bookingSchema.index({ bookingStatus: 1, paymentStatus: 1, holdExpiresAt: 1 });

export const BookingModel =
  mongoose.models.Booking || mongoose.model<IBooking>('Booking', bookingSchema);
