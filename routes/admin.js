import express from 'express';
const router = express.Router();

import { protect, restrictTo } from '../middleware/auth.js';

import {
  deleteUser,
  getAllUsers,
  getUser,
  updateUser,
} from '../controller/admin.js';

router.use(protect);

router.use(restrictTo('admin'));
router.get('/users/:id', getUser);
router.get('/users', getAllUsers);
router.patch('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);
export default router;
