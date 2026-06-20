import express from 'express';
const router = express.Router();

import { protect, restrictTo } from '../middleware/auth.js';
import { uploadImage } from '../middleware/uploadPhoto.js';

import {
  createGift,
  deleteGift,
  getAllGifts,
  getGift,
  updateGift,
} from '../controller/giftSuperAdmin.js';

router.use(protect);

router.use(restrictTo('superAdmin'));

router.get('/', getAllGifts);

router.get('/:id', getGift);

router.post('/', uploadImage, createGift);

router.patch('/:id', uploadImage, updateGift);

router.delete('/:id', deleteGift);

export default router;
