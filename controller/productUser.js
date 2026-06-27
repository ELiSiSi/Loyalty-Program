import Point from '../models/point.js';
import Product from '../models/product.js';
import AppError from '../utils/appError.js';
import catchAsync from '../utils/catchAsync.js';

export const getAllProducts = catchAsync(async (req, res, next) => {
  const products = await Product.find({ isActive: true });

  res.status(200).json({
    status: 'success',
    results: products.length,
    data: {
      products,
    },
  });
});

export const getProduct = catchAsync(async (req, res, next) => {
  const product = await Product.findById({ isActive: true , _id: req.params.id});

  if (!product) {
    return next(new AppError('No product found with that ID', 404));
  }

  if (!product.isActive) {
    return next(
      new AppError('Product not active or currently unavailable', 404)
    );
  }

  res.status(200).json({
    status: 'success',
    data: {
      product,
    },
  });
});
