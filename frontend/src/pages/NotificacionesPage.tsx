import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { notificationService, Notificacion } from '../services/notification.service'
import { useNotification } from '../contexts/NotificationContext'

const iconoPorTipo = {
  success: '✅',
  error: '❌',
  warning: '⚠️',
  info: 'ℹ️',
};

const colorCardsPorTipo = {
  success: 'from-green-50 to-emerald-50 border-green-100',
  error: 'from-red-50 to-rose-50 border-red-100',
  warning: 'from-yellow-50 to-amber-50 border-yellow-100',
  info: 'from-blue-50 to-cyan-50 border-blue-100',
};

const colorBadgePorTipo = {
  success: 'badge-success',
  error: 'badge-error',
  warning: 'badge-warning',
  info: 'badge-info',
};

const colorTextoPorTipo = {
  success: 'text-green-900',
  error: 'text-red-900',
  warning: 'text-yellow-900',
  info: 'text-blue-900',
};

const colorLeftBorder = {
  success: 'border-l-green-500',
  error: 'border-l-red-500',
  warning: 'border-l-yellow-500',
  info: 'border-l-blue-500',
};

export default function NotificacionesPage() {
  const navigate = useNavigate()
  const { addNotification } = useNotification()
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([])
  const [loading, setLoading] = useState(true)
  const [filtro, setFiltro] = useState<'todas' | 'noLeidas' | 'leidas' | 'success' | 'error' | 'warning' | 'info'>('todas')
  const [busqueda, setBusqueda] = useState('')

  const cargar = async () => {
    setLoading(true)
    try {
      const todas = await notificationService.obtenerTodas()
      setNotificaciones(todas)
    } catch (err) {
      console.error('Error cargando notificaciones:', err)
      addNotification('Error al cargar notificaciones', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    cargar()
    // Recargar cada 10 segundos para detectar nuevas notificaciones
    const interval = setInterval(cargar, 10000)
    return () => clearInterval(interval)
  }, [])

  const notificacionesFiltradas = notificaciones.filter((n) => {
    // Filtro de lectura
    if (filtro === 'noLeidas' && n.leido) return false
    if (filtro === 'leidas' && !n.leido) return false

    // Filtro de tipo
    if (['success', 'error', 'warning', 'info'].includes(filtro) && n.tipo !== filtro) return false

    // Filtro de búsqueda
    if (busqueda) {
      const busqLower = busqueda.toLowerCase()
      return (
        n.titulo.toLowerCase().includes(busqLower) ||
        n.mensaje.toLowerCase().includes(busqLower)
      )
    }

    return true
  })

  const handleMarcarLeida = async (id: string) => {
    await notificationService.marcarLeida(id)
    cargar()
  }

  const handleMarcarTodasLeidas = async () => {
    await notificationService.marcarTodasLeidas()
    addNotification('Todas las notificaciones marcadas como leídas', 'success')
    cargar()
  }

  const handleEliminar = async (id: string) => {
    await notificationService.eliminar(id)
    addNotification('Notificación eliminada', 'info')
    cargar()
  }

  const handleLimpiarTodas = async () => {
    if (!confirm('¿Eliminar todas las notificaciones? Esta acción no se puede deshacer.')) return
    await notificationService.limpiarTodas()
    addNotification('Todas las notificaciones han sido eliminadas', 'info')
    cargar()
  }

  const contarPorTipo = (tipo: string) => notificaciones.filter((n) => n.tipo === tipo).length
  const noLeidas = notificaciones.filter((n) => !n.leido).length
  const leidas = notificaciones.filter((n) => n.leido).length

  const formatearFecha = (fecha: string) => {
    const date = new Date(fecha)
    const ahora = new Date()
    const diffMs = ahora.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Ahora'
    if (diffMins < 60) return `Hace ${diffMins}m`
    if (diffHours < 24) return `Hace ${diffHours}h`
    if (diffDays < 7) return `Hace ${diffDays}d`

    return date.toLocaleDateString('es-ES', { month: 'short', day: 'numeric' })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Cargando notificaciones...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-4xl font-bold gradient-text-primary">Centro de Notificaciones</h1>
          <p className="text-gray-600 mt-3 font-medium">
            {noLeidas > 0
              ? `📬 ${noLeidas} notificación${noLeidas !== 1 ? 'es' : ''} sin leer`
              : '✅ Todas las notificaciones leídas'}
          </p>
        </div>
        {noLeidas > 0 && (
          <button
            onClick={handleMarcarTodasLeidas}
            className="btn-primary shadow-lg"
          >
            ✓ Marcar todas como leídas
          </button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { key: 'todas', label: 'Total', count: notificaciones.length, icon: '📬', color: 'gray' },
          { key: 'noLeidas', label: 'Sin leer', count: noLeidas, icon: '📨', color: 'blue' },
          { key: 'leidas', label: 'Leídas', count: leidas, icon: '✓', color: 'green' },
          { key: 'success', label: 'Éxito', count: contarPorTipo('success'), icon: '✅', color: 'green' },
          { key: 'error', label: 'Errores', count: contarPorTipo('error'), icon: '❌', color: 'red' },
        ].map(stat => (
          <button
            key={stat.key}
            onClick={() => setFiltro(stat.key as any)}
            className={`card-premium p-4 transition-all duration-300 hover:scale-102 ${
              filtro === stat.key ? 'ring-2 ring-blue-500 shadow-lg' : ''
            }`}
          >
            <div className="text-2xl mb-2">{stat.icon}</div>
            <div className="text-3xl font-bold text-gray-900">{stat.count}</div>
            <div className="text-xs text-gray-600 mt-2 font-semibold">{stat.label}</div>
          </button>
        ))}
      </div>

      {/* Búsqueda y Filtros */}
      <div className="card-premium p-5">
        <input
          type="text"
          placeholder="🔍 Buscar en notificaciones..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="input-field w-full"
        />
        {busqueda && (
          <div className="mt-3 text-sm text-gray-600">
            Encontradas <span className="font-bold">{notificacionesFiltradas.length}</span> notificación{notificacionesFiltradas.length !== 1 ? 'es' : ''}
          </div>
        )}
      </div>

      {/* Listado de Notificaciones */}
      <div className="card-premium overflow-hidden">
        {notificacionesFiltradas.length === 0 ? (
          <div className="p-12 text-center">
            <div className="text-6xl mb-4">📭</div>
            <p className="text-gray-600 font-medium text-lg mb-2">
              {busqueda
                ? 'No se encontraron notificaciones con esos términos'
                : filtro === 'noLeidas'
                ? 'No hay notificaciones sin leer'
                : filtro === 'leidas'
                ? 'No hay notificaciones leídas'
                : 'No hay notificaciones'}
            </p>
            {!busqueda && filtro === 'todas' && (
              <button
                onClick={() => navigate('/')}
                className="btn-primary mt-4"
              >
                → Ir al Dashboard
              </button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {notificacionesFiltradas.map((notif) => (
              <div
                key={notif.id}
                className={`p-5 border-l-4 transition-all ${colorLeftBorder[notif.tipo]} ${
                  notif.leido ? 'bg-gray-50/50' : 'bg-white hover:shadow-md'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className="text-3xl flex-shrink-0 mt-1">{iconoPorTipo[notif.tipo]}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-3 mb-2 flex-wrap">
                      <div className="flex items-center gap-2">
                        <h3 className={`font-bold text-lg ${colorTextoPorTipo[notif.tipo]}`}>
                          {notif.titulo}
                        </h3>
                        <span className={colorBadgePorTipo[notif.tipo]}>
                          {notif.tipo}
                        </span>
                        {!notif.leido && (
                          <div className="flex items-center gap-1.5">
                            <span className="inline-block w-2.5 h-2.5 bg-blue-600 rounded-full animate-pulse"></span>
                            <span className="text-xs font-bold text-blue-600">Nuevo</span>
                          </div>
                        )}
                      </div>
                      <span className="text-xs text-gray-500 font-medium flex-shrink-0">
                        {formatearFecha(notif.fechaCreacion)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 leading-relaxed mb-3">{notif.mensaje}</p>
                    <div className="flex items-center gap-2 flex-wrap">
                      {notif.accion && (
                        <button
                          onClick={() => navigate(notif.accion!.url)}
                          className="btn-primary text-sm"
                        >
                          {notif.accion.label}
                        </button>
                      )}
                      {!notif.leido && (
                        <button
                          onClick={() => handleMarcarLeida(notif.id)}
                          className="btn-secondary text-sm"
                        >
                          Marcar como leída
                        </button>
                      )}
                      <button
                        onClick={() => handleEliminar(notif.id)}
                        className="btn-ghost text-sm text-red-600 hover:text-red-700"
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {notificaciones.length > 0 && (
        <div className="text-center">
          <button
            onClick={handleLimpiarTodas}
            className="text-sm text-gray-600 hover:text-red-700 font-medium transition"
          >
            🗑️ Limpiar todas las notificaciones
          </button>
        </div>
      )}
    </div>
  )
}
