import express from 'express';
const router = express.Router();

import { protect, restrictTo } from '../middleware/auth.js';
import { uploadImage } from '../middleware/uploadPhoto.js';

import {
  createProduct,
  deleteProduct,
  getAllProducts,
  getProduct,
  updateProduct,
} from '../controller/productAdmin.js';

router.use(protect);
router.use(restrictTo('admin'));

router.get('/', getAllProducts);
router.get('/:id', getProduct);

router.post('/', uploadImage, createProduct);
router.patch('/:id', uploadImage, updateProduct);
router.delete('/:id', deleteProduct);

export default router;
