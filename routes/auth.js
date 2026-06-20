import express from 'express';
const router = express.Router();

import {
  forgotPassword,
  login,
  logout,
  refreshAccessToken,
  resetPassword,
  signup,
} from '../controller/auth.js';
import { protect } from '../middleware/auth.js';

router.post('/signup/', signup);
router.post('/login', login);
router.post('/refresh', refreshAccessToken);
router.post('/logout', protect, logout);
router.post('/forgotPassword', forgotPassword);
router.patch('/resetPassword/:token', resetPassword);

export default router;
