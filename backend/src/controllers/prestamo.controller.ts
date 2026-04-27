import { Response } from 'express';
import prisma from '../config/db';
import { AuthRequest } from '../middleware/auth';
import { sendEmail, templates } from '../services/email.service';

const formatFecha = (date: Date): string =>
  date.toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' });

const generarNumeroSolicitud = async (): Promise<string> => {
  const year = new Date().getFullYear();
  const count = await prisma.prestamo.count({
    where: {
      fechaCreacion: {
        gte: new Date(`${year}-01-01`),
        lt: new Date(`${year + 1}-01-01`),
      },
    },
  });
  return `SOL-${year}-${String(count + 1).padStart(6, '0')}`;
};

export const listarSolicitudes = async (req: AuthRequest, res: Response) => {
  try {
    const { estado, usuario } = req.query;
    const where: any = {};

    if (estado) where.estado = estado;
    if (usuario === 'mias' && req.user) where.usuarioSolicitanteId = req.user.id;

    const solicitudes = await prisma.prestamo.findMany({
      where,
      include: {
        usuarioSolicitante: {
          select: { id: true, nombreCompleto: true, email: true },
        },
        distribuidor: true,
        detalles: {
          include: { robot: { include: { familia: true } } },
        },
        usuarioAprobador: {
          select: { id: true, nombreCompleto: true },
        },
      },
      orderBy: { fechaCreacion: 'desc' },
    });

    return res.json(solicitudes);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Error al listar solicitudes' });
  }
};

export const obtenerSolicitud = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const solicitud = await prisma.prestamo.findUnique({
      where: { id },
      include: {
        usuarioSolicitante: true,
        distribuidor: true,
        detalles: { include: { robot: { include: { familia: true } } } },
        usuarioAprobador: { select: { id: true, nombreCompleto: true } },
        usuarioServicioSalida: { select: { id: true, nombreCompleto: true } },
        usuarioServicioRecepcion: { select: { id: true, nombreCompleto: true } },
      },
    });

    if (!solicitud) {
      return res.status(404).json({ error: 'Solicitud no encontrada' });
    }

    return res.json(solicitud);
  } catch {
    return res.status(500).json({ error: 'Error al obtener solicitud' });
  }
};

export const crearSolicitud = async (req: AuthRequest, res: Response) => {
  try {
    const { robotIds, distribuidorId, fechaInicio, fechaFin, motivo } = req.body;

    if (!robotIds || robotIds.length === 0) {
      return res.status(400).json({ error: 'Debe seleccionar al menos un robot' });
    }

    if (!fechaInicio || !fechaFin || !motivo || !distribuidorId) {
      return res.status(400).json({ error: 'Todos los campos son requeridos' });
    }

    const config = await prisma.configuracion.findFirst();
    const diasMin = config?.diasMinimosAnticipacion || 7;
    const fechaInicioDate = new Date(fechaInicio);
    const fechaFinDate = new Date(fechaFin);
    const hoy = new Date();
    const diasDiferencia = Math.floor(
      (fechaInicioDate.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (diasDiferencia < diasMin) {
      return res.status(400).json({
        error: `Debe solicitarse con mínimo ${diasMin} días de anticipación`,
      });
    }

    if (fechaFinDate <= fechaInicioDate) {
      return res.status(400).json({ error: 'Fecha fin debe ser posterior a fecha inicio' });
    }

    const numeroSolicitud = await generarNumeroSolicitud();

    const solicitud = await prisma.prestamo.create({
      data: {
        numeroSolicitud,
        usuarioSolicitanteId: req.user!.id,
        distribuidorId,
        fechaInioSolicitada: fechaInicioDate,
        fechaFinSolicitada: fechaFinDate,
        motivo,
        estado: 'PENDIENTE_APROBACION',
        detalles: {
          create: robotIds.map((robotId: string, index: number) => ({
            robotId,
            orden: index + 1,
          })),
        },
      },
      include: {
        usuarioSolicitante: true,
        detalles: { include: { robot: true } },
      },
    });

    const robotsString = solicitud.detalles
      .map((d) => `${d.robot.numeroSerie} (${d.robot.modelo || ''})`)
      .join(', ');

    await sendEmail({
      to: solicitud.usuarioSolicitante.email,
      cc: config?.correoAdminPrincipal,
      subject: `Solicitud de Demo Creada - ${numeroSolicitud}`,
      html: templates.solicitudCreada({
        numeroSolicitud,
        nombre: solicitud.usuarioSolicitante.nombreCompleto,
        robots: robotsString,
        fechaInicio: formatFecha(fechaInicioDate),
        fechaFin: formatFecha(fechaFinDate),
        motivo,
      }),
    });

    return res.status(201).json(solicitud);
  } catch (error) {
    console.error('Error creando solicitud:', error);
    return res.status(500).json({ error: 'Error al crear solicitud' });
  }
};

export const aprobarSolicitud = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const solicitud = await prisma.prestamo.update({
      where: { id },
      data: {
        estado: 'APROBADO',
        fechaAprobacion: new Date(),
        usuarioAprobadorId: req.user!.id,
      },
      include: {
        usuarioSolicitante: true,
        detalles: { include: { robot: true } },
      },
    });

    const robotsString = solicitud.detalles
      .map((d) => `${d.robot.numeroSerie} (${d.robot.modelo || ''})`)
      .join(', ');

    await sendEmail({
      to: solicitud.usuarioSolicitante.email,
      subject: `✅ Solicitud Aprobada - ${solicitud.numeroSolicitud}`,
      html: templates.solicitudAprobada({
        numeroSolicitud: solicitud.numeroSolicitud,
        nombre: solicitud.usuarioSolicitante.nombreCompleto,
        robots: robotsString,
        fechaInicio: formatFecha(solicitud.fechaInioSolicitada),
        fechaFin: formatFecha(solicitud.fechaFinSolicitada),
      }),
    });

    return res.json(solicitud);
  } catch {
    return res.status(500).json({ error: 'Error al aprobar solicitud' });
  }
};

