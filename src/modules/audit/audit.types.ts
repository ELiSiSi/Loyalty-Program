import { Document, Types } from 'mongoose';

export interface IAuditLog extends Document {
  _id: Types.ObjectId;
  tenantId?: Types.ObjectId;
  actorId?: Types.ObjectId;
  actorRole?: string;
  action: string;
  entity: string;
  entityId?: string;
  ipAddress?: string;
  userAgent?: string;
  details?: any;
  createdAt: Date;
}
