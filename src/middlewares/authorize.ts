import { FastifyReply, FastifyRequest } from 'fastify';
import { ForbiddenError, UnauthorizedError } from '../errors/appError.js';
import { UserRole } from '../types/index.js';
import { ROLE_DEFAULT_PERMISSIONS } from '../constants/permissions.js';

export const restrictTo = (...roles: UserRole[]) => {
  return async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    if (!request.user) {
      throw new UnauthorizedError('Authentication required before checking roles.');
    }

    if (!roles.includes(request.user.role)) {
      throw new ForbiddenError(
        `Access denied. Role '${request.user.role}' is not authorized to perform this operation.`
      );
    }
  };
};

export const requirePermission = (...requiredPermissions: string[]) => {
  return async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    if (!request.user) {
      throw new UnauthorizedError('Authentication required before checking permissions.');
    }

    // SuperAdmin has wildcard access to all permissions
    if (request.user.role === 'superAdmin') {
      return;
    }

    const userPerms = new Set([
      ...(request.user.permissions || []),
      ...(ROLE_DEFAULT_PERMISSIONS[request.user.role] || []),
    ]);

    const hasAll = requiredPermissions.every((perm) => userPerms.has(perm));
    if (!hasAll) {
      throw new ForbiddenError(
        `Access denied. You lack the necessary permissions: [${requiredPermissions.join(', ')}]`
      );
    }
  };
};
