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

const colorPorTipo = {
  success: 'bg-green-50 border-green-200',
  error: 'bg-red-50 border-red-200',
  warning: 'bg-yellow-50 border-yellow-200',
  info: 'bg-blue-50 border-blue-200',
};

const colorTextoPorTipo = {
  success: 'text-green-800',
  error: 'text-red-800',
  warning: 'text-yellow-800',
  info: 'text-blue-800',
};

export default function NotificacionesPage() {
  const navigate = useNavigate()
  const { addNotification } = useNotification()
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([])
  const [loading, setLoading] = useState(true)
  const [filtro, setFiltro] = useState<'todas' | 'noLeidas' | 'leidas'>('todas')

  const cargar = async () => {
    setLoading(true)
    try {
      const todas = await notificationService.obtenerTodas()
      setNotificaciones(todas)
    } catch (err) {
      console.error('Error cargando notificaciones:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    cargar()
  }, [])

  const notificacionesFiltradas = notificaciones.filter((n) => {
    if (filtro === 'noLeidas') return !n.leido
    if (filtro === 'leidas') return n.leido
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
    addNotification('Notificación eliminada', 'success')
    cargar()
  }

  const handleLimpiarTodas = async () => {
    if (!confirm('¿Eliminar todas las notificaciones?')) return
    await notificationService.limpiarTodas()
    addNotification('Todas las notificaciones eliminadas', 'success')
    cargar()
  }

  const contarPorTipo = (tipo: string) => notificaciones.filter((n) => n.tipo === tipo).length
  const noLeidas = notificaciones.filter((n) => !n.leido).length

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Centro de Notificaciones</h1>
          <p className="text-gray-600 mt-1">
            {noLeidas > 0 ? `📬 ${noLeidas} notificación${noLeidas !== 1 ? 'es' : ''} sin leer` : '✅ Todo al día'}
          </p>
        </div>
        {noLeidas > 0 && (
          <button
            onClick={handleMarcarTodasLeidas}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition"
          >
            Marcar todas como leídas
          </button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <button
          onClick={() => setFiltro('todas')}
          className={`p-3 rounded-lg border-2 transition ${
            filtro === 'todas' ? 'border-gray-400 bg-gray-50' : 'border-gray-200 bg-white hover:border-gray-300'
          }`}
        >
          <div className="text-2xl font-bold text-gray-900">{notificaciones.length}</div>
          <div className="text-xs text-gray-500 mt-1">Total</div>
        </button>
        <button
          onClick={() => setFiltro('noLeidas')}
          className={`p-3 rounded-lg border-2 transition ${
            filtro === 'noLeidas' ? 'border-blue-400 bg-blue-50' : 'border-gray-200 bg-white hover:border-gray-300'
          }`}
        >
          <div className="text-2xl font-bold text-blue-700">{noLeidas}</div>
          <div className="text-xs text-gray-500 mt-1">Sin leer</div>
        </button>
        <button
          onClick={() => setFiltro('leidas')}
          className={`p-3 rounded-lg border-2 transition ${
            filtro === 'leidas' ? 'border-green-400 bg-green-50' : 'border-gray-200 bg-white hover:border-gray-300'
          }`}
        >
          <div className="text-2xl font-bold text-green-700">{notificaciones.filter((n) => n.leido).length}</div>
          <div className="text-xs text-gray-500 mt-1">Leídas</div>
        </button>
        <button
          onClick={() => setFiltro('todas')}
          className="p-3 rounded-lg border-2 border-green-200 bg-white hover:border-green-300"
        >
          <div className="text-2xl font-bold text-green-700">{contarPorTipo('success')}</div>
          <div className="text-xs text-gray-500 mt-1">Éxito</div>
        </button>
        <button
          onClick={() => setFiltro('todas')}
          className="p-3 rounded-lg border-2 border-red-200 bg-white hover:border-red-300"
        >
          <div className="text-2xl font-bold text-red-700">{contarPorTipo('error')}</div>
          <div className="text-xs text-gray-500 mt-1">Errores</div>
        </button>
      </div>

      {/* Listado */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-500">
            <div className="animate-pulse">Cargando notificaciones...</div>
          </div>
        ) : notificacionesFiltradas.length === 0 ? (
          <div className="p-12 text-center">
            <div className="text-5xl mb-4">📭</div>
            <p className="text-gray-500 mb-4">
              {filtro === 'noLeidas'
                ? 'No hay notificaciones sin leer'
                : filtro === 'leidas'
                ? 'No hay notificaciones leídas'
                : 'No hay notificaciones'}
            </p>
            <button
              onClick={() => navigate('/')}
              className="px-4 py-2 bg-blue-600 text-white rounded font-medium hover:bg-blue-700 transition"
            >
              Ir al Dashboard
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {notificacionesFiltradas.map((notif) => (
              <div
                key={notif.id}
                className={`p-4 border-l-4 transition ${colorPorTipo[notif.tipo]} ${
                  notif.leido ? 'opacity-75' : 'border-l-blue-500'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="text-2xl mt-1">{iconoPorTipo[notif.tipo]}</div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className={`font-semibold ${colorTextoPorTipo[notif.tipo]}`}>
                        {notif.titulo}
                        {!notif.leido && <span className="ml-2 inline-block w-2 h-2 bg-blue-600 rounded-full"></span>}
                      </h3>
                      <span className="text-xs text-gray-500">
                        {new Date(notif.fechaCreacion).toLocaleDateString('es-ES', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 mt-1">{notif.mensaje}</p>
                    <div className="flex items-center gap-2 mt-3">
                      {notif.accion && (
                        <button
                          onClick={() => navigate(notif.accion!.url)}
                          className="px-3 py-1 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded transition"
                        >
                          {notif.accion.label}
                        </button>
                      )}
                      {!notif.leido && (
                        <button
                          onClick={() => handleMarcarLeida(notif.id)}
                          className="px-3 py-1 text-sm text-gray-700 bg-gray-200 hover:bg-gray-300 rounded transition"
                        >
                          Marcar como leída
                        </button>
                      )}
                      <button
                        onClick={() => handleEliminar(notif.id)}
                        className="px-3 py-1 text-sm text-red-700 hover:bg-red-100 rounded transition"
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
            className="px-4 py-2 text-sm text-gray-700 hover:text-red-700 transition"
          >
            🗑️ Limpiar todas las notificaciones
          </button>
        </div>
      )}
    </div>
  )
}
