import express from 'express';
import { getDashboardStats, getNotifications } from '../controllers/dashboardController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.get('/stats', authenticate, getDashboardStats);
router.get('/notifications', authenticate, getNotifications);

export default router;
