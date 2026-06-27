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
      points: calculateProductPoints(product),
    },
  });
});


// export const createProduct = catchAsync(async (req, res, next) => {
//   const { url, addPoints } = req.body;

//   if (!url) {
//     return next(new AppError('Please provide URL and Category', 400));
//   }

//   const response = await fetch(url);
//   if (!response.ok) {
//     return next(
//       new AppError('Failed to fetch data from the provided URL', 400)
//     );
//   }

//   const flightsData = await response.json();

//   const company = req.user.company;
//   if (!company) {
//     return next(new AppError('You are not assigned to any company', 400));
//   }

//   const companyExists = await Company.findById(company);
//   if (!companyExists) {
//     return next(new AppError('Company not found', 404));
//   }

//   const categoryFound = await Category.findById(category);
//   if (!categoryFound) {
//     return next(new AppError('Category not found', 404));
//   }

//   const pointConfig = await getPointConfig(company);
//   const finalAddPoints = Array.isArray(addPoints) ? addPoints : [];

//   const productsToCreate = flightsData.map((flight) => {
//     const basePoints = calculateBasePoints(flight.ticket_price, pointConfig);

//     return {
//       name: flight.flight_name,
//       price: flight.ticket_price,
//       image: flight.flight_image,
//       description: flight.flight_description,
//       departureCity: flight.departure_city,
//       arrivalCity: flight.arrival_city,
//       company: company,
//       category: flight.flight_category,
//       points: basePoints,
//       addPoints: finalAddPoints,
//     };
//   });

//   const newProducts = await Product.insertMany(productsToCreate);

//   res.status(201).json({
//     status: 'success',
//     results: newProducts.length,
//     data: {
//       products: newProducts,
//     },
//   });
// });


export const createProduct = catchAsync(async (req, res, next) => {
  const { price, category, addPoints } = req.body;
  const company = req.user.company;

  if (!company) {
    return next(new AppError('You are not assigned to any company', 400));
  }

  if (req.file) {
    req.body.image = req.file.path.replace(/\\/g, '/');
  } else {
    return next(new AppError('Please upload a product image', 400));
  }

  const companyExists = await Company.findById(company);
  if (!companyExists) {
    return next(new AppError('Company not found', 404));
  }

  const categoryFound = await Category.findById(category);
  if (!categoryFound) {
    return next(new AppError('Category not found', 404));
  }

  const pointConfig = await getPointConfig(company);
  const basePoints = calculateBasePoints(price, pointConfig);

  const finalAddPoints = Array.isArray(addPoints) ? addPoints : [];

  const newProduct = await Product.create({
    ...req.body,
    company: company,
    category: category,
    points: basePoints,
    addPoints: finalAddPoints,
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
  const product = await Product.findOne({
    _id: req.params.id,
    company: req.user.company,
  });

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
