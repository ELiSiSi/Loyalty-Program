import Point from '../models/point.js';
import AppError from '../utils/appError.js';
import mongoose from 'mongoose';

export const calculateBasePoints = (price, pointConfig) => {
  return Math.floor((price * (pointConfig.pointsPercentage || 0)) / 100);
};

export const calculateProductPoints = (product) => {
  const now = new Date();

  const bonusPoints = (product.addPoints || [])
    .filter((p) => p.startsAt <= now && p.endAt >= now)
    .reduce((sum, p) => sum + p.points, 0);

  return {
    basePoints: product.points || 0,
    bonusPoints,
    totalPoints: (product.points || 0) + bonusPoints,
  };
};

export const getPointConfig = async (companyId) => {
  if (!companyId) {
    throw new AppError(
      'Company ID is required to fetch point configuration',
      400
    );
  }

  const objectIdCompany = new mongoose.Types.ObjectId(String(companyId).trim());

  const pointConfig = await Point.findOne({ companyId: objectIdCompany });

  if (!pointConfig) {
    throw new AppError('Point configuration not found for this company', 404);
  }

  return pointConfig;
};
