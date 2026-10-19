import { FastifyReply, FastifyRequest } from 'fastify';
import { WebhookService } from './webhook.service.js';
import { successResponse } from '../../utils/response.js';
import { registerWebhookSchema } from './webhook.schema.js';

export class WebhookController {
  static async register(request: FastifyRequest, reply: FastifyReply) {
    const { url, events } = registerWebhookSchema.parse(request.body);
    const tenantId = request.tenant?.id || request.user?.tenantId?.toString();
    const sub = await WebhookService.registerWebhook(tenantId!, url, events);
    return reply.status(201).send(successResponse(sub, 'Webhook registered. Store your secret safely.'));
  }

  static async list(request: FastifyRequest, reply: FastifyReply) {
    const tenantId = request.tenant?.id || request.user?.tenantId?.toString();
    const subs = await WebhookService.listWebhooks(tenantId!);
    return reply.send(successResponse(subs));
  }

  static async delete(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const tenantId = request.tenant?.id || request.user?.tenantId?.toString();
    await WebhookService.deleteWebhook(tenantId!, request.params.id);
    return reply.send(successResponse(null, 'Webhook removed.'));
  }
}
