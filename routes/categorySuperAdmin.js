import express from 'express';
const router = express.Router();

import { protect, restrictTo } from '../middleware/auth.js';
import { uploadImage } from '../middleware/uploadPhoto.js';

import {
  createCategory,
  deleteCategory,
  getAllCategories,
  getCategory,
  updateCategory,
  deleteAllCategories,
} from '../controller/categorySuperAdmin.js';

router.use(protect);
router.use(restrictTo('superAdmin'));

/**
 * @swagger
 * tags:
 *   name: Super Admin Categories
 *   description: Category management for super admin (all companies)
 */

/**
 * @swagger
 * /api/v1/super-admin/category:
 *   get:
 *     summary: Get ALL categories across all companies
 *     tags: [Super Admin Categories]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all categories with company info
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
 *                     categories:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                             example: "64a1b2c3d4e5f6g7h8i9j0k1"
 *                           name:
 *                             type: string
 *                             example: "Hotels"
 *                           description:
 *                             type: string
 *                             example: "All hotel bookings"
 *                           image:
 *                             type: string
 *                             example: "uploads/categories/hotel.jpg"
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
 *         description: Forbidden - Not super admin
 */
router.get('/', getAllCategories);

/**
 * @swagger
 * /api/v1/super-admin/category/{id}:
 *   get:
 *     summary: Get single category by ID (with company info)
 *     tags: [Super Admin Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Category ID (MongoDB ObjectId)
 *         example: "64a1b2c3d4e5f6g7h8i9j0k1"
 *     responses:
 *       200:
 *         description: Category found
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
 *                     category:
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
 *         description: Category not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Not super admin
 */
router.get('/:id', getCategory);

/**
 * @swagger
 * /api/v1/super-admin/category:
 *   post:
 *     summary: Create new category (for any company)
 *     tags: [Super Admin Categories]
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
 *               - company
 *             properties:
 *               name:
 *                 type: string
 *                 description: Category name
 *                 example: "Luxury Hotels"
 *               description:
 *                 type: string
 *                 description: Category description
 *                 example: "5-star hotels and resorts"
 *               company:
 *                 type: string
 *                 description: Company ID (MongoDB ObjectId)
 *                 example: "64a1b2c3d4e5f6g7h8i9j0k1"
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: Category image file
 *     responses:
 *       201:
 *         description: Category created
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
 *                     category:
 *                       type: object
 *                       properties:
 *                         _id:
 *                           type: string
 *                         name:
 *                           type: string
 *                         company:
 *                           type: string
 *                         image:
 *                           type: string
 *                         createdAt:
 *                           type: string
 *                           format: date-time
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Not super admin
 */
router.post('/', uploadImage, createCategory);

/**
 * @swagger
 * /api/v1/super-admin/category/{id}:
 *   patch:
 *     summary: Update category
 *     tags: [Super Admin Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Category ID
 *         example: "64a1b2c3d4e5f6g7h8i9j0k1"
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Updated Hotels"
 *               description:
 *                 type: string
 *                 example: "Updated description"
 *               company:
 *                 type: string
 *                 description: New company ID
 *                 example: "64a1b2c3d4e5f6g7h8i9j0k1"
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: New category image
 *     responses:
 *       200:
 *         description: Category updated
 *       404:
 *         description: Category not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Not super admin
 */
router.patch('/:id', uploadImage, updateCategory);

/**
 * @swagger
 * /api/v1/super-admin/category/deleteall:
 *   delete:
 *     summary: DELETE ALL categories (DANGER - Super Admin only)
 *     tags: [Super Admin Categories]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       204:
 *         description: All categories deleted
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
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Not super admin
 */
router.delete('/deleteall', deleteAllCategories);

/**
 * @swagger
 * /api/v1/super-admin/category/{id}:
 *   delete:
 *     summary: Delete single category
 *     tags: [Super Admin Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Category ID
 *         example: "64a1b2c3d4e5f6g7h8i9j0k1"
 *     responses:
 *       204:
 *         description: Category deleted
 *       404:
 *         description: Category not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Not super admin
 */
router.delete('/:id', deleteCategory);

export default router;
