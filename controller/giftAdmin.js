import Gift from '../models/gift.js';
import AppError from '../utils/appError.js';
import catchAsync from '../utils/catchAsync.js';

export const getAllGifts = catchAsync(async (req, res) => {
  const gifts = await Gift.find({
    company: req.user.company,
  });

  res.status(200).json({
    status: 'success',
    results: gifts.length,
    data: { gifts },
  });
});

export const getGift = catchAsync(async (req, res, next) => {
  const gift = await Gift.findOne({
    _id: req.params.id,
    company: req.user.company,
  });

  if (!gift) {
    return next(new AppError('No gift found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: { gift },
  });
});

export const createGift = catchAsync(async (req, res, next) => {
  if (req.file) {
    req.body.image = req.file.path;
  } else {
    return next(new AppError('Please upload an image for the gift', 400));
  }

  // bind gift to admin company
  req.body.company = req.user.company;

  const newGift = await Gift.create(req.body);

  res.status(201).json({
    status: 'success',
    data: {
      gift: newGift,
    },
  });
});

export const updateGift = catchAsync(async (req, res, next) => {
  const gift = await Gift.findOne({
    _id: req.params.id,
    company: req.user.company,
  });

  if (!gift) {
    return next(new AppError('No gift found with that ID', 404));
  }

  if (req.file) {
    req.body.image = req.file.path;
  }

  Object.assign(gift, req.body);

  await gift.save();

  res.status(200).json({
    status: 'success',
    data: { gift },
  });
});

export const deleteGift = catchAsync(async (req, res, next) => {
  const gift = await Gift.findOneAndDelete({
    _id: req.params.id,
    company: req.user.company,
  });

  if (!gift) {
    return next(new AppError('No gift found with that ID', 404));
  }

  res.status(204).json({
    status: 'success',
    data: null,
  });
});
