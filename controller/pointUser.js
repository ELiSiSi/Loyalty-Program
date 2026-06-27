import Company from '../models/company.js';
import Point from '../models/point.js';
import AppError from '../utils/appError.js';
import catchAsync from '../utils/catchAsync.js';



export const getMyPoints = catchAsync(async (req, res) => {
  const points = await Point.find({
    userId: req.user._id,
  })

  res.status(200).json({
    status: 'success',
    results: points.length,
    data: { points },
  });
});


export const getOnePoint = catchAsync(async (req, res) => {
  const point = await Point.findOne({
    userId: req.user._id,
    _id: req.params.id
  })

  if (!point) {
    return next(new AppError('No point found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: { point },
  })
}
)
