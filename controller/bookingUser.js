import Booking from '../models/booking.js';
import Coupon from '../models/coupon.js';
import Point from '../models/point.js';
import Product from '../models/product.js';
import User from '../models/user.js';
import AppError from '../utils/appError.js';
import catchAsync from '../utils/catchAsync.js';


export const createBooking = catchAsync(async (req, res, next) => {
  const { productId, quantity = 1, couponCode, usedPoints = 0 } = req.body;

  const product = await Product.findById(productId)
    .populate('company')
    .populate('category')
    .populate('gifts');

  if (!product) {
    return next(new AppError('Product not found', 404));
  }

  const user = await User.findById(req.user._id);

  if (!user) {
    return next(new AppError('User not found', 404));
  }

  let totalPrice = product.price * quantity;

  let discountAmount = 0;
  let couponId = null;

  if (couponCode) {
    const coupon = await Coupon.findOne({ code: couponCode });

    if (!coupon) {
      return next(new AppError('Coupon not found', 404));
    }

    const now = new Date();

    if (now < coupon.startsAt || now > coupon.expiresAt) {
      return next(new AppError('Coupon expired', 400));
    }

    discountAmount = (totalPrice * coupon.discount) / 100;
    couponId = coupon._id;
  }

  if (usedPoints > user.availablePoints) {
    return next(new AppError('Insufficient points balance', 400));
  }

  const finalPrice = totalPrice - discountAmount - usedPoints;

  const earnedPoints = Math.floor(finalPrice / 100);

  user.availablePoints -= usedPoints;
  user.pendingPoints += earnedPoints;
  user.totalPoints += earnedPoints;

  await user.save({ validateBeforeSave: false });

  const booking = await Booking.create({
    user: user._id,
    company: product.company._id,
    bookingType: product.category?.name || 'product',
    product: product._id,
    quantity,
    totalPrice,
    coupon: couponId,
    discountAmount,
    usedPoints,
    earnedPoints,
    finalPrice,
  });

  await Point.create({
    companyId: product.company._id,
    userId: user._id,
    earngPoints: earnedPoints,
    LostPoints: usedPoints,
    due: `booking ${product.name}`,
  });

  const populatedBooking = await Booking.findById(booking._id);

  res.status(201).json({
    status: 'success',
    data: {
      booking: populatedBooking,
    },
  });
});
export const getMyAllBookings = catchAsync(async (req, res) => {
  const bookings = await Booking.find({ user: req.user._id });

  res.status(200).json({
    status: 'success',
    results: bookings.length,
    data: {
      bookings,
    },
  });
});
export const getMyBooking = catchAsync(async (req, res, next) => {
  const booking = await Booking.findOne({
    _id: req.params.id,
    user: req.user._id,
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

export const cancelBooking = catchAsync(async (req, res, next) => {
  const booking = await Booking.findById(req.params.id);

  if (!booking) {
    return next(new AppError('Booking not found', 404));
  }

  if (booking.bookingStatus === 'cancelled') {
    return next(new AppError('Booking already cancelled', 400));
  }

  const user = await User.findById(booking.user);

  if (!user) {
    return next(new AppError('User not found', 404));
  }

  user.pendingPoints -= booking.earnedPoints;
  user.availablePoints += booking.usedPoints;
  user.totalPoints -= booking.earnedPoints;

  await user.save({ validateBeforeSave: false });

  await Point.create({
    companyId: booking.company,
    userId: user._id,
    LostPoints: booking.earnedPoints,
    due: `cancel booking`,
  });

  booking.bookingStatus = 'cancelled';
  await booking.save({ validateBeforeSave: false });

  res.status(200).json({
    status: 'success',
    data: { booking },
  });
});
export const updateMyBooking = catchAsync(async (req, res, next) => {
  const { couponCode, quantity, usedPoints } = req.body;

  const booking = await Booking.findOne({
    _id: req.params.id,
    user: req.user._id,
  });

  if (!booking) {
    return next(new AppError('Booking not found', 404));
  }

  if (booking.bookingStatus === 'paid') {
    return next(new AppError('Cannot update paid booking', 400));
  }

  if (booking.bookingStatus === 'cancelled') {
    return next(new AppError('Cannot update cancelled booking', 400));
  }

  const product = await Product.findById(booking.product);
  const user = await User.findById(req.user._id);

  const pointSystem = await Point.findOne({
    companyId: booking.company,
  });

  if (!pointSystem) {
    return next(new AppError('Point system not found', 404));
  }

  user.pendingPoints -= booking.earnedPoints;
  user.availablePoints += booking.usedPoints;

  pointSystem.pendingPoints -= booking.earnedPoints;
  pointSystem.usedPoints -= booking.usedPoints;
  pointSystem.allPoints += booking.usedPoints;

  await user.save({ validateBeforeSave: false });
  await pointSystem.save({ validateBeforeSave: false });

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
    if (now < coupon.startsAt || now > coupon.expiresAt) {
      return next(new AppError('Coupon expired', 400));
    }

    discountAmount = (totalPrice * coupon.discount) / 100;
    couponId = coupon._id;
  }

  const pointsToUse = usedPoints ?? booking.usedPoints;

  if (pointsToUse > user.availablePoints) {
    return next(new AppError('Insufficient points balance', 400));
  }

  const finalPrice = totalPrice - discountAmount - pointsToUse;
  const earnedPoints = Math.floor(finalPrice / 100);

  user.availablePoints -= pointsToUse;
  user.pendingPoints += earnedPoints;

  pointSystem.usedPoints += pointsToUse;
  pointSystem.allPoints -= pointsToUse;
  pointSystem.pendingPoints += earnedPoints;

  await user.save({ validateBeforeSave: false });
  await pointSystem.save({ validateBeforeSave: false });

  booking.quantity = qty;
  booking.totalPrice = totalPrice;
  booking.discountAmount = discountAmount;
  booking.usedPoints = pointsToUse;
  booking.earnedPoints = earnedPoints;
  booking.finalPrice = finalPrice;
  booking.coupon = couponId;

  await booking.save({ validateBeforeSave: false });

  const updated = await Booking.findById(booking._id);

  await Point.create({
    companyId: product.company._id,
    userId: user._id,
    usedPoints: earnedPoints,
    due: `booking ${product.name}`,
  });

  res.status(200).json({
    status: 'success',
    data: {
      booking: updated,
    },
  });
});
