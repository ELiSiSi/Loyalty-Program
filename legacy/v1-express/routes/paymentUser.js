import express from 'express';
const router = express.Router();

import { protect } from '../middleware/auth.js';

import {
  createPayment,
  getAllPayments,
  getPayment,
} from '../controller/paymentUser.js';

router.use(protect);

/**
 * @swagger
 * /api/v1/payments:
 *   get:
 *     summary: Get all payments for current user
 *     description: Returns all payments made by the logged-in user with populated booking and user data.
 *     tags: [User Payments]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of user payments
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
 *                     payments:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/PaymentPopulated'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.get('/', getAllPayments);

/**
 * @swagger
 * /api/v1/payments/{id}:
 *   get:
 *     summary: Get single payment by booking ID
 *     description: Returns a specific payment for the logged-in user by booking ID.
 *     tags: [User Payments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           pattern: '^[0-9a-fA-F]{24}$'
 *         description: Booking ID (MongoDB ObjectId)
 *         example: 64a2f8c1e4b0d123456789ab
 *     responses:
 *       200:
 *         description: Payment found
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
 *                     payment:
 *                       $ref: '#/components/schemas/PaymentPopulated'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         description: Payment not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/:id', getPayment);

/**
 * @swagger
 * /api/v1/payments/{id}:
 *   post:
 *     summary: Create payment for a booking
 *     description: |
 *       Processes payment for a booking. Validates booking status, updates user points,
 *       creates payment record, and confirms the booking.
 *
 *       Business rules:
 *       - Booking must belong to current user
 *       - Booking must not be already paid or cancelled
 *       - Payment must not already exist for this booking
 *       - Transfers earned points from pending to available
 *       - First payment gets bonus 200 points
 *     tags: [User Payments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           pattern: '^[0-9a-fA-F]{24}$'
 *         description: Booking ID to pay for
 *         example: 64a2f8c1e4b0d123456789ab
 *     responses:
 *       201:
 *         description: Payment created successfully
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
 *                     payment:
 *                       $ref: '#/components/schemas/Payment'
 *       400:
 *         description: Bad request - already paid, cancelled, or payment exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         description: Booking not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/:id', createPayment);

export default router;
