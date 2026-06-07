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
      const nombreReporte = reportConfig[tipo]?.titulo || tipo

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
      addNotification(
        `${nombreReporte} generado con ${data.datos.length} registros`,
        'success',
        3000,
        '📊 Reporte Generado'
      )
    } catch (error: any) {
      addNotification(
        error.message || 'No se pudo generar el reporte',
        'error',
        4000,
        '❌ Error al Generar'
      )
      console.error('Error generando reporte:', error)
    } finally {
      setLoading(false)
    }
  }

  const descargarCSV = (report: ReportData) => {
    try {
      reportsService.descargarCSV(report)
      addNotification(
        `${report.titulo} descargado en formato CSV (${report.datos.length} registros)`,
        'success',
        3000,
        '📥 Descarga Completada'
      )
    } catch (error: any) {
      addNotification(
        error.message || 'No se pudo descargar el archivo CSV',
        'error',
        4000,
        '❌ Error en Descarga'
      )
    }
  }

  const descargarPDF = async (report: ReportData) => {
    setGeneratingPDF(true)
    try {
      await reportsService.generarReportePDF(report)
      addNotification(
        `${report.titulo} descargado en formato PDF`,
        'success',
        3000,
        '📥 Descarga Completada'
      )
    } catch (error: any) {
      addNotification(
        error.message || 'No se pudo generar el archivo PDF',
        'error',
        4000,
        '❌ Error en Descarga'
      )
    } finally {
      setGeneratingPDF(false)
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
      <div className="card-premium border-l-4 border-l-yellow-500 bg-gradient-to-r from-yellow-50 to-amber-50 p-6">
        <div className="flex items-center gap-4">
          <div className="text-4xl">⛔</div>
          <div>
            <p className="font-bold text-yellow-900 text-lg">Acceso Denegado</p>
            <p className="text-sm text-yellow-700 mt-1">Solo gerentes y administradores pueden generar reportes</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      <div>
        <h1 className="text-4xl font-bold gradient-text-primary">Centro de Reportes</h1>
        <p className="text-gray-600 mt-3 font-medium">Genera reportes profesionales y exporta datos en múltiples formatos</p>
      </div>

      {selectedReport === null ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {(Object.entries(reportConfig) as Array<[ReportType, any]>).map(([tipo, config]) => (
            <button
              key={tipo}
              onClick={() => setSelectedReport(tipo)}
              className={`card-premium p-6 transition-all hover:scale-102 cursor-pointer text-left bg-gradient-to-br ${
                config.color === 'blue' ? 'from-blue-50 to-cyan-50 border-blue-100' :
                config.color === 'green' ? 'from-green-50 to-emerald-50 border-green-100' :
                config.color === 'purple' ? 'from-purple-50 to-pink-50 border-purple-100' :
                config.color === 'orange' ? 'from-orange-50 to-amber-50 border-orange-100' :
                'from-red-50 to-rose-50 border-red-100'
              }`}
            >
              <div className="text-4xl mb-3">{config.icono}</div>
              <h3 className={`font-bold text-lg ${getTextColor(config.color)}`}>{config.titulo}</h3>
              <p className="text-sm text-gray-600 mt-2">{config.descripcion}</p>
              <div className="mt-4 text-sm font-bold text-gray-500 flex items-center gap-1">
                Haz clic para generar <span>→</span>
              </div>
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
            className="btn-secondary"
          >
            ← Volver a reportes
          </button>

          {loading && (
            <div className="card-premium bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-100 p-6 flex items-center gap-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <div>
                <p className="font-semibold text-blue-900">Generando reporte...</p>
                <p className="text-sm text-blue-700">Por favor espera mientras procesamos los datos</p>
              </div>
            </div>
          )}

          {reports.map((report, idx) => (
            <div key={idx} className="space-y-5">
              <div className="card-premium p-6 bg-gradient-to-br from-white to-gray-50">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-3xl font-bold gradient-text-primary">{report.titulo}</h2>
                    <p className="text-gray-600 mt-2">{report.descripcion}</p>
                    <p className="text-xs text-gray-500 mt-3 flex items-center gap-2">
                      <span>🌍 {report.region}</span>
                      <span>•</span>
                      <span>📅 {new Date(report.generadoEn).toLocaleString('es-ES')}</span>
                      <span>•</span>
                      <span>📊 {report.datos.length} registros</span>
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => descargarCSV(report)}
                      className="btn-secondary text-sm"
                    >
                      📥 CSV
                    </button>
                    <button
                      onClick={() => descargarPDF(report)}
                      disabled={generatingPDF}
                      className="btn-primary text-sm disabled:opacity-50"
                    >
                      {generatingPDF ? '⏳ Generando PDF...' : '📥 PDF'}
                    </button>
                  </div>
                </div>
              </div>

              <div className="card-premium overflow-hidden">
                <div className="overflow-x-auto">
                  {report.datos.length === 0 ? (
                    <div className="p-12 text-center">
                      <div className="text-5xl mb-4">📭</div>
                      <p className="text-gray-600 font-medium">No hay datos para mostrar en este reporte</p>
                    </div>
                  ) : (
                    <table className="table-premium">
                      <thead>
                        <tr>
                          {Object.keys(report.datos[0]).map((key) => (
                            <th key={key}>{key}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {report.datos.slice(0, 50).map((row: any, idx: number) => (
                          <tr key={idx}>
                            {Object.keys(row).map((key) => (
                              <td key={key} className="text-gray-700">
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
                <div className="card-premium bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-100 p-4">
                  <p className="text-sm text-blue-700 flex items-center gap-2">
                    <span>ℹ️</span>
                    Mostrando <strong>50 de {report.datos.length}</strong> registros. Descargar el archivo para ver todos.
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
