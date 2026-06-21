import express from 'express';
import {
  getFastSellingItems,
  getLowStockAlerts,
  getSalesVelocityMetrics,
  getAIInsightsSummary,
  recordSaleTransaction
} from '../controllers/aiController.js';

const router = express.Router();

// Get fast-selling items
router.get('/fast-selling', getFastSellingItems);

// Get low stock alerts
router.get('/low-stock', getLowStockAlerts);

// Get sales velocity metrics
router.get('/sales-velocity', getSalesVelocityMetrics);

// Get AI insights summary
router.get('/summary', getAIInsightsSummary);

// Record a sale transaction
router.post('/sales', recordSaleTransaction);

export default router;
