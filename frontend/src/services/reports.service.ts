import { robotService } from './robot.service'
import { prestamoService } from './prestamo.service'
import { ubicacionService } from './ubicacion.service'

export interface ReportData {
  titulo: string
  descripcion: string
  generadoEn: string
  region: string
  datos: any[]
}

class ReportsService {
  async generarReporteInventario(region: string): Promise<ReportData> {
    const robots = await robotService.listar({ region })
    const ahora = new Date()

    const datos = robots.map((r: any) => ({
      numeroSerie: r.numeroSerie,
      modelo: r.modelo,
      familia: r.familia?.nombreFamilia || 'N/A',
      estado: r.estado,
      ubicacion: r.ubicacionActual || 'No asignada',
      createdAt: r.createdAt || 'N/A',
    }))

    return {
      titulo: 'Reporte de Inventario General',
      descripcion: 'Listado completo de todos los robots con estado actual',
      generadoEn: ahora.toISOString(),
      region,
      datos,
    }
  }

  async generarReporteUtilizacion(region: string): Promise<ReportData> {
    const [robots, prestamos] = await Promise.all([
      robotService.listar({ region }),
      prestamoService.listar({ region }),
    ])

    const ahora = new Date()
    const datos = robots.map((r: any) => {
      const prestamoActivo = prestamos.find(
        (p: any) => p.robotIds?.includes(r.id) && p.estado === 'ACTIVO'
      )

      const tasaUso = prestamos.filter((p: any) =>
        p.robotIds?.includes(r.id) && p.estado === 'COMPLETADO'
      ).length

      return {
        numeroSerie: r.numeroSerie,
        modelo: r.modelo,
        estado: r.estado,
        enPrestamo: prestamoActivo ? 'Sí' : 'No',
        solicitudActiva: prestamoActivo?.numeroSolicitud || '-',
        prestamosPrevios: tasaUso,
        ultimaFecha: prestamoActivo?.fechaInicio || 'Nunca utilizado',
      }
    })

    return {
      titulo: 'Reporte de Utilización por Robot',
      descripcion: 'Análisis detallado del uso de cada robot en el periodo',
      generadoEn: ahora.toISOString(),
      region,
      datos,
    }
  }

  async generarReporteMovimientos(region: string): Promise<ReportData> {
    const prestamos = await prestamoService.listar({ region })

    const datos = prestamos
      .filter((p: any) => p.estado === 'COMPLETADO' || p.estado === 'ACTIVO')
      .map((p: any) => ({
        numeroSolicitud: p.numeroSolicitud,
        solicitante: p.usuarioSolicitante?.nombreCompleto || 'Desconocido',
        fechaInicio: p.fechaInicio || p.fechaInioSolicitada || '-',
        fechaFin: p.fechaFin || p.fechaFinSolicitada || '-',
        duracion: this.calcularDuracion(
          p.fechaInicio || p.fechaInioSolicitada,
          p.fechaFin || p.fechaFinSolicitada
        ),
        estado: p.estado,
        razon: p.razon || p.observaciones || '-',
        robotsCount: p.robotIds?.length || 0,
      }))
      .sort(
        (a, b) => new Date(b.fechaInicio).getTime() - new Date(a.fechaInicio).getTime()
      )

    return {
      titulo: 'Reporte de Movimientos Históricos',
      descripcion: 'Historial de todos los movimientos y préstamos registrados',
      generadoEn: new Date().toISOString(),
      region,
      datos,
    }
  }

  async generarReporteUbicaciones(region: string): Promise<ReportData> {
    const [ubicaciones, robots] = await Promise.all([
      ubicacionService.listar({ region } as any),
      robotService.listar({ region }),
    ])

    const datos = ubicaciones.map((ub: any) => {
      const robotsEnUbicacion = robots.filter((r: any) => r.ubicacionActual === ub.id)
      const disponibles = robotsEnUbicacion.filter((r: any) => r.estado === 'DISPONIBLE')
      const enPrestamo = robotsEnUbicacion.filter((r: any) => r.estado === 'EN_PRESTAMO')
      const mantenimiento = robotsEnUbicacion.filter((r: any) => r.estado === 'MANTENIMIENTO')

      return {
        nombre: ub.nombre,
        tipo: ub.tipo,
        ciudad: ub.ciudad,
        contacto: ub.contacto?.nombre || '-',
        totalRobots: robotsEnUbicacion.length,
        disponibles: disponibles.length,
        enPrestamo: enPrestamo.length,
        mantenimiento: mantenimiento.length,
        estado: ub.estado,
      }
    })

    return {
      titulo: 'Reporte de Análisis por Ubicación',
      descripcion: 'Distribución y estado de robots por cada ubicación',
      generadoEn: new Date().toISOString(),
      region,
      datos,
    }
  }

