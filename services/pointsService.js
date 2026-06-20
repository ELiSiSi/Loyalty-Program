import Point from '../models/point.js';

export const calculateBasePoints = (price, pointConfig) => {
  return Math.floor((price * pointConfig.pointsPercentage) / 100);
};

export const calculateProductPoints = (product) => {
  const now = new Date();

  const bonusPoints = (product.addPoints || [])
    .filter((p) => p.startsAt <= now && p.endAt >= now)
    .reduce((sum, p) => sum + p.points, 0);

  return {
    basePoints: product.points,
    bonusPoints,
    totalPoints: product.points + bonusPoints,
  };
};

export const getPointConfig = async (companyId) => {
  const pointConfig = await Point.findOne({ companyId });

  if (!pointConfig) {
    throw new Error('Point configuration not found for this company');
  }

  return pointConfig;
};
