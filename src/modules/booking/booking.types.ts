import { Document, Types } from 'mongoose';

export type BookingStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'expired';
export type PaymentStatus = 'pending' | 'paid' | 'refunded';

export interface IBooking extends Document {
  _id: Types.ObjectId;
  tenantId: Types.ObjectId;
  userId: Types.ObjectId;
  bookingType: string;
  productId?: Types.ObjectId;
  quantity: number;
  totalPrice: number;
  discountAmount: number;
  usedPoints: number;
  finalPrice: number;
  earnedPoints: number;
  bookingStatus: BookingStatus;
  paymentStatus: PaymentStatus;
  holdExpiresAt: Date;
  completedAt?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}
