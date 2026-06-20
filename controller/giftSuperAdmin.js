import Gift from '../models/gift.js';
import AppError from '../utils/appError.js';
import catchAsync from '../utils/catchAsync.js';

export const getAllGifts = catchAsync(async (req, res) => {
  const gifts = await Gift.find().populate('company', 'name logo');

  res.status(200).json({
    status: 'success',
    results: gifts.length,
    data: { gifts },
  });
});

export const getGift = catchAsync(async (req, res, next) => {
  const gift = await Gift.findById(req.params.id).populate(
    'company',
    'name logo'
  );

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

  const gift = await Gift.create(req.body);

  await gift.populate({
    path: 'company',
    select: 'name logo',
  });

  res.status(201).json({
    status: 'success',
    data: { gift },
  });
});

export const updateGift = catchAsync(async (req, res, next) => {
  if (req.file) {
    req.body.image = req.file.path;
  }

  const gift = await Gift.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  }).populate('company', 'name logo');

  if (!gift) {
    return next(new AppError('No gift found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: { gift },
  });
});

export const deleteGift = catchAsync(async (req, res, next) => {
  const gift = await Gift.findByIdAndDelete(req.params.id);

  if (!gift) {
    return next(new AppError('No gift found with that ID', 404));
  }

  res.status(204).json({
    status: 'success',
    data: null,
  });
});
