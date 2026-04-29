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
    const pdfFile = (req as any).file;

    if (!robotIds || robotIds.length === 0) {
      return res.status(400).json({ error: 'Debe seleccionar al menos un robot' });
    }

    if (!fechaInicio || !fechaFin || !motivo || !distribuidorId) {
      return res.status(400).json({ error: 'Todos los campos son requeridos' });
    }

    // Validar que no haya préstamos activos sin confirmar recepción
    const prestamoActivo = await prisma.prestamo.findFirst({
      where: {
        usuarioSolicitanteId: req.user!.id,
        estado: 'ACTIVO',
        estadoRecepcion: null,
      },
    });

    if (prestamoActivo) {
      return res.status(400).json({
        error: 'No puedes crear una nueva solicitud mientras tengas un préstamo activo sin confirmar recepción. Por favor devuelve los robots primero.',
        prestamoActivoId: prestamoActivo.id,
      });
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
        pdfVendedor: pdfFile ? pdfFile.path : null,
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

    // Email al solicitante
    const attachments = pdfFile ? [{ filename: pdfFile.originalname, path: pdfFile.path }] : [];

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
      attachments,
    });

    // Email a gerente de ventas para aprobación
    const gerenteVentas = await prisma.usuario.findFirst({
      where: { rol: 'GERENTE_VENTAS', activo: true },
    });

    if (gerenteVentas) {
      await sendEmail({
        to: gerenteVentas.email,
        subject: `⏳ Aprobación Requerida - Solicitud ${numeroSolicitud}`,
        html: templates.solicitudParaAprobacion({
          numeroSolicitud,
          solicitante: solicitud.usuarioSolicitante.nombreCompleto,
          robots: robotsString,
          fechaInicio: formatFecha(fechaInicioDate),
          fechaFin: formatFecha(fechaFinDate),
          motivo,
        }),
        attachments,
      });
    }

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

    // Email al solicitante
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

    // Email a personal de servicio
    const personalServicio = await prisma.usuario.findFirst({
      where: { rol: 'SERVICIO', activo: true },
    });

    if (personalServicio) {
      await sendEmail({
        to: personalServicio.email,
        subject: `✅ Solicitud Aprobada - Preparar Entrega ${solicitud.numeroSolicitud}`,
        html: templates.resultadoSolicitud({
          numeroSolicitud: solicitud.numeroSolicitud,
          solicitante: solicitud.usuarioSolicitante.nombreCompleto,
          estado: 'APROBADO',
          robots: robotsString,
          fechaInicio: formatFecha(solicitud.fechaInioSolicitada),
          fechaFin: formatFecha(solicitud.fechaFinSolicitada),
        }),
      });
    }

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
      include: {
        usuarioSolicitante: true,
        detalles: { include: { robot: true } },
      },
    });

    const robotsString = solicitud.detalles
      .map((d) => `${d.robot.numeroSerie} (${d.robot.modelo || ''})`)
      .join(', ');

    // Email al solicitante
    await sendEmail({
      to: solicitud.usuarioSolicitante.email,
      subject: `❌ Solicitud Rechazada - ${solicitud.numeroSolicitud}`,
      html: templates.solicitudRechazada({
        numeroSolicitud: solicitud.numeroSolicitud,
        nombre: solicitud.usuarioSolicitante.nombreCompleto,
        motivo: motivoRechazo || 'No se especificó motivo',
      }),
    });

    // Email a personal de servicio (informativo)
    const personalServicio = await prisma.usuario.findFirst({
      where: { rol: 'SERVICIO', activo: true },
    });

    if (personalServicio) {
      await sendEmail({
        to: personalServicio.email,
        subject: `❌ Solicitud Rechazada - ${solicitud.numeroSolicitud}`,
        html: templates.resultadoSolicitud({
          numeroSolicitud: solicitud.numeroSolicitud,
          solicitante: solicitud.usuarioSolicitante.nombreCompleto,
          estado: 'RECHAZADO',
          robots: robotsString,
          fechaInicio: formatFecha(solicitud.fechaInioSolicitada),
          fechaFin: formatFecha(solicitud.fechaFinSolicitada),
          motivo: motivoRechazo,
        }),
      });
    }

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

