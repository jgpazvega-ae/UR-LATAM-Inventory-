export interface MaintenanceRecord {
  id: string
  robotId: string
  tipo: 'Preventivo' | 'Correctivo' | 'Inspección'
  estado: 'Pendiente' | 'En Progreso' | 'Completado' | 'Cancelado'
  descripcion: string
  tecnico: {
    nombre: string
    email: string
    telefono: string
  }
  fechaProgramada: string
  fechaCompletado?: string
  notas?: string
  piezasReemplazadas?: Array<{
    nombre: string
    cantidad: number
    costo?: number
  }>
  tiempoEmpleado?: number
  proximaFechaMantenimiento?: string
  createdAt: string
}

const MANTENIMIENTOS_INICIALES: MaintenanceRecord[] = []

const intervalosDias: Record<string, number> = {
  Preventivo: 90,
  Correctivo: 0,
  Inspección: 30,
}

class MaintenanceServiceLocal {
  private key = 'mantenimientos-demo'

  private getMantenimientos(): MaintenanceRecord[] {
    const stored = localStorage.getItem(this.key)
    if (stored) {
      try {
        return JSON.parse(stored)
      } catch (err) {
        console.error('Error parseando mantenimientos:', err)
        return MANTENIMIENTOS_INICIALES
      }
    }
    localStorage.setItem(this.key, JSON.stringify(MANTENIMIENTOS_INICIALES))
    return MANTENIMIENTOS_INICIALES
  }

  private saveMantenimientos(mantenimientos: MaintenanceRecord[]) {
    localStorage.setItem(this.key, JSON.stringify(mantenimientos))
  }

  async listar(filtros?: {
    robotId?: string
    estado?: string
    tipo?: string
  }): Promise<MaintenanceRecord[]> {
    let mantenimientos = this.getMantenimientos()

    if (filtros?.robotId) {
      mantenimientos = mantenimientos.filter((m) => m.robotId === filtros.robotId)
    }

    if (filtros?.estado) {
      mantenimientos = mantenimientos.filter((m) => m.estado === filtros.estado)
    }

    if (filtros?.tipo) {
      mantenimientos = mantenimientos.filter((m) => m.tipo === filtros.tipo)
    }

    return mantenimientos.sort(
      (a, b) => new Date(b.fechaProgramada).getTime() - new Date(a.fechaProgramada).getTime()
    )
  }

  async obtener(id: string): Promise<MaintenanceRecord | undefined> {
    const mantenimientos = this.getMantenimientos()
    return mantenimientos.find((m) => m.id === id)
  }

  async crear(data: Omit<MaintenanceRecord, 'id' | 'createdAt'>): Promise<MaintenanceRecord> {
    const mantenimientos = this.getMantenimientos()
    const nuevoId = `mnt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

    const nuevo: MaintenanceRecord = {
      id: nuevoId,
      ...data,
      createdAt: new Date().toISOString(),
    }

    mantenimientos.push(nuevo)
    this.saveMantenimientos(mantenimientos)
    console.log('✅ Mantenimiento creado:', nuevoId)
    return nuevo
  }

  async actualizar(id: string, data: Partial<MaintenanceRecord>): Promise<MaintenanceRecord> {
    const mantenimientos = this.getMantenimientos()
    const index = mantenimientos.findIndex((m) => m.id === id)

    if (index === -1) throw new Error('Mantenimiento no encontrado')

    mantenimientos[index] = {
      ...mantenimientos[index],
      ...data,
    }

    this.saveMantenimientos(mantenimientos)
    return mantenimientos[index]
  }

  async completar(
    id: string,
    notas?: string,
    piezasReemplazadas?: Array<{ nombre: string; cantidad: number; costo?: number }>,
    tiempoEmpleado?: number
  ): Promise<MaintenanceRecord> {
    const mantenimientos = this.getMantenimientos()
    const index = mantenimientos.findIndex((m) => m.id === id)

    if (index === -1) throw new Error('Mantenimiento no encontrado')

    const ahora = new Date()
    const proximaFecha = new Date(ahora)
    const intervalo = intervalosDias[mantenimientos[index].tipo] || 90
    proximaFecha.setDate(proximaFecha.getDate() + intervalo)

    mantenimientos[index] = {
      ...mantenimientos[index],
      estado: 'Completado',
      fechaCompletado: ahora.toISOString(),
      notas,
      piezasReemplazadas,
      tiempoEmpleado,
      proximaFechaMantenimiento: proximaFecha.toISOString(),
    }

    this.saveMantenimientos(mantenimientos)
    console.log('✅ Mantenimiento completado:', id)
    return mantenimientos[index]
  }

  async cancelar(id: string): Promise<void> {
    const mantenimientos = this.getMantenimientos()
    const index = mantenimientos.findIndex((m) => m.id === id)

    if (index === -1) throw new Error('Mantenimiento no encontrado')

    mantenimientos[index].estado = 'Cancelado'
    this.saveMantenimientos(mantenimientos)
  }

  async obtenerProximos(robotId: string, dias: number = 30): Promise<MaintenanceRecord[]> {
    const mantenimientos = this.getMantenimientos()
    const ahora = new Date()
    const limite = new Date(ahora.getTime() + dias * 24 * 60 * 60 * 1000)

    return mantenimientos.filter((m) => {
      if (m.robotId !== robotId || m.estado === 'Completado' || m.estado === 'Cancelado') {
        return false
      }
      const fecha = new Date(m.fechaProgramada)
      return fecha >= ahora && fecha <= limite
    })
  }

  async obtenerVencidos(): Promise<MaintenanceRecord[]> {
    const mantenimientos = this.getMantenimientos()
    const ahora = new Date()

    return mantenimientos.filter((m) => {
      if (m.estado !== 'Pendiente' && m.estado !== 'En Progreso') return false
      return new Date(m.fechaProgramada) < ahora
    })
  }

  async generarReporteMensual(
    robotId?: string
  ): Promise<{
    totalMantenimientos: number
    completados: number
    pendientes: number
    costoTotal: number
    tiempoTotal: number
  }> {
    const mantenimientos = this.getMantenimientos()
    const ahora = new Date()
    const hace30Dias = new Date(ahora.getTime() - 30 * 24 * 60 * 60 * 1000)

    let filtered = mantenimientos.filter(
      (m) => new Date(m.createdAt) >= hace30Dias && new Date(m.createdAt) <= ahora
    )

    if (robotId) {
      filtered = filtered.filter((m) => m.robotId === robotId)
    }

    return {
      totalMantenimientos: filtered.length,
      completados: filtered.filter((m) => m.estado === 'Completado').length,
      pendientes: filtered.filter((m) => m.estado === 'Pendiente' || m.estado === 'En Progreso')
        .length,
      costoTotal: filtered.reduce((sum, m) => {
        const piezas = m.piezasReemplazadas || []
        return sum + piezas.reduce((s, p) => s + (p.costo || 0), 0)
      }, 0),
      tiempoTotal: filtered.reduce((sum, m) => sum + (m.tiempoEmpleado || 0), 0),
    }
  }

  async eliminar(id: string): Promise<void> {
    const mantenimientos = this.getMantenimientos()
    const filtered = mantenimientos.filter((m) => m.id !== id)
    this.saveMantenimientos(filtered)
  }
}

export const maintenanceService = new MaintenanceServiceLocal()
