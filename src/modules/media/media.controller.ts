import { FastifyReply, FastifyRequest } from 'fastify';
import { MediaService } from './media.service.js';
import { successResponse } from '../../utils/response.js';
import { BadRequestError } from '../../errors/appError.js';

export class MediaController {
  static async upload(request: FastifyRequest<{ Querystring: { entity_type?: string } }>, reply: FastifyReply) {
    const data = await request.file();
    if (!data) {
      throw new BadRequestError('No file was uploaded in request.');
    }

    const buffer = await data.toBuffer();
    const entityType = request.query.entity_type || 'general';

    const result = await MediaService.uploadFile(
      buffer,
      data.filename,
      data.mimetype,
      entityType
    );

    return reply.status(201).send(successResponse(result, 'File uploaded successfully.'));
  }
}
