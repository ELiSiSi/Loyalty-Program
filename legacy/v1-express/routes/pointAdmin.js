import express from 'express';
const router = express.Router();

import { protect, restrictTo } from '../middleware/auth.js';
import { getOnePoint, getMyPoints } from '../controller/pointAdmin.js';

router.use(protect);
router.use(restrictTo('admin'));

/**
 * @swagger
 * tags:
 *   name: Points Admin
 *   description: Points Management APIs for Admin
 */

/**
 * @swagger
 * /api/v1/admin/points:
 *   get:
 *     summary: Get all points for admin's company
 *     tags: [Points Admin]
 *     security:
 *       - bearerAuth: []
 *     description: Retrieve all points transactions for the admin's company
 *     responses:
 *       200:
 *         description: List of all points for the company
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
 *                   example: 10
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
 *         description: Forbidden - Not admin
 */
router.get('/', getMyPoints);

/**
 * @swagger
 * /api/v1/admin/points/{id}:
 *   get:
 *     summary: Get a single point record by ID
 *     tags: [Points Admin]
 *     security:
 *       - bearerAuth: []
 *     description: Retrieve a specific points transaction for the admin's company
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
 *         description: Forbidden - Not admin
 *       404:
 *         description: Point record not found
 */
router.get('/:id', getOnePoint);

export default router;
