import { Router } from 'express';
import { getTransactions, createTransaction } from '../controllers/transactionController.js';
import { verifyFirebaseToken } from '../middleware/authMiddleware.js';

const router = Router();

// Protect all transaction endpoints with Firebase Authentication middleware
router.use(verifyFirebaseToken);

router.get('/', getTransactions);
router.post('/', createTransaction);

export default router;
