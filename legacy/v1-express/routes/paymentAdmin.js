import express from 'express';
const router = express.Router();

import { protect, restrictTo } from '../middleware/auth.js';

import { getAllPayments, getPayment } from '../controller/paymentAdmin.js';

router.use(protect);

router.use(restrictTo('admin'));

/**
 * @swagger
 * /api/v1/admin/payments:
 *   get:
 *     summary: Get all payments for admin's company
 *     description: |
 *       Returns all payments associated with bookings belonging to the admin's company.
 *       Populates user data (name, email) and booking product details (name, price, image).
 *     tags: [Admin Payments]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of company payments
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
 *                   example: 25
 *                 data:
 *                   type: object
 *                   properties:
 *                     payments:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/PaymentAdminPopulated'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
router.get('/', getAllPayments);

/**
 * @swagger
 * /api/v1/admin/payments/{id}:
 *   get:
 *     summary: Get single payment by ID
 *     description: |
 *       Returns a specific payment if its associated booking belongs to the admin's company.
 *       Returns 403 if payment belongs to another company.
 *     tags: [Admin Payments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           pattern: '^[0-9a-fA-F]{24}$'
 *         description: Payment ID (MongoDB ObjectId)
 *         example: 64a2f8c1e4b0d123456789af
 *     responses:
 *       200:
 *         description: Payment found and belongs to admin's company
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
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         description: Payment does not belong to admin's company
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Payment not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/:id', getPayment);

export default router;
