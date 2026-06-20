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

router.get('/', getAllCompanies);

router.get('/:id', getCompany);

router.post('/', uploadLogo, createCompany);

router.patch('/:id', uploadLogo, updateCompany);

router.delete('/:id', deleteCompany);

export default router;
