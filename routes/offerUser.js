import express from 'express';
const router = express.Router();

import { protect } from '../middleware/auth.js';

import { getAllOffersUser, getOfferUser } from '../controller/offerUser.js';

router.use(protect);

router.get('/', getAllOffersUser);

router.get('/:id', getOfferUser);

export default router;
