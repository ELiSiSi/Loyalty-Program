import express from 'express';
const router = express.Router();

import { protect, restrictTo } from '../middleware/auth.js';
import { uploadLogo } from '../middleware/uploadPhoto.js';

import { getMyCompany, updateMyCompany } from '../controller/companyAdmin.js';

router.use(protect);
router.use(restrictTo('admin'));

/**
 * @swagger
 * tags:
 *   name: Company Admin
 *   description: Company management for admin (my company only)
 */

/**
 * @swagger
 * /api/v1/admin/company/me:
 *   get:
 *     summary: Get my company details
 *     tags: [Company Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Company details retrieved
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
 *                           example: "64a1b2c3d4e5f6g7h8i9j0k1"
 *                         name:
 *                           type: string
 *                           example: "Travel Co"
 *                         email:
 *                           type: string
 *                           example: "info@travelco.com"
 *                         phone:
 *                           type: string
 *                           example: "+1234567890"
 *                         address:
 *                           type: string
 *                           example: "123 Main St, City"
 *                         logo:
 *                           type: string
 *                           example: "uploads/companies/logo.jpg"
 *                         description:
 *                           type: string
 *                           example: "Best travel company"
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
 *         description: Forbidden - Not admin
 */
router.get('/me', getMyCompany);

/**
 * @swagger
 * /api/v1/admin/company/me:
 *   patch:
 *     summary: Update my company details
 *     tags: [Company Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Company name
 *                 example: "Updated Travel Co"
 *               email:
 *                 type: string
 *                 description: Company email
 *                 example: "new@travelco.com"
 *               phone:
 *                 type: string
 *                 description: Company phone
 *                 example: "+9876543210"
 *               address:
 *                 type: string
 *                 description: Company address
 *                 example: "456 New St, City"
 *               description:
 *                 type: string
 *                 description: Company description
 *                 example: "Updated description"
 *               logo:
 *                 type: string
 *                 format: binary
 *                 description: Company logo image
 *     responses:
 *       200:
 *         description: Company updated
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
 *                         updatedAt:
 *                           type: string
 *                           format: date-time
 *       404:
 *         description: Company not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Not admin
 */
router.patch('/me', uploadLogo, updateMyCompany);

export default router;
