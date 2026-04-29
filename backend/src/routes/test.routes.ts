import { Router } from 'express';
import { testEmail, healthCheck } from '../controllers/test.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.use(authenticate);

// Health check endpoint (public)
router.get('/health', healthCheck);

// Email test endpoint (admin only)
router.post('/email', authorize('ADMIN'), testEmail);

export default router;
