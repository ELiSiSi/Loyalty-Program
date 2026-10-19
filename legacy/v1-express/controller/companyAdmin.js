import Company from '../models/company.js';
import AppError from '../utils/appError.js';
import catchAsync from '../utils/catchAsync.js';

export const getMyCompany = catchAsync(async (req, res, next) => {
  const companyId = req.user.company;

  const company = await Company.findById(companyId);

  if (!company) {
    return next(new AppError('No company found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: { company },
  });
});
export const updateMyCompany = catchAsync(async (req, res, next) => {
  const companyId = req.user.company;

  const updateData = { ...req.body };

  if (req.file) {
    updateData.logo = req.file.path.replace(/\\/g, '/');
  }

  const company = await Company.findByIdAndUpdate(companyId, updateData, {
    new: true,
    runValidators: true,
  });

  if (!company) {
    return next(new AppError('No company found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: { company },
  });
});
