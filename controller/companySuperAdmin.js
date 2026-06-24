import Company from '../models/company.js';
import AppError from '../utils/appError.js';
import catchAsync from '../utils/catchAsync.js';

export const getCompany = catchAsync(async (req, res, next) => {
  const company = await Company.findById(req.params.id);

  if (!company) {
    return next(new AppError('No company found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: { company },
  });
});

export const getAllCompanies = catchAsync(async (req, res) => {
  const companies = await Company.find();

  res.status(200).json({
    status: 'success',
    results: companies.length,
    data: { companies },
  });
});

export const createCompany = catchAsync(async (req, res) => {
  const companyData = { ...req.body };

  if (req.file) {
    companyData.logo = req.file.path.replace(/\\/g, '/');
  }

  const newCompany = await Company.create(companyData);

  res.status(201).json({
    status: 'success',
    data: { company: newCompany },
  });
});

export const updateCompany = catchAsync(async (req, res, next) => {
  const updateData = { ...req.body };

  if (req.file) {
    updateData.logo = req.file.path.replace(/\\/g, '/');
  }

  const company = await Company.findByIdAndUpdate(req.params.id, updateData, {
    new: true,
    runValidators: true,
  });

  if (!company) {
    return next(new AppError('No company found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: { company },
  });
});

export const deleteCompany = catchAsync(async (req, res, next) => {
  const company = await Company.findByIdAndDelete(req.params.id);

  if (!company) {
    return next(new AppError('No company found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: null,
  });
});
