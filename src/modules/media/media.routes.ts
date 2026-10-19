import { FastifyInstance } from 'fastify';
import { MediaController } from './media.controller.js';
import { authenticate } from '../../middlewares/authenticate.js';

export async function mediaRoutes(app: FastifyInstance) {
  app.post('/upload', {
    preHandler: [authenticate],
    schema: {
      tags: ['Media & Uploads'],
      summary: 'Upload logo, image, or media asset (Cloudinary or local CDN)',
      security: [{ bearerAuth: [] }],
      querystring: {
        type: 'object',
        properties: {
          entity_type: {
            type: 'string',
            enum: ['logos', 'products', 'rewards', 'users', 'general'],
            default: 'general',
          },
        },
      },
    },
    handler: MediaController.upload,
  });
}
