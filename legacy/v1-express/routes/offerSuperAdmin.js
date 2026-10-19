import express from 'express';
const router = express.Router();

import { protect, restrictTo } from '../middleware/auth.js';

import {
  createOffer,
  deleteOffer,
  getAllOffersAdmin,
  getOfferAdmin,
  updateOffer,
} from '../controller/offerSuperAdmin.js';

router.use(protect);
router.use(restrictTo('superAdmin'));

/**
 * @swagger
 * tags:
 *   name: Super Admin Offers
 *   description: Offer management for super admin (all companies)
 */

/**
 * @swagger
 * /api/v1/super-admin/offer:
 *   get:
 *     summary: Get ALL offers across all companies
 *     tags: [Super Admin Offers]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all offers with company info
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
 *                   example: 20
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
 *                           updatedAt:
 *                             type: string
 *                             format: date-time
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Not super admin
 */
router.get('/', getAllOffersAdmin);

/**
 * @swagger
 * /api/v1/super-admin/offer/{id}:
 *   get:
 *     summary: Get single offer by ID (with company info)
 *     tags: [Super Admin Offers]
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
 *                           type: object
 *                           properties:
 *                             name:
 *                               type: string
 *                               example: "Travel Co"
 *                             logo:
 *                               type: string
 *                               example: "uploads/companies/logo.jpg"
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
 *         description: Forbidden - Not super admin
 */
router.get('/:id', getOfferAdmin);

/**
 * @swagger
 * /api/v1/super-admin/offer:
 *   post:
 *     summary: Create new offer for any company
 *     tags: [Super Admin Offers]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *             properties:
 *               title:
 *                 type: string
 *                 description: Offer title
 *                 example: "Global Sale"
 *               description:
 *                 type: string
 *                 description: Offer description
 *                 example: "Special discount for all companies"
 *               discount:
 *                 type: number
 *                 description: Discount percentage
 *                 example: 30
 *               image:
 *                 type: string
 *                 description: Offer image URL
 *                 example: "uploads/offers/global.jpg"
 *               company:
 *                 type: string
 *                 description: Company ID (optional, MongoDB ObjectId)
 *                 example: "64a1b2c3d4e5f6g7h8i9j0k1"
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
 *                         discount:
 *                           type: number
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
 *         description: Bad request - Missing required fields
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Not super admin
 *       404:
 *         description: Company not found
 */
router.post('/', createOffer);

/**
 * @swagger
 * /api/v1/super-admin/offer/{id}:
 *   patch:
 *     summary: Update offer (any company)
 *     tags: [Super Admin Offers]
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
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 description: New offer title
 *                 example: "Updated Sale"
 *               description:
 *                 type: string
 *                 description: New description
 *                 example: "Updated discount offer"
 *               discount:
 *                 type: number
 *                 description: New discount percentage
 *                 example: 40
 *               image:
 *                 type: string
 *                 description: New image URL
 *                 example: "uploads/offers/updated.jpg"
 *               company:
 *                 type: string
 *                 description: New company ID
 *                 example: "64a1b2c3d4e5f6g7h8i9j0k1"
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
 *                           type: object
 *                           properties:
 *                             name:
 *                               type: string
 *                             logo:
 *                               type: string
 *                         updatedAt:
 *                           type: string
 *                           format: date-time
 *       404:
 *         description: Offer not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Not super admin
 */
router.patch('/:id', updateOffer);

/**
 * @swagger
 * /api/v1/super-admin/offer/{id}:
 *   delete:
 *     summary: Delete offer
 *     tags: [Super Admin Offers]
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
 *         description: Forbidden - Not super admin
 */
router.delete('/:id', deleteOffer);

export default router;
