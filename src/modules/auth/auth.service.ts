import jwt from 'jsonwebtoken';
import { env } from '../../config/env.js';
import { UserModel } from '../user/user.model.js';
import { TenantModel } from '../tenant/tenant.model.js';
import { IAuthResponse, IAuthTokens } from './auth.types.js';
import {
  BadRequestError,
  ConflictError,
  NotFoundError,
  UnauthorizedError,
  ForbiddenError,
} from '../../errors/appError.js';
import { hashToken, generateSecureToken } from '../../utils/crypto.js';
import { sendEmail } from '../../utils/email.js';

export class AuthService {
  static generateTokens(payload: { id: string; role: string; tenantId?: string }): IAuthTokens {
    const accessToken = jwt.sign(payload, env.JWT_ACCESS_SECRET, {
      expiresIn: env.JWT_ACCESS_EXPIRES_IN as any,
    });

    const refreshToken = jwt.sign(payload, env.JWT_REFRESH_SECRET, {
      expiresIn: env.JWT_REFRESH_EXPIRES_IN as any,
    });

    return {
      accessToken,
      refreshToken,
      expiresIn: env.JWT_ACCESS_EXPIRES_IN,
    };
  }

  static async register(data: {
    name: string;
    email: string;
    password: string;
    passwordConfirm?: string;
    phone?: string;
    tenantId?: string;
    tenantSlug?: string;
    role?: 'user' | 'admin' | 'staff' | 'superAdmin';
  }): Promise<IAuthResponse> {
    let tenant = null;

    if (data.tenantId) {
      tenant = await TenantModel.findById(data.tenantId);
    } else if (data.tenantSlug) {
      tenant = await TenantModel.findOne({ slug: data.tenantSlug.toLowerCase() });
    }

    // Check if user with this email already exists in this tenant (or globally)
    const existingQuery: any = { email: data.email.toLowerCase() };
    if (tenant) {
      existingQuery.$or = [{ tenantId: tenant._id }, { company: tenant._id }];
    }
    const existing = await UserModel.findOne(existingQuery);
    if (existing) {
      throw new ConflictError('A user with this email address already exists.');
    }

    // Check tenant user limit quota
    if (tenant) {
      const userCount = await UserModel.countDocuments({
        $or: [{ tenantId: tenant._id }, { company: tenant._id }],
      });
      if (userCount >= tenant.limits.maxUsers) {
        throw new ForbiddenError(
          `Tenant user quota reached (${tenant.limits.maxUsers} max members). Please upgrade the SaaS plan.`
        );
      }
    }

    const newUser = await UserModel.create({
      name: data.name,
      email: data.email,
      password: data.password,
      passwordConfirm: data.passwordConfirm || data.password,
      phone: data.phone,
      role: data.role || 'user',
      tenantId: tenant ? tenant._id : undefined,
      company: tenant ? tenant._id : undefined,
      vipTier: 'bronze',
      availablePoints: 0,
      totalPoints: 0,
    });

    const tokens = this.generateTokens({
      id: newUser._id.toString(),
      role: newUser.role,
      tenantId: newUser.tenantId?.toString(),
    });

    // Save hashed refresh token
    newUser.refreshToken = hashToken(tokens.refreshToken);
    newUser.refreshTokenExpires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await newUser.save({ validateBeforeSave: false });

    return {
      user: {
        id: newUser._id.toString(),
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        tenantId: newUser.tenantId?.toString(),
        vipTier: newUser.vipTier,
        availablePoints: newUser.availablePoints,
      },
      tokens,
    };
  }

  static async login(data: {
    email: string;
    password: string;
    tenantId?: string;
    tenantSlug?: string;
  }): Promise<IAuthResponse> {
    const query: any = { email: data.email.toLowerCase() };

    let tenant = null;
    if (data.tenantId) {
      tenant = await TenantModel.findById(data.tenantId);
    } else if (data.tenantSlug) {
      tenant = await TenantModel.findOne({ slug: data.tenantSlug.toLowerCase() });
    }

    if (tenant) {
      query.$or = [{ tenantId: tenant._id }, { company: tenant._id }];
    }

    const user = await UserModel.findOne(query).select('+password +is_active');
    if (!user) {
      throw new UnauthorizedError('Invalid email or password.');
    }

    if (!user.is_active) {
      throw new ForbiddenError('Your account has been deactivated. Please contact support.');
    }

    const isMatch = await user.correctPassword(data.password);
    if (!isMatch) {
      throw new UnauthorizedError('Invalid email or password.');
    }

    const tokens = this.generateTokens({
      id: user._id.toString(),
      role: user.role,
      tenantId: user.tenantId?.toString(),
    });

    user.refreshToken = hashToken(tokens.refreshToken);
    user.refreshTokenExpires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await user.save({ validateBeforeSave: false });

    return {
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        tenantId: user.tenantId?.toString(),
        vipTier: user.vipTier,
        availablePoints: user.availablePoints,
      },
      tokens,
    };
  }

  static async refreshTokens(tokenString: string): Promise<IAuthTokens> {
    if (!tokenString) {
      throw new UnauthorizedError('Refresh token required.');
    }

    let decoded: any;
    try {
      decoded = jwt.verify(tokenString, env.JWT_REFRESH_SECRET);
    } catch {
      throw new UnauthorizedError('Invalid or expired refresh token.');
    }

    const hashed = hashToken(tokenString);
    const user = await UserModel.findOne({
      _id: decoded.id,
      refreshToken: hashed,
      refreshTokenExpires: { $gt: new Date() },
    }).select('+refreshToken +refreshTokenExpires');

    if (!user) {
      throw new UnauthorizedError('Refresh token revoked or expired. Please log in again.');
    }

    // Refresh Token Rotation: issue brand new tokens and update DB
    const tokens = this.generateTokens({
      id: user._id.toString(),
      role: user.role,
      tenantId: user.tenantId?.toString(),
    });

    user.refreshToken = hashToken(tokens.refreshToken);
    user.refreshTokenExpires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await user.save({ validateBeforeSave: false });

    return tokens;
  }

  static async forgotPassword(email: string): Promise<string> {
    const user = await UserModel.findOne({ email: email.toLowerCase() });
    if (!user) {
      // Return safe message without leaking user existence
      return 'If an account with that email exists, a password reset link has been sent.';
    }

    const resetToken = generateSecureToken(32);
    user.passwordResetToken = hashToken(resetToken);
    user.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await user.save({ validateBeforeSave: false });

    await sendEmail({
      email: user.email,
      subject: 'Loyalty Platform - Password Reset Request',
      message: `Your password reset token is: ${resetToken}\nUse this token to reset your password. Valid for 60 minutes.`,
    });

    return 'Password reset token dispatched to your email.';
  }

  static async resetPassword(token: string, newPass: string): Promise<void> {
    const hashed = hashToken(token);
    const user = await UserModel.findOne({
      passwordResetToken: hashed,
      passwordResetExpires: { $gt: new Date() },
    });

    if (!user) {
      throw new BadRequestError('Password reset token is invalid or has expired.');
    }

    user.password = newPass;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    user.refreshToken = undefined; // Revoke existing sessions

    await user.save();
  }
}
