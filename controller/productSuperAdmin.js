import Category from '../models/category.js';
import Company from '../models/company.js';
import Product from '../models/product.js';
import AppError from '../utils/appError.js';
import catchAsync from '../utils/catchAsync.js';

import {
  calculateBasePoints,
  calculateProductPoints,
  getPointConfig,
} from '../services/pointsService.js';

export const getAllProducts = catchAsync(async (req, res, next) => {
  const products = await Product.find().populate('company category');

  res.status(200).json({
    status: 'success',
    results: products.length,
    data: { products },
  });
});

export const getProduct = catchAsync(async (req, res, next) => {
  const product = await Product.findById(req.params.id).populate(
    'company category'
  );

  if (!product) {
    return next(new AppError('No product found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      product,
      points: calculateProductPoints(product),
    },
  });
});

export const createProduct = catchAsync(async (req, res, next) => {
  const { price, category, addPoints, companyId } = req.body;

  if (!companyId) {
    return next(new AppError('Company is required', 400));
  }

  if (req.file) {
    req.body.image = req.file.path.replace(/\\/g, '/');
  } else {
    return next(new AppError('Please upload a product image', 400));
  }

  const company = await Company.findById(companyId);
  if (!company) {
    return next(new AppError('Company not found', 404));
  }

  const categoryFound = await Category.findById(category);
  if (!categoryFound) {
    return next(new AppError('Category not found', 404));
  }

  const pointConfig = await getPointConfig(companyId);
  const basePoints = calculateBasePoints(price, pointConfig);

  const newProduct = await Product.create({
    ...req.body,
    company: companyId,
    category,
    points: basePoints,
    addPoints: addPoints || [],
  });

  res.status(201).json({
    status: 'success',
    data: {
      product: newProduct,
      points: calculateProductPoints(newProduct),
    },
  });
});

export const updateProduct = catchAsync(async (req, res, next) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return next(new AppError('No product found with that ID', 404));
  }

  if (req.file) {
    req.body.image = req.file.path.replace(/\\/g, '/');
  }

  const allowedFields = [
    'name',
    'price',
    'image',
    'description',
    'category',
    'addPoints',
    'isActive',
  ];

  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) {
      product[field] = req.body[field];
    }
  });

  if (req.body.price) {
    const pointConfig = await getPointConfig(product.company);
    product.points = calculateBasePoints(product.price, pointConfig);
  }

  await product.save();

  res.status(200).json({
    status: 'success',
    data: {
      product,
      points: calculateProductPoints(product),
    },
  });
});

export const deleteProduct = catchAsync(async (req, res, next) => {
  const product = await Product.findByIdAndDelete(req.params.id);

  if (!product) {
    return next(new AppError('No product found with that ID', 404));
  }

  res.status(204).json({
    status: 'success',
    data: null,
  });
});
