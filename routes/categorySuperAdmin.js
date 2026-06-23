import express from 'express';
const router = express.Router();

import { protect, restrictTo } from '../middleware/auth.js';
import { uploadImage } from '../middleware/uploadPhoto.js';

import {
  createCategory,
  deleteCategory,
  getAllCategories,
  getCategory,
  updateCategory,
  deleteAllCategories,
} from '../controller/categorySuperAdmin.js';

router.use(protect);

router.use(restrictTo('superAdmin'));

router.get('/', getAllCategories);
router.get('/:id', getCategory);

router.post('/', uploadImage, createCategory);
router.patch('/:id', uploadImage, updateCategory);
router.delete('/deleteall', deleteAllCategories);
router.delete('/:id', deleteCategory);


export default router;
