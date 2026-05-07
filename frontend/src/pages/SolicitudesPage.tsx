import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { prestamoService } from '../services/prestamo.service'
import { robotService } from '../services/robot.service'

const estadoBadge: Record<string, string> = {
  PENDIENTE_APROBACION: 'bg-yellow-100 text-yellow-800',
  APROBADO: 'bg-blue-100 text-blue-800',
  RECHAZADO: 'bg-red-100 text-red-800',
  ACTIVO: 'bg-green-100 text-green-800',
  COMPLETADO: 'bg-gray-100 text-gray-800',
  VENCIDO: 'bg-orange-100 text-orange-800',
}

const formatFecha = (fecha: string) =>
  new Date(fecha).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })

export default function SolicitudesPage() {
  const [solicitudes, setSolicitudes] = useState<any[]>([])
  const [robots, setRobots] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filtro, setFiltro] = useState('TODAS')
  const navigate = useNavigate()

  useEffect(() => {
    const cargar = async () => {
      setLoading(true)
      try {
        console.log('📋 Cargando solicitudes...')
        const data = await prestamoService.listar(
          filtro !== 'TODAS' ? { estado: filtro } : {}
        )
        const robotsData = await robotService.obtenerTodosLosRobots()

        console.log('✅ Solicitudes cargadas:', data?.length || 0, data)
        console.log('✅ Robots cargados:', robotsData?.length || 0)

        setSolicitudes(data || [])
        setRobots(robotsData || [])
      } catch (err) {
        console.error('❌ Error cargando solicitudes:', err)
      } finally {
        setLoading(false)
      }
    }
    cargar()
  }, [filtro])

  const getRobotsNombres = (robotIds: string[]) => {
    if (!robotIds || robotIds.length === 0) return 'Sin robots'
    return robotIds
      .map(id => robots.find(r => r.id === id)?.numeroSerie || id)
      .slice(0, 2)
      .join(', ') + (robotIds.length > 2 ? '...' : '')
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Solicitudes de Préstamo</h1>
          <p className="text-gray-600 mt-1">Gestión de solicitudes de demos - Total: {solicitudes.length}</p>
        </div>
        <button
          onClick={() => navigate('/solicitudes/nueva')}
          className="bg-teradyne-secondary hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition"
        >
          + Nueva Solicitud
        </button>
      </div>

      <div className="flex gap-2 flex-wrap">
        {['TODAS', 'PENDIENTE_APROBACION', 'APROBADO', 'ACTIVO', 'RECHAZADO', 'COMPLETADO'].map(e => (
          <button
            key={e}
            onClick={() => setFiltro(e)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
              filtro === e ? 'bg-teradyne-primary text-white' : 'bg-white text-gray-700 hover:bg-gray-100 border'
            }`}
          >
            {e === 'TODAS' ? 'Todas' : e.replace('_', ' ')}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Cargando solicitudes...</div>
        ) : solicitudes.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-500 mb-4">No hay solicitudes registradas</p>
            <button
              onClick={() => navigate('/solicitudes/nueva')}
              className="px-4 py-2 bg-teradyne-secondary text-white rounded font-medium hover:bg-blue-600 transition"
            >
              Crear primera solicitud
            </button>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">N° Solicitud</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Robots</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Período</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Motivo</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Estado</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Fecha Creación</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {solicitudes.map((s: any) => (
                <tr key={s.id} className="hover:bg-gray-50 cursor-pointer">
                  <td className="px-6 py-4 font-mono text-sm font-semibold text-gray-900">{s.numeroSolicitud}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">
                    {s.robotIds?.length || 0} robot(s)
                    <div className="text-xs text-gray-500">{getRobotsNombres(s.robotIds)}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">
                    {s.fechaInicio ? formatFecha(s.fechaInicio) : 'N/A'} al {s.fechaFin ? formatFecha(s.fechaFin) : 'N/A'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">
                    <div className="truncate max-w-xs" title={s.motivo}>
                      {s.motivo?.substring(0, 40)}...
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${estadoBadge[s.estado] || 'bg-gray-100 text-gray-800'}`}>
                      {s.estado?.replace('_', ' ') || 'DESCONOCIDO'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {s.createdAt ? formatFecha(s.createdAt) : 'N/A'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
