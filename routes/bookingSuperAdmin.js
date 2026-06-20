import express from 'express';

const router = express.Router();

import { protect, restrictTo } from '../middleware/auth.js';

import {
  cancelBookingAdmin,
  getAllBookingsAdmin,
  getBookingAdmin,
  updateBookingAdmin,
} from '../controller/bookingSuperAdmin.js';

router.use(protect);

router.use(restrictTo('superAdmin'));

router.get('/', getAllBookingsAdmin);
router.get('/:id', getBookingAdmin);

router.patch('/:id', updateBookingAdmin);

router.patch('/:id/cancel', cancelBookingAdmin);

export default router;
