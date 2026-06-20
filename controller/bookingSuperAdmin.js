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

export const updateBookingAdmin = catchAsync(async (req, res, next) => {
  const { couponCode, usedPoints, quantity, bookingStatus } = req.body;

  const booking = await Booking.findById(req.params.id)
    .populate('product')
    .populate('user');

  if (!booking) {
    return next(new AppError('Booking not found', 404));
  }

  if (booking.paymentStatus === 'paid') {
    return next(new AppError('Cannot update paid booking', 400));
  }

  const product = booking.product;
  const user = booking.user;

  const qty = quantity || booking.quantity || 1;
  const totalPrice = product.price * qty;

  let discountAmount = 0;
  let couponId = booking.coupon;

  if (couponCode) {
    const coupon = await Coupon.findOne({ code: couponCode });

    if (!coupon) return next(new AppError('Coupon not found', 404));

    const now = new Date();
    const isActive = now >= coupon.startsAt && now <= coupon.expiresAt;

    if (!isActive) return next(new AppError('Coupon expired', 400));

    discountAmount = (totalPrice * coupon.discount) / 100;
    couponId = coupon._id;
  }

  const pointsToUse = usedPoints ?? booking.usedPoints;
  const finalPrice = totalPrice - discountAmount - pointsToUse;
  const earnedPoints = Math.floor(finalPrice / 100);

  booking.quantity = qty;
  booking.totalPrice = totalPrice;
  booking.discountAmount = discountAmount;
  booking.usedPoints = pointsToUse;
  booking.earnedPoints = earnedPoints;
  booking.finalPrice = finalPrice;
  booking.coupon = couponId;

  if (bookingStatus) {
    booking.bookingStatus = bookingStatus;
  }

  await booking.save();

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
