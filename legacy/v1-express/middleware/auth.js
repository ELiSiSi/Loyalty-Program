import jwt from 'jsonwebtoken';
import User from '../models/user.js';
import AppError from '../utils/appError.js';
import catchAsync from '../utils/catchAsync.js';

export const verifyAccessToken = (token) =>
  jwt.verify(token, process.env.JWT_ACCESS_SECRET);

export const protect = catchAsync(async (req, res, next) => {
  let token;

  if (req.headers.authorization?.startsWith('Bearer'))
    token = req.headers.authorization.split(' ')[1];
  else if (req.cookies?.access_token) token = req.cookies.access_token;

  if (!token) return next(new AppError('You are not logged in!', 401));

  let decoded;
  try {
    decoded = verifyAccessToken(token);
  } catch (err) {
    return next(
      new AppError(
        err.name === 'TokenExpiredError'
          ? 'Access token expired. Please refresh.'
          : 'Invalid token. Please log in again.',
        401
      )
    );
  }

  const currentUser = await User.findById(decoded.id);
  if (!currentUser) return next(new AppError('User no longer exists.', 401));

  if (!currentUser.is_active)
    return next(new AppError('Your account is inactive.', 403));

  if (currentUser.changedPasswordAfter(decoded.iat))
    return next(
      new AppError('Password changed recently. Please log in again.', 401)
    );

  req.user = res.locals.user = currentUser;
  next();
});

export const restrictTo =
  (...roles) =>
  (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You do not have permission to perform this action.', 403)
      );
    }

    next();
  };
