import User from '../models/user.js';
import Booking from '../models/booking.js';
import Product from '../models/product.js';
import Payment from '../models/payment.js';
import AppError from '../utils/appError.js';
import catchAsync from '../utils/catchAsync.js';
import { Email } from '../utils/email.js';
import crypto from 'crypto';

export const getAdminReport = catchAsync(async (req, res, next) => {
  const companyFilter = req.user?.role === 'admin' && req.user?.company
    ? { company: req.user.company }
    : {};

  const [
    totalUsers,
    activeUsers,
    totalProducts,
    totalBookings,
    totalPayments,
    pendingBookings,
    confirmedBookings,
    paidPayments,
    revenueResult,
    recentBookings,
  ] = await Promise.all([
    User.countDocuments({ role: 'user' }),
    User.countDocuments({ role: 'user', is_active: true }),
    Product.countDocuments(companyFilter),
    Booking.countDocuments(companyFilter),
    Payment.countDocuments(),
    Booking.countDocuments({ ...companyFilter, bookingStatus: 'pending' }),
    Booking.countDocuments({ ...companyFilter, bookingStatus: 'confirmed' }),
    Booking.countDocuments({ ...companyFilter, paymentStatus: 'paid' }),
    Booking.aggregate([
      { $match: { ...companyFilter, paymentStatus: 'paid' } },
      { $group: { _id: null, totalRevenue: { $sum: '$finalPrice' } } },
    ]),
    Booking.find(companyFilter)
      .sort('-createdAt')
      .limit(5)
      .select('user product totalPrice finalPrice bookingStatus paymentStatus createdAt')
      .lean(),
  ]);

  const totalRevenue = revenueResult[0]?.totalRevenue || 0;

  res.status(200).json({
    status: 'success',
    data: {
      summary: {
        totalUsers,
        activeUsers,
        totalProducts,
        totalBookings,
        totalPayments,
        totalRevenue,
        pendingBookings,
        confirmedBookings,
        paidPayments,
      },
      recentBookings,
    },
  });
});

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