export const rechazarSolicitud = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { motivoRechazo } = req.body;

    const solicitud = await prisma.prestamo.update({
      where: { id },
      data: {
        estado: 'RECHAZADO',
        fechaAprobacion: new Date(),
        usuarioAprobadorId: req.user!.id,
      },
      include: { usuarioSolicitante: true },
    });

    await sendEmail({
      to: solicitud.usuarioSolicitante.email,
      subject: `Solicitud Rechazada - ${solicitud.numeroSolicitud}`,
      html: templates.solicitudRechazada({
        numeroSolicitud: solicitud.numeroSolicitud,
        nombre: solicitud.usuarioSolicitante.nombreCompleto,
        motivo: motivoRechazo || 'No se especificó motivo',
      }),
    });

    return res.json(solicitud);
  } catch {
    return res.status(500).json({ error: 'Error al rechazar solicitud' });
  }
};

export const confirmarSalida = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const solicitud = await prisma.prestamo.update({
      where: { id },
      data: {
        estado: 'ACTIVO',
        estadoSalida: 'CONFIRMADO',
        fechaSalidaReal: new Date(),
        usuarioServicioSalidaId: req.user!.id,
      },
      include: {
        usuarioSolicitante: true,
        detalles: { include: { robot: true } },
      },
    });

    // Actualizar estado de robots a EN_PRESTAMO
    for (const detalle of solicitud.detalles) {
      await prisma.robot.update({
        where: { id: detalle.robotId },
        data: { estado: 'EN_PRESTAMO' },
      });
    }

    const robotsString = solicitud.detalles
      .map((d) => `${d.robot.numeroSerie} (${d.robot.modelo || ''})`)
      .join(', ');

    await sendEmail({
      to: solicitud.usuarioSolicitante.email,
      subject: `Robot Entregado - ${solicitud.numeroSolicitud}`,
      html: templates.salidaConfirmada({
        numeroSolicitud: solicitud.numeroSolicitud,
        nombre: solicitud.usuarioSolicitante.nombreCompleto,
        robots: robotsString,
        fechaSalida: formatFecha(new Date()),
      }),
    });

    return res.json(solicitud);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Error al confirmar salida' });
  }
};

export const confirmarRecepcion = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const solicitud = await prisma.prestamo.update({
      where: { id },
      data: {
        estado: 'COMPLETADO',
        estadoRecepcion: 'CONFIRMADO',
        fechaRecepcionReal: new Date(),
        usuarioServicioRecepcionId: req.user!.id,
      },
      include: {
        usuarioSolicitante: true,
        detalles: { include: { robot: true } },
      },
    });

    // Restaurar robots a DISPONIBLE
    for (const detalle of solicitud.detalles) {
      await prisma.robot.update({
        where: { id: detalle.robotId },
        data: { estado: 'DISPONIBLE' },
      });
    }

    const robotsString = solicitud.detalles
      .map((d) => `${d.robot.numeroSerie} (${d.robot.modelo || ''})`)
      .join(', ');

    await sendEmail({
      to: solicitud.usuarioSolicitante.email,
      subject: `Robot Devuelto - ${solicitud.numeroSolicitud}`,
      html: templates.recepcionConfirmada({
        numeroSolicitud: solicitud.numeroSolicitud,
        nombre: solicitud.usuarioSolicitante.nombreCompleto,
        robots: robotsString,
        fechaRecepcion: formatFecha(new Date()),
      }),
    });

    return res.json(solicitud);
  } catch {
    return res.status(500).json({ error: 'Error al confirmar recepción' });
  }
};
