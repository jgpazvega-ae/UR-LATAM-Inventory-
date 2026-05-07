const PRESTAMOS_INICIALES: any[] = [];

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

  async listar(filtros?: { estado?: string; usuario?: string }) {
    try {
      let prestamos = this.getPrestamos();

      if (filtros?.estado) {
        prestamos = prestamos.filter(p => p.estado === filtros.estado);
      }

      if (filtros?.usuario) {
        prestamos = prestamos.filter(p => p.usuario === filtros.usuario);
      }

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

  async aprobar(id: string) {
    const prestamos = this.getPrestamos();
    const index = prestamos.findIndex(p => p.id === id);
    if (index === -1) throw new Error('Préstamo no encontrado');

    prestamos[index].estado = 'APROBADO';
    this.savePrestamos(prestamos);
    return prestamos[index];
  }

  async rechazar(id: string, motivoRechazo: string) {
    const prestamos = this.getPrestamos();
    const index = prestamos.findIndex(p => p.id === id);
    if (index === -1) throw new Error('Préstamo no encontrado');

    prestamos[index].estado = 'RECHAZADO';
    prestamos[index].motivoRechazo = motivoRechazo;
    this.savePrestamos(prestamos);
    return prestamos[index];
  }

  async confirmarSalida(id: string) {
    const prestamos = this.getPrestamos();
    const index = prestamos.findIndex(p => p.id === id);
    if (index === -1) throw new Error('Préstamo no encontrado');

    prestamos[index].estado = 'ACTIVO';
    prestamos[index].fechaSalida = new Date().toISOString();
    this.savePrestamos(prestamos);
    return prestamos[index];
  }

  async confirmarRecepcion(id: string) {
    const prestamos = this.getPrestamos();
    const index = prestamos.findIndex(p => p.id === id);
    if (index === -1) throw new Error('Préstamo no encontrado');

    prestamos[index].estadoRecepcion = 'CONFIRMADA';
    prestamos[index].fechaRecepcion = new Date().toISOString();
    this.savePrestamos(prestamos);
    return prestamos[index];
  }

  async reporteDemosActivas() {
    const prestamos = this.getPrestamos();
    return prestamos.filter(p => p.estado === 'ACTIVO');
  }
}

export const prestamoService = new PrestamoServiceLocal();
