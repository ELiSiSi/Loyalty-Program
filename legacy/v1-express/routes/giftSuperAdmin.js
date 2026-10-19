import express from 'express';
const router = express.Router();

import { protect, restrictTo } from '../middleware/auth.js';
import { uploadImage } from '../middleware/uploadPhoto.js';

import {
  createGift,
  deleteGift,
  getAllGifts,
  getGift,
  updateGift,
} from '../controller/giftSuperAdmin.js';

router.use(protect);
router.use(restrictTo('superAdmin'));

/**
 * @swagger
 * tags:
 *   name: Super Admin Gifts
 *   description: Gift management for super admin (all companies)
 */

/**
 * @swagger
 * /api/v1/super-admin/gift:
 *   get:
 *     summary: Get ALL gifts across all companies
 *     tags: [Super Admin Gifts]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all gifts with company info
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
 *                   example: 15
 *                 data:
 *                   type: object
 *                   properties:
 *                     gifts:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                             example: "64a1b2c3d4e5f6g7h8i9j0k1"
 *                           name:
 *                             type: string
 *                             example: "Free Dinner"
 *                           description:
 *                             type: string
 *                             example: "Complimentary dinner for two"
 *                           image:
 *                             type: string
 *                             example: "uploads/gifts/dinner.jpg"
 *                           points:
 *                             type: number
 *                             example: 500
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
router.get('/', getAllGifts);

/**
 * @swagger
 * /api/v1/super-admin/gift/{id}:
 *   get:
 *     summary: Get single gift by ID (with company info)
 *     tags: [Super Admin Gifts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Gift ID (MongoDB ObjectId)
 *         example: "64a1b2c3d4e5f6g7h8i9j0k1"
 *     responses:
 *       200:
 *         description: Gift found
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
 *                     gift:
 *                       type: object
 *                       properties:
 *                         _id:
 *                           type: string
 *                         name:
 *                           type: string
 *                           example: "Free Dinner"
 *                         description:
 *                           type: string
 *                           example: "Complimentary dinner for two"
 *                         image:
 *                           type: string
 *                           example: "uploads/gifts/dinner.jpg"
 *                         points:
 *                           type: number
 *                           example: 500
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
 *         description: Gift not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Not super admin
 */
router.get('/:id', getGift);

/**
 * @swagger
 * /api/v1/super-admin/gift:
 *   post:
 *     summary: Create new gift for any company
 *     tags: [Super Admin Gifts]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - image
 *               - company
 *             properties:
 *               name:
 *                 type: string
 *                 description: Gift name
 *                 example: "Free Dinner"
 *               description:
 *                 type: string
 *                 description: Gift description
 *                 example: "Complimentary dinner for two at partner restaurant"
 *               points:
 *                 type: number
 *                 description: Points required to redeem
 *                 example: 500
 *               company:
 *                 type: string
 *                 description: Company ID (MongoDB ObjectId)
 *                 example: "64a1b2c3d4e5f6g7h8i9j0k1"
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: Gift image file (required)
 *     responses:
 *       201:
 *         description: Gift created
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
 *                     gift:
 *                       type: object
 *                       properties:
 *                         _id:
 *                           type: string
 *                         name:
 *                           type: string
 *                         description:
 *                           type: string
 *                         image:
 *                           type: string
 *                           example: "uploads/gifts/dinner.jpg"
 *                         points:
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
 *         description: Bad request - Missing image or required fields
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Not super admin
 */
router.post('/', uploadImage, createGift);

/**
 * @swagger
 * /api/v1/super-admin/gift/{id}:
 *   patch:
 *     summary: Update gift (any company)
 *     tags: [Super Admin Gifts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Gift ID
 *         example: "64a1b2c3d4e5f6g7h8i9j0k1"
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: New gift name
 *                 example: "Updated Free Dinner"
 *               description:
 *                 type: string
 *                 description: New description
 *                 example: "Updated dinner offer"
 *               points:
 *                 type: number
 *                 description: New points required
 *                 example: 600
 *               company:
 *                 type: string
 *                 description: New company ID
 *                 example: "64a1b2c3d4e5f6g7h8i9j0k1"
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: New gift image
 *     responses:
 *       200:
 *         description: Gift updated
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
 *                     gift:
 *                       type: object
 *                       properties:
 *                         _id:
 *                           type: string
 *                         name:
 *                           type: string
 *                         description:
 *                           type: string
 *                         image:
 *                           type: string
 *                         points:
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
 *         description: Gift not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Not super admin
 */
router.patch('/:id', uploadImage, updateGift);

/**
 * @swagger
 * /api/v1/super-admin/gift/{id}:
 *   delete:
 *     summary: Delete gift
 *     tags: [Super Admin Gifts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Gift ID
 *         example: "64a1b2c3d4e5f6g7h8i9j0k1"
 *     responses:
 *       204:
 *         description: Gift deleted
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
 *         description: Gift not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Not super admin
 */
router.delete('/:id', deleteGift);

export default router;
