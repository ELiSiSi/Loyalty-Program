import express from 'express';
const router = express.Router();

import { protect, restrictTo } from '../middleware/auth.js';
import { uploadImage } from '../middleware/uploadPhoto.js';

import {
  deleteProduct,
  getAllProducts,
  getProduct,
} from '../controller/productSuperAdmin.js';

router.use(protect);
router.use(restrictTo('superAdmin'));

router.get('/', getAllProducts);

router.get('/:id', getProduct);



router.delete('/:id', deleteProduct);

export default router;
