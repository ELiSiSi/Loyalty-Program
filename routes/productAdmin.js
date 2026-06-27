import express from 'express';
const router = express.Router();

import { protect, restrictTo } from '../middleware/auth.js';
import { uploadImage } from '../middleware/uploadPhoto.js';

import {
  createProduct,
  deleteProduct,
  getAllProducts,
  getProduct,
  updateProduct,
} from '../controller/productAdmin.js';

router.use(protect);
router.use(restrictTo('admin'));
/**
 * @swagger
 * tags:
 *   name: Products
 *   description: Product Management APIs
 */

/**
 * @swagger
 * /api/v1/products:
 *   get:
 *     summary: Get all products
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all products for the admin's company
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
 *                     products:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Product'
 *       401:
 *         description: Unauthorized - Not logged in
 *       403:
 *         description: Forbidden - Not admin
 */
router.get('/', getAllProducts);

/**
 * @swagger
 * /api/v1/products/{id}:
 *   get:
 *     summary: Get a single product by ID
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID (MongoDB ObjectId)
 *     responses:
 *       200:
 *         description: Product found and returned
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
 *                       $ref: '#/components/schemas/Product'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Not admin
 *       404:
 *         description: Product not found
 */
router.get('/:id', getProduct);

/**
 * @swagger
 * /api/v1/products:
 *   post:
 *     summary: Create a new product
 *     tags: [Products]
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
 *               - price
 *               - category
 *               - image
 *             properties:
 *               name:
 *                 type: string
 *                 description: Product name
 *                 example: "iPhone 15 Pro"
 *               price:
 *                 type: number
 *                 description: Product price
 *                 example: 999.99
 *               category:
 *                 type: string
 *                 description: Category ID
 *                 example: "60d21b4667d0d8992e610c85"
 *               description:
 *                 type: string
 *                 description: Product description
 *                 example: "Latest Apple iPhone with titanium design"
 *               addPoints:
 *                 type: number
 *                 description: Points added when purchasing
 *                 example: 100
 *               isActive:
 *                 type: boolean
 *                 description: Product availability status
 *                 example: true
 *               fromLocation:
 *                 type: string
 *                 description: Source location
 *                 example: "Warehouse A"
 *               toLocation:
 *                 type: string
 *                 description: Destination location
 *                 example: "Store B"
 *               gifts:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Gift product IDs
 *                 example: ["60d21b4667d0d8992e610c86"]
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: Product image file
 *     responses:
 *       201:
 *         description: Product created successfully
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
 *                       $ref: '#/components/schemas/Product'
 *       400:
 *         description: Bad request - Missing image or invalid data
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Not admin
 *       404:
 *         description: Company or Category not found
 */
router.post('/', uploadImage, createProduct);

/**
 * @swagger
 * /api/v1/products/{id}:
 *   patch:
 *     summary: Update a product
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "iPhone 15 Pro Max"
 *               price:
 *                 type: number
 *                 example: 1199.99
 *               category:
 *                 type: string
 *                 description: Category ID
 *                 example: "60d21b4667d0d8992e610c85"
 *               description:
 *                 type: string
 *                 example: "Updated description"
 *               addPoints:
 *                 type: number
 *                 example: 150
 *               isActive:
 *                 type: boolean
 *                 example: true
 *               fromLocation:
 *                 type: string
 *                 example: "Warehouse B"
 *               toLocation:
 *                 type: string
 *                 example: "Store C"
 *               gifts:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["60d21b4667d0d8992e610c86"]
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: New product image (optional)
 *     responses:
 *       200:
 *         description: Product updated successfully
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
 *                       $ref: '#/components/schemas/Product'
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Not admin
 *       404:
 *         description: Product or Category not found
 */
router.patch('/:id', uploadImage, updateProduct);

/**
 * @swagger
 * /api/v1/products/{id}:
 *   delete:
 *     summary: Delete a product
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID to delete
 *     responses:
 *       204:
 *         description: Product deleted successfully (no content)
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Not admin
 *       404:
 *         description: Product not found
 */
router.delete('/:id', deleteProduct);

export default router;
