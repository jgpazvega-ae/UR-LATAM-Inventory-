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
    <header className="bg-gradient-to-r from-white to-gray-50/50 border-b border-gray-200/50 px-8 py-4 shadow-sm">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold gradient-text-primary">{t('header.title')}</h2>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 bg-white rounded-xl border border-gray-200 p-2 shadow-sm">
            <select
              value={currentRegion}
              onChange={(e) => setRegion(e.target.value)}
              className="px-2 py-1 text-sm border-0 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-medium"
            >
              <option value="MX">{t('regions.MX')}</option>
              <option value="BR">{t('regions.BR')}</option>
              <option value="USA">{t('regions.USA')}</option>
            </select>

            <div className="w-px h-6 bg-gray-200"></div>

            <select
              value={currentIdioma}
              onChange={(e) => setIdioma(e.target.value as 'ES' | 'PT' | 'EN')}
              className="px-2 py-1 text-sm border-0 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-medium"
            >
              <option value="ES">{t('languages.ES')}</option>
              <option value="PT">{t('languages.PT')}</option>
              <option value="EN">{t('languages.EN')}</option>
            </select>
          </div>

          {/* Notificaciones Badge */}
          <Link
            to="/notificaciones"
            className="relative p-3 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-200"
            title="Ver notificaciones"
          >
            <span className="text-xl">🔔</span>
            {notificacionesNoLeidas > 0 && (
              <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold text-white bg-gradient-to-r from-red-500 to-red-600 rounded-full shadow-lg animate-pulse">
                {notificacionesNoLeidas > 9 ? '9+' : notificacionesNoLeidas}
              </span>
            )}
          </Link>

          <div className="border-l border-gray-200 pl-6">
            <div className="text-right">
              <div className="text-sm font-semibold text-gray-900">{user?.nombreCompleto || 'Usuario'}</div>
              <div className="text-xs text-gray-500 font-medium">{user?.rol?.replace('_', ' ')?.toLowerCase() || 'sin rol'}</div>
            </div>
          </div>

          <button
            onClick={logout}
            className="px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
          >
            {t('header.logout')}
          </button>
        </div>
      </div>
    </header>
  )
}
