import express from 'express';
const router = express.Router();

import { getAllProducts, getProduct } from '../controller/productUser.js';

router.get('/', getAllProducts);
router.get('/:id', getProduct);

export default router;
