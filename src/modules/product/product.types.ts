import { Document, Types } from 'mongoose';

export interface IProduct extends Document {
  _id: Types.ObjectId;
  tenantId: Types.ObjectId;
  company?: Types.ObjectId;
  name: string;
  description?: string;
  price: number;
  category: string;
  points: number;
  images: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
