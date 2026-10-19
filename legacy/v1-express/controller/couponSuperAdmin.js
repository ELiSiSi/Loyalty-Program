import Company from '../models/company.js';
import Coupon from '../models/coupon.js';
import AppError from '../utils/appError.js';
import catchAsync from '../utils/catchAsync.js';

export const getAllCoupons = catchAsync(async (req, res) => {
  const coupons = await Coupon.find().populate('company', 'name logo');

  const now = new Date();

  const updatedCoupons = coupons.map((coupon) => {
    const doc = coupon.toObject();

    doc.isActive = now >= coupon.startsAt && now <= coupon.expiresAt;

    return doc;
  });

  res.status(200).json({
    status: 'success',
    results: updatedCoupons.length,
    data: {
      coupons: updatedCoupons,
    },
  });
});

export const getCoupon = catchAsync(async (req, res, next) => {
  const coupon = await Coupon.findById(req.params.id).populate(
    'company',
    'name logo'
  );

  if (!coupon) {
    return next(new AppError('Coupon not found', 404));
  }

  const doc = coupon.toObject();

  const now = new Date();

  doc.isActive = now >= coupon.startsAt && now <= coupon.expiresAt;

  res.status(200).json({
    status: 'success',
    data: {
      coupon: doc,
    },
  });
});

export const createCoupon = catchAsync(async (req, res, next) => {
  const { startsAt, expiresAt } = req.body;

  if (new Date(expiresAt) <= new Date(startsAt)) {
    return next(new AppError('Expiration date must be after start date', 400));
  }

  const company = await Company.findById(req.body.company);

  if (!company) {
    return next(new AppError('Company not found', 404));
  }

  const coupon = await Coupon.create(req.body);

  await coupon.populate({
    path: 'company',
    select: 'name logo',
  });

  const doc = coupon.toObject();

  const now = new Date();

  doc.isActive = now >= coupon.startsAt && now <= coupon.expiresAt;

  res.status(201).json({
    status: 'success',
    data: {
      coupon: doc,
    },
  });
});

export const updateCoupon = catchAsync(async (req, res, next) => {
  const coupon = await Coupon.findById(req.params.id);

  if (!coupon) {
    return next(new AppError('Coupon not found', 404));
  }

  const allowedFields = [
    'code',
    'discount',
    'startsAt',
    'expiresAt',
    'company',
  ];

  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) {
      coupon[field] = req.body[field];
    }
  });

  if (
    coupon.startsAt &&
    coupon.expiresAt &&
    coupon.expiresAt <= coupon.startsAt
  ) {
    return next(new AppError('Expiration date must be after start date', 400));
  }

  await coupon.save();

  await coupon.populate({
    path: 'company',
    select: 'name logo',
  });

  const doc = coupon.toObject();

  const now = new Date();

  doc.isActive = now >= coupon.startsAt && now <= coupon.expiresAt;

  res.status(200).json({
    status: 'success',
    data: {
      coupon: doc,
    },
  });
});

export const deleteCoupon = catchAsync(async (req, res, next) => {
  const coupon = await Coupon.findByIdAndDelete(req.params.id);

  if (!coupon) {
    return next(new AppError('Coupon not found', 404));
  }

  res.status(204).json({
    status: 'success',
    data: null,
  });
});
