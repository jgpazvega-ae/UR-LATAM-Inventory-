import cron from 'node-cron';
import prisma from '../config/db';
import { sendEmail, templates } from './email.service';

/**
 * Sistema de Notificaciones Automáticas
 * Ejecuta cron jobs para enviar alertas de vencimiento
 */

const formatFecha = (date: Date): string =>
  date.toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' });

const obtenerRobotsPrestamoString = async (prestamoId: string): Promise<string> => {
  const detalles = await prisma.detallePrestamoRobot.findMany({
    where: { prestamoId },
    include: { robot: true },
  });
  return detalles.map((d) => `${d.robot.numeroSerie} (${d.robot.modelo || 'N/A'})`).join(', ');
};

const diasEntreFechas = (a: Date, b: Date): number =>
  Math.floor((a.getTime() - b.getTime()) / (1000 * 60 * 60 * 24));

/**
 * Envía alertas de vencimiento próximo (7 días antes)
 */
export const enviarAlertasVencimientoProximo = async () => {
  const config = await prisma.configuracion.findFirst();
  const diasAlerta = config?.diasVencimientoAlerta || 7;

  const hoy = new Date();
  const fechaAlerta = new Date();
  fechaAlerta.setDate(hoy.getDate() + diasAlerta);

  const prestamos = await prisma.prestamo.findMany({
    where: {
      estado: 'ACTIVO',
      fechaFinSolicitada: {
        gte: hoy,
        lte: fechaAlerta,
      },
    },
    include: { usuarioSolicitante: true },
  });

  for (const prestamo of prestamos) {
    const robots = await obtenerRobotsPrestamoString(prestamo.id);
    const diasRestantes = diasEntreFechas(prestamo.fechaFinSolicitada, hoy);

    await sendEmail({
      to: prestamo.usuarioSolicitante.email,
      subject: `Recordatorio: Tu Demo Vence en ${diasRestantes} Días - ${prestamo.numeroSolicitud}`,
      html: templates.alertaVencimiento({
        numeroSolicitud: prestamo.numeroSolicitud,
        nombre: prestamo.usuarioSolicitante.nombreCompleto,
        robots,
        diasRestantes,
        fechaFin: formatFecha(prestamo.fechaFinSolicitada),
      }),
    });
  }
  console.log(`✓ ${prestamos.length} alertas de vencimiento próximo enviadas`);
};

/**
 * Envía alertas de préstamos vencidos
 */
export const enviarAlertasVencidos = async () => {
  const config = await prisma.configuracion.findFirst();
  const correosCC = [
    config?.correoAdminPrincipal,
    config?.correoAdminCopia1,
    config?.correoAdminCopia2,
  ].filter(Boolean) as string[];

  const hoy = new Date();
  const prestamos = await prisma.prestamo.findMany({
    where: {
      estado: 'ACTIVO',
      fechaFinSolicitada: { lt: hoy },
    },
    include: { usuarioSolicitante: true },
  });

  for (const prestamo of prestamos) {
    const robots = await obtenerRobotsPrestamoString(prestamo.id);
    const diasVencido = diasEntreFechas(hoy, prestamo.fechaFinSolicitada);
    const critico = diasVencido >= 7;

    await sendEmail({
      to: prestamo.usuarioSolicitante.email,
      cc: critico ? correosCC : undefined,
      subject: `${critico ? '🚨 CRÍTICO' : '⚠️ ALERTA'}: Demo Vencida - ${prestamo.numeroSolicitud}`,
      html: templates.alertaVencido({
        numeroSolicitud: prestamo.numeroSolicitud,
        nombre: prestamo.usuarioSolicitante.nombreCompleto,
        robots,
        diasVencido,
        critico,
      }),
    });

    await prisma.prestamo.update({
      where: { id: prestamo.id },
      data: { estado: 'VENCIDO' },
    });
  }
  console.log(`✓ ${prestamos.length} alertas de vencidos enviadas`);
};

/**
 * Inicia los cron jobs según horarios configurados
 */
export const iniciarCronJobs = async () => {
  const config = await prisma.configuracion.findFirst();
  let horarios: string[] = ['08:00', '12:00', '16:00'];

  if (config?.horariosNotificacion) {
    try {
      horarios = JSON.parse(config.horariosNotificacion);
    } catch {
      console.warn('Horarios de notificación inválidos, usando default');
    }
  }

  // Configurar cron jobs para cada horario (Lunes a Viernes)
  horarios.forEach((horario) => {
    const [hora, minuto] = horario.split(':');
    const cronExpression = `${minuto} ${hora} * * 1-5`;

    cron.schedule(cronExpression, async () => {
      console.log(`⏰ Ejecutando notificaciones [${horario}]`);
      await enviarAlertasVencimientoProximo();
      await enviarAlertasVencidos();
    });

    console.log(`✓ Cron job programado: ${cronExpression} (${horario})`);
  });
};

export default {
  enviarAlertasVencimientoProximo,
  enviarAlertasVencidos,
  iniciarCronJobs,
};
