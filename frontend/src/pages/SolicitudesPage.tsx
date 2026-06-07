import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { prestamoService } from '../services/prestamo.service'
import { robotService } from '../services/robot.service'
import { useAuth } from '../contexts/AuthContext'
import { useRegionLanguage } from '../contexts/RegionLanguageContext'

const estadoBadge: Record<string, string> = {
  PENDIENTE_APROBACION: 'badge-warning',
  APROBADO: 'badge-info',
  RECHAZADO: 'badge-error',
  ACTIVO: 'badge-success',
  COMPLETADO: 'badge-info',
  VENCIDO: 'badge-warning',
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Cargando solicitudes...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-4xl font-bold gradient-text-primary">Solicitudes de Préstamo</h1>
          <p className="text-gray-600 mt-3 font-medium">
            {isAdmin || isGerente || isServicio
              ? `Gestión de todas las solicitudes en ${currentRegion}`
              : 'Mis solicitudes'}
          </p>
        </div>
        <button
          onClick={() => navigate('/solicitudes/nueva')}
          className="btn-primary shadow-lg"
        >
          <span>+</span> Nueva Solicitud
        </button>
      </div>

      {/* Filter Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
        {[
          { key: 'TODAS', label: 'Total', count: stats.total, icon: '📋', color: 'blue' },
          { key: 'PENDIENTE_APROBACION', label: 'Pendientes', count: stats.pendientes, icon: '⏳', color: 'yellow' },
          { key: 'APROBADO', label: 'Aprobadas', count: stats.aprobadas, icon: '✅', color: 'blue' },
          { key: 'ACTIVO', label: 'Activas', count: stats.activas, icon: '🚀', color: 'green' },
          { key: 'COMPLETADO', label: 'Completadas', count: stats.completadas, icon: '🎉', color: 'gray' },
          { key: 'RECHAZADO', label: 'Rechazadas', count: stats.rechazadas, icon: '❌', color: 'red' },
        ].map(f => (
          <button
            key={f.key}
            onClick={() => setFiltro(f.key)}
            className={`card-premium p-4 transition-all duration-300 hover:scale-102 ${
              filtro === f.key ? `ring-2 ring-${f.color}-500 shadow-lg` : ''
            }`}
          >
            <div className="text-2xl mb-2">{f.icon}</div>
            <div className="text-3xl font-bold text-gray-900">{f.count}</div>
            <div className="text-xs text-gray-600 mt-2 font-semibold">{f.label}</div>
          </button>
        ))}
      </div>

      {/* Search Bar */}
      <div className="card-premium p-4 flex gap-3">
        <input
          type="text"
          placeholder="🔍 Buscar por solicitud, solicitante o motivo..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="input-field flex-1"
        />
        {filtro !== 'TODAS' && (
          <button
            onClick={() => setFiltro('TODAS')}
            className="btn-secondary"
          >
            Limpiar
          </button>
        )}
      </div>

      {/* Requests Table */}
      <div className="card-premium overflow-hidden">
        {solicitudesFiltradas.length === 0 ? (
          <div className="p-12 text-center">
            <div className="text-5xl mb-4">📭</div>
            <p className="text-gray-600 font-medium mb-4">
              {busqueda
                ? 'No se encontraron solicitudes con ese criterio'
                : filtro !== 'TODAS'
                ? `No hay solicitudes con estado ${filtro.replace('_', ' ')}`
                : 'No hay solicitudes registradas'}
            </p>
            {!busqueda && filtro === 'TODAS' && (
              <button
                onClick={() => navigate('/solicitudes/nueva')}
                className="btn-primary"
              >
                + Crear primera solicitud
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table-premium">
              <thead>
                <tr>
                  <th>N° Solicitud</th>
                  <th>Solicitante</th>
                  <th>Robots</th>
                  <th>Período</th>
                  <th>Estado</th>
                  <th>PDF</th>
                  <th>Creada</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {solicitudesFiltradas.map((s: any) => (
                  <tr
                    key={s.id}
                    onClick={() => navigate(`/solicitudes/${s.id}`)}
                    className="cursor-pointer"
                  >
                    <td className="font-mono font-bold text-blue-700">{s.numeroSolicitud}</td>
                    <td>
                      <div className="font-medium text-gray-900">
                        {s.usuarioSolicitante?.nombreCompleto || 'Sin asignar'}
                      </div>
                      {s.usuarioSolicitante?.email && (
                        <div className="text-xs text-gray-500">{s.usuarioSolicitante.email}</div>
                      )}
                    </td>
                    <td>
                      <div className="font-semibold text-gray-900">{s.robotIds?.length || 0} robot(s)</div>
                      <div className="text-xs text-gray-500">{getRobotsNombres(s.robotIds)}</div>
                    </td>
                    <td className="text-gray-700">
                      <div className="font-medium">{formatFecha(s.fechaInicio)}</div>
                      <div className="text-xs text-gray-500">al {formatFecha(s.fechaFin)}</div>
                    </td>
                    <td>
                      <span className={estadoBadge[s.estado] || 'badge-error'}>
                        {s.estado?.replace('_', ' ') || 'N/A'}
                      </span>
                    </td>
                    <td className="text-center">
                      {s.pdfAdjunto ? (
                        <span className="text-blue-600 text-lg" title={s.pdfAdjunto.name}>📎</span>
                      ) : (
                        <span className="text-gray-300">—</span>
                      )}
                    </td>
                    <td className="text-gray-600 text-sm">{formatFecha(s.createdAt)}</td>
                    <td className="text-right">
                      <span className="text-blue-600 hover:text-blue-700 font-semibold">
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
