import express from 'express';
import {
  getSyncStatus,
  syncDownload,
  syncUpload,
  syncBidirectional,
  getSyncHistory,
} from '../controllers/syncController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/status/:deviceId', getSyncStatus);
router.post('/download', syncDownload);
router.post('/upload', protect, syncUpload);
router.post('/bidirectional', protect, syncBidirectional);
router.get('/history', protect, getSyncHistory);

export default router;
