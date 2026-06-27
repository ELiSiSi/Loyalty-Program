import express from 'express';
const router = express.Router();

import { protect, restrictTo } from '../middleware/auth.js';

import {
    getMyPoints,
    getOnePoint
} from '../controller/pointUser.js';

router.use(protect);
router.use(restrictTo('user'));

router.get('/me', getMyPoints);
router.get('/me/:id', getOnePoint);

export default router;
