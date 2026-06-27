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
/**
 * @swagger
 * /api/v1/bookings:
 *   post:
 *     summary: Create a new booking
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - productId
 *             properties:
 *               productId:
 *                 type: string
 *                 description: Product ID to book
 *                 example: 60d21b4667d0d8992e610c85
 *               quantity:
 *                 type: integer
 *                 description: Number of items
 *                 minimum: 1
 *                 default: 1
 *                 example: 2
 *               couponCode:
 *                 type: string
 *                 description: Optional coupon code for discount
 *                 example: SUMMER2024
 *               usedPoints:
 *                 type: number
 *                 description: Points to redeem
 *                 example: 50
 *     responses:
 *       201:
 *         description: Booking created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     booking:
 *                       $ref: '#/components/schemas/Booking'
 *       400:
 *         description: Bad request - Insufficient points, expired coupon, etc.
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Product, User, or Coupon not found
 */
router.post('/', createBooking);


/**
 * @swagger
 * /api/v1/bookings/my:
 *   get:
 *     summary: Get all my bookings
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     description: Retrieve all bookings for the currently logged-in user
 *     responses:
 *       200:
 *         description: List of all user bookings
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 results:
 *                   type: integer
 *                   example: 5
 *                 data:
 *                   type: object
 *                   properties:
 *                     bookings:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Booking'
 *       401:
 *         description: Unauthorized
 */

router.get('/',getMyAllBookings);

/**
 * @swagger
 * /api/v1/bookings/my/{id}:
 *   get:
 *     summary: Get a single booking by ID
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Booking ID
 *         example: 60d21b4667d0d8992e610c85
 *     responses:
 *       200:
 *         description: Booking found and returned
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     booking:
 *                       $ref: '#/components/schemas/Booking'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Booking not found
 */

router.get('/:id', getMyBooking);
/**
 * @swagger
 * /api/v1/bookings/{id}/cancel:
 *   patch:
 *     summary: Cancel a booking
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Booking ID to cancel
 *         example: 60d21b4667d0d8992e610c85
 *     responses:
 *       200:
 *         description: Booking cancelled successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     booking:
 *                       $ref: '#/components/schemas/Booking'
 *       400:
 *         description: Booking already cancelled
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Booking or Point system not found
 */
router.patch('/:id/cancel', cancelBooking);
/**
 * @swagger
 * /api/v1/bookings/my/{id}:
 *   patch:
 *     summary: Update my booking
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Booking ID to update
 *         example: 60d21b4667d0d8992e610c85
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               quantity:
 *                 type: integer
 *                 description: New quantity
 *                 minimum: 1
 *                 example: 3
 *               couponCode:
 *                 type: string
 *                 description: New coupon code
 *                 example: WINTER2024
 *               usedPoints:
 *                 type: number
 *                 description: Points to redeem
 *                 example: 100
 *     responses:
 *       200:
 *         description: Booking updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     booking:
 *                       $ref: '#/components/schemas/Booking'
 *       400:
 *         description: Cannot update paid/cancelled booking or insufficient points
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Booking, Product, or Coupon not found
 */
router.patch('/:id', updateMyBooking);

export default router;
