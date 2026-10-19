import { FastifyReply, FastifyRequest } from 'fastify';
import { AuthService } from './auth.service.js';
import { successResponse } from '../../utils/response.js';
import {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from './auth.schema.js';
import { env } from '../../config/env.js';

export class AuthController {
  static async register(request: FastifyRequest, reply: FastifyReply) {
    const data = registerSchema.parse(request.body);
    const result = await AuthService.register(data);

    reply.setCookie('access_token', result.tokens.accessToken, {
      path: '/',
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60,
    });

    return reply.status(201).send(successResponse(result, 'Registration successful.'));
  }

  static async login(request: FastifyRequest, reply: FastifyReply) {
    const data = loginSchema.parse(request.body);
    const result = await AuthService.login(data);

    reply.setCookie('access_token', result.tokens.accessToken, {
      path: '/',
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60,
    });

    return reply.send(successResponse(result, 'Login successful.'));
  }

  static async refresh(request: FastifyRequest, reply: FastifyReply) {
    const body = refreshTokenSchema.safeParse(request.body);
    const token = body.success && body.data.refreshToken ? body.data.refreshToken : request.cookies.refresh_token;

    const tokens = await AuthService.refreshTokens(token!);

    reply.setCookie('access_token', tokens.accessToken, {
      path: '/',
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60,
    });

    return reply.send(successResponse(tokens, 'Token refreshed successfully.'));
  }

  static async logout(request: FastifyRequest, reply: FastifyReply) {
    reply.clearCookie('access_token', { path: '/' });
    reply.clearCookie('refresh_token', { path: '/' });
    return reply.send(successResponse(null, 'Logged out successfully.'));
  }

  static async forgotPassword(request: FastifyRequest, reply: FastifyReply) {
    const { email } = forgotPasswordSchema.parse(request.body);
    const message = await AuthService.forgotPassword(email);
    return reply.send(successResponse(null, message));
  }

  static async resetPassword(request: FastifyRequest, reply: FastifyReply) {
    const { token, password } = resetPasswordSchema.parse(request.body);
    await AuthService.resetPassword(token, password);
    return reply.send(successResponse(null, 'Password reset successfully. You can now log in.'));
  }
}
