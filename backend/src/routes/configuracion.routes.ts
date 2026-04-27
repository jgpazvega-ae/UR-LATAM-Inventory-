import { Router } from 'express';
import {
  obtenerConfiguracion,
  actualizarConfiguracion,
} from '../controllers/configuracion.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/', obtenerConfiguracion);
router.put('/', authorize('ADMIN'), actualizarConfiguracion);

export default router;
