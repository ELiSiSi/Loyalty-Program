import Booking from '../models/booking.js';
import Coupon from '../models/coupon.js';
import AppError from '../utils/appError.js';
import catchAsync from '../utils/catchAsync.js';

export const getAllBookingsAdmin = catchAsync(async (req, res) => {
  const bookings = await Booking.find()
    .populate('user', 'name email')
    .populate('product', 'name price')
    .populate('company', 'name');

  res.status(200).json({
    status: 'success',
    results: bookings.length,
    data: {
      bookings,
    },
  });
});

export const getBookingAdmin = catchAsync(async (req, res, next) => {
  const booking = await Booking.findById(req.params.id)
    .populate('user', 'name email')
    .populate('product')
    .populate('company');

  if (!booking) {
    return next(new AppError('Booking not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      booking,
    },
  });
});


export const cancelBookingAdmin = catchAsync(async (req, res, next) => {
  const booking = await Booking.findById(req.params.id);

  if (!booking) {
    return next(new AppError('Booking not found', 404));
  }

  if (booking.bookingStatus === 'cancelled') {
    return next(new AppError('Already cancelled', 400));
  }

  booking.bookingStatus = 'cancelled';
  await booking.save();

  res.status(200).json({
    status: 'success',
    data: { booking },
  });
});
