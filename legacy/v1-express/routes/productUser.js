import express from 'express';
const router = express.Router();

import { getAllProducts, getProduct } from '../controller/productUser.js';

/**
 * @swagger
 * tags:
 *   name: User Products
 *   description: Public product browsing for users (active products only with gift info)
 */

/**
 * @swagger
 * /api/v1/user/product:
 *   get:
 *     summary: Get all active products (public)
 *     description: Returns only active products with active gift info if available. No authentication required.
 *     tags: [User Products]
 *     responses:
 *       200:
 *         description: List of active products with gift details
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
 *                           price:
 *                             type: number
 *                             example: 200
 *                           description:
 *                             type: string
 *                             example: "5-star hotel room with sea view"
 *                           image:
 *                             type: string
 *                             example: "uploads/products/hotel.jpg"
 *                           fromLocation:
 *                             type: string
 *                             example: "Cairo"
 *                           toLocation:
 *                             type: string
 *                             example: "Dubai"
 *                           category:
 *                             type: string
 *                             example: "64a1b2c3d4e5f6g7h8i9j0k1"
 *                           company:
 *                             type: string
 *                             example: "64a1b2c3d4e5f6g7h8i9j0k1"
 *                           addPoints:
 *                             type: number
 *                             example: 100
 *                           isActive:
 *                             type: boolean
 *                             example: true
 *                           gift:
 *                             type: object
 *                             nullable: true
 *                             description: Active gift info (only if gift is currently active)
 *                             properties:
 *                               _id:
 *                                 type: string
 *                                 example: "64a1b2c3d4e5f6g7h8i9j0k2"
 *                               name:
 *                                 type: string
 *                                 example: "Free Dinner"
 *                               image:
 *                                 type: string
 *                                 example: "uploads/gifts/dinner.jpg"
 *                               description:
 *                                 type: string
 *                                 example: "Complimentary dinner for two"
 *                               startsAt:
 *                                 type: string
 *                                 format: date-time
 *                                 example: "2024-06-01T00:00:00.000Z"
 *                               expiresAt:
 *                                 type: string
 *                                 format: date-time
 *                                 example: "2024-08-31T23:59:59.000Z"
 *       500:
 *         description: Server error
 */
router.get('/', getAllProducts);

/**
 * @swagger
 * /api/v1/user/product/{id}:
 *   get:
 *     summary: Get single active product by ID (public)
 *     description: Returns product only if active, with active gift info if available. No authentication required.
 *     tags: [User Products]
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
 *         description: Active product found with gift details
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
 *                           example: "64a1b2c3d4e5f6g7h8i9j0k1"
 *                         name:
 *                           type: string
 *                           example: "Luxury Hotel Room"
 *                         price:
 *                           type: number
 *                           example: 200
 *                         description:
 *                           type: string
 *                           example: "5-star hotel room with sea view"
 *                         image:
 *                           type: string
 *                           example: "uploads/products/hotel.jpg"
 *                         fromLocation:
 *                           type: string
 *                           example: "Cairo"
 *                         toLocation:
 *                           type: string
 *                           example: "Dubai"
 *                         category:
 *                           type: string
 *                           example: "64a1b2c3d4e5f6g7h8i9j0k1"
 *                         company:
 *                           type: string
 *                           example: "64a1b2c3d4e5f6g7h8i9j0k1"
 *                         addPoints:
 *                           type: number
 *                           example: 100
 *                         isActive:
 *                           type: boolean
 *                           example: true
 *                         gift:
 *                           type: object
 *                           nullable: true
 *                           description: Active gift info (only if gift is currently active)
 *                           properties:
 *                             _id:
 *                               type: string
 *                               example: "64a1b2c3d4e5f6g7h8i9j0k2"
 *                             name:
 *                               type: string
 *                               example: "Free Dinner"
 *                             image:
 *                               type: string
 *                               example: "uploads/gifts/dinner.jpg"
 *                             description:
 *                               type: string
 *                               example: "Complimentary dinner for two"
 *                             startsAt:
 *                               type: string
 *                               format: date-time
 *                               example: "2024-06-01T00:00:00.000Z"
 *                             expiresAt:
 *                               type: string
 *                               format: date-time
 *                               example: "2024-08-31T23:59:59.000Z"
 *       404:
 *         description: Product not found or currently unavailable
 *       500:
 *         description: Server error
 */
router.get('/:id', getProduct);

export default router;
