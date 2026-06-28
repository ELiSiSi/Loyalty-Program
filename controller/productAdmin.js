import Category from '../models/category.js';
import Company from '../models/company.js';
import Product from '../models/product.js';
import Gift from '../models/gift.js';

import AppError from '../utils/appError.js';
import catchAsync from '../utils/catchAsync.js';

import {
  calculateBasePoints,
  calculateProductPoints,
  getPointConfig,
} from '../services/pointsService.js';

export const getAllProducts = catchAsync(async (req, res, next) => {
  const products = await Product.find({
    company: req.user.company,
  });

  res.status(200).json({
    status: 'success',
    results: products.length,
    data: { products },
  });
});

export const getProduct = catchAsync(async (req, res, next) => {
  const product = await Product.findOne({
    _id: req.params.id,
    company: req.user.company,
  });

  if (!product) {
    return next(new AppError('No product found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      product,
    },
  });
});

export const createProduct = catchAsync(async (req, res, next) => {
  const company = req.user.company;

  if (!company) {
    return next(new AppError('You are not assigned to any company', 400));
  }

  if (!req.file) {
    return next(new AppError('Please upload a product image', 400));
  }

  const [companyExists, categoryFound] = await Promise.all([
    Company.findById(company),
    Category.findById(req.body.category),
  ]);

  if (!companyExists) {
    return next(new AppError('Company not found', 404));
  }

  if (!categoryFound) {
    return next(new AppError('Category not found', 404));
  }

  let addPoints = req.body.addPoints;
  if (typeof addPoints === 'string') {
    try {
      addPoints = JSON.parse(addPoints);
    } catch (e) {
      return next(new AppError('Invalid addPoints format', 400));
    }
  }

  const productData = {
    ...req.body,
    addPoints,
    company,
    image: req.file.path.replace(/\\/g, '/'),
  };

  const newProduct = await Product.create(productData);

  res.status(201).json({
    status: 'success',
    data: { product: newProduct },
  });
});

export const updateProduct = catchAsync(async (req, res, next) => {
  const product = await Product.findOne({
    _id: req.params.id,
    company: req.user.company,
  });

  if (!product) {
    return next(
      new AppError('No product found with that ID or you lack permission', 404)
    );
  }

  // إذا قام الأدمن برفع صورة جديدة
  if (req.file) {
    req.body.image = req.file.path.replace(/\\/g, '/');
  }

  // التحقق من وجود القسم الجديد في حال تم تعديله
  if (req.body.category) {
    const categoryFound = await Category.findById(req.body.category);
    if (!categoryFound) {
      return next(new AppError('Category not found', 404));
    }
  }

  const allowedFields = [
    'name',
    'price',
    'image',
    'description',
    'category',
    'addPoints',
    'isActive',
    'fromLocation',
    'toLocation',
    'gifts',
  ];

  // تطبيق التعديلات للحقول المبعوثة فعلياً فقط
  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) {
      product[field] = req.body[field];
    }
  });

  await product.save();

  res.status(200).json({
    status: 'success',
    data: {
      product,
    },
  });
});

// 5. حذف المنتج بالتأكد من حماية الشركة
export const deleteProduct = catchAsync(async (req, res, next) => {
  const product = await Product.findOneAndDelete({
    _id: req.params.id,
    company: req.user.company,
  });

  if (!product) {
    return next(new AppError('No product found with that ID', 404));
  }

  res.status(204).json({
    status: 'success',
    data: null,
  });
});
