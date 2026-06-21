import express from 'express';
import {
  getAllUsers,
  updateUserRole,
  toggleUserStatus,
  getProfile,
  updateProfile,
  changePassword,
} from '../controllers/userController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// Profile routes — any authenticated user
router.get('/profile', authenticate, getProfile);
router.put('/profile', authenticate, updateProfile);
router.put('/profile/password', authenticate, changePassword);

// Admin-only user management
router.get('/', authenticate, authorize('admin'), getAllUsers);
router.patch('/:id/role', authenticate, authorize('admin'), updateUserRole);
router.patch('/:id/status', authenticate, authorize('admin'), toggleUserStatus);

export default router;
