import express from 'express';
const router = express.Router();

import { protect, restrictTo } from '../middleware/auth.js';

import {
  createCoupon,
  deleteCoupon,
  getAllCoupons,
  getCoupon,
  updateCoupon,
} from '../controller/couponAdmin.js';

router.use(protect);

router.use(restrictTo('admin'));

router.get('/', getAllCoupons);

router.get('/:id', getCoupon);

router.post('/', createCoupon);

router.patch('/:id', updateCoupon);

router.delete('/:id', deleteCoupon);

export default router;
