import { movimientoService, TipoMovimiento } from './movimiento.service';

const PRESTAMOS_INICIALES: any[] = [];

// Registra un movimiento por cada robot involucrado en un evento del préstamo.
// Lee la ubicación actual de cada robot desde localStorage para el origen/destino.
const registrarMovimientosPrestamo = (
  robotIds: string[],
  tipo: TipoMovimiento,
  razon: string,
  usuario?: { id: string; nombreCompleto: string; email?: string }
) => {
  if (!robotIds || robotIds.length === 0) return;
  let robotsPorId: Record<string, any> = {};
  try {
    const stored = localStorage.getItem('robots-demo');
    if (stored) {
      const robots = JSON.parse(stored);
      if (Array.isArray(robots)) {
        robotsPorId = Object.fromEntries(robots.map((r: any) => [r.id, r]));
      }
    }
  } catch (err) {
    console.error('Error leyendo robots para registrar movimiento:', err);
  }

  robotIds.forEach((robotId) => {
    const ubicacion = robotsPorId[robotId]?.ubicacionActual || '';
    movimientoService
      .registrar({
        robotId,
        ubicacionOrigen: ubicacion,
        ubicacionDestino: ubicacion,
        tipo,
        razon,
        usuarioResponsable: {
          id: usuario?.id || 'sistema',
          nombreCompleto: usuario?.nombreCompleto || 'Sistema',
          email: usuario?.email || '',
        },
        fechaMovimiento: new Date().toISOString(),
      })
      .catch((err) => console.error('Error registrando movimiento:', err));
  });
};

// Detecta si un error es de cuota de localStorage
const isQuotaError = (err: any): boolean => {
  return (
    err instanceof DOMException &&
    (err.name === 'QuotaExceededError' ||
      err.name === 'NS_ERROR_DOM_QUOTA_REACHED' ||
      err.code === 22 ||
      err.code === 1014)
  );
};

// Helper seguro para guardar en localStorage con manejo de cuota
const safeSetItem = (key: string, value: string): { success: boolean; error?: string } => {
  try {
    localStorage.setItem(key, value);
    return { success: true };
  } catch (err: any) {
    if (isQuotaError(err)) {
      console.error('❌ Cuota de localStorage excedida');
      return {
        success: false,
        error: 'Espacio de almacenamiento agotado. Se eliminarán PDFs antiguos para liberar espacio.',
      };
    }
    console.error('❌ Error guardando en localStorage:', err);
    return { success: false, error: err.message || 'Error desconocido al guardar' };
  }
};

// Helper para actualizar estado de robots
const actualizarEstadoRobots = (robotIds: string[], nuevoEstado: string) => {
  try {
    if (!robotIds || robotIds.length === 0) {
      console.log('⚠️ No hay robots para actualizar');
      return;
    }

    const stored = localStorage.getItem('robots-demo');
    if (!stored) {
      console.warn('⚠️ No se encontró almacenamiento de robots');
      return;
    }

    const robots = JSON.parse(stored);
    if (!Array.isArray(robots)) {
      console.error('❌ Robots no es un array válido');
      return;
    }

    let cambios = 0;
    robotIds.forEach((id: string) => {
      const robot = robots.find((r: any) => r && r.id === id);
      if (robot) {
        const estadoAnterior = robot.estado;
        robot.estado = nuevoEstado;
        cambios++;
        console.log(`  ✓ Robot ${id}: ${estadoAnterior} → ${nuevoEstado}`);
      } else {
        console.log(`  ⚠️ Robot ${id} no encontrado`);
      }
    });

    if (cambios > 0) {
      const result = safeSetItem('robots-demo', JSON.stringify(robots));
      if (!result.success) {
        console.error('❌ Error actualizando estado de robots:', result.error);
      } else {
        console.log(`🤖 ${cambios} robot(s) actualizados a ${nuevoEstado}`);
      }
    }
  } catch (err) {
    console.error('❌ Error en actualizarEstadoRobots:', err);
  }
};

// Limpia PDFs de préstamos completados para liberar espacio
const limpiarPdfsAntiguos = (prestamos: any[]): any[] => {
  return prestamos.map((p) => {
    if ((p.estado === 'COMPLETADO' || p.estado === 'RECHAZADO') && p.pdfAdjunto) {
      return {
        ...p,
        pdfAdjunto: {
          name: p.pdfAdjunto.name,
          size: p.pdfAdjunto.size,
          data: null, // Eliminar el base64 grande
          archivado: true,
        },
      };
    }
    return p;
  });
};

