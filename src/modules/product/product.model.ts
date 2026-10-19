import mongoose, { Schema } from 'mongoose';
import { IProduct } from './product.types.js';

const productSchema = new Schema<IProduct>(
  {
    tenantId: {
      type: Schema.Types.ObjectId,
      ref: 'Tenant',
      required: true,
      index: true,
    },
    company: {
      type: Schema.Types.ObjectId,
      ref: 'Tenant',
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Please provide product name'],
      trim: true,
    },
    description: String,
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    category: {
      type: String,
      default: 'General',
      index: true,
    },
    points: {
      type: Number,
      default: 0,
    },
    images: {
      type: [String],
      default: [],
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
    collection: 'products',
  }
);

productSchema.pre('save', function (next) {
  if (this.tenantId && !this.company) this.company = this.tenantId;
  if (this.company && !this.tenantId) this.tenantId = this.company;
});

export const ProductModel =
  mongoose.models.Product || mongoose.model<IProduct>('Product', productSchema);
