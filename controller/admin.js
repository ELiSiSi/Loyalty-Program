import User from '../models/user.js';
import AppError from '../utils/appError.js';
import catchAsync from '../utils/catchAsync.js';
import { Email } from '../utils/email.js';
import crypto from 'crypto';

export const completeAdminSetup = catchAsync(async (req, res, next) => {
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const admin = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
    role: 'admin',
  });

  if (!admin) {
    return next(new AppError('Token invalid or expired', 400));
  }

  admin.password = req.body.password;
  admin.passwordConfirm = req.body.passwordConfirm;

  admin.passwordResetToken = undefined;
  admin.passwordResetExpires = undefined;

  await admin.save();

  res.status(200).json({
    status: 'success',
    message: 'Account setup completed',
  });
});
