import Category from '../models/category.js';
import AppError from '../utils/appError.js';
import catchAsync from '../utils/catchAsync.js';
import User from '../models/user.js';

export const getAllCategories = catchAsync(async (req, res, next) => {
  const companyId = req.user.company;

  const categories = await Category.find({ companyId: companyId });

  res.status(200).json({
    status: 'success',
    results: categories.length,
    data: { categories },
  });
});

export const getCategory = catchAsync(async (req, res, next) => {
  const category = await Category.findById(req.params.id);
  if (!category) {
    return next(new AppError('No category found with that ID', 404));
  }
  res.status(200).json({
    status: 'success',
    data: { category },
  });
});

export const createCategory = catchAsync(async (req, res, next) => {
  const categoryData = { ...req.body };

  categoryData.companyId = req.user.company;

  if (req.file) {
    categoryData.image = req.file.path.replace(/\\/g, '/');
  }

  const newCategory = await Category.create(categoryData);
  res.status(201).json({
    status: 'success',
    data: { category: newCategory },
  });
});

export const updateCategory = catchAsync(async (req, res, next) => {
  const updateData = { ...req.body };

  if (req.file) {
    updateData.image = req.file.path.replace(/\\/g, '/');
  }

  const category = await Category.findByIdAndUpdate(req.params.id, updateData, {
    new: true,
    runValidators: true,
  });

  if (!category) {
    return next(new AppError('No category found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: { category },
  });
});

export const deleteCategory = catchAsync(async (req, res, next) => {
  const category = await Category.findByIdAndDelete(req.params.id);
  if (!category) {
    return next(new AppError('No category found with that ID', 404));
  }
  res.status(204).json({
    status: 'success',
    data: null,
  });
});
