import express from 'express';
import {
  generateDayEndReport,
  getDayEndReport,
  getAllDayEndReports,
  finalizeReport,
  deleteReport,
  getRevenueSummary,
} from '../controllers/reportController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// Report endpoints
router.post('/generate', protect, authorize('admin'), generateDayEndReport);
router.get('/revenue-summary', protect, authorize('admin'), getRevenueSummary);
router.get('/', protect, authorize('admin'), getAllDayEndReports);
router.get('/:date', protect, authorize('admin'), getDayEndReport);
router.put('/:date/finalize', protect, authorize('admin'), finalizeReport);
router.delete('/:date', protect, authorize('admin'), deleteReport);

export default router;
