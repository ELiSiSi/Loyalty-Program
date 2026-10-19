import { WebhookSubscriptionModel } from './webhook.model.js';
import { IWebhookSubscription, WebhookEventType } from './webhook.types.js';
import { generateSecureToken, generateWebhookSignature } from '../../utils/crypto.js';
import { NotFoundError } from '../../errors/appError.js';

export class WebhookService {
  static async registerWebhook(tenantId: string, url: string, events: WebhookEventType[]): Promise<IWebhookSubscription> {
    const secret = `whsec_${generateSecureToken(24)}`;
    const subscription = await WebhookSubscriptionModel.create({
      tenantId,
      url,
      secret,
      events,
    });
    return subscription;
  }

  static async listWebhooks(tenantId: string): Promise<IWebhookSubscription[]> {
    return await WebhookSubscriptionModel.find({ tenantId });
  }

  static async deleteWebhook(tenantId: string, webhookId: string): Promise<void> {
    const deleted = await WebhookSubscriptionModel.findOneAndDelete({ _id: webhookId, tenantId });
    if (!deleted) throw new NotFoundError('Webhook subscription not found.');
  }

  /**
   * Asynchronously dispatch signed webhook to all subscribed endpoints
   */
  static async dispatchEvent(tenantId: string, event: WebhookEventType, payloadData: any): Promise<void> {
    try {
      const subscriptions = await WebhookSubscriptionModel.find({
        tenantId,
        isActive: true,
        events: event,
      });

      if (!subscriptions.length) return;

      const envelope = {
        id: `evt_${Date.now()}`,
        event,
        tenantId,
        timestamp: new Date().toISOString(),
        data: payloadData,
      };

      const payloadString = JSON.stringify(envelope);

      for (const sub of subscriptions) {
        const signature = generateWebhookSignature(payloadString, sub.secret);

        fetch(sub.url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-loyalty-event': event,
            'x-loyalty-signature': signature,
            'User-Agent': 'LoyaltyPlatform-WebhookDispatcher/2.0',
          },
          body: payloadString,
          signal: AbortSignal.timeout(5000), // 5 seconds timeout
        })
          .then((res) => {
            if (res.ok) {
              sub.lastDeliveredAt = new Date();
              sub.failureCount = 0;
            } else {
              sub.failureCount += 1;
            }
            return sub.save();
          })
          .catch(() => {
            sub.failureCount += 1;
            sub.save().catch(() => {});
          });
      }
    } catch (err) {
      console.error('[Webhook Dispatcher Error]:', err);
    }
  }
}
