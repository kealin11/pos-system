import express from 'express';
import {
  getTables,
  getTable,
  createTable,
  updateTable,
  deleteTable,
  updateTableStatus,
} from '../controllers/tableController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect); // All table routes require auth

router.route('/')
  .get(getTables)
  .post(adminOnly, createTable);

router.route('/:id')
  .get(getTable)
  .put(adminOnly, updateTable)
  .delete(adminOnly, deleteTable);

router.patch('/:id/status', updateTableStatus);

export default router;