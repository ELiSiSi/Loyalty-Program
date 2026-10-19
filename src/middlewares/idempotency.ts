import { FastifyReply, FastifyRequest } from 'fastify';
import { BadRequestError } from '../errors/appError.js';

// In-memory / cache registry of processed idempotency keys
// In production or cluster, this can easily back to Redis
const idempotencyStore = new Map<string, { timestamp: number; response: any; statusCode: number }>();

// TTL: 24 hours
const IDEMPOTENCY_TTL = 24 * 60 * 60 * 1000;

export const requireIdempotency = async (
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> => {
  const key = request.headers['x-idempotency-key'] as string | undefined;

  if (!key) {
    throw new BadRequestError(
      'x-idempotency-key header is required for this operation to prevent duplicate execution.'
    );
  }

  // Check key format (UUID or string with at least 8 characters)
  if (key.trim().length < 8) {
    throw new BadRequestError('Invalid x-idempotency-key. Must be at least 8 characters.');
  }

  const tenantPrefix = request.tenant?.id || 'global';
  const fullKey = `${tenantPrefix}:${key}`;

  const cached = idempotencyStore.get(fullKey);
  const now = Date.now();

  if (cached && now - cached.timestamp < IDEMPOTENCY_TTL) {
    request.log.info(`[Idempotency] Returning cached response for key: ${fullKey}`);
    reply.header('x-cache-idempotent', 'HIT');
    return reply.status(cached.statusCode).send(cached.response);
  }

  request.idempotencyKey = fullKey;
};

export const storeIdempotencyResult = (
  key: string,
  statusCode: number,
  response: any
): void => {
  if (!key) return;
  idempotencyStore.set(key, {
    timestamp: Date.now(),
    response,
    statusCode,
  });
};
