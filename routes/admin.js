import express from 'express';
const router = express.Router();

import { protect, restrictTo } from '../middleware/auth.js';

import { completeAdminSetup } from '../controller/admin.js';



router.patch('/setup-account/:token', completeAdminSetup);
export default router;
