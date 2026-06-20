import express from 'express';
const router = express.Router();

import { protect, restrictTo } from '../middleware/auth.js';

import {
  createOffer,
  deleteOffer,
  getAllOffersAdmin,
  getOfferAdmin,
  updateOffer,
} from '../controller/offerSuperAdmin.js';

router.use(protect);
router.use(restrictTo('superAdmin'));

router.get('/', getAllOffersAdmin);
router.get('/:id', getOfferAdmin);

router.post('/', createOffer);
router.patch('/:id', updateOffer);
router.delete('/:id', deleteOffer);

export default router;