class PrestamoServiceLocal {
  private key = 'prestamos-demo';

  private getPrestamos(): any[] {
    const stored = localStorage.getItem(this.key);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (err) {
        console.error('Error parseando préstamos:', err);
        return [];
      }
    }
    localStorage.setItem(this.key, JSON.stringify(PRESTAMOS_INICIALES));
    return PRESTAMOS_INICIALES;
  }

  private savePrestamos(prestamos: any[]): { success: boolean; error?: string } {
    const json = JSON.stringify(prestamos);
    const result = safeSetItem(this.key, json);

    // Si falla por cuota, intentar limpiar PDFs antiguos y reintentar
    if (!result.success) {
      console.log('🧹 Intentando liberar espacio eliminando PDFs antiguos...');
      const prestamosLimpios = limpiarPdfsAntiguos(prestamos);
      const retryResult = safeSetItem(this.key, JSON.stringify(prestamosLimpios));
      if (retryResult.success) {
        console.log('✅ Espacio liberado exitosamente');
        return { success: true };
      }
      return retryResult;
    }
    return result;
  }

  async listar(filtros?: { estado?: string; usuario?: string; region?: string; usuarioId?: string }) {
    try {
      let prestamos = this.getPrestamos();

      if (filtros?.estado) {
        prestamos = prestamos.filter(p => p.estado === filtros.estado);
      }

      if (filtros?.region) {
        prestamos = prestamos.filter(p => p.region === filtros.region);
      }

      if (filtros?.usuarioId) {
        prestamos = prestamos.filter(p => p.usuarioSolicitante?.id === filtros.usuarioId);
      }

      // Ordenar más recientes primero
      prestamos.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      console.log('📋 Préstamos cargados:', prestamos.length);
      return prestamos;
    } catch (error) {
      console.error('❌ Error en listar():', error);
      return [];
    }
  }

  async obtener(id: string) {
    const prestamos = this.getPrestamos();
    return prestamos.find(p => p.id === id);
  }

  async crear(solicitud: {
    robotIds: string[];
    distribuidorId?: string;
    fechaInicio: string;
    fechaFin: string;
    motivo: string;
    pdfAdjunto?: { name: string; size: number; data: string } | null;
    usuarioSolicitante?: { id: string; nombreCompleto: string; email: string; rol: string };
    region?: string;
  }) {
    const prestamos = this.getPrestamos();
    const nuevoId = (Math.max(...prestamos.map(p => parseInt(p.id) || 0), 0) + 1).toString();

    const nuevoPrestamo = {
      id: nuevoId,
      numeroSolicitud: `SOL-${Date.now()}`,
      ...solicitud,
      estado: 'PENDIENTE_APROBACION',
      estadoRecepcion: null,
      createdAt: new Date().toISOString(),
    };

    prestamos.push(nuevoPrestamo);
    const result = this.savePrestamos(prestamos);

    if (!result.success) {
      throw new Error(result.error || 'No se pudo guardar la solicitud. Espacio insuficiente.');
    }

    console.log('✅ Préstamo creado:', nuevoId);
    return nuevoPrestamo;
  }

  async aprobar(id: string, usuarioAprobador?: { id: string; nombreCompleto: string }) {
    const prestamos = this.getPrestamos();
    const index = prestamos.findIndex(p => p.id === id);
    if (index === -1) throw new Error('Préstamo no encontrado');

    prestamos[index].estado = 'APROBADO';
    prestamos[index].fechaAprobacion = new Date().toISOString();
    if (usuarioAprobador) prestamos[index].usuarioAprobador = usuarioAprobador;

    const result = this.savePrestamos(prestamos);
    if (!result.success) {
      throw new Error(result.error || 'No se pudo aprobar la solicitud');
    }
    return prestamos[index];
  }

  async rechazar(id: string, motivoRechazo: string, usuarioRechazo?: { id: string; nombreCompleto: string }) {
    const prestamos = this.getPrestamos();
    const index = prestamos.findIndex(p => p.id === id);
    if (index === -1) throw new Error('Préstamo no encontrado');

    prestamos[index].estado = 'RECHAZADO';
    prestamos[index].motivoRechazo = motivoRechazo;
    prestamos[index].fechaRechazo = new Date().toISOString();
    if (usuarioRechazo) prestamos[index].usuarioRechazo = usuarioRechazo;

    const result = this.savePrestamos(prestamos);
    if (!result.success) {
      throw new Error(result.error || 'No se pudo rechazar la solicitud');
    }
    return prestamos[index];
  }

  async confirmarSalida(id: string, usuarioSalida?: { id: string; nombreCompleto: string }) {
    const prestamos = this.getPrestamos();
    const index = prestamos.findIndex(p => p.id === id);
    if (index === -1) throw new Error('Préstamo no encontrado');

    prestamos[index].estado = 'ACTIVO';
    prestamos[index].fechaSalida = new Date().toISOString();
    if (usuarioSalida) prestamos[index].usuarioSalida = usuarioSalida;

    const result = this.savePrestamos(prestamos);
    if (!result.success) {
      throw new Error(result.error || 'No se pudo confirmar la salida');
    }

    // Actualizar robots a EN_PRESTAMO
    actualizarEstadoRobots(prestamos[index].robotIds || [], 'EN_PRESTAMO');

    // Registrar movimiento de salida (préstamo)
    registrarMovimientosPrestamo(
      prestamos[index].robotIds || [],
      'Préstamo',
      `Salida por préstamo ${prestamos[index].numeroSolicitud || ''} · ${prestamos[index].usuarioSolicitante?.nombreCompleto || 'Solicitante'}`,
      usuarioSalida
    );

    return prestamos[index];
  }

  async confirmarRecepcion(id: string, usuarioRecepcion?: { id: string; nombreCompleto: string }) {
    try {
      const prestamos = this.getPrestamos();
      const index = prestamos.findIndex(p => p.id === id);
      if (index === -1) throw new Error('Préstamo no encontrado');

      prestamos[index].estado = 'COMPLETADO';
      prestamos[index].estadoRecepcion = 'CONFIRMADA';
      prestamos[index].fechaRecepcion = new Date().toISOString();
      if (usuarioRecepcion) prestamos[index].usuarioRecepcion = usuarioRecepcion;

      // Al completar, eliminar el PDF para liberar espacio (mantener solo metadatos)
      if (prestamos[index].pdfAdjunto?.data) {
        prestamos[index].pdfAdjunto = {
          name: prestamos[index].pdfAdjunto.name,
          size: prestamos[index].pdfAdjunto.size,
          data: null,
          archivado: true,
        };
        console.log('🧹 PDF archivado del préstamo completado');
      }

      const result = this.savePrestamos(prestamos);
      if (!result.success) {
        throw new Error(result.error || 'No se pudo confirmar la recepción');
      }

      // Devolver robots a DISPONIBLE
      actualizarEstadoRobots(prestamos[index].robotIds || [], 'DISPONIBLE');

      // Registrar movimiento de retorno
      registrarMovimientosPrestamo(
        prestamos[index].robotIds || [],
        'Retorno',
        `Retorno por recepción ${prestamos[index].numeroSolicitud || ''}`,
        usuarioRecepcion
      );

      console.log('✅ Recepción confirmada para préstamo:', id);
      return prestamos[index];
    } catch (err: any) {
      console.error('❌ Error en confirmarRecepcion:', err);
      throw new Error(err.message || 'Error al confirmar recepción');
    }
  }

  async reporteDemosActivas() {
    const prestamos = this.getPrestamos();
    return prestamos.filter(p => p.estado === 'ACTIVO');
  }

  // Utilidad: Limpiar PDFs de todos los préstamos completados (admin)
  async limpiarAlmacenamiento() {
    const prestamos = this.getPrestamos();
    const limpios = limpiarPdfsAntiguos(prestamos);
    const result = this.savePrestamos(limpios);
    if (!result.success) {
      throw new Error(result.error || 'Error al limpiar almacenamiento');
    }
    const tamanoMB = (JSON.stringify(limpios).length / (1024 * 1024)).toFixed(2);
    console.log(`✅ Almacenamiento limpiado. Tamaño actual: ${tamanoMB} MB`);
    return { success: true, tamanoMB };
  }
}

export const prestamoService = new PrestamoServiceLocal();
