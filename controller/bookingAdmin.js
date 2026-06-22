import Booking from '../models/booking.js';
import Coupon from '../models/coupon.js';
import Product from '../models/product.js';
import User from '../models/user.js';
import AppError from '../utils/appError.js';
import catchAsync from '../utils/catchAsync.js';


export const getAllBookingsAdmin = catchAsync(async (req, res) => {
  const bookings = await Booking.find({
    company: req.user.company,
  });

  res.status(200).json({
    status: 'success',
    results: bookings.length,
    data: {
      bookings,
    },
  });
});

export const getBookingAdmin = catchAsync(async (req, res, next) => {
  const booking = await Booking.findOne({
    _id: req.params.id,
    company: req.user.company,
  });

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

  const booking = await Booking.findOne({
    _id: req.params.id,
    company: req.user.company,
  });

  if (!booking) {
    return next(new AppError('Booking not found', 404));
  }

  if (booking.paymentStatus === 'paid') {
    return next(new AppError('Cannot update paid booking', 400));
  }

  const product = await Product.findById(booking.bookingProduct);
  const user = await User.findById(booking.user);

  user.points = user.points - booking.earnedPoints + booking.usedPoints;

  await user.save();

  const qty = quantity || booking.quantity || 1;
  const totalPrice = product.price * qty;

  let discountAmount = 0;
  let couponId = null;

  if (couponCode) {
    const coupon = await Coupon.findOne({ code: couponCode });

    if (!coupon) {
      return next(new AppError('Coupon not found', 404));
    }

    const now = new Date();
    const isActive = now >= coupon.startsAt && now <= coupon.expiresAt;

    if (!isActive) {
      return next(new AppError('Coupon expired', 400));
    }

    discountAmount = (totalPrice * coupon.discount) / 100;
    couponId = coupon._id;
  }

  const pointsToUse = usedPoints ?? booking.usedPoints;

  const finalPrice = totalPrice - discountAmount - pointsToUse;

  const earnedPoints = Math.floor(finalPrice / 100);

  user.points = user.points - pointsToUse + earnedPoints;

  await user.save();

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
  const booking = await Booking.findOne({
    _id: req.params.id,
  });

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
