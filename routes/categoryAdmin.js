import express from 'express';
const router = express.Router();

import {
  createCategory,
  deleteCategory,
  getAllCategories,
  getCategory,
  updateCategory,
} from '../controller/categoryAdmin.js';
import { protect, restrictTo } from '../middleware/auth.js';
import { uploadImage } from '../middleware/uploadPhoto.js';

router.use(protect);
router.get('/', getAllCategories);
router.get('/:id', getCategory);

router.use(restrictTo('admin', 'superAdmin'));
router.post('/', uploadImage, createCategory);
router.patch('/:id', uploadImage, updateCategory);
router.delete('/:id', deleteCategory);

export default router;
