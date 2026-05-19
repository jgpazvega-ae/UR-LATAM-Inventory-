import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { prestamoService } from '../services/prestamo.service'
import { robotService } from '../services/robot.service'
import { ubicacionService } from '../services/ubicacion.service'
import { useRegionLanguage } from '../contexts/RegionLanguageContext'
import { useAuth } from '../contexts/AuthContext'

const formatFecha = (fecha: string) =>
  new Date(fecha).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })

interface KPI {
  titulo: string
  valor: number
  meta?: number
  icono: string
  color: 'blue' | 'green' | 'orange' | 'red' | 'purple'
  descripcion?: string
}

export default function DashboardPage() {
  const { t, currentRegion } = useRegionLanguage()
  const { user } = useAuth()
  const [stats, setStats] = useState({
    pendientes: 0,
    aprobadas: 0,
    activas: 0,
    vencidas: 0,
    disponibles: 0,
    enPrestamo: 0,
    mantenimiento: 0,
    retirados: 0,
    totalRobots: 0,
  })
  const [kpis, setKpis] = useState<KPI[]>([])
  const [robotsPorUbicacion, setRobotsPorUbicacion] = useState<Array<{ nombre: string; cantidad: number }>>([])
  const [solicitudes, setSolicitudes] = useState<any[]>([])
  const [solicitudesVencidas, setSolicitudesVencidas] = useState<any[]>([])
  const [robotsEnPrestamo, setRobotsEnPrestamo] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const cargar = async () => {
      try {
        const [todas, robots, ubicaciones] = await Promise.all([
          prestamoService.listar({ region: currentRegion }),
          robotService.listar({ region: currentRegion }),
          ubicacionService.listar({ region: currentRegion as any }),
        ])

        const ahora = new Date()
        const vencidas = todas.filter((s: any) => {
          const fechaFin = new Date(s.fechaFin || s.fechaFinSolicitada)
          return s.estado === 'ACTIVO' && fechaFin < ahora
        })

        const enPrestamo = todas.filter((s: any) => s.estado === 'ACTIVO').map((s: any) => ({
          ...s,
          diasRestantes: Math.ceil((new Date(s.fechaFin || s.fechaFinSolicitada).getTime() - ahora.getTime()) / (1000 * 60 * 60 * 24))
        }))

        const disponibles = robots.filter((r: any) => r.estado === 'DISPONIBLE').length
        const enPrest = robots.filter((r: any) => r.estado === 'EN_PRESTAMO').length
        const mantenimiento = robots.filter((r: any) => r.estado === 'MANTENIMIENTO').length
        const retirados = robots.filter((r: any) => r.estado === 'RETIRADO').length

        const tasaUtilizacion = robots.length > 0 ? Math.round(((enPrest + mantenimiento) / robots.length) * 100) : 0

        setStats({
          pendientes: todas.filter((s: any) => s.estado === 'PENDIENTE_APROBACION').length,
          aprobadas: todas.filter((s: any) => s.estado === 'APROBADO').length,
          activas: todas.filter((s: any) => s.estado === 'ACTIVO').length,
          vencidas: vencidas.length,
          disponibles,
          enPrestamo: enPrest,
          mantenimiento,
          retirados,
          totalRobots: robots.length,
        })

        setKpis([
          {
            titulo: 'Robots Disponibles',
            valor: disponibles,
            meta: robots.length,
            icono: '✅',
            color: 'green',
            descripcion: 'Listos para usar',
          },
          {
            titulo: 'En Préstamo',
            valor: enPrest,
            meta: robots.length,
            icono: '🤖',
            color: 'blue',
            descripcion: 'En uso actualmente',
          },
          {
            titulo: 'Tasa de Utilización',
            valor: tasaUtilizacion,
            meta: 100,
            icono: '📊',
            color: 'purple',
            descripcion: 'Robots en uso vs total',
          },
          {
            titulo: 'Solicitudes Vencidas',
            valor: vencidas.length,
            icono: '⚠️',
            color: vencidas.length > 0 ? 'red' : 'green',
            descripcion: 'Requieren atención',
          },
          {
            titulo: 'En Mantenimiento',
            valor: mantenimiento,
            icono: '🔧',
            color: 'orange',
            descripcion: 'Servicio técnico',
          },
          {
            titulo: 'Solicitudes Pendientes',
            valor: todas.filter((s: any) => s.estado === 'PENDIENTE_APROBACION').length,
            icono: '📋',
            color: 'blue',
            descripcion: 'Esperando aprobación',
          },
        ])

        const robotsPorUbic = ubicaciones.map((ub: any) => ({
          nombre: ub.nombre,
          cantidad: robots.filter((r: any) => r.ubicacionActual === ub.id).length,
        }))
        setRobotsPorUbicacion(robotsPorUbic.filter(r => r.cantidad > 0))

        setSolicitudes(todas.slice(0, 5))
        setSolicitudesVencidas(vencidas)
        setRobotsEnPrestamo(enPrestamo)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    cargar()
  }, [currentRegion])

  if (loading) return <div className="text-center py-8">Cargando...</div>

  const getColorClass = (color: string): string => {
    switch (color) {
      case 'green':
        return 'bg-green-50 border-green-200'
      case 'blue':
        return 'bg-blue-50 border-blue-200'
      case 'orange':
        return 'bg-orange-50 border-orange-200'
      case 'red':
        return 'bg-red-50 border-red-200'
      case 'purple':
        return 'bg-purple-50 border-purple-200'
      default:
        return 'bg-gray-50 border-gray-200'
    }
  }

  const getTextColorClass = (color: string): string => {
    switch (color) {
      case 'green':
        return 'text-green-700'
      case 'blue':
        return 'text-blue-700'
      case 'orange':
        return 'text-orange-700'
      case 'red':
        return 'text-red-700'
      case 'purple':
        return 'text-purple-700'
      default:
        return 'text-gray-700'
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">📊 Dashboard de Inventario</h1>
          <p className="text-gray-600 mt-1">
            👋 Bienvenido, <strong>{user?.nombreCompleto}</strong> · Región: <strong>{currentRegion}</strong>
          </p>
        </div>
        <Link
          to="/solicitudes/nueva"
          className="bg-teradyne-secondary hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition shadow-sm"
        >
          + Nueva Solicitud
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {kpis.map((kpi, idx) => (
          <div
            key={idx}
            className={`rounded-lg border-2 p-6 transition ${getColorClass(kpi.color)}`}
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-sm font-medium text-gray-600">{kpi.titulo}</p>
                <p className={`text-3xl font-bold mt-1 ${getTextColorClass(kpi.color)}`}>
                  {kpi.valor}
                  {kpi.titulo.includes('Utilización') && '%'}
                </p>
              </div>
              <span className="text-3xl">{kpi.icono}</span>
            </div>
            {kpi.meta && (
              <div className="mb-2">
                <div className="flex justify-between items-center text-xs text-gray-600 mb-1">
                  <span>Capacidad</span>
                  <span>{kpi.valor}/{kpi.meta}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all ${
                      kpi.color === 'green'
                        ? 'bg-green-500'
                        : kpi.color === 'blue'
                          ? 'bg-blue-500'
                          : kpi.color === 'orange'
                            ? 'bg-orange-500'
                            : kpi.color === 'red'
                              ? 'bg-red-500'
                              : 'bg-purple-500'
                    }`}
                    style={{ width: `${Math.min((kpi.valor / kpi.meta) * 100, 100)}%` }}
                  />
                </div>
              </div>
            )}
            {kpi.descripcion && <p className="text-xs text-gray-600 mt-2">{kpi.descripcion}</p>}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-teradyne-secondary">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">📍 Robots por Ubicación</h2>
          <div className="space-y-3">
            {robotsPorUbicacion.length > 0 ? (
              robotsPorUbicacion.map((ub, idx) => (
                <div key={idx} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                  <span className="text-sm font-medium text-gray-700">{ub.nombre}</span>
                  <span className="inline-flex items-center justify-center px-3 py-1 text-sm font-bold text-white bg-teradyne-secondary rounded-full">
                    {ub.cantidad}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500 italic">No hay robots asignados a ubicaciones</p>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">🤖 Estado de Robots</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-green-50 rounded">
              <div>
                <p className="text-xs text-gray-600">Disponibles</p>
                <p className="text-lg font-bold text-green-700">{stats.disponibles}</p>
              </div>
              <div className="text-2xl">✅</div>
            </div>
            <div className="flex justify-between items-center p-3 bg-blue-50 rounded">
              <div>
                <p className="text-xs text-gray-600">En Préstamo</p>
                <p className="text-lg font-bold text-blue-700">{stats.enPrestamo}</p>
              </div>
              <div className="text-2xl">🤖</div>
            </div>
            <div className="flex justify-between items-center p-3 bg-orange-50 rounded">
              <div>
                <p className="text-xs text-gray-600">Mantenimiento</p>
                <p className="text-lg font-bold text-orange-700">{stats.mantenimiento}</p>
              </div>
              <div className="text-2xl">🔧</div>
            </div>
            {stats.retirados > 0 && (
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                <div>
                  <p className="text-xs text-gray-600">Retirados</p>
                  <p className="text-lg font-bold text-gray-700">{stats.retirados}</p>
                </div>
                <div className="text-2xl">📦</div>
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">{t('dashboard.recentRequests')}</h2>
              <Link to="/solicitudes" className="text-sm text-teradyne-secondary hover:underline">
                {t('dashboard.viewAll')}
              </Link>
            </div>
            <div className="overflow-x-auto">
              {solicitudes.length === 0 ? (
                <div className="p-8 text-center text-gray-500">{t('dashboard.noRequests')}</div>
              ) : (
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">{t('dashboard.requestNumber')}</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">{t('dashboard.applicant')}</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">{t('dashboard.date')}</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">{t('dashboard.status')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {solicitudes.map((s: any) => (
                      <tr key={s.id} className="hover:bg-gray-50">
                        <td className="px-6 py-3 font-mono text-sm">
                          <Link to={`/solicitudes/${s.id}`} className="text-blue-600 hover:underline">
                            {s.numeroSolicitud}
                          </Link>
                        </td>
                        <td className="px-6 py-3 text-sm">{s.usuarioSolicitante?.nombreCompleto || 'Usuario'}</td>
                        <td className="px-6 py-3 text-sm text-gray-600">{formatFecha(s.fechaInicio || s.fechaInioSolicitada)}</td>
                        <td className="px-6 py-3">
                          <span className="text-xs px-2 py-1 bg-gray-100 rounded">
                            {s.estado?.replace('_', ' ') || 'DESCONOCIDO'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {solicitudesVencidas.length > 0 && (
            <div className="bg-white rounded-lg shadow border-l-4 border-red-500">
              <div className="p-6 border-b">
                <h2 className="text-xl font-semibold text-red-900">{t('dashboard.expiredRobots')}</h2>
                <p className="text-sm text-gray-600 mt-1">{t('dashboard.shouldReturn')}</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-red-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">{t('dashboard.applicant')}</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">{t('dashboard.requestNumber')}</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">{t('dashboard.returnDate')}</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">{t('dashboard.daysExpired')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {solicitudesVencidas.map((s: any) => {
                      const diasVencido = Math.ceil((new Date().getTime() - new Date(s.fechaFin || s.fechaFinSolicitada).getTime()) / (1000 * 60 * 60 * 24))
                      return (
                        <tr key={s.id} className="hover:bg-red-50 bg-red-50">
                          <td className="px-6 py-3 text-sm font-medium">{s.usuarioSolicitante?.nombreCompleto || 'Usuario'}</td>
                          <td className="px-6 py-3 font-mono text-sm">
                            <Link to={`/solicitudes/${s.id}`} className="text-blue-600 hover:underline">
                              {s.numeroSolicitud}
                            </Link>
                          </td>
                          <td className="px-6 py-3 text-sm text-gray-600">{formatFecha(s.fechaFin || s.fechaFinSolicitada)}</td>
                          <td className="px-6 py-3">
                            <span className="text-sm font-bold text-red-600">{diasVencido} días</span>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {robotsEnPrestamo.length > 0 && (
            <div className="bg-white rounded-lg shadow border-l-4 border-blue-500">
              <div className="p-6 border-b">
                <h2 className="text-xl font-semibold text-blue-900">{t('dashboard.activeLoans')}</h2>
                <p className="text-sm text-gray-600 mt-1">{t('dashboard.theoreticalReturn')}</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-blue-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">{t('dashboard.requestNumber')}</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">{t('dashboard.applicant')}</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">{t('dashboard.returnDate')}</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">{t('dashboard.daysRemaining')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {robotsEnPrestamo.map((s: any) => (
                      <tr key={s.id} className="hover:bg-blue-50">
                        <td className="px-6 py-3 font-mono text-sm">
                          <Link to={`/solicitudes/${s.id}`} className="text-blue-600 hover:underline">
                            {s.numeroSolicitud}
                          </Link>
                        </td>
                        <td className="px-6 py-3 text-sm">{s.usuarioSolicitante?.nombreCompleto || 'Usuario'}</td>
                        <td className="px-6 py-3 text-sm text-gray-600">{formatFecha(s.fechaFin || s.fechaFinSolicitada)}</td>
                        <td className="px-6 py-3">
                          <span className={`text-sm font-bold ${s.diasRestantes > 0 ? 'text-blue-600' : 'text-red-600'}`}>
                            {s.diasRestantes > 0 ? `${s.diasRestantes} días` : `Vencido hace ${Math.abs(s.diasRestantes)} días`}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
