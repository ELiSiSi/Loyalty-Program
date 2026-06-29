import express from 'express';
const router = express.Router();

import { protect } from '../middleware/auth.js';

import { getAllOffersUser, getOfferUser } from '../controller/offerUser.js';

router.use(protect);

/**
 * @swagger
 * tags:
 *   name: User Offers
 *   description: Available offers for logged-in users (filtered by points, company, active status)
 */

/**
 * @swagger
 * /api/v1/user/offer:
 *   get:
 *     summary: Get all available offers for current user
 *     description: Returns only active offers that the user can afford with their available points, from their company
 *     tags: [User Offers]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of available offers with user's points
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 availablePoints:
 *                   type: number
 *                   description: Current user's available points
 *                   example: 1500
 *                 results:
 *                   type: integer
 *                   example: 3
 *                 data:
 *                   type: object
 *                   properties:
 *                     offers:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                             example: "64a1b2c3d4e5f6g7h8i9j0k1"
 *                           title:
 *                             type: string
 *                             example: "Summer Sale"
 *                           description:
 *                             type: string
 *                             example: "50% off all bookings"
 *                           image:
 *                             type: string
 *                             example: "uploads/offers/summer.jpg"
 *                           discount:
 *                             type: number
 *                             example: 50
 *                           requiredPoints:
 *                             type: number
 *                             example: 500
 *                           startsAt:
 *                             type: string
 *                             format: date-time
 *                             example: "2024-06-01T00:00:00.000Z"
 *                           expiresAt:
 *                             type: string
 *                             format: date-time
 *                             example: "2024-08-31T23:59:59.000Z"
 *                           company:
 *                             type: string
 *                             example: "64a1b2c3d4e5f6g7h8i9j0k1"
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 *       401:
 *         description: Unauthorized - Not logged in
 */
router.get('/', getAllOffersUser);

/**
 * @swagger
 * /api/v1/user/offer/{id}:
 *   get:
 *     summary: Get single offer by ID (if available for user)
 *     description: Returns offer only if it's active, within date range, user has enough points, and same company
 *     tags: [User Offers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Offer ID (MongoDB ObjectId)
 *         example: "64a1b2c3d4e5f6g7h8i9j0k1"
 *     responses:
 *       200:
 *         description: Offer is available for user
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
 *                     offer:
 *                       type: object
 *                       properties:
 *                         _id:
 *                           type: string
 *                           example: "64a1b2c3d4e5f6g7h8i9j0k1"
 *                         title:
 *                           type: string
 *                           example: "Summer Sale"
 *                         description:
 *                           type: string
 *                           example: "50% off all bookings"
 *                         image:
 *                           type: string
 *                           example: "uploads/offers/summer.jpg"
 *                         discount:
 *                           type: number
 *                           example: 50
 *                         requiredPoints:
 *                           type: number
 *                           example: 500
 *                         startsAt:
 *                           type: string
 *                           format: date-time
 *                         expiresAt:
 *                           type: string
 *                           format: date-time
 *                         company:
 *                           type: string
 *                           example: "64a1b2c3d4e5f6g7h8i9j0k1"
 *                     availablePoints:
 *                       type: number
 *                       description: Current user's available points
 *                       example: 1500
 *       404:
 *         description: Offer not available (inactive, expired, not enough points, or different company)
 *       401:
 *         description: Unauthorized - Not logged in
 */
router.get('/:id', getOfferUser);

export default router;
