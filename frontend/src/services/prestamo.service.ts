const PRESTAMOS_INICIALES: any[] = [];

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
      if (robot && robot.estado !== undefined) {
        const estadoAnterior = robot.estado;
        robot.estado = nuevoEstado;
        cambios++;
        console.log(`  ✓ Robot ${id}: ${estadoAnterior} → ${nuevoEstado}`);
      } else {
        console.log(`  ⚠️ Robot ${id} no encontrado o estructura inválida`);
      }
    });

    if (cambios > 0) {
      localStorage.setItem('robots-demo', JSON.stringify(robots));
      console.log(`🤖 ${cambios} robot(s) actualizados a ${nuevoEstado}`);
    }
  } catch (err) {
    console.error('❌ Error actualizando robots:', err);
    throw new Error(`Error al actualizar estado de robots: ${(err as any).message}`);
  }
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

  private savePrestamos(prestamos: any[]) {
    localStorage.setItem(this.key, JSON.stringify(prestamos));
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
    this.savePrestamos(prestamos);

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
    this.savePrestamos(prestamos);
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
    this.savePrestamos(prestamos);
    return prestamos[index];
  }

  async confirmarSalida(id: string, usuarioSalida?: { id: string; nombreCompleto: string }) {
    const prestamos = this.getPrestamos();
    const index = prestamos.findIndex(p => p.id === id);
    if (index === -1) throw new Error('Préstamo no encontrado');

    prestamos[index].estado = 'ACTIVO';
    prestamos[index].fechaSalida = new Date().toISOString();
    if (usuarioSalida) prestamos[index].usuarioSalida = usuarioSalida;
    this.savePrestamos(prestamos);

    // Actualizar robots a EN_PRESTAMO
    actualizarEstadoRobots(prestamos[index].robotIds || [], 'EN_PRESTAMO');

    return prestamos[index];
  }

  async confirmarRecepcion(id: string, usuarioRecepcion?: { id: string; nombreCompleto: string }) {
    const prestamos = this.getPrestamos();
    const index = prestamos.findIndex(p => p.id === id);
    if (index === -1) throw new Error('Préstamo no encontrado');

    prestamos[index].estado = 'COMPLETADO';
    prestamos[index].estadoRecepcion = 'CONFIRMADA';
    prestamos[index].fechaRecepcion = new Date().toISOString();
    if (usuarioRecepcion) prestamos[index].usuarioRecepcion = usuarioRecepcion;
    this.savePrestamos(prestamos);

    // Devolver robots a DISPONIBLE
    actualizarEstadoRobots(prestamos[index].robotIds || [], 'DISPONIBLE');

    return prestamos[index];
  }

  async reporteDemosActivas() {
    const prestamos = this.getPrestamos();
    return prestamos.filter(p => p.estado === 'ACTIVO');
  }
}

export const prestamoService = new PrestamoServiceLocal();