  async generarReporteRobotesEnRiesgo(region: string): Promise<ReportData> {
    const [robots, prestamos] = await Promise.all([
      robotService.listar({ region }),
      prestamoService.listar({ region }),
    ])

    const ahora = new Date()
    const datos = robots
      .filter((r: any) => r.estado !== 'DISPONIBLE')
      .map((r: any) => {
        const prestamoActivo = prestamos.find((p: any) =>
          p.robotIds?.includes(r.id) && p.estado === 'ACTIVO'
        )
        const diasEnUso = prestamoActivo
          ? Math.ceil(
              (ahora.getTime() - new Date(prestamoActivo.fechaInicio || prestamoActivo.fechaInioSolicitada).getTime()) /
              (1000 * 60 * 60 * 24)
            )
          : 0

        return {
          numeroSerie: r.numeroSerie,
          modelo: r.modelo,
          estado: r.estado,
          diasEnUso,
          solicitante: prestamoActivo?.usuarioSolicitante?.nombreCompleto || '-',
          fechaInicio: prestamoActivo?.fechaInicio || prestamoActivo?.fechaInioSolicitada || '-',
          razon: r.estado === 'MANTENIMIENTO' ? 'Mantenimiento' : 'En préstamo',
        }
      })

    return {
      titulo: 'Reporte de Robots en Riesgo',
      descripcion: 'Robots que requieren atención inmediata (sin servicio o vencidos)',
      generadoEn: new Date().toISOString(),
      region,
      datos,
    }
  }

  private calcularDuracion(inicio: string, fin: string): string {
    if (!inicio || !fin) return '-'
    const ms = new Date(fin).getTime() - new Date(inicio).getTime()
    const dias = Math.floor(ms / (1000 * 60 * 60 * 24))
    const horas = Math.floor((ms % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    return `${dias}d ${horas}h`
  }

  exportarCSV(data: ReportData): string {
    const headers = Object.keys(data.datos[0] || {})
    const rows = data.datos.map((d: any) => headers.map((h) => this.escapeCSV(d[h])).join(','))

    const contenido = [
      `Reporte: ${data.titulo}`,
      `Descripción: ${data.descripcion}`,
      `Región: ${data.region}`,
      `Fecha de generación: ${new Date(data.generadoEn).toLocaleString('es-ES')}`,
      '',
      headers.join(','),
      ...rows,
    ].join('\n')

    return contenido
  }

  private escapeCSV(value: any): string {
    if (value === null || value === undefined) return ''
    const str = String(value)
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`
    }
    return str
  }

  descargarCSV(data: ReportData): void {
    const csv = this.exportarCSV(data)
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `${data.titulo.toLowerCase().replace(/\s+/g, '_')}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  async generarReportePDF(data: ReportData): Promise<void> {
    try {
      const { jsPDF } = await import('jspdf')

      const doc = new jsPDF() as any
      let yPosition = 20

      doc.setFontSize(18)
      doc.text(data.titulo, 20, yPosition)
      yPosition += 10

      doc.setFontSize(10)
      doc.setTextColor(100)
      doc.text(`Región: ${data.region}`, 20, yPosition)
      yPosition += 5
      doc.text(
        `Generado: ${new Date(data.generadoEn).toLocaleString('es-ES')}`,
        20,
        yPosition
      )
      yPosition += 5
      doc.text(`Descripción: ${data.descripcion}`, 20, yPosition)
      yPosition += 10

      doc.setTextColor(0)
      doc.setFontSize(11)

      const headers = Object.keys(data.datos[0] || {})
      doc.text(`Total de registros: ${data.datos.length}`, 20, yPosition)
      yPosition += 8

      doc.setFontSize(9)
      doc.setFont(undefined, 'bold')
      headers.forEach((header, idx) => {
        const xPos = 20 + idx * 40
        if (xPos < 190) {
          doc.text(header, xPos, yPosition)
        }
      })
      yPosition += 8

      doc.setFont(undefined, 'normal')
      data.datos.slice(0, 30).forEach((row: any) => {
        if (yPosition > 270) {
          doc.addPage()
          yPosition = 20
        }
        headers.forEach((header, idx) => {
          const xPos = 20 + idx * 40
          if (xPos < 190) {
            const cellValue = String(row[header] || '-').substring(0, 10)
            doc.text(cellValue, xPos, yPosition)
          }
        })
        yPosition += 6
      })

      if (data.datos.length > 30) {
        doc.text(`... y ${data.datos.length - 30} registros más.`, 20, yPosition + 5)
      }

      const filename = `${data.titulo.toLowerCase().replace(/\s+/g, '_')}.pdf`
      doc.save(filename)
    } catch (error) {
      console.error('Error generando PDF:', error)
      alert('Error al generar el PDF. Intente descargar como CSV.')
    }
  }
}

export const reportsService = new ReportsService()
