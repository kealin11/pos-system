import express from 'express';
import {
  getOrders,
  getOrder,
  placeOrder,
  updateOrderStatus,
  deleteOrder,
  getDashboardStats,
} from '../controllers/orderController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect); // All order routes require auth

router.get('/stats', getDashboardStats);

router.route('/')
  .get(getOrders)
  .post(placeOrder);

router.route('/:id')
  .get(getOrder)
  .delete(authorize('admin'), deleteOrder);

router.patch('/:id/status', updateOrderStatus);

export default router;
