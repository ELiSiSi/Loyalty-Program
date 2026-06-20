import Company from '../models/company.js';
import Offer from '../models/offer.js';
import AppError from '../utils/appError.js';
import catchAsync from '../utils/catchAsync.js';

export const getAllOffersAdmin = catchAsync(async (req, res) => {
  const offers = await Offer.find().populate('company', 'name logo');

  res.status(200).json({
    status: 'success',
    results: offers.length,
    data: { offers },
  });
});

export const getOfferAdmin = catchAsync(async (req, res, next) => {
  const offer = await Offer.findById(req.params.id).populate(
    'company',
    'name logo'
  );

  if (!offer) {
    return next(new AppError('No offer found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: { offer },
  });
});

export const createOffer = catchAsync(async (req, res, next) => {
  if (req.file) {
    req.body.image = req.file.path;
  }

  if (req.body.company) {
    const company = await Company.findById(req.body.company);

    if (!company) {
      return next(new AppError('Company not found', 404));
    }
  }

  const offer = await Offer.create(req.body);

  await offer.populate('company', 'name logo');

  res.status(201).json({
    status: 'success',
    data: { offer },
  });
});

export const updateOffer = catchAsync(async (req, res, next) => {
  if (req.file) {
    req.body.image = req.file.path;
  }

  const offer = await Offer.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  }).populate('company', 'name logo');

  if (!offer) {
    return next(new AppError('No offer found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: { offer },
  });
});

export const deleteOffer = catchAsync(async (req, res, next) => {
  const offer = await Offer.findByIdAndDelete(req.params.id);

  if (!offer) {
    return next(new AppError('No offer found with that ID', 404));
  }

  res.status(204).json({
    status: 'success',
    data: null,
  });
});
