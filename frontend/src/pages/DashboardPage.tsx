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


  const getColorClass = (color: string): string => {
    switch (color) {
      case 'green':
        return 'bg-gradient-to-br from-green-50 to-emerald-50 border border-green-100'
      case 'blue':
        return 'bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-100'
      case 'orange':
        return 'bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-100'
      case 'red':
        return 'bg-gradient-to-br from-red-50 to-rose-50 border border-red-100'
      case 'purple':
        return 'bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-100'
      default:
        return 'bg-gradient-to-br from-gray-50 to-slate-50 border border-gray-100'
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

  const getAccentColor = (color: string): string => {
    switch (color) {
      case 'green':
        return 'bg-green-500'
      case 'blue':
        return 'bg-blue-500'
      case 'orange':
        return 'bg-orange-500'
      case 'red':
        return 'bg-red-500'
      case 'purple':
        return 'bg-purple-500'
      default:
        return 'bg-gray-500'
    }
  }

  if (loading) return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center space-y-4">
        <div className="inline-flex">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
        <p className="text-gray-600 font-medium">Cargando datos...</p>
      </div>
    </div>
  )

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-4xl font-bold gradient-text-primary">Dashboard</h1>
          <p className="text-gray-600 mt-3">
            Bienvenido, <span className="font-semibold text-gray-900">{user?.nombreCompleto}</span> ·
            <span className="ml-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium inline-block">{currentRegion}</span>
          </p>
        </div>
        <Link
          to="/solicitudes/nueva"
          className="btn-primary shadow-lg"
        >
          <span>+</span> Nueva Solicitud
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {kpis.map((kpi, idx) => (
          <div
            key={idx}
            className={`kpi-card cursor-pointer hover:scale-102 ${getColorClass(kpi.color)}`}
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider">{kpi.titulo}</p>
                <p className={`text-4xl font-bold mt-3 ${getTextColorClass(kpi.color)}`}>
                  {kpi.valor}
                  {kpi.titulo.includes('Utilización') && <span className="text-2xl">%</span>}
                </p>
              </div>
              <div className={`w-16 h-16 rounded-xl flex items-center justify-center text-2xl ${
                kpi.color === 'green' ? 'bg-green-100' :
                kpi.color === 'blue' ? 'bg-blue-100' :
                kpi.color === 'orange' ? 'bg-orange-100' :
                kpi.color === 'red' ? 'bg-red-100' :
                'bg-purple-100'
              }`}>
                {kpi.icono}
              </div>
            </div>
            {kpi.meta && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex justify-between items-center text-xs text-gray-600 mb-2">
                  <span className="font-medium">Capacidad</span>
                  <span className="font-bold">{kpi.valor}/{kpi.meta}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${getAccentColor(kpi.color)}`}
                    style={{ width: `${Math.min((kpi.valor / kpi.meta) * 100, 100)}%` }}
                  />
                </div>
              </div>
            )}
            {kpi.descripcion && <p className="text-xs text-gray-600 mt-3">{kpi.descripcion}</p>}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="card-premium">
          <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-t-2xl p-6 border-b border-blue-100">
            <h2 className="text-lg font-bold text-blue-900">📍 Ubicaciones</h2>
          </div>
          <div className="p-6 space-y-3">
            {robotsPorUbicacion.length > 0 ? (
              robotsPorUbicacion.map((ub, idx) => (
                <div key={idx} className="flex justify-between items-center p-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl hover:shadow-md transition-all">
                  <span className="text-sm font-semibold text-gray-700">{ub.nombre}</span>
                  <span className="inline-flex items-center justify-center px-3 py-1.5 text-sm font-bold text-white bg-gradient-to-r from-blue-500 to-blue-600 rounded-full shadow-md">
                    {ub.cantidad}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500 text-center py-4">Sin asignaciones</p>
            )}
          </div>
        </div>

        <div className="card-premium">
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-t-2xl p-6 border-b border-purple-100">
            <h2 className="text-lg font-bold text-purple-900">🤖 Estado Robots</h2>
          </div>
          <div className="p-6 space-y-3">
            <div className="flex justify-between items-center p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-100 hover:shadow-md transition-all">
              <div>
                <p className="text-xs font-semibold text-gray-600 uppercase">Disponibles</p>
                <p className="text-2xl font-bold text-green-700 mt-1">{stats.disponibles}</p>
              </div>
              <span className="text-3xl">✅</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border border-blue-100 hover:shadow-md transition-all">
              <div>
                <p className="text-xs font-semibold text-gray-600 uppercase">En Préstamo</p>
                <p className="text-2xl font-bold text-blue-700 mt-1">{stats.enPrestamo}</p>
              </div>
              <span className="text-3xl">🤖</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl border border-orange-100 hover:shadow-md transition-all">
              <div>
                <p className="text-xs font-semibold text-gray-600 uppercase">Mantenimiento</p>
                <p className="text-2xl font-bold text-orange-700 mt-1">{stats.mantenimiento}</p>
              </div>
              <span className="text-3xl">🔧</span>
            </div>
            {stats.retirados > 0 && (
              <div className="flex justify-between items-center p-3 bg-gradient-to-r from-gray-50 to-slate-50 rounded-xl border border-gray-100 hover:shadow-md transition-all">
                <div>
                  <p className="text-xs font-semibold text-gray-600 uppercase">Retirados</p>
                  <p className="text-2xl font-bold text-gray-700 mt-1">{stats.retirados}</p>
                </div>
                <span className="text-3xl">📦</span>
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-2 space-y-5">
          <div className="card-premium overflow-hidden">
            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-6 border-b border-blue-100 flex justify-between items-center">
              <h2 className="text-lg font-bold text-blue-900">{t('dashboard.recentRequests')}</h2>
              <Link to="/solicitudes" className="text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors">
                Ver todo →
              </Link>
            </div>
            <div className="overflow-x-auto">
              {solicitudes.length === 0 ? (
                <div className="p-12 text-center text-gray-500">{t('dashboard.noRequests')}</div>
              ) : (
                <table className="table-premium">
                  <thead>
                    <tr>
                      <th>{t('dashboard.requestNumber')}</th>
                      <th>{t('dashboard.applicant')}</th>
                      <th>{t('dashboard.date')}</th>
                      <th>{t('dashboard.status')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {solicitudes.map((s: any) => (
                      <tr key={s.id}>
                        <td className="font-mono font-semibold">
                          <Link to={`/solicitudes/${s.id}`} className="text-blue-600 hover:text-blue-700 font-bold transition-colors">
                            {s.numeroSolicitud}
                          </Link>
                        </td>
                        <td className="font-medium text-gray-900">{s.usuarioSolicitante?.nombreCompleto || 'Usuario'}</td>
                        <td className="text-gray-600">{formatFecha(s.fechaInicio || s.fechaInioSolicitada)}</td>
                        <td>
                          <span className="badge-info">
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
            <div className="card-premium overflow-hidden border-l-4 border-red-500">
              <div className="bg-gradient-to-r from-red-50 to-rose-50 p-6 border-b border-red-100">
                <h2 className="text-lg font-bold text-red-900">{t('dashboard.expiredRobots')}</h2>
                <p className="text-sm text-red-700 mt-2 font-medium">{t('dashboard.shouldReturn')}</p>
              </div>
              <div className="overflow-x-auto">
                <table className="table-premium">
                  <thead className="bg-red-50">
                    <tr>
                      <th>{t('dashboard.applicant')}</th>
                      <th>{t('dashboard.requestNumber')}</th>
                      <th>{t('dashboard.returnDate')}</th>
                      <th>{t('dashboard.daysExpired')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {solicitudesVencidas.map((s: any) => {
                      const diasVencido = Math.ceil((new Date().getTime() - new Date(s.fechaFin || s.fechaFinSolicitada).getTime()) / (1000 * 60 * 60 * 24))
                      return (
                        <tr key={s.id} className="bg-red-50/30 hover:bg-red-50">
                          <td className="font-semibold text-gray-900">{s.usuarioSolicitante?.nombreCompleto || 'Usuario'}</td>
                          <td className="font-mono font-semibold">
                            <Link to={`/solicitudes/${s.id}`} className="text-blue-600 hover:text-blue-700 transition-colors">
                              {s.numeroSolicitud}
                            </Link>
                          </td>
                          <td className="text-gray-600">{formatFecha(s.fechaFin || s.fechaFinSolicitada)}</td>
                          <td>
                            <span className="badge-error font-bold">
                              {diasVencido} días
                            </span>
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
            <div className="card-premium overflow-hidden border-l-4 border-blue-500">
              <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-6 border-b border-blue-100">
                <h2 className="text-lg font-bold text-blue-900">{t('dashboard.activeLoans')}</h2>
                <p className="text-sm text-blue-700 mt-2 font-medium">{t('dashboard.theoreticalReturn')}</p>
              </div>
              <div className="overflow-x-auto">
                <table className="table-premium">
                  <thead className="bg-blue-50">
                    <tr>
                      <th>{t('dashboard.requestNumber')}</th>
                      <th>{t('dashboard.applicant')}</th>
                      <th>{t('dashboard.returnDate')}</th>
                      <th>{t('dashboard.daysRemaining')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {robotsEnPrestamo.map((s: any) => (
                      <tr key={s.id} className="hover:bg-blue-50/30">
                        <td className="font-mono font-semibold">
                          <Link to={`/solicitudes/${s.id}`} className="text-blue-600 hover:text-blue-700 transition-colors">
                            {s.numeroSolicitud}
                          </Link>
                        </td>
                        <td className="font-medium text-gray-900">{s.usuarioSolicitante?.nombreCompleto || 'Usuario'}</td>
                        <td className="text-gray-600">{formatFecha(s.fechaFin || s.fechaFinSolicitada)}</td>
                        <td>
                          <span className={`font-bold ${s.diasRestantes > 0 ? 'text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg inline-block' : 'text-red-600 bg-red-50 px-3 py-1.5 rounded-lg inline-block'}`}>
                            {s.diasRestantes > 0 ? `${s.diasRestantes}d` : `Vencido ${Math.abs(s.diasRestantes)}d`}
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
