import mongoose, { Schema } from 'mongoose';
import bcrypt from 'bcryptjs';
import { IUser } from './user.types.js';
import { ROLE_DEFAULT_PERMISSIONS } from '../../constants/permissions.js';

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, 'Please provide user name'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Please provide an email address'],
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
      lowercase: true,
    },
    photo: {
      type: String,
      default:
        'https://res.cloudinary.com/dr0xirap5/image/upload/v1782557156/uploads/general/8ef3b9e8-e2ce-4c43-a656-ae39caecd6c1.jpg',
    },
    role: {
      type: String,
      enum: ['superAdmin', 'admin', 'staff', 'user'],
      default: 'user',
      index: true,
    },
    tenantId: {
      type: Schema.Types.ObjectId,
      ref: 'Tenant',
      index: true,
    },
    company: {
      type: Schema.Types.ObjectId,
      ref: 'Tenant',
      index: true,
    },
    permissions: {
      type: [String],
      default: [],
    },

    // Loyalty Points Engine
    vipTier: {
      type: String,
      enum: ['BRONZE', 'SILVER', 'GOLD', 'PLATINUM', 'bronze', 'silver', 'gold', 'platinum'],
      default: 'bronze',
      lowercase: true,
      index: true,
    },
    totalPoints: {
      type: Number,
      default: 0,
      min: 0,
    },
    availablePoints: {
      type: Number,
      default: 0,
      min: 0,
    },
    pendingPoints: {
      type: Number,
      default: 0,
      min: 0,
    },
    lifetimePoints: {
      type: Number,
      default: 0,
      min: 0,
    },

    active: {
      type: Boolean,
      default: true,
      select: false,
    },
    is_active: {
      type: Boolean,
      default: true,
      index: true,
    },

    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: 6,
      select: false,
    },
    passwordConfirm: {
      type: String,
      validate: {
        validator: function (this: any, el: string) {
          return !this.isModified('password') || el === this.password;
        },
        message: 'Passwords do not match.',
      },
    },
    passwordChangedAt: Date,
    passwordResetToken: { type: String, select: false },
    passwordResetExpires: { type: Date, select: false },
    refreshToken: { type: String, select: false },
    refreshTokenExpires: { type: Date, select: false },
    otpConfirmEmail: { type: String, select: false },
    otpConfirmEmailExpires: { type: Date, select: false },
  },
  {
    timestamps: true,
    collection: 'users',
  }
);

// Compound index for multi-tenant isolation: email is unique per tenant
userSchema.index({ tenantId: 1, email: 1 });

userSchema.pre('save', async function (this: any) {
  if (this.isModified('tenantId') && !this.company) {
    this.company = this.tenantId;
  } else if (this.isModified('company') && !this.tenantId) {
    this.tenantId = this.company;
  }

  // Populate default permissions if none supplied
  if (this.isNew && (!this.permissions || this.permissions.length === 0)) {
    this.permissions = ROLE_DEFAULT_PERMISSIONS[this.role] || [];
  }

  if (!this.isModified('password') || !this.password) return;

  this.password = await bcrypt.hash(this.password, 12);
  this.passwordChangedAt = new Date(Date.now() - 1000);
  this.passwordConfirm = undefined;
});

userSchema.methods.correctPassword = async function (candidate: string): Promise<boolean> {
  if (!this.password) return false;
  return await bcrypt.compare(candidate, this.password);
};

userSchema.methods.changedPasswordAfter = function (jwtTimestamp: number): boolean {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(`${this.passwordChangedAt.getTime() / 1000}`, 10);
    return jwtTimestamp < changedTimestamp;
  }
  return false;
};

export const UserModel = mongoose.models.User || mongoose.model<IUser>('User', userSchema);
export default UserModel;
