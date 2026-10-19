import Fastify, { FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import compress from '@fastify/compress';
import cookie from '@fastify/cookie';
import rateLimit from '@fastify/rate-limit';
import mongoose from 'mongoose';

import { env } from './config/env.js';
import { registerSwagger } from './config/swagger.js';
import { errorHandler } from './errors/errorHandler.js';

// Module Routes
import { authRoutes } from './modules/auth/auth.routes.js';
import { tenantRoutes } from './modules/tenant/tenant.routes.js';
import { userRoutes } from './modules/user/user.routes.js';
import { pointsRoutes } from './modules/points/points.routes.js';
import { campaignRoutes } from './modules/campaign/campaign.routes.js';
import { couponRoutes } from './modules/coupon/coupon.routes.js';
import { rewardRoutes } from './modules/reward/reward.routes.js';
import { bookingRoutes } from './modules/booking/booking.routes.js';
import { paymentRoutes } from './modules/payment/payment.routes.js';
import { webhookRoutes } from './modules/webhook/webhook.routes.js';
import { auditRoutes } from './modules/audit/audit.routes.js';
import { analyticsRoutes } from './modules/analytics/analytics.routes.js';
import multipart from '@fastify/multipart';
import { mediaRoutes } from './modules/media/media.routes.js';
import { productRoutes } from './modules/product/product.routes.js';

export async function buildApp(): Promise<FastifyInstance> {
  const app = Fastify({
    logger:
      env.NODE_ENV === 'test'
        ? false
        : {
            level: env.NODE_ENV === 'development' ? 'debug' : 'info',
            transport:
              env.NODE_ENV === 'development'
                ? {
                    target: 'pino-pretty',
                    options: { colorize: true },
                  }
                : undefined,
          },
    trustProxy: true,
  });

  // Security & Core Plugins
  await app.register(helmet, {
    contentSecurityPolicy: false,
  });

  await app.register(cors, {
    origin: true,
    credentials: true,
  });

  await app.register(compress);

  await app.register(cookie, {
    secret: env.JWT_ACCESS_SECRET,
    parseOptions: {},
  });

  await app.register(multipart, {
    limits: {
      fileSize: 20 * 1024 * 1024, // 20 MB
    },
  });

  // Rate Limiting (SaaS protection)
  await app.register(rateLimit, {
    max: env.RATE_LIMIT_MAX,
    timeWindow: env.RATE_LIMIT_TIMEWINDOW,
    keyGenerator: (req) => {
      const tenant = req.headers['x-tenant-id'] as string;
      return tenant ? `${tenant}:${req.ip}` : req.ip;
    },
    errorResponseBuilder: () => ({
      success: false,
      status: 'fail',
      code: 'TOO_MANY_REQUESTS',
      message: 'Too many requests. Rate limit exceeded. Please try again shortly.',
    }),
  });

  // OpenAPI Swagger Documentation
  await registerSwagger(app);

  // Global Error Handler
  app.setErrorHandler(errorHandler);

  // Health Check Endpoints
  app.get('/health', {
    schema: {
      tags: ['System'],
      summary: 'Liveness & readiness probe',
    },
    handler: async () => {
      const dbState = mongoose.connection.readyState;
      const dbStatus = dbState === 1 ? 'connected' : 'disconnected';

      return {
        status: 'UP',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        database: dbStatus,
        version: '2.0.0',
        framework: 'Fastify',
      };
    },
  });

  app.get('/health/detailed', {
    schema: {
      tags: ['System'],
      summary: 'Deep system diagnostics & memory health probe',
    },
    handler: async () => {
      const dbState = mongoose.connection.readyState;
      const mem = process.memoryUsage();

      return {
        status: 'UP',
        timestamp: new Date().toISOString(),
        uptimeSeconds: Math.floor(process.uptime()),
        database: {
          status: dbState === 1 ? 'connected' : 'disconnected',
          readyState: dbState,
          host: mongoose.connection.host || 'local',
          dbName: mongoose.connection.name || 'loyalty_saas',
        },
        memory: {
          rssMb: (mem.rss / 1024 / 1024).toFixed(2),
          heapTotalMb: (mem.heapTotal / 1024 / 1024).toFixed(2),
          heapUsedMb: (mem.heapUsed / 1024 / 1024).toFixed(2),
        },
        system: {
          nodeVersion: process.version,
          platform: process.platform,
          arch: process.arch,
          pid: process.pid,
        },
      };
    },
  });

  // API v1 Routes
  await app.register(
    async (v1) => {
      await v1.register(authRoutes, { prefix: '/auth' });
      await v1.register(tenantRoutes, { prefix: '/tenants' });
      await v1.register(userRoutes, { prefix: '/users' });
      await v1.register(pointsRoutes, { prefix: '/points' });
      await v1.register(campaignRoutes, { prefix: '/campaigns' });
      await v1.register(couponRoutes, { prefix: '/coupons' });
      await v1.register(rewardRoutes, { prefix: '/rewards' });
      await v1.register(bookingRoutes, { prefix: '/bookings' });
      await v1.register(paymentRoutes, { prefix: '/payments' });
      await v1.register(webhookRoutes, { prefix: '/webhooks' });
      await v1.register(auditRoutes, { prefix: '/audit' });
      await v1.register(analyticsRoutes, { prefix: '/analytics' });
      await v1.register(productRoutes, { prefix: '/products' });
      await v1.register(mediaRoutes, { prefix: '/media' });
    },
    { prefix: '/api/v1' }
  );

  return app;
}
