import crypto from 'crypto';
import asyncHandler from 'express-async-handler';
import JWT from 'jsonwebtoken';


import User from '../models/user.js';
import AppError from '../utils/appError.js';

export const signAccessToken = (payload) =>
  JWT.sign(payload, process.env.JWT_ACCESS_SECRET, {
    expiresIn: process.env.JWT_ACCESS_EXPIRES_IN,
  });

export const signRefreshToken = (payload) =>
  JWT.sign(payload, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN,
  });

export const verifyAccessToken = (token) =>
  JWT.verify(token, process.env.JWT_ACCESS_SECRET);

export const verifyRefreshToken = (token) =>
  JWT.verify(token, process.env.JWT_REFRESH_SECRET);

const hashToken = (token) =>
  crypto.createHash('sha256').update(token).digest('hex');

const IS_PROD = process.env.NODE_ENV === 'production';

const setAuthCookies = (res, accessToken, refreshToken) => {
  res.cookie('access_token', accessToken, {
    httpOnly: true,
    secure: IS_PROD,
    sameSite: 'strict',
  });

  res.cookie('refresh_token', refreshToken, {
    httpOnly: true,
    secure: IS_PROD,
    sameSite: 'strict',
    path: '/api/v1/auth/refresh',
  });
};

const clearAuthCookies = (res) => {
  const options = {
    httpOnly: true,
    secure: IS_PROD,
    sameSite: 'strict',
  };

  res.clearCookie('access_token', options);
  res.clearCookie('refresh_token', {
    ...options,
    path: '/api/v1/auth/refresh',
  });
};

const issueTokens = async (user, res) => {
  const accessToken = signAccessToken({
    id: user._id,
    role: user.role,
  });

  const refreshToken = signRefreshToken({
    id: user._id,
  });

  user.setRefreshToken(refreshToken);
  await user.save({ validateBeforeSave: false });

  setAuthCookies(res, accessToken, refreshToken);

  return { accessToken, refreshToken };
};


export const signup = asyncHandler(async (req, res) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    photo: req.body.photo,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    pendingPoints: 200,
  });

  const { accessToken } = await issueTokens(newUser, res);

  newUser.password = undefined;

  res.status(201).json({
    status: 'success',
    accessToken,
    data: {
      user: newUser,
    },
  });
});


export const login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password)
    return next(new AppError('Please provide email and password', 400));

  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Incorrect email or password', 401));
  }

  if (!user.is_active)
    return next(new AppError('Your account is inactive', 403));

  const { accessToken } = await issueTokens(user, res);

  user.password = undefined;

  res.status(200).json({
    status: 'success',
    accessToken,
    data: {
      user,
    },
  });
});


export const refreshAccessToken = asyncHandler(async (req, res, next) => {
  const rt = req.cookies?.refresh_token || req.body?.refreshToken;

  if (!rt) return next(new AppError('No refresh token provided', 401));

  let decoded;
  try {
    decoded = verifyRefreshToken(rt);
  } catch {
    return next(new AppError('Invalid refresh token', 401));
  }

  const user = await User.findById(decoded.id).select(
    '+refreshToken +refreshTokenExpires'
  );

  if (!user) return next(new AppError('User not found', 401));

  const hashedToken = hashToken(rt);

  const isExpired =
    user.refreshTokenExpires && user.refreshTokenExpires.getTime() < Date.now();

  if (user.refreshToken !== hashedToken || isExpired) {
    return next(new AppError('Refresh token expired or invalid', 401));
  }

  const { accessToken } = await issueTokens(user, res);

  res.status(200).json({
    status: 'success',
    accessToken,
  });
});


export const logout = asyncHandler(async (req, res, next) => {
  if (!req.user) {
    return next(new AppError('Not authenticated', 401));
  }

  req.user.clearRefreshToken();
  await req.user.save({ validateBeforeSave: false });

  clearAuthCookies(res);

  res.status(200).json({
    status: 'success',
    message: 'Logged out successfully',
  });
});


export const forgotPassword = asyncHandler(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(new AppError('No user found with this email', 404));
  }

  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  const resetURL = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/auth/resetPassword/${resetToken}`;

  try {
    res.status(200).json({
      status: 'success',
      message: 'Reset token sent',
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(new AppError('Email sending failed', 500));
  }
});


export const resetPassword = asyncHandler(async (req, res, next) => {
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!user) {
    return next(new AppError('Token invalid or expired', 400));
  }

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;

  await user.save();

  const { accessToken } = await issueTokens(user, res);

  res.status(200).json({
    status: 'success',
    accessToken,
    data: {
      user,
    },
  });
});
