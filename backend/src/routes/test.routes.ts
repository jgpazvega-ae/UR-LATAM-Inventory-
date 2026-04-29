import { Router } from 'express';
import { testEmail, healthCheck } from '../controllers/test.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

// Health check endpoint (public, no auth required)
router.get('/health', healthCheck);

router.use(authenticate);

// Email test endpoint (admin only)
router.post('/email', authorize('ADMIN'), testEmail);

export default router;
