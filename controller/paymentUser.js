import Booking from '../models/booking.js';
import Payment from '../models/payment.js';
import User from '../models/user.js';
import AppError from '../utils/appError.js';
import catchAsync from '../utils/catchAsync.js';

export const createPayment = catchAsync(async (req, res, next) => {
  const bookingId = req.params.id;

  const booking = await Booking.findOne({
    _id: bookingId,
    user: req.user._id,
  });

  if (!booking) {
    return next(new AppError('Booking not found', 404));
  }

  const existingPayment = await Payment.findOne({ bookingId });

  if (existingPayment) {
    return next(new AppError('Booking already paid', 400));
  }

  const newPayment = await Payment.create({
    userId: req.user._id,
    bookingId,
  });
  const countPayments = await Payment.find({
    userId: req.user._id,
  });

  if (countPayments.length == 1) {
    const user = await User.findById(req.user._id);
    user.pendingPoints -= 200;
    user.availablePoints += 200;
   await user.save({ validateBeforeSave: false });
  }
  booking.bookingStatus = 'paid';
  await booking.save({ validateBeforeSave: false });

  res.status(201).json({
    status: 'success',
    data: {
      payment: newPayment,
    },
  });
});

export const getAllPayments = catchAsync(async (req, res) => {
  const payments = await Payment.find({
    userId: req.user._id,
  })
    .populate('bookingId')
    .populate('userId');

  res.status(200).json({
    status: 'success',
    results: payments.length,
    data: {
      payments,
    },
  });
});

export const getPayment = catchAsync(async (req, res, next) => {
  const payment = await Payment.findOne({
    userId: req.user._id,
    bookingId: req.params.id,
  })
    .populate('bookingId')
    .populate('userId');

  if (!payment) {
    return next(new AppError('Payment not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      payment,
    },
  });
});
