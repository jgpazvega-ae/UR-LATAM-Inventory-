import { useAuth } from '../contexts/AuthContext'
import { useRegionLanguage } from '../contexts/RegionLanguageContext'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { notificationService } from '../services/notification.service'

export default function Header() {
  const { user, logout } = useAuth()
  const { currentRegion, currentIdioma, setRegion, setIdioma, t } = useRegionLanguage()
  const [notificacionesNoLeidas, setNotificacionesNoLeidas] = useState(0)

  useEffect(() => {
    const cargarConteo = async () => {
      const count = await notificationService.contarNoLeidas()
      setNotificacionesNoLeidas(count)
    }
    cargarConteo()

    // Actualizar cada 5 segundos
    const interval = setInterval(cargarConteo, 5000)
    return () => clearInterval(interval)
  }, [])

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 px-8 py-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-800">{t('header.title')}</h2>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <select
              value={currentRegion}
              onChange={(e) => setRegion(e.target.value)}
              className="px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-teradyne-secondary outline-none"
            >
              <option value="MX">{t('regions.MX')}</option>
              <option value="BR">{t('regions.BR')}</option>
              <option value="USA">{t('regions.USA')}</option>
            </select>

            <select
              value={currentIdioma}
              onChange={(e) => setIdioma(e.target.value as 'ES' | 'PT' | 'EN')}
              className="px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-teradyne-secondary outline-none"
            >
              <option value="ES">{t('languages.ES')}</option>
              <option value="PT">{t('languages.PT')}</option>
              <option value="EN">{t('languages.EN')}</option>
            </select>
          </div>

          {/* Notificaciones Badge */}
          <Link
            to="/notificaciones"
            className="relative p-2 text-gray-600 hover:text-teradyne-secondary hover:bg-gray-100 rounded-lg transition"
            title="Ver notificaciones"
          >
            <span className="text-xl">🔔</span>
            {notificacionesNoLeidas > 0 && (
              <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
                {notificacionesNoLeidas > 9 ? '9+' : notificacionesNoLeidas}
              </span>
            )}
          </Link>

          <div className="border-l border-gray-200 pl-6">
            <div className="text-right">
              <div className="text-sm font-medium text-gray-800">{user?.nombreCompleto || 'Usuario'}</div>
              <div className="text-xs text-gray-500">{user?.rol?.replace('_', ' ')?.toLowerCase() || 'sin rol'}</div>
            </div>
          </div>

          <button
            onClick={logout}
            className="px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded transition"
          >
            {t('header.logout')}
          </button>
        </div>
      </div>
    </header>
  )
}
