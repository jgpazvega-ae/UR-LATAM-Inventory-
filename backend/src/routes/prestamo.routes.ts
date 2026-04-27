import { Router } from 'express';
import {
  listarSolicitudes,
  obtenerSolicitud,
  crearSolicitud,
  aprobarSolicitud,
  rechazarSolicitud,
  confirmarSalida,
  confirmarRecepcion,
} from '../controllers/prestamo.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/', listarSolicitudes);
router.get('/:id', obtenerSolicitud);
router.post('/', crearSolicitud);
router.post('/:id/aprobar', authorize('ADMIN', 'GERENTE_VENTAS'), aprobarSolicitud);
router.post('/:id/rechazar', authorize('ADMIN', 'GERENTE_VENTAS'), rechazarSolicitud);
router.post('/:id/salida', authorize('ADMIN', 'SERVICIO'), confirmarSalida);
router.post('/:id/recepcion', authorize('ADMIN', 'SERVICIO'), confirmarRecepcion);

export default router;
