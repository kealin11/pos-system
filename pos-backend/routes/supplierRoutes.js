import express from 'express';
import {
  getAllSuppliers,
  getSupplier,
  createSupplier,
  updateSupplier,
  deleteSupplier,
  addItemsToSupplier,
  removeItemsFromSupplier,
  getSupplierByItem,
} from '../controllers/supplierController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// Get suppliers for specific item
router.get('/item/:itemId', protect, authorize('admin'), getSupplierByItem);

// Supplier CRUD
router.get('/', protect, authorize('admin'), getAllSuppliers);
router.post('/', protect, authorize('admin'), createSupplier);
router.get('/:id', protect, authorize('admin'), getSupplier);
router.put('/:id', protect, authorize('admin'), updateSupplier);
router.delete('/:id', protect, authorize('admin'), deleteSupplier);

// Add/Remove items from supplier
router.post('/:supplierId/add-items', protect, authorize('admin'), addItemsToSupplier);
router.post('/:supplierId/remove-items', protect, authorize('admin'), removeItemsFromSupplier);

export default router;
