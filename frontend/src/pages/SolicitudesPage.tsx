import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { prestamoService } from '../services/prestamo.service'
import { robotService } from '../services/robot.service'
import { useAuth } from '../contexts/AuthContext'
import { useRegionLanguage } from '../contexts/RegionLanguageContext'

const estadoBadge: Record<string, string> = {
  PENDIENTE_APROBACION: 'bg-yellow-100 text-yellow-800',
  APROBADO: 'bg-blue-100 text-blue-800',
  RECHAZADO: 'bg-red-100 text-red-800',
  ACTIVO: 'bg-green-100 text-green-800',
  COMPLETADO: 'bg-gray-100 text-gray-800',
  VENCIDO: 'bg-orange-100 text-orange-800',
}

const formatFecha = (fecha?: string) =>
  fecha ? new Date(fecha).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '-'

export default function SolicitudesPage() {
  const [solicitudes, setSolicitudes] = useState<any[]>([])
  const [robots, setRobots] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filtro, setFiltro] = useState('TODAS')
  const [busqueda, setBusqueda] = useState('')
  const navigate = useNavigate()
  const { user, isAdmin, isGerente, isServicio } = useAuth()
  const { currentRegion } = useRegionLanguage()

  useEffect(() => {
    const cargar = async () => {
      setLoading(true)
      try {
        console.log('📋 Cargando solicitudes para región:', currentRegion)
        const filtros: any = { region: currentRegion }
        if (filtro !== 'TODAS') filtros.estado = filtro

        // Si NO es admin/gerente/servicio, filtrar solo las solicitudes del usuario actual
        if (!isAdmin && !isGerente && !isServicio && user?.id) {
          filtros.usuarioId = user.id
        }

        const [data, robotsData] = await Promise.all([
          prestamoService.listar(filtros),
          robotService.obtenerTodosLosRobots(),
        ])

        console.log('✅ Solicitudes:', data?.length || 0)
        setSolicitudes(data || [])
        setRobots(robotsData || [])
      } catch (err) {
        console.error('❌ Error:', err)
      } finally {
        setLoading(false)
      }
    }
    cargar()
  }, [filtro, currentRegion, user?.id])

  const getRobotsNombres = (robotIds: string[]) => {
    if (!robotIds || robotIds.length === 0) return 'Sin robots'
    const nombres = robotIds.map(id => robots.find(r => r.id === id)?.numeroSerie || id)
    return nombres.slice(0, 2).join(', ') + (nombres.length > 2 ? `, +${nombres.length - 2}` : '')
  }

  const solicitudesFiltradas = solicitudes.filter(s => {
    if (!busqueda) return true
    const busq = busqueda.toLowerCase()
    return (
      s.numeroSolicitud?.toLowerCase().includes(busq) ||
      s.motivo?.toLowerCase().includes(busq) ||
      s.usuarioSolicitante?.nombreCompleto?.toLowerCase().includes(busq) ||
      s.usuarioSolicitante?.email?.toLowerCase().includes(busq)
    )
  })

  // Estadísticas
  const stats = {
    total: solicitudes.length,
    pendientes: solicitudes.filter(s => s.estado === 'PENDIENTE_APROBACION').length,
    aprobadas: solicitudes.filter(s => s.estado === 'APROBADO').length,
    activas: solicitudes.filter(s => s.estado === 'ACTIVO').length,
    completadas: solicitudes.filter(s => s.estado === 'COMPLETADO').length,
    rechazadas: solicitudes.filter(s => s.estado === 'RECHAZADO').length,
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Solicitudes de Préstamo</h1>
          <p className="text-gray-600 mt-1">
            {isAdmin || isGerente || isServicio
              ? `Gestión de todas las solicitudes en ${currentRegion}`
              : 'Mis solicitudes'}
          </p>
        </div>
        <button
          onClick={() => navigate('/solicitudes/nueva')}
          className="bg-teradyne-secondary hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition shadow-sm"
        >
          + Nueva Solicitud
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
        <button
          onClick={() => setFiltro('TODAS')}
          className={`p-3 rounded-lg border-2 transition ${filtro === 'TODAS' ? 'border-teradyne-secondary bg-blue-50' : 'border-gray-200 bg-white hover:border-gray-300'}`}
        >
          <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
          <div className="text-xs text-gray-500 mt-1">Total</div>
        </button>
        <button
          onClick={() => setFiltro('PENDIENTE_APROBACION')}
          className={`p-3 rounded-lg border-2 transition ${filtro === 'PENDIENTE_APROBACION' ? 'border-yellow-400 bg-yellow-50' : 'border-gray-200 bg-white hover:border-gray-300'}`}
        >
          <div className="text-2xl font-bold text-yellow-700">{stats.pendientes}</div>
          <div className="text-xs text-gray-500 mt-1">Pendientes</div>
        </button>
        <button
          onClick={() => setFiltro('APROBADO')}
          className={`p-3 rounded-lg border-2 transition ${filtro === 'APROBADO' ? 'border-blue-400 bg-blue-50' : 'border-gray-200 bg-white hover:border-gray-300'}`}
        >
          <div className="text-2xl font-bold text-blue-700">{stats.aprobadas}</div>
          <div className="text-xs text-gray-500 mt-1">Aprobadas</div>
        </button>
        <button
          onClick={() => setFiltro('ACTIVO')}
          className={`p-3 rounded-lg border-2 transition ${filtro === 'ACTIVO' ? 'border-green-400 bg-green-50' : 'border-gray-200 bg-white hover:border-gray-300'}`}
        >
          <div className="text-2xl font-bold text-green-700">{stats.activas}</div>
          <div className="text-xs text-gray-500 mt-1">Activas</div>
        </button>
        <button
          onClick={() => setFiltro('COMPLETADO')}
          className={`p-3 rounded-lg border-2 transition ${filtro === 'COMPLETADO' ? 'border-gray-400 bg-gray-50' : 'border-gray-200 bg-white hover:border-gray-300'}`}
        >
          <div className="text-2xl font-bold text-gray-700">{stats.completadas}</div>
          <div className="text-xs text-gray-500 mt-1">Completadas</div>
        </button>
        <button
          onClick={() => setFiltro('RECHAZADO')}
          className={`p-3 rounded-lg border-2 transition ${filtro === 'RECHAZADO' ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-white hover:border-gray-300'}`}
        >
          <div className="text-2xl font-bold text-red-700">{stats.rechazadas}</div>
          <div className="text-xs text-gray-500 mt-1">Rechazadas</div>
        </button>
      </div>

      {/* Búsqueda */}
      <div className="flex gap-3">
        <input
          type="text"
          placeholder="🔍 Buscar por solicitud, solicitante o motivo..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teradyne-secondary outline-none"
        />
        {filtro !== 'TODAS' && (
          <button
            onClick={() => setFiltro('TODAS')}
            className="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg transition"
          >
            Limpiar filtros ✕
          </button>
        )}
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-500">
            <div className="animate-pulse">Cargando solicitudes...</div>
          </div>
        ) : solicitudesFiltradas.length === 0 ? (
          <div className="p-12 text-center">
            <div className="text-5xl mb-4">📭</div>
            <p className="text-gray-500 mb-4">
              {busqueda
                ? 'No se encontraron solicitudes con ese criterio'
                : filtro !== 'TODAS'
                ? `No hay solicitudes con estado ${filtro.replace('_', ' ')}`
                : 'No hay solicitudes registradas'}
            </p>
            {!busqueda && filtro === 'TODAS' && (
              <button
                onClick={() => navigate('/solicitudes/nueva')}
                className="px-4 py-2 bg-teradyne-secondary text-white rounded font-medium hover:bg-blue-600 transition"
              >
                Crear primera solicitud
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">N° Solicitud</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Solicitante</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Robots</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Período</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">PDF</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Creada</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {solicitudesFiltradas.map((s: any) => (
                  <tr
                    key={s.id}
                    onClick={() => navigate(`/solicitudes/${s.id}`)}
                    className="hover:bg-blue-50 cursor-pointer transition"
                  >
                    <td className="px-4 py-3 font-mono text-sm font-semibold text-gray-900">
                      {s.numeroSolicitud}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <div className="font-medium text-gray-900">
                        {s.usuarioSolicitante?.nombreCompleto || 'Sin asignar'}
                      </div>
                      {s.usuarioSolicitante?.email && (
                        <div className="text-xs text-gray-500">{s.usuarioSolicitante.email}</div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      <div className="font-semibold">{s.robotIds?.length || 0} robot(s)</div>
                      <div className="text-xs text-gray-500">{getRobotsNombres(s.robotIds)}</div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      <div>{formatFecha(s.fechaInicio)}</div>
                      <div className="text-xs text-gray-500">al {formatFecha(s.fechaFin)}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${estadoBadge[s.estado] || 'bg-gray-100 text-gray-800'}`}>
                        {s.estado?.replace('_', ' ') || 'N/A'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {s.pdfAdjunto ? (
                        <span className="text-blue-600" title={s.pdfAdjunto.name}>📎</span>
                      ) : (
                        <span className="text-gray-300">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {formatFecha(s.createdAt)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                        Ver →
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
