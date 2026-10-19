import express from 'express';
const router = express.Router();

import { protect, restrictTo } from '../middleware/auth.js';

import { getMyPoints, getOnePoint } from '../controller/pointUser.js';

router.use(protect);
router.use(restrictTo('user'));

/**
 * @swagger
 * tags:
 *   name: Points
 *   description: User Points APIs
 */

/**
 * @swagger
 * /api/v1/points/me:
 *   get:
 *     summary: Get all my points
 *     tags: [Points]
 *     security:
 *       - bearerAuth: []
 *     description: Retrieve all points transactions for the currently logged-in user
 *     responses:
 *       200:
 *         description: List of all points for the user
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
 *                   example: 5
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
 *         description: Forbidden - Not a regular user
 */
router.get('/me', getMyPoints);

/**
 * @swagger
 * /api/v1/points/me/{id}:
 *   get:
 *     summary: Get a single point record by ID
 *     tags: [Points]
 *     security:
 *       - bearerAuth: []
 *     description: Retrieve a specific points transaction for the currently logged-in user
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
 *         description: Forbidden - Not a regular user
 *       404:
 *         description: Point record not found
 */
router.get('/me/:id', getOnePoint);

export default router;
