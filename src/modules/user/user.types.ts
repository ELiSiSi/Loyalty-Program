import { Document, Types } from 'mongoose';
import { UserRole } from '../../types/index.js';
import { VipTierCode } from '../../constants/tiers.js';

export interface IUser extends Document {
  _id: Types.ObjectId;
  name: string;
  email: string;
  phone?: string;
  photo?: string;
  role: UserRole;
  tenantId?: Types.ObjectId;
  company?: Types.ObjectId;
  permissions: string[];
  
  // Loyalty Points & Tiers
  vipTier: 'bronze' | 'silver' | 'gold' | 'platinum' | string;
  totalPoints: number;        // Current spendable points
  availablePoints: number;    // Spendable points
  pendingPoints: number;      // Escrow / Pending verification
  lifetimePoints: number;     // Historical points earned (tier calculation)
  
  // Status & Security
  active: boolean;
  is_active: boolean;
  password?: string;
  passwordConfirm?: string;
  passwordChangedAt?: Date;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  refreshToken?: string;
  refreshTokenExpires?: Date;
  otpConfirmEmail?: string;
  otpConfirmEmailExpires?: Date;
  
  createdAt: Date;
  updatedAt: Date;

  correctPassword(candidatePassword: string): Promise<boolean>;
  changedPasswordAfter(JWTTimestamp: number): boolean;
}
