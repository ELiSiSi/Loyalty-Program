import express from 'express';
const router = express.Router();

import { protect, restrictTo } from '../middleware/auth.js';

import {
  createCoupon,
  deleteCoupon,
  getAllCoupons,
  getCoupon,
  updateCoupon,
} from '../controller/couponSuperAdmin.js';

router.use(protect);
router.use(restrictTo('superAdmin'));

router.route('/').get(getAllCoupons).post(createCoupon);

router.route('/:id').get(getCoupon).patch(updateCoupon).delete(deleteCoupon);

export default router;
