import express from 'express';
import {
  createGrv,
  getAllGrvs,
  getGrv,
  postGrv,
  updateGrv,
} from '../controllers/grvController.js';
import { authorize, protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(authorize('admin'), getAllGrvs)
  .post(authorize('admin'), createGrv);

router.route('/:id')
  .get(authorize('admin'), getGrv)
  .put(authorize('admin'), updateGrv);

router.post('/:id/post', authorize('admin'), postGrv);

export default router;
