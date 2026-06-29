import express from 'express';
const router = express.Router();

import { protect, restrictTo } from '../middleware/auth.js';
import { uploadLogo } from '../middleware/uploadPhoto.js';

import {
  createCompany,
  deleteCompany,
  getAllCompanies,
  getCompany,
  updateCompany,
} from '../controller/companySuperAdmin.js';

router.use(protect);
router.use(restrictTo('superAdmin'));

/**
 * @swagger
 * tags:
 *   name: Super Admin Companies
 *   description: Company management for super admin (all companies)
 */

/**
 * @swagger
 * /api/v1/super-admin/company:
 *   get:
 *     summary: Get ALL companies
 *     tags: [Super Admin Companies]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all companies
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
 *                   example: 10
 *                 data:
 *                   type: object
 *                   properties:
 *                     companies:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                             example: "64a1b2c3d4e5f6g7h8i9j0k1"
 *                           name:
 *                             type: string
 *                             example: "Travel Co"
 *                           email:
 *                             type: string
 *                             example: "info@travelco.com"
 *                           phone:
 *                             type: string
 *                             example: "+1234567890"
 *                           address:
 *                             type: string
 *                             example: "123 Main St, City"
 *                           logo:
 *                             type: string
 *                             example: "uploads/companies/logo.jpg"
 *                           description:
 *                             type: string
 *                             example: "Best travel company"
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
router.get('/', getAllCompanies);

/**
 * @swagger
 * /api/v1/super-admin/company/{id}:
 *   get:
 *     summary: Get single company by ID
 *     tags: [Super Admin Companies]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Company ID (MongoDB ObjectId)
 *         example: "64a1b2c3d4e5f6g7h8i9j0k1"
 *     responses:
 *       200:
 *         description: Company found
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
 *                     company:
 *                       type: object
 *                       properties:
 *                         _id:
 *                           type: string
 *                         name:
 *                           type: string
 *                         email:
 *                           type: string
 *                         phone:
 *                           type: string
 *                         address:
 *                           type: string
 *                         logo:
 *                           type: string
 *                         description:
 *                           type: string
 *                         createdAt:
 *                           type: string
 *                           format: date-time
 *                         updatedAt:
 *                           type: string
 *                           format: date-time
 *       404:
 *         description: Company not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Not super admin
 */
router.get('/:id', getCompany);

/**
 * @swagger
 * /api/v1/super-admin/company:
 *   post:
 *     summary: Create new company
 *     tags: [Super Admin Companies]
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
 *               - email
 *             properties:
 *               name:
 *                 type: string
 *                 description: Company name
 *                 example: "New Travel Co"
 *               email:
 *                 type: string
 *                 description: Company email
 *                 example: "new@travelco.com"
 *               phone:
 *                 type: string
 *                 description: Company phone
 *                 example: "+1234567890"
 *               address:
 *                 type: string
 *                 description: Company address
 *                 example: "123 Main St, City"
 *               description:
 *                 type: string
 *                 description: Company description
 *                 example: "New travel company"
 *               logo:
 *                 type: string
 *                 format: binary
 *                 description: Company logo image
 *     responses:
 *       201:
 *         description: Company created
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
 *                     company:
 *                       type: object
 *                       properties:
 *                         _id:
 *                           type: string
 *                         name:
 *                           type: string
 *                         email:
 *                           type: string
 *                         phone:
 *                           type: string
 *                         address:
 *                           type: string
 *                         logo:
 *                           type: string
 *                         description:
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
router.post('/', uploadLogo, createCompany);

/**
 * @swagger
 * /api/v1/super-admin/company/{id}:
 *   patch:
 *     summary: Update company
 *     tags: [Super Admin Companies]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Company ID
 *         example: "64a1b2c3d4e5f6g7h8i9j0k1"
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Updated Travel Co"
 *               email:
 *                 type: string
 *                 example: "updated@travelco.com"
 *               phone:
 *                 type: string
 *                 example: "+9876543210"
 *               address:
 *                 type: string
 *                 example: "456 New St, City"
 *               description:
 *                 type: string
 *                 example: "Updated description"
 *               logo:
 *                 type: string
 *                 format: binary
 *                 description: New company logo
 *     responses:
 *       200:
 *         description: Company updated
 *       404:
 *         description: Company not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Not super admin
 */
router.patch('/:id', uploadLogo, updateCompany);

/**
 * @swagger
 * /api/v1/super-admin/company/{id}:
 *   delete:
 *     summary: Delete company
 *     tags: [Super Admin Companies]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Company ID
 *         example: "64a1b2c3d4e5f6g7h8i9j0k1"
 *     responses:
 *       200:
 *         description: Company deleted
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
 *         description: Company not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Not super admin
 */
router.delete('/:id', deleteCompany);

export default router;
