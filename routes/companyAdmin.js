import express from 'express';
const router = express.Router();

import { protect, restrictTo } from '../middleware/auth.js';
import { uploadLogo } from '../middleware/uploadPhoto.js';

import { getMyCompany, updateMyCompany } from '../controller/companyAdmin.js';

router.use(protect);

router.use(restrictTo('admin'));

router.get('/me', getMyCompany);

router.patch('/me', uploadLogo, updateMyCompany);

export default router;
