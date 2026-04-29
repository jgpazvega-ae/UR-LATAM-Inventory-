import { useAuth } from '../contexts/AuthContext'
import { useRegionLanguage } from '../contexts/RegionLanguageContext'

export default function Header() {
  const { user, logout } = useAuth()
  const { currentRegion, currentIdioma, setRegion, setIdioma, t } = useRegionLanguage()

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

          <div className="border-l border-gray-200 pl-6">
            <div className="text-right">
              <div className="text-sm font-medium text-gray-800">{user?.nombreCompleto}</div>
              <div className="text-xs text-gray-500">{user?.rol.replace('_', ' ').toLowerCase()}</div>
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
