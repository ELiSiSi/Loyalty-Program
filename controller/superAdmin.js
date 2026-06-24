import User from '../models/user.js';
import AppError from '../utils/appError.js';
import catchAsync from '../utils/catchAsync.js';
import { Email } from '../utils/email.js';
import crypto from 'crypto';

export const createAdminInvite = catchAsync(async (req, res, next) => {
  const { email, company } = req.body;

  const tempPassword = crypto.randomBytes(8).toString('hex');

  const newAdmin = await User.create({
    email,
    name: email.split('@')[0],
    password: tempPassword,
    passwordConfirm: tempPassword,
    role: 'admin',
    company,
  });
  const setupToken = newAdmin.createPasswordResetToken();

  await newAdmin.save({ validateBeforeSave: false });

  const setupURL = `${req.protocol}://${req.get('host')}/admin/setup-account/${setupToken}`;
console.log('--- TEST EMAIL CONFIG ---');
console.log('EMAIL USERNAME:', process.env.MY_EMAIL_USERNAME);
console.log('EMAIL PASSWORD:', process.env.MY_EMAIL_PASSWORD);
console.log('-------------------------');
  try {
    await new Email(newAdmin, setupURL).sendAdminInvite();

    res.status(201).json({
      status: 'success',
      message: 'Invitation email sent successfully to the new admin.',
      data: {
        user: newAdmin,
      },
    });
} catch (err) {
    console.error('CRITICAL EMAIL ERROR:', err);

    newAdmin.passwordResetToken = undefined;
    newAdmin.passwordResetExpires = undefined;
    await newAdmin.save({ validateBeforeSave: false });

    return res.status(500).json({
      status: 'error',
      message: 'There was an error sending the invitation email. Try again later.',
    });
  }
});

export const getAllUsers = catchAsync(async (req, res, next) => {
  const users = await User.find();
  res.status(200).json({
    status: 'success',
    results: users.length,
    data: {
      users,
    },
  });
});

export const getUser = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    return next(new AppError('No user found with that ID', 404));
  }
  res.status(200).json({
    status: 'success',
    data: {
      user,
    },
  });
});

export const updateUser = catchAsync(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!user) {
    return next(new AppError('No user found with that ID', 404));
  }
  res.status(200).json({
    status: 'success',
    data: {
      user,
    },
  });
});
export const deleteUser = catchAsync(async (req, res, next) => {
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) {
    return next(new AppError('No user found with that ID', 404));
  }
  res.status(204).json({
    status: 'success',
    data: null,
  });
});
