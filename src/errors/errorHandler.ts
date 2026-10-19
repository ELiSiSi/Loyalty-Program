import { FastifyError, FastifyReply, FastifyRequest } from 'fastify';
import { ZodError } from 'zod';
import { AppError } from './appError.js';

export const errorHandler = (
  error: FastifyError | AppError | Error,
  request: FastifyRequest,
  reply: FastifyReply
) => {
  request.log.error(error);

  const isDev = process.env.NODE_ENV === 'development';

  // Custom AppError
  if (error instanceof AppError) {
    return reply.status(error.statusCode).send({
      success: false,
      status: error.status,
      code: error.code || 'APP_ERROR',
      message: error.message,
      errors: error.errors || null,
      ...(isDev ? { stack: error.stack } : {}),
    });
  }

  // Zod Validation Error
  if (error instanceof ZodError) {
    const issues = error.issues || (error as any).errors || [];
    const formattedErrors = issues.map((e: any) => ({
      field: Array.isArray(e.path) ? e.path.join('.') : String(e.path || ''),
      message: e.message,
      rule: e.code,
    }));

    return reply.status(400).send({
      success: false,
      status: 'fail',
      code: 'VALIDATION_ERROR',
      message: 'Input validation failed',
      errors: formattedErrors,
    });
  }

  // Fastify Schema Validation Error
  if ((error as FastifyError).validation) {
    return reply.status(400).send({
      success: false,
      status: 'fail',
      code: 'VALIDATION_ERROR',
      message: error.message,
      errors: (error as FastifyError).validation,
    });
  }

  // Mongoose Duplicate Key Error (Code 11000)
  if ((error as any).code === 11000) {
    const keys = Object.keys((error as any).keyValue || {});
    return reply.status(409).send({
      success: false,
      status: 'fail',
      code: 'DUPLICATE_RESOURCE',
      message: `Duplicate entry for ${keys.join(', ')}. This resource already exists.`,
    });
  }

  // Mongoose CastError (Invalid ObjectId)
  if (error.name === 'CastError') {
    return reply.status(400).send({
      success: false,
      status: 'fail',
      code: 'INVALID_IDENTIFIER',
      message: `Invalid ID format for path: ${(error as any).path}`,
    });
  }

  // JWT Errors
  if (error.name === 'JsonWebTokenError') {
    return reply.status(401).send({
      success: false,
      status: 'fail',
      code: 'INVALID_TOKEN',
      message: 'Invalid authorization token',
    });
  }

  if (error.name === 'TokenExpiredError') {
    return reply.status(401).send({
      success: false,
      status: 'fail',
      code: 'TOKEN_EXPIRED',
      message: 'Authorization token has expired. Please refresh.',
    });
  }

  // Fallback 500 Internal Server Error
  const statusCode = (error as FastifyError).statusCode || 500;
  return reply.status(statusCode).send({
    success: false,
    status: 'error',
    code: 'INTERNAL_SERVER_ERROR',
    message: isDev ? error.message : 'An unexpected error occurred. Please contact support.',
    ...(isDev ? { stack: error.stack } : {}),
  });
};
