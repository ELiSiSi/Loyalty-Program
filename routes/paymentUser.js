import express from 'express';
const router = express.Router();

import { protect } from '../middleware/auth.js';

import {
  createPayment,
  getAllPayments,
  getPayment,
} from '../controller/paymentUser.js';

router.use(protect);

router.get('/', getAllPayments);

router.get('/:id', getPayment);

router.post('/:id', createPayment);

export default router;
