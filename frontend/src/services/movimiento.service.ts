export type TipoMovimiento = 'Préstamo' | 'Retorno' | 'Mantenimiento' | 'Transferencia' | 'Recepción' | 'Envío' | 'Otro';

export interface Movimiento {
  id: string;
  robotId: string;
  ubicacionOrigen: string;
  ubicacionDestino: string;
  tipo: TipoMovimiento;
  razon: string;
  usuarioResponsable: {
    id: string;
    nombreCompleto: string;
    email: string;
  };
  fechaMovimiento: string;
  notas?: string;
  documentoAdjunto?: {
    name: string;
    url: string;
  };
}

class MovimientoServiceLocal {
  private key = 'movimientos-demo';

  private getMovimientos(): Movimiento[] {
    const stored = localStorage.getItem(this.key);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (err) {
        console.error('Error parseando movimientos:', err);
        return [];
      }
    }
    return [];
  }

  private saveMovimientos(movimientos: Movimiento[]) {
    localStorage.setItem(this.key, JSON.stringify(movimientos));
  }

  async registrar(movimiento: Omit<Movimiento, 'id'>): Promise<Movimiento> {
    const movimientos = this.getMovimientos();
    const nuevoId = Date.now().toString();

    const nuevo: Movimiento = {
      id: nuevoId,
      ...movimiento,
    };

    movimientos.push(nuevo);
    this.saveMovimientos(movimientos);
    console.log('📍 Movimiento registrado:', nuevoId);
    return nuevo;
  }

  async obtenerPorRobot(robotId: string): Promise<Movimiento[]> {
    const movimientos = this.getMovimientos();
    return movimientos
      .filter((m) => m.robotId === robotId)
      .sort((a, b) => new Date(b.fechaMovimiento).getTime() - new Date(a.fechaMovimiento).getTime());
  }

  async obtenerPorUbicacion(ubicacionId: string): Promise<Movimiento[]> {
    const movimientos = this.getMovimientos();
    return movimientos
      .filter((m) => m.ubicacionDestino === ubicacionId || m.ubicacionOrigen === ubicacionId)
      .sort((a, b) => new Date(b.fechaMovimiento).getTime() - new Date(a.fechaMovimiento).getTime());
  }

  async obtenerTodos(filtros?: {
    robotId?: string;
    ubicacion?: string;
    tipo?: TipoMovimiento;
    desde?: string;
    hasta?: string;
  }): Promise<Movimiento[]> {
    let movimientos = this.getMovimientos();

    if (filtros?.robotId) {
      movimientos = movimientos.filter((m) => m.robotId === filtros.robotId);
    }

    if (filtros?.ubicacion) {
      movimientos = movimientos.filter(
        (m) => m.ubicacionDestino === filtros.ubicacion || m.ubicacionOrigen === filtros.ubicacion
      );
    }

    if (filtros?.tipo) {
      movimientos = movimientos.filter((m) => m.tipo === filtros.tipo);
    }

    if (filtros?.desde) {
      const desde = new Date(filtros.desde).getTime();
      movimientos = movimientos.filter((m) => new Date(m.fechaMovimiento).getTime() >= desde);
    }

    if (filtros?.hasta) {
      const hasta = new Date(filtros.hasta).getTime();
      movimientos = movimientos.filter((m) => new Date(m.fechaMovimiento).getTime() <= hasta);
    }

    return movimientos.sort((a, b) => new Date(b.fechaMovimiento).getTime() - new Date(a.fechaMovimiento).getTime());
  }

  async obtenerUltimos(robotId: string, cantidad: number = 5): Promise<Movimiento[]> {
    const movimientos = await this.obtenerPorRobot(robotId);
    return movimientos.slice(0, cantidad);
  }

  async eliminar(id: string): Promise<void> {
    const movimientos = this.getMovimientos();
    const filtered = movimientos.filter((m) => m.id !== id);
    this.saveMovimientos(filtered);
  }

  async limpiarAntiguos(diasRetener: number = 365): Promise<number> {
    const movimientos = this.getMovimientos();
    const fecha = new Date();
    fecha.setDate(fecha.getDate() - diasRetener);

    const retenidos = movimientos.filter((m) => new Date(m.fechaMovimiento).getTime() >= fecha.getTime());
    const eliminados = movimientos.length - retenidos.length;

    this.saveMovimientos(retenidos);
    console.log(`🧹 ${eliminados} movimientos antiguos eliminados`);
    return eliminados;
  }
}

export const movimientoService = new MovimientoServiceLocal();
