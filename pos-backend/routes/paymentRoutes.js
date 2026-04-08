import express from 'express';
import {
  completePayment,
  createRazorpayOrder,
  verifyPayment,
  getInvoice,
} from '../controllers/paymentController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect); // All payment routes require auth

router.post('/create-order', createRazorpayOrder);
router.post('/verify',       verifyPayment);
router.post('/complete',     completePayment);
router.get('/invoice/:orderId', getInvoice);

export default router;
