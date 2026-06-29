import express from 'express';
const router = express.Router();

import { protect, restrictTo } from '../middleware/auth.js';
import { uploadImage } from '../middleware/uploadPhoto.js';

import {
  createOffer,
  deleteOffer,
  getAllOffersAdmin,
  getOfferAdmin,
  updateOffer,
} from '../controller/offerAdmin.js';

router.use(protect);
router.use(restrictTo('admin'));

/**
 * @swagger
 * tags:
 *   name: Admin Offers
 *   description: Offer management for admin (company-specific)
 */

/**
 * @swagger
 * /api/v1/admin/offer:
 *   get:
 *     summary: Get all offers for admin's company
 *     tags: [Admin Offers]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of offers
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
 *                           company:
 *                             type: string
 *                             example: "64a1b2c3d4e5f6g7h8i9j0k1"
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 *                           updatedAt:
 *                             type: string
 *                             format: date-time
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Not admin
 */
router.get('/', getAllOffersAdmin);

/**
 * @swagger
 * /api/v1/admin/offer/{id}:
 *   get:
 *     summary: Get single offer by ID
 *     tags: [Admin Offers]
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
 *         description: Offer found
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
 *                         company:
 *                           type: string
 *                           example: "64a1b2c3d4e5f6g7h8i9j0k1"
 *                         createdAt:
 *                           type: string
 *                           format: date-time
 *                         updatedAt:
 *                           type: string
 *                           format: date-time
 *       404:
 *         description: Offer not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Not admin
 */
router.get('/:id', getOfferAdmin);

/**
 * @swagger
 * /api/v1/admin/offer:
 *   post:
 *     summary: Create new offer for company
 *     tags: [Admin Offers]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *             properties:
 *               title:
 *                 type: string
 *                 description: Offer title
 *                 example: "Summer Sale"
 *               description:
 *                 type: string
 *                 description: Offer description
 *                 example: "50% off all bookings this summer"
 *               discount:
 *                 type: number
 *                 description: Discount percentage
 *                 example: 50
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: Offer image file
 *     responses:
 *       201:
 *         description: Offer created
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
 *                         title:
 *                           type: string
 *                         description:
 *                           type: string
 *                         image:
 *                           type: string
 *                           example: "uploads/offers/summer.jpg"
 *                         discount:
 *                           type: number
 *                         company:
 *                           type: string
 *                         createdAt:
 *                           type: string
 *                           format: date-time
 *       400:
 *         description: Bad request - Missing required fields
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Not admin
 *       404:
 *         description: Company not found
 */
router.post('/', uploadImage, createOffer);

/**
 * @swagger
 * /api/v1/admin/offer/{id}:
 *   patch:
 *     summary: Update offer (company field protected)
 *     tags: [Admin Offers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Offer ID
 *         example: "64a1b2c3d4e5f6g7h8i9j0k1"
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 description: New offer title
 *                 example: "Winter Sale"
 *               description:
 *                 type: string
 *                 description: New description
 *                 example: "40% off winter bookings"
 *               discount:
 *                 type: number
 *                 description: New discount percentage
 *                 example: 40
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: New offer image
 *     responses:
 *       200:
 *         description: Offer updated
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
 *                         title:
 *                           type: string
 *                         description:
 *                           type: string
 *                         image:
 *                           type: string
 *                         discount:
 *                           type: number
 *                         company:
 *                           type: string
 *                         updatedAt:
 *                           type: string
 *                           format: date-time
 *       404:
 *         description: Offer not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Not admin
 */
router.patch('/:id', uploadImage, updateOffer);

/**
 * @swagger
 * /api/v1/admin/offer/{id}:
 *   delete:
 *     summary: Delete offer
 *     tags: [Admin Offers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Offer ID
 *         example: "64a1b2c3d4e5f6g7h8i9j0k1"
 *     responses:
 *       204:
 *         description: Offer deleted
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
 *         description: Offer not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Not admin
 */
router.delete('/:id', deleteOffer);

export default router;
