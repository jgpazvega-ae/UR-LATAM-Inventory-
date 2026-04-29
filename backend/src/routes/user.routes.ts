import { Router } from 'express';
import {
  listarUsuarios,
  obtenerUsuario,
  crearUsuario,
  actualizarUsuario,
  activarUsuario,
  eliminarUsuario,
  listarDistribuidores,
  crearDistribuidor,
  resetearPassword,
} from '../controllers/user.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/distribuidores', listarDistribuidores);
router.post('/distribuidores', authorize('ADMIN'), crearDistribuidor);

router.get('/', authorize('ADMIN', 'GERENTE_VENTAS'), listarUsuarios);
router.get('/:id', authorize('ADMIN', 'GERENTE_VENTAS'), obtenerUsuario);
router.post('/', authorize('ADMIN'), crearUsuario);
router.put('/:id', authorize('ADMIN'), actualizarUsuario);
router.post('/:id/activar', authorize('ADMIN'), activarUsuario);
router.post('/:usuarioId/resetear-password', authorize('ADMIN'), resetearPassword);
router.delete('/:id', authorize('ADMIN'), eliminarUsuario);

export default router;
