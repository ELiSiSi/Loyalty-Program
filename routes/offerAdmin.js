import express from 'express';
const router = express.Router();

import { protect, restrictTo } from '../middleware/auth.js';
import { uploadImage } from '../middleware/uploadPhoto.js';

import {
  createOffer,
  deleteOffer,
  getAllOffersAdmin,
  getOfferAdmin,
  updateOffer,
} from '../controller/offerAdmin.js';

router.use(protect);

router.use(restrictTo('admin'));

router.get('/', getAllOffersAdmin);

router.get('/:id', getOfferAdmin);

router.post('/', uploadImage, createOffer);

router.patch('/:id', uploadImage, updateOffer);

router.delete('/:id', deleteOffer);

export default router;
