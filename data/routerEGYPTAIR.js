import express from "express";

const router = express.Router();

import { getFlights } from './getEGYPTAIR.js';

router.get("/", getFlights);

export default router;
