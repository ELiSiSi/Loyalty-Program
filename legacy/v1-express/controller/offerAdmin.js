import Company from '../models/company.js';
import Offer from '../models/offer.js';
import AppError from '../utils/appError.js';
import catchAsync from '../utils/catchAsync.js';

export const getAllOffersAdmin = catchAsync(async (req, res) => {
  const offers = await Offer.find({
    company: req.user.company,
  });

  res.status(200).json({
    status: 'success',
    results: offers.length,
    data: { offers },
  });
});

export const getOfferAdmin = catchAsync(async (req, res, next) => {
  const offer = await Offer.findOne({
    _id: req.params.id,
    company: req.user.company,
  });

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

  const company = await Company.findById(req.user.company);

  if (!company) {
    return next(new AppError('Company not found', 404));
  }

  req.body.company = req.user.company;

  const offer = await Offer.create(req.body);

  res.status(201).json({
    status: 'success',
    data: { offer },
  });
});

export const updateOffer = catchAsync(async (req, res, next) => {
  const offer = await Offer.findOne({
    _id: req.params.id,
    company: req.user.company,
  });

  if (!offer) {
    return next(new AppError('No offer found with that ID', 404));
  }

  if (req.file) {
    req.body.image = req.file.path;
  }

  delete req.body.company;

  offer.set(req.body);
  await offer.save();

  res.status(200).json({
    status: 'success',
    data: { offer },
  });
});

export const deleteOffer = catchAsync(async (req, res, next) => {
  const offer = await Offer.findOneAndDelete({
    _id: req.params.id,
    company: req.user.company,
  });

  if (!offer) {
    return next(new AppError('No offer found with that ID', 404));
  }

  res.status(204).json({
    status: 'success',
    data: null,
  });
});
