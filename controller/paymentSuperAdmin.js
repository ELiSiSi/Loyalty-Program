import Booking from '../models/booking.js';
import Payment from '../models/payment.js';
import AppError from '../utils/appError.js';
import catchAsync from '../utils/catchAsync.js';

export const getAllPayments = catchAsync(async (req, res) => {

  const payments = await Payment.find()
    .populate('userId', 'name email')
    .populate({
      path: 'bookingId',
      populate: {
        path: 'product',
        select: 'name price image',
      },
    });

  res.status(200).json({
    status: 'success',
    results: payments.length,
    data: {
      payments,
    },
  });
});

export const getPayment = catchAsync(async (req, res, next) => {
  const payment = await Payment.findById(req.params.id);

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
