import { Response } from 'express';
import prisma from '../config/db';
import { AuthRequest } from '../middleware/auth';

export const listarFamilias = async (_req: AuthRequest, res: Response) => {
  try {
    const familias = await prisma.familiaRobot.findMany({
      orderBy: { nombreFamilia: 'asc' },
      include: { _count: { select: { robots: true } } },
    });
    return res.json(familias);
  } catch {
    return res.status(500).json({ error: 'Error al listar familias' });
  }
};

export const crearFamilia = async (req: AuthRequest, res: Response) => {
  try {
    const familia = await prisma.familiaRobot.create({ data: req.body });
    return res.status(201).json(familia);
  } catch {
    return res.status(500).json({ error: 'Error al crear familia' });
  }
};

export const listarRobots = async (req: AuthRequest, res: Response) => {
  try {
    const { familiaId, estado, disponibles } = req.query;
    const where: any = {};

    if (familiaId) where.familiaId = familiaId;
    if (estado) where.estado = estado;
    if (disponibles === 'true') where.estado = 'DISPONIBLE';

    const robots = await prisma.robot.findMany({
      where,
      include: { familia: true },
      orderBy: { numeroSerie: 'asc' },
    });

    return res.json(robots);
  } catch {
    return res.status(500).json({ error: 'Error al listar robots' });
  }
};

export const obtenerRobot = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const robot = await prisma.robot.findUnique({
      where: { id },
      include: {
        familia: true,
        detallesPrestamo: {
          include: { prestamo: { include: { usuarioSolicitante: true } } },
          orderBy: { fechaAgregado: 'desc' },
          take: 10,
        },
      },
    });

    if (!robot) {
      return res.status(404).json({ error: 'Robot no encontrado' });
    }

    return res.json(robot);
  } catch {
    return res.status(500).json({ error: 'Error al obtener robot' });
  }
};

export const crearRobot = async (req: AuthRequest, res: Response) => {
  try {
    const robot = await prisma.robot.create({
      data: req.body,
      include: { familia: true },
    });
    return res.status(201).json(robot);
  } catch {
    return res.status(500).json({ error: 'Error al crear robot' });
  }
};

export const actualizarRobot = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const robot = await prisma.robot.update({
      where: { id },
      data: req.body,
      include: { familia: true },
    });
    return res.json(robot);
  } catch {
    return res.status(500).json({ error: 'Error al actualizar robot' });
  }
};

export const eliminarRobot = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.robot.delete({ where: { id } });
    return res.json({ mensaje: 'Robot eliminado' });
  } catch {
    return res.status(500).json({ error: 'Error al eliminar robot' });
  }
};

export const importarRobots = async (req: AuthRequest, res: Response) => {
  try {
    const { robots } = req.body;

    if (!Array.isArray(robots) || robots.length === 0) {
      return res.status(400).json({ error: 'Lista de robots requerida' });
    }

    const resultados = { creados: 0, errores: 0, detalles: [] as any[] };

    for (const robotData of robots) {
      try {
        await prisma.robot.create({ data: robotData });
        resultados.creados++;
      } catch (err: any) {
        resultados.errores++;
        resultados.detalles.push({ numeroSerie: robotData.numeroSerie, error: err.message });
      }
    }

    return res.json(resultados);
  } catch {
    return res.status(500).json({ error: 'Error al importar robots' });
  }
};
