import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import prisma from '../config/db';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    rol: string;
    email: string;
  };
}

export const authenticate = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'No autorizado' });
      return;
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as { id: string };

    const user = await prisma.usuario.findUnique({
      where: { id: decoded.id },
      select: { id: true, rol: true, email: true, activo: true },
    });

    if (!user || !user.activo) {
      res.status(401).json({ error: 'Usuario no activo' });
      return;
    }

    req.user = { id: user.id, rol: user.rol, email: user.email };
    next();
  } catch {
    res.status(401).json({ error: 'Token inválido' });
  }
};

export const authorize = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user.rol)) {
      res.status(403).json({ error: 'Sin permisos suficientes' });
      return;
    }
    next();
  };
};
