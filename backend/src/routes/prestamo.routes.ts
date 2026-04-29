import { Router } from 'express';
import {
  listarSolicitudes,
  obtenerSolicitud,
  crearSolicitud,
  aprobarSolicitud,
  rechazarSolicitud,
  confirmarSalida,
  confirmarRecepcion,
  reporteDemosActivas,
  responderSolicitud,
  subirPDFConfirmacion,
} from '../controllers/prestamo.controller';
import { authenticate, authorize } from '../middleware/auth';
import { uploadPDF } from '../middleware/upload';

const router = Router();

router.use(authenticate);

router.get('/reportes/demos-activas', authorize('ADMIN', 'GERENTE_VENTAS'), reporteDemosActivas);
router.get('/', listarSolicitudes);
router.get('/:id', obtenerSolicitud);
router.post('/', uploadPDF.single('pdf'), crearSolicitud);
router.post('/:id/aprobar', authorize('ADMIN', 'GERENTE_VENTAS'), aprobarSolicitud);
router.post('/:id/rechazar', authorize('ADMIN', 'GERENTE_VENTAS'), rechazarSolicitud);
router.post('/:id/responder', authorize('ADMIN', 'GERENTE_VENTAS'), uploadPDF.single('pdf'), responderSolicitud);
router.post('/:id/salida', authorize('ADMIN', 'SERVICIO'), confirmarSalida);
router.post('/:id/recepcion', authorize('ADMIN', 'SERVICIO'), confirmarRecepcion);
router.post('/:id/confirmacion-pdf', authorize('ADMIN', 'SERVICIO'), uploadPDF.single('pdf'), subirPDFConfirmacion);

export default router;
