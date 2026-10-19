import express from 'express';
const router = express.Router();

import { protect, restrictTo } from '../middleware/auth.js';
import { uploadImage } from '../middleware/uploadPhoto.js';

import {
  deleteProduct,
  getAllProducts,
  getProduct,
} from '../controller/productSuperAdmin.js';

router.use(protect);
router.use(restrictTo('superAdmin'));

/**
 * @swagger
 * tags:
 *   name: Super Admin Products
 *   description: Product management for super admin (all companies)
 */

/**
 * @swagger
 * /api/v1/super-admin/product:
 *   get:
 *     summary: Get ALL products across all companies
 *     tags: [Super Admin Products]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all products
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
 *                   example: 50
 *                 data:
 *                   type: object
 *                   properties:
 *                     products:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                             example: "64a1b2c3d4e5f6g7h8i9j0k1"
 *                           name:
 *                             type: string
 *                             example: "Luxury Hotel Room"
 *                           description:
 *                             type: string
 *                             example: "5-star hotel room with sea view"
 *                           price:
 *                             type: number
 *                             example: 200
 *                           image:
 *                             type: string
 *                             example: "uploads/products/hotel.jpg"
 *                           category:
 *                             type: string
 *                             example: "64a1b2c3d4e5f6g7h8i9j0k1"
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
 *         description: Forbidden - Not super admin
 */
router.get('/', getAllProducts);

/**
 * @swagger
 * /api/v1/super-admin/product/{id}:
 *   get:
 *     summary: Get single product by ID with calculated points
 *     tags: [Super Admin Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID (MongoDB ObjectId)
 *         example: "64a1b2c3d4e5f6g7h8i9j0k1"
 *     responses:
 *       200:
 *         description: Product found with calculated points
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
 *                     product:
 *                       type: object
 *                       properties:
 *                         _id:
 *                           type: string
 *                         name:
 *                           type: string
 *                           example: "Luxury Hotel Room"
 *                         description:
 *                           type: string
 *                           example: "5-star hotel room with sea view"
 *                         price:
 *                           type: number
 *                           example: 200
 *                         image:
 *                           type: string
 *                           example: "uploads/products/hotel.jpg"
 *                         category:
 *                           type: string
 *                           example: "64a1b2c3d4e5f6g7h8i9j0k1"
 *                         company:
 *                           type: string
 *                           example: "64a1b2c3d4e5f6g7h8i9j0k1"
 *                         createdAt:
 *                           type: string
 *                           format: date-time
 *                         updatedAt:
 *                           type: string
 *                           format: date-time
 *                     points:
 *                       type: number
 *                       description: Calculated points based on product price
 *                       example: 400
 *       404:
 *         description: Product not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Not super admin
 */
router.get('/:id', getProduct);

/**
 * @swagger
 * /api/v1/super-admin/product/{id}:
 *   delete:
 *     summary: Delete product
 *     tags: [Super Admin Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *         example: "64a1b2c3d4e5f6g7h8i9j0k1"
 *     responses:
 *       204:
 *         description: Product deleted
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
 *         description: Product not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Not super admin
 */
router.delete('/:id', deleteProduct);

export default router;
