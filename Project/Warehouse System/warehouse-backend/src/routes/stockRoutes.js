import express from 'express';
import { getStockHistory, logStockMovement } from '../controllers/stockController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// All roles can view and log stock movements
router.get('/', authenticate, getStockHistory);
router.post('/', authenticate, logStockMovement);

export default router;
