import express from 'express';
import {
  getAllItems,
  getItem,
  createItem,
  updateItem,
  deleteItem,
  addStock,
  reduceStock,
  getStockMovements,
  getLowStockItems,
  adjustStock,
  getStockSummary,
} from '../controllers/inventoryController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// Stock summary
router.get('/summary', protect, authorize('admin'), getStockSummary);

// Stock movements
router.get('/movements', protect, authorize('admin'), getStockMovements);

// Low stock items
router.get('/low-stock', protect, authorize('admin'), getLowStockItems);

// Menu items CRUD
router.get('/', protect, getAllItems);
router.post('/', protect, authorize('admin'), createItem);
router.get('/:id', protect, authorize('admin'), getItem);
router.put('/:id', protect, authorize('admin'), updateItem);
router.delete('/:id', protect, authorize('admin'), deleteItem);

// Stock operations
router.post('/add-stock', protect, authorize('admin'), addStock);
router.post('/reduce-stock', protect, authorize('admin'), reduceStock);
router.post('/:id/adjust', protect, authorize('admin'), adjustStock);

export default router;
