import express from 'express';
const router = express.Router();

import { protect, restrictTo } from '../middleware/auth.js';

import {
  getAllPoints,
  getPoint,
  deletePoint,
} from '../controller/pointSuperAdmin.js';

router.use(protect);

router.use(restrictTo('superAdmin'));

router.get('/', getAllPoints);

router.get('/:id', getPoint);



router.delete('/:id', deletePoint);

export default router;
