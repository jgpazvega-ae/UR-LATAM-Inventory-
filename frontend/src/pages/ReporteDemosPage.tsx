import { useEffect, useState } from 'react'
import { prestamoService } from '../services/prestamo.service'
import { robotService } from '../services/robot.service'

const formatFecha = (fecha?: string) =>
  fecha ? new Date(fecha).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'

export default function ReporteDemosPage() {
  const [demos, setDemos] = useState<any[]>([])
  const [robots, setRobots] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const cargar = async () => {
      try {
        console.log('📊 Cargando reporte de demos...')
        const [data, robotsData] = await Promise.all([
          prestamoService.reporteDemosActivas(),
          robotService.obtenerTodosLosRobots(),
        ])

        const ahora = new Date()
        const demosConCalculos = (data || []).map((d: any) => {
          const fechaFin = new Date(d.fechaFin || d.fechaFinSolicitada || ahora)
          const diasRestantes = Math.ceil((fechaFin.getTime() - ahora.getTime()) / (1000 * 60 * 60 * 24))
          return {
            ...d,
            vigente: diasRestantes >= 0,
            diasRestantes,
          }
        })

        console.log('✅ Demos cargadas:', demosConCalculos.length)
        setDemos(demosConCalculos)
        setRobots(robotsData || [])
      } catch (err) {
        console.error('❌ Error cargando reporte:', err)
        setError('Error al cargar el reporte de demos')
      } finally {
        setLoading(false)
      }
    }
    cargar()
  }, [])

  const getRobotsSeries = (robotIds: string[]) => {
    if (!robotIds || robotIds.length === 0) return '-'
    return robotIds
      .map(id => robots.find(r => r.id === id)?.numeroSerie || id)
      .join(', ')
  }

  if (loading) return <div className="text-center py-8">Cargando reporte...</div>

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">📊 Reporte de Demos en Préstamo</h1>
        <p className="text-gray-600 mt-1">Todas las demos activas con estado de vigencia</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-6 border-b">
          <p className="text-sm text-gray-600">
            Total de demos en préstamo: <strong className="text-lg">{demos.length}</strong>
          </p>
        </div>

        {demos.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No hay demos en préstamo actualmente
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Solicitud</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Robots</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Motivo</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Fecha Inicio</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Fecha Fin</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Estado</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Días Restantes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {demos.map((demo: any) => (
                  <tr key={demo.id} className={demo.vigente ? 'hover:bg-gray-50' : 'hover:bg-red-50 bg-red-50'}>
                    <td className="px-6 py-3 font-mono text-sm font-medium">
                      {demo.numeroSolicitud}
                    </td>
                    <td className="px-6 py-3 text-sm">
                      <div className="max-w-xs text-xs">
                        {getRobotsSeries(demo.robotIds)}
                      </div>
                    </td>
                    <td className="px-6 py-3 text-sm">
                      <div className="max-w-xs truncate" title={demo.motivo}>
                        {demo.motivo?.substring(0, 30)}...
                      </div>
                    </td>
                    <td className="px-6 py-3 text-sm text-gray-600">
                      {formatFecha(demo.fechaInicio || demo.fechaInioSolicitada)}
                    </td>
                    <td className="px-6 py-3 text-sm text-gray-600">
                      {formatFecha(demo.fechaFin || demo.fechaFinSolicitada)}
                    </td>
                    <td className="px-6 py-3">
                      <span className={`text-xs px-2 py-1 rounded font-medium ${
                        demo.vigente
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {demo.vigente ? '✓ VIGENTE' : '❌ VENCIDO'}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-sm font-medium">
                      <span className={demo.vigente ? 'text-green-600' : 'text-red-600'}>
                        {demo.diasRestantes > 0 ? `+${demo.diasRestantes}` : demo.diasRestantes} días
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {demos.length > 0 && (
          <div className="p-6 border-t bg-gray-50">
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-sm text-gray-600">Vigentes</p>
                <p className="text-2xl font-bold text-green-600">
                  {demos.filter((d: any) => d.vigente).length}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600">Vencidos</p>
                <p className="text-2xl font-bold text-red-600">
                  {demos.filter((d: any) => !d.vigente).length}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600">Total</p>
                <p className="text-2xl font-bold text-gray-900">{demos.length}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
