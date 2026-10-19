import Point from '../models/point.js';
import Product from '../models/product.js';
import Gift from '../models/gift.js';
import AppError from '../utils/appError.js';
import catchAsync from '../utils/catchAsync.js';


const isGiftActive = (gift) => {
  if (!gift) return false;
  const now = new Date();
  return gift.isActive && now >= gift.startsAt && now <= gift.expiresAt;
};

const formatProduct = (product) => {
  const obj = {
    _id: product._id,
    name: product.name,
    price: product.price,
    description: product.description,
    image: product.image,
    fromLocation: product.fromLocation,
    toLocation: product.toLocation,
    category: product.category,
    company: product.company,
    addPoints: product.addPoints,
    isActive: product.isActive,
  };

  if (isGiftActive(product.gifts)) {
    obj.gift = {
      _id: product.gifts._id,
      name: product.gifts.name,
      image: product.gifts.image,
      description: product.gifts.description,
      startsAt: product.gifts.startsAt,
      expiresAt: product.gifts.expiresAt,
    };
  }

  return obj;
};

export const getAllProducts = catchAsync(async (req, res, next) => {
  const products = await Product.find({ isActive: true });

  const formatted = products.map(formatProduct);

  res.status(200).json({
    status: 'success',
    results: formatted.length,
    data: { products: formatted },
  });
});

export const getProduct = catchAsync(async (req, res, next) => {
  const product = await Product.findOne({
    _id: req.params.id,
    isActive: true,
  });

  if (!product) {
    return next(new AppError('Product not found or currently unavailable', 404));
  }

  res.status(200).json({
    status: 'success',
    data: { product: formatProduct(product) },
  });
});
