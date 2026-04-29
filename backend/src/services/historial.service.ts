import prisma from '../config/db';
import { TipoEventoRobot, EstadoRobot } from '@prisma/client';

export const historialRobotService = {
  // Registrar evento de robot
  async registrarEvento(
    robotId: string,
    usuarioId: string,
    tipoEvento: TipoEventoRobot,
    descripcion: string,
    estadoAnterior?: EstadoRobot,
    estadoNuevo?: EstadoRobot,
    prestamoId?: string,
    fechaPrestamo?: Date,
    fechaDevolucion?: Date,
    descripcionDano?: string,
  ) {
    try {
      const evento = await prisma.historialRobot.create({
        data: {
          robotId,
          usuarioId,
          tipoEvento,
          descripcion,
          estadoAnterior,
          estadoNuevo,
          prestamoId,
          fechaPrestamo,
          fechaDevolucion,
          descripcionDano,
        },
        include: { robot: true, usuario: true },
      });
      return evento;
    } catch (error) {
      console.error('Error registering robot event:', error);
      return null;
    }
  },

  // Obtener historial de un robot
  async obtenerHistorial(robotId: string, limite: number = 50) {
    try {
      const historial = await prisma.historialRobot.findMany({
        where: { robotId },
        include: { usuario: true, prestamo: true },
        orderBy: { fechaEvento: 'desc' },
        take: limite,
      });
      return historial;
    } catch (error) {
      console.error('Error obtaining robot history:', error);
      return [];
    }
  },

  // Obtener robots dañados
  async obtenerRobotsDanados() {
    try {
      const robots = await prisma.robot.findMany({
        where: { estado: 'DANADO' },
        include: {
          familia: true,
          historialRobot: {
            where: { tipoEvento: 'DANADO' },
            orderBy: { fechaEvento: 'desc' },
            take: 1,
          },
        },
      });
      return robots;
    } catch (error) {
      console.error('Error obtaining damaged robots:', error);
      return [];
    }
  },

  // Obtener robots en préstamo
  async obtenerRobotsEnPrestamo() {
    try {
      const robots = await prisma.robot.findMany({
        where: { estado: 'EN_PRESTAMO' },
        include: {
          familia: true,
          historialRobot: {
            where: { tipoEvento: 'PRESTAMO_INICIADO' },
            orderBy: { fechaEvento: 'desc' },
            take: 1,
            include: { prestamo: true },
          },
        },
      });
      return robots;
    } catch (error) {
      console.error('Error obtaining loaned robots:', error);
      return [];
    }
  },

  // Reportar robot como dañado
  async reportarDano(
    robotId: string,
    usuarioId: string,
    descripcion: string,
    requisitosReparacion?: string
  ) {
    try {
      // Cambiar estado del robot a DANADO
      await prisma.robot.update({
        where: { id: robotId },
        data: { estado: 'DANADO' },
      });

      // Registrar en historial
      const evento = await this.registrarEvento(
        robotId,
        usuarioId,
        'DANADO',
        `Robot dañado: ${descripcion}`,
        'EN_PRESTAMO',
        'DANADO',
        undefined,
        undefined,
        undefined,
        descripcion
      );

      return evento;
    } catch (error) {
      console.error('Error reporting damage:', error);
      return null;
    }
  },

  // Registrar reparación
  async registrarReparacion(robotId: string, usuarioId: string) {
    try {
      await prisma.robot.update({
        where: { id: robotId },
        data: { estado: 'DISPONIBLE' },
      });

      const evento = await this.registrarEvento(
        robotId,
        usuarioId,
        'REPARADO',
        'Robot reparado y disponible',
        'DANADO',
        'DISPONIBLE'
      );

      return evento;
    } catch (error) {
      console.error('Error registering repair:', error);
      return null;
    }
  },

  // Generar reporte de historial de robot
  async generarReporte(robotId: string) {
    try {
      const robot = await prisma.robot.findUnique({
        where: { id: robotId },
        include: {
          familia: true,
          historialRobot: {
            include: { usuario: true, prestamo: true },
            orderBy: { fechaEvento: 'desc' },
          },
        },
      });

      if (!robot) return null;

      return {
        robot: {
          numeroSerie: robot.numeroSerie,
          modelo: robot.modelo,
          familia: robot.familia.nombreFamilia,
          estado: robot.estado,
          ubicacion: robot.ubicacionActual,
          fechaAdquisicion: robot.fechaAdquisicion,
        },
        historial: robot.historialRobot,
        resumen: {
          totalEventos: robot.historialRobot.length,
          totalPrestamos: robot.historialRobot.filter(h => h.tipoEvento === 'PRESTAMO_INICIADO').length,
          totalDanos: robot.historialRobot.filter(h => h.tipoEvento === 'DANADO').length,
          totalReparaciones: robot.historialRobot.filter(h => h.tipoEvento === 'REPARADO').length,
        },
      };
    } catch (error) {
      console.error('Error generating report:', error);
      return null;
    }
  },
};
