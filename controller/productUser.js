import Point from '../models/point.js';
import Product from '../models/product.js';
import AppError from '../utils/appError.js';
import catchAsync from '../utils/catchAsync.js';

import { calculateProductPoints } from '../services/pointsService.js';

export const getAllProducts = catchAsync(async (req, res, next) => {
  const products = await Product.find({ isActive: true });

  const productsWithPoints = await Promise.all(
    products.map(async (product) => {
      const pointConfig = await Point.findOne({
        companyId: product.company,
      });

      return {
        ...product.toObject(),
        points: pointConfig ? calculateProductPoints(product, pointConfig) : 0,
      };
    })
  );

  res.status(200).json({
    status: 'success',
    results: productsWithPoints.length,
    data: {
      products: productsWithPoints,
    },
  });
});

export const getProduct = catchAsync(async (req, res, next) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return next(new AppError('No product found with that ID', 404));
  }

  if (!product.isActive) {
    return next(new AppError('Product not active', 404));
  }

  const pointConfig = await Point.findOne({
    companyId: product.company,
  });

  const points = pointConfig ? calculateProductPoints(product, pointConfig) : 0;

  res.status(200).json({
    status: 'success',
    data: {
      product,
      points,
    },
  });
});
