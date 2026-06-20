import express from 'express';

const router = express.Router();

import { protect, restrictTo } from '../middleware/auth.js';

import {
  cancelBooking,
  createBooking,
  getMyAllBookings,
  getMyBooking,
  updateMyBooking,
} from '../controller/bookingUser.js';

router.use(protect);

router.post('/', createBooking);

router.get('/', restrictTo('admin', 'superAdmin'), getMyAllBookings);

router.get('/:id', getMyBooking);

router.patch('/:id/cancel', cancelBooking);

router.patch('/:id', updateMyBooking);

export default router;
