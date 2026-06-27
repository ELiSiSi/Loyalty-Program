import Company from '../models/company.js';
import Point from '../models/point.js';
import AppError from '../utils/appError.js';
import catchAsync from '../utils/catchAsync.js';



export const getAllPoints = catchAsync(async (req, res) => {
  const points = await Point.find()

  res.status(200).json({
    status: 'success',
    results: points.length,
    data: { points },
  });
});

export const getPoint = catchAsync(async (req, res, next) => {
  const point = await Point.findById(req.params.id).populate('companyId');

  if (!point) {
    return next(new AppError('No point found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: { point },
  });
});


export const deletePoint = catchAsync(async (req, res, next) => {
  const point = await Point.findByIdAndDelete(req.params.id);

  if (!point) {
    return next(new AppError('No point found with that ID', 404));
  }

  res.status(204).json({
    status: 'success',
    data: null,
  });
});
