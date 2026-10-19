import express from 'express';

const router = express.Router();

import { protect, restrictTo } from '../middleware/auth.js';

import {
  cancelBookingAdmin,
  getAllBookingsAdmin,
  getBookingAdmin,
} from '../controller/bookingSuperAdmin.js';

router.use(protect);

router.use(restrictTo('superAdmin'));

/**
 * @swagger
 * /api/v1/super-admin/booking:
 *   get:
 *     summary: Get all bookings
 *     tags: [Super Admin - Bookings]
 */
router.get('/', getAllBookingsAdmin);

/**
 * @swagger
 * /api/v1/super-admin/booking/{id}:
 *   get:
 *     summary: Get single booking
 *     tags: [Super Admin - Bookings]
 */
router.get('/:id', getBookingAdmin);

/**
 * @swagger
 * /api/v1/super-admin/booking/{id}/cancel:
 *   patch:
 *     summary: Cancel booking
 *     tags: [Super Admin - Bookings]
 */
router.patch('/:id/cancel', cancelBookingAdmin);

export default router;
