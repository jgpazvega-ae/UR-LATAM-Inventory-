import { Response } from 'express';
import prisma from '../config/db';
import { AuthRequest } from '../middleware/auth';
import { historialRobotService } from '../services/historial.service';

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
    const where: any = { regionId: req.user!.regionId };

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
    const robot = await prisma.robot.findFirst({
      where: { id, regionId: req.user!.regionId },
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
      data: { ...req.body, regionId: req.user!.regionId },
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

    if (robot.regionId !== req.user!.regionId) {
      return res.status(403).json({ error: 'No tiene permiso para actualizar este robot' });
    }

    return res.json(robot);
  } catch {
    return res.status(500).json({ error: 'Error al actualizar robot' });
  }
};

export const eliminarRobot = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const robot = await prisma.robot.findFirst({
      where: { id, regionId: req.user!.regionId },
    });

    if (!robot) {
      return res.status(403).json({ error: 'No tiene permiso para eliminar este robot' });
    }

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
        await prisma.robot.create({
          data: { ...robotData, regionId: req.user!.regionId },
        });
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

export const reportarDano = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { descripcion, requisitos } = req.body;

    const robot = await prisma.robot.findFirst({
      where: { id, regionId: req.user!.regionId },
    });

    if (!robot) {
      return res.status(404).json({ error: 'Robot no encontrado' });
    }

    const evento = await historialRobotService.reportarDano(
      id,
      req.user!.id,
      descripcion,
      requisitos
    );

    if (!evento) {
      return res.status(500).json({ error: 'Error al reportar daño' });
    }

    return res.json({ mensaje: 'Daño reportado correctamente', evento });
  } catch {
    return res.status(500).json({ error: 'Error al reportar daño' });
  }
};

export const repararRobot = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const robot = await prisma.robot.findFirst({
      where: { id, regionId: req.user!.regionId },
    });

    if (!robot) {
      return res.status(404).json({ error: 'Robot no encontrado' });
    }

    const evento = await historialRobotService.registrarReparacion(id, req.user!.id);

    if (!evento) {
      return res.status(500).json({ error: 'Error al registrar reparación' });
    }

    return res.json({ mensaje: 'Robot reparado correctamente', evento });
  } catch {
    return res.status(500).json({ error: 'Error al registrar reparación' });
  }
};

export const obtenerHistorial = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { limite = '50' } = req.query;

    const robot = await prisma.robot.findFirst({
      where: { id, regionId: req.user!.regionId },
    });

    if (!robot) {
      return res.status(404).json({ error: 'Robot no encontrado' });
    }

    const historial = await historialRobotService.obtenerHistorial(
      id,
      parseInt(limite as string)
    );

    return res.json(historial);
  } catch {
    return res.status(500).json({ error: 'Error al obtener historial' });
  }
};

export const generarReporte = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const robot = await prisma.robot.findFirst({
      where: { id, regionId: req.user!.regionId },
    });

    if (!robot) {
      return res.status(404).json({ error: 'Robot no encontrado' });
    }

    const reporte = await historialRobotService.generarReporte(id);

    if (!reporte) {
      return res.status(500).json({ error: 'Error al generar reporte' });
    }

    return res.json(reporte);
  } catch {
    return res.status(500).json({ error: 'Error al generar reporte' });
  }
};
