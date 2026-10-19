import { Document, Types } from 'mongoose';

export type WebhookEventType =
  | 'points.earned'
  | 'points.redeemed'
  | 'tier.upgraded'
  | 'booking.created'
  | 'booking.completed'
  | 'reward.redeemed';

export interface IWebhookSubscription extends Document {
  _id: Types.ObjectId;
  tenantId: Types.ObjectId;
  url: string;
  secret: string;
  events: WebhookEventType[];
  isActive: boolean;
  failureCount: number;
  lastDeliveredAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}
