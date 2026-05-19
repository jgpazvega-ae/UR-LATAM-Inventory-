import { useEffect, useState } from 'react'
import { useRegionLanguage } from '../contexts/RegionLanguageContext'
import { useAuth } from '../contexts/AuthContext'
import { useNotification } from '../contexts/NotificationContext'
import { reportsService, ReportData } from '../services/reports.service'

type ReportType = 'inventario' | 'utilizacion' | 'movimientos' | 'ubicaciones' | 'riesgo'

const reportConfig: Record<
  ReportType,
  { titulo: string; descripcion: string; icono: string; color: string }
> = {
  inventario: {
    titulo: 'Inventario General',
    descripcion: 'Listado completo de todos los robots',
    icono: '📦',
    color: 'blue',
  },
  utilizacion: {
    titulo: 'Utilización por Robot',
    descripcion: 'Análisis detallado del uso de cada robot',
    icono: '📊',
    color: 'green',
  },
  movimientos: {
    titulo: 'Movimientos Históricos',
    descripcion: 'Historial de todos los préstamos y movimientos',
    icono: '📈',
    color: 'purple',
  },
  ubicaciones: {
    titulo: 'Análisis por Ubicación',
    descripcion: 'Distribución de robots por ubicación',
    icono: '📍',
    color: 'orange',
  },
  riesgo: {
    titulo: 'Robots en Riesgo',
    descripcion: 'Robots que requieren atención inmediata',
    icono: '⚠️',
    color: 'red',
  },
}

export default function ReportsPage() {
  const { currentRegion } = useRegionLanguage()
  const { isGerente, isAdmin } = useAuth()
  const { addNotification } = useNotification()

  const [reports, setReports] = useState<ReportData[]>([])
  const [selectedReport, setSelectedReport] = useState<ReportType | null>(null)
  const [loading, setLoading] = useState(false)
  const [generatingPDF, setGeneratingPDF] = useState(false)

  useEffect(() => {
    if (selectedReport) {
      cargarReporte(selectedReport)
    }
  }, [selectedReport, currentRegion])

  const cargarReporte = async (tipo: ReportType) => {
    setLoading(true)
    try {
      let data: ReportData

      switch (tipo) {
        case 'inventario':
          data = await reportsService.generarReporteInventario(currentRegion)
          break
        case 'utilizacion':
          data = await reportsService.generarReporteUtilizacion(currentRegion)
          break
        case 'movimientos':
          data = await reportsService.generarReporteMovimientos(currentRegion)
          break
        case 'ubicaciones':
          data = await reportsService.generarReporteUbicaciones(currentRegion)
          break
        case 'riesgo':
          data = await reportsService.generarReporteRobotesEnRiesgo(currentRegion)
          break
        default:
          return
      }

      setReports([data])
      addNotification('Reporte generado exitosamente', 'success')
    } catch (error: any) {
      addNotification('Error al generar reporte: ' + error.message, 'error')
      console.error('Error generando reporte:', error)
    } finally {
      setLoading(false)
    }
  }

  const descargarCSV = (report: ReportData) => {
    try {
      reportsService.descargarCSV(report)
      addNotification('Reporte descargado como CSV', 'success')
    } catch (error: any) {
      addNotification('Error al descargar CSV', 'error')
    }
  }

  const descargarPDF = async (report: ReportData) => {
    setGeneratingPDF(true)
    try {
      await reportsService.generarReportePDF(report)
      addNotification('Reporte descargado como PDF', 'success')
    } catch (error: any) {
      addNotification('Error al descargar PDF', 'error')
    } finally {
      setGeneratingPDF(false)
    }
  }

  const getColorClass = (color: string) => {
    switch (color) {
      case 'blue':
        return 'bg-blue-50 border-blue-200 hover:border-blue-400'
      case 'green':
        return 'bg-green-50 border-green-200 hover:border-green-400'
      case 'purple':
        return 'bg-purple-50 border-purple-200 hover:border-purple-400'
      case 'orange':
        return 'bg-orange-50 border-orange-200 hover:border-orange-400'
      case 'red':
        return 'bg-red-50 border-red-200 hover:border-red-400'
      default:
        return 'bg-gray-50 border-gray-200'
    }
  }

  const getTextColor = (color: string) => {
    switch (color) {
      case 'blue':
        return 'text-blue-700'
      case 'green':
        return 'text-green-700'
      case 'purple':
        return 'text-purple-700'
      case 'orange':
        return 'text-orange-700'
      case 'red':
        return 'text-red-700'
      default:
        return 'text-gray-700'
    }
  }

  if (!isGerente && !isAdmin) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-6 py-4 rounded-lg">
        <p className="font-medium">No tienes permisos para acceder a reportes</p>
        <p className="text-sm mt-1">Solo gerentes y administradores pueden generar reportes</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">📊 Centro de Reportes</h1>
        <p className="text-gray-600 mt-1">Genera reportes profesionales y exporta datos en múltiples formatos</p>
      </div>

      {selectedReport === null ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {(Object.entries(reportConfig) as Array<[ReportType, any]>).map(([tipo, config]) => (
            <button
              key={tipo}
              onClick={() => setSelectedReport(tipo)}
              className={`rounded-lg border-2 p-6 transition cursor-pointer text-left ${getColorClass(
                config.color
              )}`}
            >
              <div className="text-3xl mb-2">{config.icono}</div>
              <h3 className={`font-bold ${getTextColor(config.color)}`}>{config.titulo}</h3>
              <p className="text-sm text-gray-600 mt-2">{config.descripcion}</p>
              <div className="mt-4 text-sm font-medium text-gray-500">Haz clic para generar →</div>
            </button>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          <button
            onClick={() => {
              setSelectedReport(null)
              setReports([])
            }}
            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
          >
            ← Volver a reportes
          </button>

          {loading && (
            <div className="bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded">
              Generando reporte... por favor espera
            </div>
          )}

          {reports.map((report, idx) => (
            <div key={idx} className="space-y-4">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{report.titulo}</h2>
                    <p className="text-gray-600 mt-1">{report.descripcion}</p>
                    <p className="text-xs text-gray-500 mt-2">
                      Región: {report.region} • Generado:{' '}
                      {new Date(report.generadoEn).toLocaleString('es-ES')}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => descargarCSV(report)}
                      className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition"
                    >
                      📥 Descargar CSV
                    </button>
                    <button
                      onClick={() => descargarPDF(report)}
                      disabled={generatingPDF}
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition disabled:opacity-50"
                    >
                      {generatingPDF ? '⏳ Generando...' : '📥 Descargar PDF'}
                    </button>
                  </div>
                </div>

                <div className="mt-4 p-4 bg-gray-50 rounded">
                  <p className="text-sm text-gray-600 mb-2 font-medium">Total de registros: {report.datos.length}</p>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="overflow-x-auto">
                  {report.datos.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">
                      No hay datos para mostrar en este reporte
                    </div>
                  ) : (
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b">
                        <tr>
                          {Object.keys(report.datos[0]).map((key) => (
                            <th
                              key={key}
                              className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider"
                            >
                              {key}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {report.datos.slice(0, 50).map((row: any, idx: number) => (
                          <tr key={idx} className="hover:bg-gray-50">
                            {Object.keys(row).map((key) => (
                              <td key={key} className="px-6 py-3 text-sm text-gray-700">
                                {row[key] || '-'}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>

              {report.datos.length > 50 && (
                <div className="bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded text-sm">
                  Mostrando 50 de {report.datos.length} registros. Descargar el archivo para ver todos.
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
