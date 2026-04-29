import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { prestamoService } from '../services/prestamo.service'
import { robotService } from '../services/robot.service'
import { useRegionLanguage } from '../contexts/RegionLanguageContext'
import StatCard from '../components/StatCard'

const formatFecha = (fecha: string) =>
  new Date(fecha).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })

export default function DashboardPage() {
  const { t } = useRegionLanguage()
  const [stats, setStats] = useState({
    pendientes: 0,
    aprobadas: 0,
    activas: 0,
    vencidas: 0,
    disponibles: 0,
    enPrestamo: 0,
    mantenimiento: 0,
  })
  const [solicitudes, setSolicitudes] = useState<any[]>([])
  const [solicitudesVencidas, setSolicitudesVencidas] = useState<any[]>([])
  const [robotsEnPrestamo, setRobotsEnPrestamo] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const cargar = async () => {
      try {
        const [todas, robots] = await Promise.all([
          prestamoService.listar(),
          robotService.listar(),
        ])

        const ahora = new Date()
        const vencidas = todas.filter((s: any) => {
          const fechaFin = new Date(s.fechaFinSolicitada)
          return s.estado === 'ACTIVO' && fechaFin < ahora
        })

        const enPrestamo = todas.filter((s: any) => s.estado === 'ACTIVO').map((s: any) => ({
          ...s,
          diasRestantes: Math.ceil((new Date(s.fechaFinSolicitada).getTime() - ahora.getTime()) / (1000 * 60 * 60 * 24))
        }))

        setStats({
          pendientes: todas.filter((s: any) => s.estado === 'PENDIENTE_APROBACION').length,
          aprobadas: todas.filter((s: any) => s.estado === 'APROBADO').length,
          activas: todas.filter((s: any) => s.estado === 'ACTIVO').length,
          vencidas: vencidas.length,
          disponibles: robots.filter((r: any) => r.estado === 'DISPONIBLE').length,
          enPrestamo: robots.filter((r: any) => r.estado === 'EN_PRESTAMO').length,
          mantenimiento: robots.filter((r: any) => r.estado === 'MANTENIMIENTO').length,
        })

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
  }, [])

  if (loading) return <div className="text-center py-8">Cargando...</div>

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">{t('dashboard.title')}</h1>
        <p className="text-gray-600 mt-1">{t('dashboard.subtitle')}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title={t('dashboard.pending')} value={String(stats.pendientes)} icon="📋" color="blue" />
        <StatCard title={t('dashboard.approved')} value={String(stats.aprobadas)} icon="✓" color="green" />
        <StatCard title={t('dashboard.robots')} value={String(stats.enPrestamo)} icon="🤖" color="purple" />
        <StatCard title={t('dashboard.expired')} value={String(stats.vencidas)} icon="⚠️" color="red" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
                        <td className="px-6 py-3 text-sm">{s.usuarioSolicitante.nombreCompleto}</td>
                        <td className="px-6 py-3 text-sm text-gray-600">{formatFecha(s.fechaInioSolicitada)}</td>
                        <td className="px-6 py-3">
                          <span className="text-xs px-2 py-1 bg-gray-100 rounded">
                            {s.estado.replace('_', ' ')}
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
                      const diasVencido = Math.ceil((new Date().getTime() - new Date(s.fechaFinSolicitada).getTime()) / (1000 * 60 * 60 * 24))
                      return (
                        <tr key={s.id} className="hover:bg-red-50 bg-red-50">
                          <td className="px-6 py-3 text-sm font-medium">{s.usuarioSolicitante.nombreCompleto}</td>
                          <td className="px-6 py-3 font-mono text-sm">
                            <Link to={`/solicitudes/${s.id}`} className="text-blue-600 hover:underline">
                              {s.numeroSolicitud}
                            </Link>
                          </td>
                          <td className="px-6 py-3 text-sm text-gray-600">{formatFecha(s.fechaFinSolicitada)}</td>
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
                        <td className="px-6 py-3 text-sm">{s.usuarioSolicitante.nombreCompleto}</td>
                        <td className="px-6 py-3 text-sm text-gray-600">{formatFecha(s.fechaFinSolicitada)}</td>
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

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">{t('dashboard.robotStatus')}</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-green-50 rounded">
              <span className="text-gray-700">{t('dashboard.available')}</span>
              <span className="text-2xl font-bold text-green-600">{stats.disponibles}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-blue-50 rounded">
              <span className="text-gray-700">{t('dashboard.inLoan')}</span>
              <span className="text-2xl font-bold text-blue-600">{stats.enPrestamo}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-orange-50 rounded">
              <span className="text-gray-700">{t('dashboard.maintenance')}</span>
              <span className="text-2xl font-bold text-orange-600">{stats.mantenimiento}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
