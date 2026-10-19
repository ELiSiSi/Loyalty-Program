import { FastifyInstance } from 'fastify';
import { AuthController } from './auth.controller.js';

export async function authRoutes(app: FastifyInstance) {
  app.post('/register', {
    schema: {
      tags: ['Auth'],
      summary: 'Register a new customer or tenant user',
      description: 'Creates a new user, checks tenant limits, issues JWT access and refresh tokens.',
    },
    handler: AuthController.register,
  });

  app.post('/login', {
    schema: {
      tags: ['Auth'],
      summary: 'Authenticate user with email and password',
      description: 'Returns JWT tokens and sets HTTP-only session cookies.',
    },
    handler: AuthController.login,
  });

  app.post('/refresh', {
    schema: {
      tags: ['Auth'],
      summary: 'Rotate refresh token and issue new access token',
    },
    handler: AuthController.refresh,
  });

  app.post('/logout', {
    schema: {
      tags: ['Auth'],
      summary: 'Log out current user and clear auth cookies',
    },
    handler: AuthController.logout,
  });

  app.post('/forgot-password', {
    schema: {
      tags: ['Auth'],
      summary: 'Request password reset token via email',
    },
    handler: AuthController.forgotPassword,
  });

  app.post('/reset-password', {
    schema: {
      tags: ['Auth'],
      summary: 'Reset password with verification token',
    },
    handler: AuthController.resetPassword,
  });
}
