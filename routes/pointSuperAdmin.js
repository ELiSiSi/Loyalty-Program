import express from 'express';
const router = express.Router();

import { protect, restrictTo } from '../middleware/Auth.js';

import {
  createPoint,
  getAllPoints,
  getPoint,
  updatePoint,
  deletePoint,
} from '../controller/PointSuperAdmin.js';

router.use(protect);

router.use(restrictTo('superAdmin'));

router.get('/', getAllPoints);

router.get('/:id', getPoint);

router.post('/', createPoint);

router.patch('/:id', updatePoint);

router.delete('/:id', deletePoint);

export default router;
