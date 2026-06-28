import express from 'express';

const router = express.Router();

import { protect, restrictTo } from '../middleware/auth.js';

import {
  cancelBookingAdmin,
  getAllBookingsAdmin,
  getBookingAdmin,
} from '../controller/bookingAdmin.js';

router.use(protect);

router.use(restrictTo('admin', 'superAdmin'));

/**
 * @swagger
 * /api/v1/admin/bookings:
 *   get:
 *     summary: Get all company bookings
 *     tags: [Admin Bookings]
 */
router.get('/', getAllBookingsAdmin);

/**
 * @swagger
 * /api/v1/admin/bookings/{id}:
 *   get:
 *     summary: Get single booking
 *     tags: [Admin Bookings]
 */
router.get('/:id', getBookingAdmin);

/**
 * @swagger
 * /api/v1/admin/bookings/{id}/cancel:
 *   patch:
 *     summary: Cancel booking
 *     tags: [Admin Bookings]
 */
router.patch('/:id/cancel', cancelBookingAdmin);

export default router;
