import Category from '../models/category.js';
import AppError from '../utils/appError.js';
import catchAsync from '../utils/catchAsync.js';

export const getAllCategories = catchAsync(async (req, res) => {
  const categories = await Category.find().populate('company', 'name logo');

  res.status(200).json({
    status: 'success',
    results: categories.length,
    data: { categories },
  });
});

export const getCategory = catchAsync(async (req, res, next) => {
  const category = await Category.findById(req.params.id).populate(
    'company',
    'name logo'
  );

  if (!category) {
    return next(new AppError('No category found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: { category },
  });
});

export const createCategory = catchAsync(async (req, res) => {
  const categoryData = { ...req.body };

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



export const deleteAllCategories = catchAsync(async (req, res) => {
  await Category.deleteMany({});
  res.status(204).json({
    status: 'success',
    data: null,
  });
}); 
