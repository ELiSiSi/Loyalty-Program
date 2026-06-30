import express from 'express';
const router = express.Router();

import { protect, restrictTo } from '../middleware/auth.js';

import { completeAdminSetup, getAdminReport } from '../controller/admin.js';



/**
 * @swagger
 * /api/v1/admin/setup-account/{token}:
 *   patch:
 *     summary: Complete Admin account setup
 *     description: Validates the setup token sent via email, updates the admin's password, and activates the account.
 *     tags:
 *       - Admin
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *         description: The unhashed setup/reset token received by the admin.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - password
 *               - passwordConfirm
 *             properties:
 *               password:
 *                 type: string
 *                 format: password
 *                 description: The new password for the admin account (min length usually 8 characters).
 *                 example: "SecureP@ss123!"
 *               passwordConfirm:
 *                 type: string
 *                 format: password
 *                 description: Must match the password field exactly.
 *                 example: "SecureP@ss123!"
 *     responses:
 *       200:
 *         description: Account setup completed successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 message:
 *                   type: string
 *                   example: "Account setup completed"
 *       400:
 *         description: Bad Request - Token is invalid, expired, or passwords do not match.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "fail"
 *                 message:
 *                   type: string
 *                   example: "Token invalid or expired"
 */
router.get('/report', protect, restrictTo('admin', 'superAdmin'), getAdminReport);
router.patch('/setup-account/:token', completeAdminSetup);

export default router;
