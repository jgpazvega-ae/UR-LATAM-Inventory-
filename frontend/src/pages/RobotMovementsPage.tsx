import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { robotService } from '../services/robot.service'
import { movimientoService } from '../services/movimiento.service'
import { ubicacionService } from '../services/ubicacion.service'
import { useRegionLanguage } from '../contexts/RegionLanguageContext'

interface MovimientoConDetalles {
  id: string
  robotId: string
  ubicacionOrigen?: string
  ubicacionDestino?: string
  tipo: string
  razon: string
  usuarioResponsable: { nombreCompleto: string; email: string }
  fechaMovimiento: string
  notas?: string
  diasEnUbicacion?: number
}

const iconoPorTipo = {
  'Préstamo': '📤',
  'Retorno': '📥',
  'Mantenimiento': '🔧',
  'Transferencia': '↔️',
  'Recepción': '📦',
  'Envío': '🚚',
  'Otro': '📍',
}

const colorPorTipo: Record<string, string> = {
  'Préstamo': 'border-blue-300 bg-blue-50',
  'Retorno': 'border-green-300 bg-green-50',
  'Mantenimiento': 'border-orange-300 bg-orange-50',
  'Transferencia': 'border-purple-300 bg-purple-50',
  'Recepción': 'border-gray-300 bg-gray-50',
  'Envío': 'border-red-300 bg-red-50',
  'Otro': 'border-gray-300 bg-gray-50',
}

export default function RobotMovementsPage() {
  const { robotId } = useParams<{ robotId: string }>()
  const navigate = useNavigate()
  const { currentRegion } = useRegionLanguage()

  const [robot, setRobot] = useState<any | null>(null)
  const [movimientos, setMovimientos] = useState<MovimientoConDetalles[]>([])
  const [ubicaciones, setUbicaciones] = useState<Map<string, any>>(new Map())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    cargar()
  }, [robotId, currentRegion])

  const cargar = async () => {
    setLoading(true)
    setError('')
    try {
      if (!robotId) {
        setError('ID de robot no especificado')
        return
      }

      const [robData, ubs] = await Promise.all([
        robotService.obtener(robotId),
        ubicacionService.listar({ region: currentRegion } as any),
      ])

      setRobot(robData)

      const ubicacionesMap = new Map(ubs.map((u: any) => [u.id, u]))
      setUbicaciones(ubicacionesMap)

      const movs = await movimientoService.obtenerPorRobot(robotId)
      const movsOrdenados = movs.sort((a, b) =>
        new Date(b.fechaMovimiento).getTime() - new Date(a.fechaMovimiento).getTime()
      )

      const movsConDetalles: MovimientoConDetalles[] = movsOrdenados.map((m: any, idx: number) => ({
        ...m,
        diasEnUbicacion:
          idx < movsOrdenados.length - 1
            ? Math.ceil(
                (new Date(movsOrdenados[idx].fechaMovimiento).getTime() -
                  new Date(movsOrdenados[idx + 1].fechaMovimiento).getTime()) /
                (1000 * 60 * 60 * 24)
              )
            : undefined,
      }))

      setMovimientos(movsConDetalles)
    } catch (err: any) {
      console.error('Error cargando movimientos:', err)
      setError('Error al cargar los movimientos del robot')
    } finally {
      setLoading(false)
    }
  }

  const getNombreUbicacion = (ubicacionId?: string) => {
    if (!ubicacionId) return 'Ubicación no asignada'
    const ub = ubicaciones.get(ubicacionId)
    return ub?.nombre || `Ubicación ${ubicacionId}`
  }

  if (loading) {
    return <div className="text-center py-8">Cargando historial de movimientos...</div>
  }

  if (!robot) {
    return (
      <div className="space-y-4">
        <button
          onClick={() => navigate('/robots')}
          className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
        >
          ← Volver a robots
        </button>
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded">
          {error || 'Robot no encontrado'}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <button
        onClick={() => navigate('/robots')}
        className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
      >
        ← Volver a robots
      </button>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">🤖 Historial de Movimientos</h1>
            <p className="text-gray-600 mt-2">
              <strong>{robot.numeroSerie}</strong> · {robot.modelo}
            </p>
          </div>
          <span
            className={`px-4 py-2 rounded-lg font-medium text-sm ${
              robot.estado === 'DISPONIBLE'
                ? 'bg-green-100 text-green-800'
                : robot.estado === 'EN_PRESTAMO'
                  ? 'bg-blue-100 text-blue-800'
                  : robot.estado === 'MANTENIMIENTO'
                    ? 'bg-orange-100 text-orange-800'
                    : 'bg-gray-100 text-gray-800'
            }`}
          >
            {robot.estado}
          </span>
        </div>

        {movimientos.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p className="mb-4">No hay movimientos registrados para este robot</p>
            <button
              onClick={() => navigate('/robots')}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
            >
              Ir a robots
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-sm text-gray-600 mb-4">
              Total de movimientos: <strong>{movimientos.length}</strong>
            </div>

            <div className="relative">
              {movimientos.map((mov, idx) => {
                const tipo = mov.tipo as keyof typeof iconoPorTipo
                const icono = iconoPorTipo[tipo] || '📍'
                const colorClass = colorPorTipo[tipo] || colorPorTipo['Otro']

                return (
                  <div key={mov.id} className="relative mb-6">
                    <div className="flex">
                      <div className="flex flex-col items-center mr-6">
                        <div
                          className={`w-12 h-12 rounded-full border-4 flex items-center justify-center text-xl ${colorClass}`}
                        >
                          {icono}
                        </div>
                        {idx < movimientos.length - 1 && (
                          <div className="w-1 h-20 bg-gray-200 my-2"></div>
                        )}
                      </div>

                      <div className={`flex-1 rounded-lg border-2 p-4 ${colorClass}`}>
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="font-bold text-gray-900">{mov.tipo}</h3>
                            <p className="text-sm text-gray-600 mt-1">
                              {new Date(mov.fechaMovimiento).toLocaleString('es-ES')}
                            </p>
                          </div>
                          {mov.diasEnUbicacion !== undefined && (
                            <span className="text-xs bg-white px-2 py-1 rounded font-medium">
                              {mov.diasEnUbicacion} días
                            </span>
                          )}
                        </div>

                        <div className="space-y-2 text-sm">
                          {(mov.ubicacionOrigen || mov.ubicacionDestino) && (
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-xs text-gray-600">Origen</p>
                                <p className="font-medium">
                                  {getNombreUbicacion(mov.ubicacionOrigen)}
                                </p>
                              </div>
                              <span className="text-lg">→</span>
                              <div>
                                <p className="text-xs text-gray-600">Destino</p>
                                <p className="font-medium">
                                  {getNombreUbicacion(mov.ubicacionDestino)}
                                </p>
                              </div>
                            </div>
                          )}

                          {mov.razon && (
                            <div className="pt-2 border-t border-current border-opacity-20">
                              <p className="text-xs text-gray-600">Razón</p>
                              <p className="font-medium">{mov.razon}</p>
                            </div>
                          )}

                          <div className="pt-2 border-t border-current border-opacity-20 flex justify-between">
                            <div>
                              <p className="text-xs text-gray-600">Responsable</p>
                              <p className="font-medium text-sm">{mov.usuarioResponsable.nombreCompleto}</p>
                              <p className="text-xs text-gray-500">{mov.usuarioResponsable.email}</p>
                            </div>
                          </div>

                          {mov.notas && (
                            <div className="pt-2 border-t border-current border-opacity-20">
                              <p className="text-xs text-gray-600">Notas</p>
                              <p className="text-sm italic">{mov.notas}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
