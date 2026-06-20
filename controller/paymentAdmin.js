import Booking from '../models/booking.js';
import Payment from '../models/payment.js';
import AppError from '../utils/appError.js';
import catchAsync from '../utils/catchAsync.js';

export const getAllPayments = catchAsync(async (req, res) => {
  const bookings = await Booking.find({
    company: req.user.company,
  }).select('_id');

  const bookingIds = bookings.map((booking) => booking._id);

  const payments = await Payment.find({
    bookingId: { $in: bookingIds },
  })
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

  const booking = await Booking.findOne({
    _id: payment.bookingId,
    company: req.user.company,
  });

  if (!booking) {
    return next(
      new AppError('This payment does not belong to your company', 403)
    );
  }

  res.status(200).json({
    status: 'success',
    data: {
      payment,
    },
  });
});
