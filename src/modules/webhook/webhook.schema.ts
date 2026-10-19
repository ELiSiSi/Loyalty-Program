import { z } from 'zod';

export const registerWebhookSchema = z.object({
  url: z.string().url('Webhook target must be a valid URL'),
  events: z
    .array(
      z.enum([
        'points.earned',
        'points.redeemed',
        'tier.upgraded',
        'booking.created',
        'booking.completed',
        'reward.redeemed',
      ])
    )
    .min(1, 'Select at least one event to subscribe to'),
});
