import express from 'express';
const router = express.Router();

import { protect, restrictTo } from '../middleware/auth.js';

import {
  createCoupon,
  deleteCoupon,
  getAllCoupons,
  getCoupon,
  updateCoupon,
} from '../controller/couponAdmin.js';

router.use(protect);
router.use(restrictTo('admin'));

/**
 * @swagger
 * tags:
 *   name: Admin Coupons
 *   description: Coupon management for admin (company-specific)
 */

/**
 * @swagger
 * /api/v1/admin/coupon:
 *   get:
 *     summary: Get all coupons for admin's company
 *     tags: [Admin Coupons]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of coupons with isActive status
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
 *                     coupons:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                             example: "64a1b2c3d4e5f6g7h8i9j0k1"
 *                           code:
 *                             type: string
 *                             example: "SUMMER2024"
 *                           discount:
 *                             type: number
 *                             example: 20
 *                           startsAt:
 *                             type: string
 *                             format: date-time
 *                             example: "2024-06-01T00:00:00.000Z"
 *                           expiresAt:
 *                             type: string
 *                             format: date-time
 *                             example: "2024-08-31T23:59:59.000Z"
 *                           isActive:
 *                             type: boolean
 *                             example: true
 *                           company:
 *                             type: object
 *                             properties:
 *                               name:
 *                                 type: string
 *                                 example: "Travel Co"
 *                               logo:
 *                                 type: string
 *                                 example: "uploads/companies/logo.jpg"
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Not admin
 */
router.get('/', getAllCoupons);

/**
 * @swagger
 * /api/v1/admin/coupon/{id}:
 *   get:
 *     summary: Get single coupon by ID
 *     tags: [Admin Coupons]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Coupon ID (MongoDB ObjectId)
 *         example: "64a1b2c3d4e5f6g7h8i9j0k1"
 *     responses:
 *       200:
 *         description: Coupon found with isActive status
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
 *                     coupon:
 *                       type: object
 *                       properties:
 *                         _id:
 *                           type: string
 *                         code:
 *                           type: string
 *                           example: "SUMMER2024"
 *                         discount:
 *                           type: number
 *                           example: 20
 *                         startsAt:
 *                           type: string
 *                           format: date-time
 *                         expiresAt:
 *                           type: string
 *                           format: date-time
 *                         isActive:
 *                           type: boolean
 *                           example: true
 *                         company:
 *                           type: object
 *                           properties:
 *                             name:
 *                               type: string
 *                             logo:
 *                               type: string
 *                         createdAt:
 *                           type: string
 *                           format: date-time
 *       404:
 *         description: Coupon not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Not admin
 */
router.get('/:id', getCoupon);

/**
 * @swagger
 * /api/v1/admin/coupon:
 *   post:
 *     summary: Create new coupon for company
 *     tags: [Admin Coupons]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - code
 *               - discount
 *               - startsAt
 *               - expiresAt
 *             properties:
 *               code:
 *                 type: string
 *                 description: Unique coupon code
 *                 example: "SUMMER2024"
 *               discount:
 *                 type: number
 *                 description: Discount percentage
 *                 example: 20
 *               startsAt:
 *                 type: string
 *                 format: date-time
 *                 description: Coupon start date
 *                 example: "2024-06-01T00:00:00.000Z"
 *               expiresAt:
 *                 type: string
 *                 format: date-time
 *                 description: Coupon expiration date (must be after startsAt)
 *                 example: "2024-08-31T23:59:59.000Z"
 *     responses:
 *       201:
 *         description: Coupon created
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
 *                     coupon:
 *                       type: object
 *                       properties:
 *                         _id:
 *                           type: string
 *                         code:
 *                           type: string
 *                         discount:
 *                           type: number
 *                         startsAt:
 *                           type: string
 *                           format: date-time
 *                         expiresAt:
 *                           type: string
 *                           format: date-time
 *                         isActive:
 *                           type: boolean
 *                         company:
 *                           type: object
 *                           properties:
 *                             name:
 *                               type: string
 *                             logo:
 *                               type: string
 *                         createdAt:
 *                           type: string
 *                           format: date-time
 *       400:
 *         description: Bad request - Invalid dates or missing fields
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Not admin
 *       404:
 *         description: Company not found
 */
router.post('/', createCoupon);

/**
 * @swagger
 * /api/v1/admin/coupon/{id}:
 *   patch:
 *     summary: Update coupon (code, discount, dates)
 *     tags: [Admin Coupons]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Coupon ID
 *         example: "64a1b2c3d4e5f6g7h8i9j0k1"
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               code:
 *                 type: string
 *                 description: New coupon code
 *                 example: "WINTER2024"
 *               discount:
 *                 type: number
 *                 description: New discount percentage
 *                 example: 30
 *               startsAt:
 *                 type: string
 *                 format: date-time
 *                 description: New start date
 *                 example: "2024-12-01T00:00:00.000Z"
 *               expiresAt:
 *                 type: string
 *                 format: date-time
 *                 description: New expiration date (must be after startsAt)
 *                 example: "2024-12-31T23:59:59.000Z"
 *     responses:
 *       200:
 *         description: Coupon updated
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
 *                     coupon:
 *                       type: object
 *                       properties:
 *                         _id:
 *                           type: string
 *                         code:
 *                           type: string
 *                         discount:
 *                           type: number
 *                         startsAt:
 *                           type: string
 *                           format: date-time
 *                         expiresAt:
 *                           type: string
 *                           format: date-time
 *                         isActive:
 *                           type: boolean
 *                         company:
 *                           type: object
 *                           properties:
 *                             name:
 *                               type: string
 *                             logo:
 *                               type: string
 *                         updatedAt:
 *                           type: string
 *                           format: date-time
 *       400:
 *         description: Bad request - Invalid dates
 *       404:
 *         description: Coupon not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Not admin
 */
router.patch('/:id', updateCoupon);

/**
 * @swagger
 * /api/v1/admin/coupon/{id}:
 *   delete:
 *     summary: Delete coupon
 *     tags: [Admin Coupons]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Coupon ID
 *         example: "64a1b2c3d4e5f6g7h8i9j0k1"
 *     responses:
 *       204:
 *         description: Coupon deleted
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: null
 *       404:
 *         description: Coupon not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Not admin
 */
router.delete('/:id', deleteCoupon);

export default router;
