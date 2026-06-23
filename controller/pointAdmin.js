import Company from '../models/company.js';
import Point from '../models/point.js';
import AppError from '../utils/appError.js';
import catchAsync from '../utils/catchAsync.js';

export const createPoint = catchAsync(async (req, res, next) => {
  const { name, currency, pointValue, pointsPercentage } = req.body;

  if (!req.user || !req.user.company) {
    return next(new AppError('You are not assigned to any company', 400));
  }

  const company = await Company.findById(req.user.company);
  if (!company) {
    return next(new AppError('Company not found', 404));
  }

  const existingPoint = await Point.findOne({
    companyId: req.user.company,
  });

  if (existingPoint) {
    return next(
      new AppError('Point system already exists for this company', 400)
    );
  }

  const point = await Point.create({
    name,
    currency,
    pointValue,
    pointsPercentage,
    companyId: req.user.company,
  });

  res.status(201).json({
    status: 'success',
    data: { point },
  });
});

export const getMyPoints = catchAsync(async (req, res) => {
  const points = await Point.find({
    companyId: req.user.company,
  }).populate('companyId');

  res.status(200).json({
    status: 'success',
    results: points.length,
    data: { points },
  });
});

export const updatePoint = catchAsync(async (req, res, next) => {
  const point = await Point.findOneAndUpdate(
    {
      _id: req.params.id,
      companyId: req.user.company,
    },
    req.body,
    {
      new: true,
      runValidators: true,
    }
  );

  if (!point) {
    return next(
      new AppError(
        'No point found with that ID or you do not have permission',
        404
      )
    );
  }

  res.status(200).json({
    status: 'success',
    data: { point },
  });
});

export const deletePoint = catchAsync(async (req, res, next) => {
  const point = await Point.findOneAndDelete({
    _id: req.params.id,
    companyId: req.user.company,
  });

  if (!point) {
    return next(
      new AppError(
        'No point found with that ID or you do not have permission',
        404
      )
    );
  }

  res.status(204).json({
    status: 'success',
    data: null,
  });
});
