import express from 'express';
const router = express.Router();

import { protect, restrictTo } from '../middleware/auth.js';

import {
  getAllPoints,
  getPoint,
  deletePoint,
} from '../controller/pointSuperAdmin.js';

router.use(protect);
router.use(restrictTo('superAdmin'));

/**
 * @swagger
 * tags:
 *   name: Points SuperAdmin
 *   description: Points Management APIs for Super Admin
 */

/**
 * @swagger
 * /api/v1/super-admin/points:
 *   get:
 *     summary: Get all points records
 *     tags: [Points SuperAdmin]
 *     security:
 *       - bearerAuth: []
 *     description: Retrieve all points transactions across all companies (Super Admin only)
 *     responses:
 *       200:
 *         description: List of all points records
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
 *                   description: Number of points records
 *                   example: 50
 *                 data:
 *                   type: object
 *                   properties:
 *                     points:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Point'
 *       401:
 *         description: Unauthorized - Not logged in
 *       403:
 *         description: Forbidden - Not super admin
 */
router.get('/', getAllPoints);

/**
 * @swagger
 * /api/v1/super-admin/points/{id}:
 *   get:
 *     summary: Get a single point record by ID
 *     tags: [Points SuperAdmin]
 *     security:
 *       - bearerAuth: []
 *     description: Retrieve a specific points transaction by ID (Super Admin only)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Point record ID (MongoDB ObjectId)
 *         example: 60d21b4667d0d8992e610c85
 *     responses:
 *       200:
 *         description: Point record found and returned
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
 *                     point:
 *                       $ref: '#/components/schemas/Point'
 *       401:
 *         description: Unauthorized - Not logged in
 *       403:
 *         description: Forbidden - Not super admin
 *       404:
 *         description: Point record not found
 */
router.get('/:id', getPoint);

/**
 * @swagger
 * /api/v1/super-admin/points/{id}:
 *   delete:
 *     summary: Delete a point record
 *     tags: [Points SuperAdmin]
 *     security:
 *       - bearerAuth: []
 *     description: Delete a points transaction by ID (Super Admin only)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Point record ID to delete
 *         example: 60d21b4667d0d8992e610c85
 *     responses:
 *       204:
 *         description: Point record deleted successfully (no content)
 *       401:
 *         description: Unauthorized - Not logged in
 *       403:
 *         description: Forbidden - Not super admin
 *       404:
 *         description: Point record not found
 */
router.delete('/:id', deletePoint);

export default router;
