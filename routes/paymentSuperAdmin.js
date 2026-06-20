import express from 'express';
const router = express.Router();

import { protect, restrictTo } from '../middleware/auth.js';

import { getAllPayments, getPayment } from '../controller/PaymentSuperAdmin.js';

router.use(protect);

router.use(restrictTo('superAdmin'));

router.get('/', getAllPayments);
router.get('/:id', getPayment);

export default router;
