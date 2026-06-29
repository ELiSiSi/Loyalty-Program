import express from 'express';
const router = express.Router();

import {
  deleteMe,
  getMe,
  updateMe,
  updatePassword,
} from '../controller/user.js';
import { protect } from '../middleware/auth.js';
import { uploadSingleFile } from '../middleware/uploadPhoto.js';

router.use(protect);

/**
 * @swagger
 * tags:
 *   name: User Profile
 *   description: Current user profile management (authenticated users only)
 */

/**
 * @swagger
 * /api/v1/user/me:
 *   get:
 *     summary: Get my profile
 *     description: Returns current logged-in user's profile
 *     tags: [User Profile]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile retrieved
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
 *                     user:
 *                       type: object
 *                       properties:
 *                         _id:
 *                           type: string
 *                           example: "64a1b2c3d4e5f6g7h8i9j0k1"
 *                         name:
 *                           type: string
 *                           example: "John Doe"
 *                         email:
 *                           type: string
 *                           example: "john@example.com"
 *                         photo:
 *                           type: string
 *                           example: "user-123.jpg"
 *                         role:
 *                           type: string
 *                           example: "user"
 *                         company:
 *                           type: string
 *                           example: "64a1b2c3d4e5f6g7h8i9j0k1"
 *                         availablePoints:
 *                           type: number
 *                           example: 1500
 *                         createdAt:
 *                           type: string
 *                           format: date-time
 *                         updatedAt:
 *                           type: string
 *                           format: date-time
 *       401:
 *         description: Unauthorized - Not logged in
 */
router.get('/me', getMe);

/**
 * @swagger
 * /api/v1/user/me:
 *   patch:
 *     summary: Update my profile
 *     description: Update current user's info. Cannot update password or role from here.
 *     tags: [User Profile]
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
 *                 description: New name
 *                 example: "Updated Name"
 *               email:
 *                 type: string
 *                 format: email
 *                 description: New email
 *                 example: "updated@example.com"
 *               photo:
 *                 type: string
 *                 format: binary
 *                 description: Profile photo image
 *     responses:
 *       200:
 *         description: Profile updated
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
 *                     user:
 *                       type: object
 *                       properties:
 *                         _id:
 *                           type: string
 *                         name:
 *                           type: string
 *                           example: "Updated Name"
 *                         email:
 *                           type: string
 *                           example: "updated@example.com"
 *                         photo:
 *                           type: string
 *                           example: "user-456.jpg"
 *                         role:
 *                           type: string
 *                           example: "user"
 *                         company:
 *                           type: string
 *                           example: "64a1b2c3d4e5f6g7h8i9j0k1"
 *                         updatedAt:
 *                           type: string
 *                           format: date-time
 *       401:
 *         description: Unauthorized - Not logged in
 */
router.patch('/me', uploadSingleFile, updateMe);

/**
 * @swagger
 * /api/v1/user/me:
 *   delete:
 *     summary: Delete my account
 *     description: Permanently delete current user's account
 *     tags: [User Profile]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Account deleted
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
 *         description: Unauthorized - Not logged in
 *       404:
 *         description: User not found
 */
router.delete('/me', deleteMe);

/**
 * @swagger
 * /api/v1/user/me/update-password:
 *   patch:
 *     summary: Update my password
 *     description: Change current user's password (requires current password)
 *     tags: [User Profile]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - currentPassword
 *               - newPassword
 *               - newPasswordConfirm
 *             properties:
 *               currentPassword:
 *                 type: string
 *                 format: password
 *                 description: Current password
 *                 example: "oldpassword123"
 *               newPassword:
 *                 type: string
 *                 format: password
 *                 description: New password (min 8 chars)
 *                 example: "newpassword456"
 *               newPasswordConfirm:
 *                 type: string
 *                 format: password
 *                 description: Confirm new password
 *                 example: "newpassword456"
 *     responses:
 *       200:
 *         description: Password updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: "Password updated successfully"
 *       400:
 *         description: Bad request - Passwords don't match or validation error
 *       401:
 *         description: Unauthorized - Current password incorrect or not logged in
 */
router.patch('/me/update-password', updatePassword);

export default router;
