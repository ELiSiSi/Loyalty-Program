import express from 'express';
const router = express.Router();

import { protect, restrictTo } from '../middleware/auth.js';

import { getAllPayments, getPayment } from '../controller/paymentSuperAdmin.js';

router.use(protect);

router.use(restrictTo('superAdmin'));

/**
 * @swagger
 * /api/v1/super-admin/payments:
 *   get:
 *     summary: Get all payments across all companies
 *     description: |
 *       Super admin only. Returns all payments with populated user data and booking product details.
 *       No company filter applied - returns payments from all companies.
 *     tags: [Super Admin - Payments]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all payments
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
 *                   example: 500
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
 * /api/v1/super-admin/payments/{id}:
 *   get:
 *     summary: Get single payment by ID
 *     description: |
 *       Super admin only. Returns any payment by ID regardless of company.
 *       No company ownership check applied.
 *     tags: [Super Admin - Payments]
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
 *                       $ref: '#/components/schemas/Payment'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         description: Payment not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/:id', getPayment);

export default router;
