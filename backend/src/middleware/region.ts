import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from './auth';

// Middleware que valida y extrae región del request
export const regionMiddleware = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    // La región viene del usuario autenticado (req.user.region)
    // O del header X-Region para requests sin usuario
    const region = req.user?.region || req.headers['x-region'];

    if (!region) {
      return res.status(400).json({ error: 'Region not specified' });
    }

    // Agregar región al request
    (req as any).region = region;
    next();
  } catch (err) {
    console.error('Error in region middleware:', err);
    return res.status(400).json({ error: 'Error processing region' });
  }
};

// Middleware que valida que usuario tiene acceso a la región
export const validateRegionAccess = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const requestedRegion = req.params.region || (req as any).region;

    if (!requestedRegion) {
      return res.status(400).json({ error: 'Region not specified' });
    }

    // Usuario solo puede acceder a su propia región
    if (req.user.region !== requestedRegion) {
      return res.status(403).json({ error: 'Access denied to this region' });
    }

    next();
  } catch (err) {
    console.error('Error validating region access:', err);
    return res.status(500).json({ error: 'Error validating access' });
  }
};
