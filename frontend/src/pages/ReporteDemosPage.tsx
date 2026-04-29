import { useEffect, useState } from 'react'
import { prestamoService } from '../services/prestamo.service'

const formatFecha = (fecha: string) =>
  new Date(fecha).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })

export default function ReporteDemosPage() {
  const [demos, setDemos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const cargar = async () => {
      try {
        const data = await prestamoService.reporteDemosActivas()
        setDemos(data || [])
      } catch (err) {
        console.error(err)
        setError('Error al cargar el reporte de demos')
      } finally {
        setLoading(false)
      }
    }
    cargar()
  }, [])

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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Solicitante</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Distribuidor</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Robots</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Fecha Inicio</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Fecha Fin</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Estado</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Días Restantes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {demos.map((demo) => (
                  <tr key={demo.id} className={demo.vigente ? 'hover:bg-gray-50' : 'hover:bg-red-50 bg-red-50'}>
                    <td className="px-6 py-3 font-mono text-sm font-medium">
                      {demo.numeroSolicitud}
                    </td>
                    <td className="px-6 py-3 text-sm">
                      <div className="font-medium">{demo.usuarioSolicitante.nombreCompleto}</div>
                      <div className="text-xs text-gray-500">{demo.usuarioSolicitante.email}</div>
                    </td>
                    <td className="px-6 py-3 text-sm">{demo.distribuidor?.nombre || '-'}</td>
                    <td className="px-6 py-3 text-sm">
                      <div className="max-w-xs">
                        {demo.detalles.map((d: any) => (
                          <div key={d.id} className="text-xs py-1">
                            {d.robot.numeroSerie}
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-3 text-sm text-gray-600">
                      {formatFecha(demo.fechaInioSolicitada)}
                    </td>
                    <td className="px-6 py-3 text-sm text-gray-600">
                      {formatFecha(demo.fechaFinSolicitada)}
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
                  {demos.filter((d) => d.vigente).length}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600">Vencidos</p>
                <p className="text-2xl font-bold text-red-600">
                  {demos.filter((d) => !d.vigente).length}
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
