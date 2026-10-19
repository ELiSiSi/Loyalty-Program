import { FastifyReply, FastifyRequest } from 'fastify';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { UnauthorizedError, ForbiddenError } from '../errors/appError.js';
import { UserModel } from '../modules/user/user.model.js';
import { IUserPayload } from '../types/index.js';

interface DecodedToken {
  id: string;
  role: string;
  tenantId?: string;
  iat: number;
  exp: number;
}

export const authenticate = async (
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> => {
  let token: string | undefined;

  const authHeader = request.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  } else if (request.cookies?.access_token) {
    token = request.cookies.access_token;
  }

  if (!token) {
    throw new UnauthorizedError('You are not logged in. Please provide an access token.');
  }

  let decoded: DecodedToken;
  try {
    decoded = jwt.verify(token, env.JWT_ACCESS_SECRET) as DecodedToken;
  } catch (err: any) {
    if (err.name === 'TokenExpiredError') {
      throw new UnauthorizedError('Access token expired. Please refresh your session.');
    }
    throw new UnauthorizedError('Invalid access token. Please log in again.');
  }

  const currentUser = await UserModel.findById(decoded.id).select('+passwordChangedAt +is_active');
  if (!currentUser) {
    throw new UnauthorizedError('The user belonging to this token no longer exists.');
  }

  if (!currentUser.is_active) {
    throw new ForbiddenError('Your user account has been deactivated. Contact support.');
  }

  if (currentUser.changedPasswordAfter(decoded.iat)) {
    throw new UnauthorizedError('Password was recently changed. Please log in again.');
  }

  request.user = {
    _id: currentUser._id,
    id: currentUser._id.toString(),
    name: currentUser.name,
    email: currentUser.email,
    role: currentUser.role as any,
    tenantId: currentUser.tenantId || currentUser.company,
    company: currentUser.company || currentUser.tenantId,
    permissions: currentUser.permissions || [],
    is_active: currentUser.is_active,
  };
};
