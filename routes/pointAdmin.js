import express from 'express';
const router = express.Router();

import { protect, restrictTo } from '../middleware/auth.js';

import {
  createPoint,
  deletePoint,
  getMyPoints,
  updatePoint,
} from '../controller/pointAdmin.js';

router.use(protect);

router.use(restrictTo('admin'));

router.get('/', getMyPoints);

router.post('/', createPoint);

router.patch('/:id', updatePoint);

router.delete('/:id', deletePoint);

export default router;
