import express from 'express';
const router = express.Router();

import { protect, restrictTo } from '../middleware/auth.js';
import { getOnePoint , getMyPoints} from '../controller/pointAdmin.js';

router.use(protect);
router.use(restrictTo('admin'));


router.get('/', getMyPoints);
router.get('/:id', getOnePoint);


export default router;
