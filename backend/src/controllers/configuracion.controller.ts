import { Response } from 'express';
import prisma from '../config/db';
import { AuthRequest } from '../middleware/auth';

export const obtenerConfiguracion = async (_req: AuthRequest, res: Response) => {
  try {
    let config = await prisma.configuracion.findFirst();

    if (!config) {
      config = await prisma.configuracion.create({
        data: {
          diasMinimosAnticipacion: 7,
          diasVencimientoAlerta: 7,
          correoAdminPrincipal: process.env.ADMIN_EMAIL || 'admin@teradyne-robotics.com',
          correoAdminCopia1: process.env.ADMIN_EMAIL_CC1,
          correoAdminCopia2: process.env.ADMIN_EMAIL_CC2,
          horariosNotificacion: '["08:00", "12:00", "16:00"]',
        },
      });
    }

    return res.json(config);
  } catch {
    return res.status(500).json({ error: 'Error al obtener configuración' });
  }
};

export const actualizarConfiguracion = async (req: AuthRequest, res: Response) => {
  try {
    const data = req.body;
    if (data.horariosNotificacion && Array.isArray(data.horariosNotificacion)) {
      data.horariosNotificacion = JSON.stringify(data.horariosNotificacion);
    }

    let config = await prisma.configuracion.findFirst();

    if (config) {
      config = await prisma.configuracion.update({
        where: { id: config.id },
        data,
      });
    } else {
      config = await prisma.configuracion.create({ data });
    }

    return res.json(config);
  } catch {
    return res.status(500).json({ error: 'Error al actualizar configuración' });
  }
};
