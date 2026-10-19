import Offer from '../models/offer.js';
import AppError from '../utils/appError.js';
import catchAsync from '../utils/catchAsync.js';

export const getAllOffersUser = catchAsync(async (req, res) => {
  const now = new Date();
  const user = req.user;

  const offers = await Offer.find({
    isActive: true,

    startsAt: { $lte: now },
    expiresAt: { $gte: now },

    requiredPoints: { $lte: user.availablePoints },

    company: user.company,
  });

  res.status(200).json({
    status: 'success',
    availablePoints: user.availablePoints,
    results: offers.length,
    data: {
      offers,
    },
  });
});

export const getOfferUser = catchAsync(async (req, res, next) => {
  const now = new Date();
  const user = req.user;

  const offer = await Offer.findOne({
    _id: req.params.id,

    isActive: true,

    startsAt: { $lte: now },
    expiresAt: { $gte: now },

    requiredPoints: { $lte: user.availablePoints },

    company: user.company,
  });

  if (!offer) {
    return next(new AppError('Offer not available for you', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      offer,
      availablePoints: user.availablePoints,
    },
  });
});
