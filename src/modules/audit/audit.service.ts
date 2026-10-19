import { AuditLogModel } from './audit.model.js';
import { IAuditLog } from './audit.types.js';

export class AuditService {
  static async record(params: {
    tenantId?: string;
    actorId?: string;
    actorRole?: string;
    action: string;
    entity: string;
    entityId?: string;
    ipAddress?: string;
    userAgent?: string;
    details?: any;
  }): Promise<IAuditLog> {
    return await AuditLogModel.create(params);
  }

  static async listAudits(tenantId: string, options: { page?: number; limit?: number; action?: string }) {
    const page = Math.max(1, options.page || 1);
    const limit = Math.min(100, Math.max(1, options.limit || 20));
    const skip = (page - 1) * limit;

    const query: any = { tenantId };
    if (options.action) query.action = options.action;

    const [logs, total] = await Promise.all([
      AuditLogModel.find(query).skip(skip).limit(limit).sort({ createdAt: -1 }),
      AuditLogModel.countDocuments(query),
    ]);

    return {
      logs,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
}
