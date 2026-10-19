import { FastifyInstance } from 'fastify';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';

export const registerSwagger = async (app: FastifyInstance) => {
  await app.register(swagger, {
    openapi: {
      info: {
        title: 'Loyalty Program — Multi-Tenant SaaS Platform API',
        description:
          'Enterprise-grade Multi-Tenant Loyalty & Rewards SaaS Engine. Featuring Double-Entry Points Ledger, Dynamic VIP Tiers, Multi-tenant Isolation, Idempotent Financial Operations, Promotions Engine, Reservations, and Webhook Integrations.',
        version: '2.0.0',
        contact: {
          name: 'Platform Engineering Team',
          email: 'support@loyaltyplatform.io',
        },
      },
      servers: [
        {
          url: 'http://localhost:3000',
          description: 'Local Development Server',
        },
        {
          url: 'https://api.loyaltyplatform.io',
          description: 'Production Multi-Tenant Cluster',
        },
      ],
      components: {
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
            description: 'Enter your Bearer Access Token to authenticate.',
          },
          tenantHeader: {
            type: 'apiKey',
            name: 'x-tenant-id',
            in: 'header',
            description: 'Tenant UUID or Slug identifier for SaaS scoping.',
          },
          idempotencyHeader: {
            type: 'apiKey',
            name: 'x-idempotency-key',
            in: 'header',
            description: 'Unique client-generated UUID for ensuring financial and points operation idempotency.',
          },
        },
      },
      tags: [
        { name: 'Auth', description: 'Authentication, registration, OTP, tokens' },
        { name: 'Tenant', description: 'Tenant management, SaaS plans, branding & settings' },
        { name: 'Users', description: 'Customer profiles, VIP tiers & activity' },
        { name: 'Points & Ledger', description: 'Double-entry points ledger, earn, redeem, adjust' },
        { name: 'Campaigns', description: 'Promotional rules, multipliers & bonus campaigns' },
        { name: 'Coupons', description: 'Voucher codes, percentage/fixed discounts' },
        { name: 'Rewards & Gifts', description: 'Redeemable rewards catalog & voucher codes' },
        { name: 'Bookings', description: 'Reservations, slot holding & auto-cancel' },
        { name: 'Payments', description: 'Payment records and point conversion' },
        { name: 'Webhooks', description: 'Outbound webhook subscriptions & delivery' },
        { name: 'Audit', description: 'SaaS compliance and mutation audit trail' },
        { name: 'Analytics', description: 'Loyalty metrics, churn rate & top customers' },
        { name: 'System', description: 'Health checks and platform diagnostics' },
      ],
    },
  });

  await app.register(swaggerUi, {
    routePrefix: '/docs',
    uiConfig: {
      docExpansion: 'list',
      deepLinking: true,
      displayRequestDuration: true,
    },
    staticCSP: true,
    transformStaticCSP: (header) => header,
  });
};
