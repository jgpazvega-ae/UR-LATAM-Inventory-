import { Router } from 'express';
import { Response } from 'express';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';
import { regionService } from '../services/region.service';
import { translationService } from '../services/translation.service';

const router = Router();

// Listar regiones (público - sin auth)
router.get('/publicas', (_req, res: Response) => {
  try {
    const regiones = regionService.listarRegionesPublicas();
    return res.json(regiones);
  } catch (error) {
    return res.status(500).json({ error: 'Error listing regions' });
  }
});

// Listar idiomas (público - sin auth)
router.get('/idiomas/publicos', (_req, res: Response) => {
  try {
    const idiomas = regionService.listarIdiomasPublicos();
    return res.json(idiomas);
  } catch (error) {
    return res.status(500).json({ error: 'Error listing languages' });
  }
});

// Rutas que requieren autenticación
router.use(authenticate);

// Listar todas las regiones (usuario autenticado)
router.get('/', async (_req: AuthRequest, res: Response) => {
  try {
    const regiones = await regionService.listarRegiones();
    return res.json(regiones);
  } catch (error) {
    return res.status(500).json({ error: 'Error listing regions' });
  }
});

// Obtener región específica
router.get('/:codigo', async (req: AuthRequest, res: Response) => {
  try {
    const { codigo } = req.params;
    const region = await regionService.obtenerRegion(codigo);

    if (!region) {
      return res.status(404).json({ error: 'Region not found' });
    }

    return res.json(region);
  } catch (error) {
    return res.status(500).json({ error: 'Error obtaining region' });
  }
});

// Obtener configuración regional
router.get('/config/:codigo/:idioma', async (req: AuthRequest, res: Response) => {
  try {
    const { codigo, idioma } = req.params;
    const config = await regionService.obtenerConfiguracion(codigo, idioma);

    if (!config) {
      return res.status(404).json({ error: 'Regional configuration not found' });
    }

    return res.json(config);
  } catch (error) {
    return res.status(500).json({ error: 'Error obtaining configuration' });
  }
});

// Cambiar idioma del usuario
router.post('/cambiar-idioma', async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const { idioma } = req.body;

    if (!idioma) {
      return res.status(400).json({ error: 'Language code is required' });
    }

    const usuarioActualizado = await regionService.cambiarIdiomaUsuario(req.user.id, idioma);

    if (!usuarioActualizado) {
      return res.status(400).json({ error: 'Invalid language code' });
    }

    return res.json({
      mensaje: 'Language updated successfully',
      usuario: usuarioActualizado,
    });
  } catch (error) {
    return res.status(500).json({ error: 'Error changing language' });
  }
});

// Obtener traducciones para un idioma (admin)
router.get('/traducciones/:idioma', async (req: AuthRequest, res: Response) => {
  try {
    const { idioma } = req.params;

    if (!translationService.esIdiomaValido(idioma)) {
      return res.status(400).json({ error: 'Invalid language code' });
    }

    const traducciones = translationService.obtenerTodas(idioma as 'ES' | 'PT' | 'EN');
    return res.json(traducciones);
  } catch (error) {
    return res.status(500).json({ error: 'Error obtaining translations' });
  }
});

// Obtener zona horaria de una región
router.get('/zona-horaria/:codigo', async (req: AuthRequest, res: Response) => {
  try {
    const { codigo } = req.params;
    const zonaHoraria = await regionService.obtenerZonaHoraria(codigo);

    if (!zonaHoraria) {
      return res.status(404).json({ error: 'Region not found' });
    }

    return res.json({ zonaHoraria });
  } catch (error) {
    return res.status(500).json({ error: 'Error obtaining timezone' });
  }
});

export default router;
