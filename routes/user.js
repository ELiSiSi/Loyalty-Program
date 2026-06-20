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
router.get('/me', getMe);

router.patch('/me/', uploadSingleFile, updateMe);
router.delete('/me/', deleteMe);
router.patch('/me/update-password', updatePassword);

export default router;