export const reporteDemosActivas = async (_req: AuthRequest, res: Response) => {
  try {
    const demosActivas = await prisma.prestamo.findMany({
      where: {
        estado: 'ACTIVO',
      },
      include: {
        usuarioSolicitante: {
          select: { id: true, nombreCompleto: true, email: true },
        },
        distribuidor: true,
        detalles: {
          include: { robot: { include: { familia: true } } },
        },
      },
      orderBy: { fechaFinSolicitada: 'asc' },
    });

    const reporteEnriquecido = demosActivas.map((demo) => {
      const ahora = new Date();
      const fechaFin = new Date(demo.fechaFinSolicitada);
      const diasRestantes = Math.ceil((fechaFin.getTime() - ahora.getTime()) / (1000 * 60 * 60 * 24));
      const vigente = diasRestantes > 0;

      return {
        ...demo,
        diasRestantes,
        vigente,
      };
    });

    return res.json(reporteEnriquecido);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Error al obtener reporte de demos' });
  }
};

export const responderSolicitud = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const pdfFile = (req as any).file;

    const solicitud = await prisma.prestamo.findUnique({
      where: { id },
      include: {
        usuarioSolicitante: true,
        detalles: { include: { robot: true } },
      },
    });

    if (!solicitud) {
      return res.status(404).json({ error: 'Solicitud no encontrada' });
    }

    const updated = await prisma.prestamo.update({
      where: { id },
      data: {
        pdfUriel: pdfFile ? pdfFile.path : solicitud.pdfUriel,
      },
      include: {
        usuarioSolicitante: true,
        detalles: { include: { robot: true } },
      },
    });

    const robotsString = updated.detalles
      .map((d) => `${d.robot.numeroSerie} (${d.robot.modelo || ''})`)
      .join(', ');

    const attachments = [];
    if (solicitud.pdfVendedor) {
      attachments.push({ filename: 'solicitud-vendedor.pdf', path: solicitud.pdfVendedor });
    }
    if (pdfFile) {
      attachments.push({ filename: pdfFile.originalname, path: pdfFile.path });
    }

    const personalServicio = await prisma.usuario.findFirst({
      where: { rol: 'SERVICIO', activo: true },
    });

    if (personalServicio) {
      await sendEmail({
        to: personalServicio.email,
        subject: `📋 Respuesta de Admin - Solicitud ${solicitud.numeroSolicitud}`,
        html: templates.respuestaAdmin({
          numeroSolicitud: solicitud.numeroSolicitud,
          solicitante: solicitud.usuarioSolicitante.nombreCompleto,
          robots: robotsString,
          fechaInicio: formatFecha(solicitud.fechaInioSolicitada),
          fechaFin: formatFecha(solicitud.fechaFinSolicitada),
        }),
        attachments,
      });
    }

    return res.json(updated);
  } catch (error) {
    console.error('Error respondiendo solicitud:', error);
    return res.status(500).json({ error: 'Error al responder solicitud' });
  }
};

export const subirPDFConfirmacion = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const pdfFile = (req as any).file;

    if (!pdfFile) {
      return res.status(400).json({ error: 'Se requiere un archivo PDF' });
    }

    const solicitud = await prisma.prestamo.update({
      where: { id },
      data: {
        pdfServicio: pdfFile.path,
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
      subject: `📦 Confirmación de Entrega - ${solicitud.numeroSolicitud}`,
      html: templates.confirmacionEntrega({
        numeroSolicitud: solicitud.numeroSolicitud,
        nombre: solicitud.usuarioSolicitante.nombreCompleto,
        robots: robotsString,
        fechaEntrega: formatFecha(new Date()),
      }),
      attachments: [{ filename: pdfFile.originalname, path: pdfFile.path }],
    });

    return res.json(solicitud);
  } catch (error) {
    console.error('Error subiendo PDF confirmación:', error);
    return res.status(500).json({ error: 'Error al subir confirmación' });
  }
};
