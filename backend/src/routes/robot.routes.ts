import { Router } from 'express';
import {
  listarFamilias,
  crearFamilia,
  listarRobots,
  obtenerRobot,
  crearRobot,
  actualizarRobot,
  eliminarRobot,
  importarRobots,
} from '../controllers/robot.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/familias', listarFamilias);
router.post('/familias', authorize('ADMIN', 'SERVICIO'), crearFamilia);

router.get('/', listarRobots);
router.get('/:id', obtenerRobot);
router.post('/', authorize('ADMIN', 'SERVICIO'), crearRobot);
router.put('/:id', authorize('ADMIN', 'SERVICIO'), actualizarRobot);
router.delete('/:id', authorize('ADMIN', 'SERVICIO'), eliminarRobot);
router.post('/importar', authorize('ADMIN', 'SERVICIO'), importarRobots);

export default router;
