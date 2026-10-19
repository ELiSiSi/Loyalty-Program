import mongoose, { Schema } from 'mongoose';
import { IWebhookSubscription } from './webhook.types.js';

const webhookSubscriptionSchema = new Schema<IWebhookSubscription>(
  {
    tenantId: {
      type: Schema.Types.ObjectId,
      ref: 'Tenant',
      required: true,
      index: true,
    },
    url: {
      type: String,
      required: [true, 'Please provide webhook endpoint URL'],
      trim: true,
    },
    secret: {
      type: String,
      required: true,
    },
    events: {
      type: [String],
      default: ['points.earned', 'points.redeemed', 'tier.upgraded', 'booking.completed', 'reward.redeemed'],
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    failureCount: {
      type: Number,
      default: 0,
    },
    lastDeliveredAt: Date,
  },
  {
    timestamps: true,
    collection: 'webhooks',
  }
);

export const WebhookSubscriptionModel =
  mongoose.models.WebhookSubscription ||
  mongoose.model<IWebhookSubscription>('WebhookSubscription', webhookSubscriptionSchema);
