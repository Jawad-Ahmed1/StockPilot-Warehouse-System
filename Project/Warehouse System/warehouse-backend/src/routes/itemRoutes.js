import express from 'express';
import {
  getAllItems,
  getItemById,
  createItem,
  updateItem,
  deleteItem,
  searchItems
} from '../controllers/itemController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// All authenticated users can view
router.get('/', authenticate, getAllItems);
router.get('/search', authenticate, searchItems);
router.get('/:id', authenticate, getItemById);

// Supervisor, Manager, Admin can add/edit
router.post('/', authenticate, authorize('admin', 'manager', 'supervisor'), createItem);
router.put('/:id', authenticate, authorize('admin', 'manager', 'supervisor'), updateItem);

// Only Admin and Manager can delete
router.delete('/:id', authenticate, authorize('admin', 'manager'), deleteItem);

export default router;
