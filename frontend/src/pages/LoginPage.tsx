import { useState, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useRegionLanguage } from '../contexts/RegionLanguageContext'
import { usuariosPorRegion } from '../data/usuarios'

export default function LoginPage() {
  const [selectedUserId, setSelectedUserId] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { login } = useAuth()
  const { currentRegion, currentIdioma, setRegion, setIdioma, t } = useRegionLanguage()

  const usuariosRegion = useMemo(
    () => usuariosPorRegion[currentRegion as keyof typeof usuariosPorRegion] || [],
    [currentRegion]
  )

  const usuarioSeleccionado = usuariosRegion.find(u => u.id === selectedUserId)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!usuarioSeleccionado || !password) {
      setError('Por favor selecciona un usuario e ingresa la contraseña')
      return
    }

    setLoading(true)

    try {
      await login(usuarioSeleccionado.email, password)
      navigate('/')
    } catch (err: any) {
      setError(err.response?.data?.error || t('login.error'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teradyne-primary to-teradyne-secondary px-4">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-teradyne-primary">{t('login.title')}</h1>
          <p className="text-gray-600 mt-2">{t('login.subtitle')}</p>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{t('login.region')}</label>
            <select
              value={currentRegion}
              onChange={(e) => {
                setRegion(e.target.value)
                setSelectedUserId('')
                setPassword('')
                setError('')
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teradyne-secondary focus:border-transparent outline-none text-sm"
            >
              <option value="MX">{t('regions.MX')}</option>
              <option value="BR">{t('regions.BR')}</option>
              <option value="USA">{t('regions.USA')}</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{t('login.language')}</label>
            <select
              value={currentIdioma}
              onChange={(e) => setIdioma(e.target.value as 'ES' | 'PT' | 'EN')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teradyne-secondary focus:border-transparent outline-none text-sm"
            >
              <option value="ES">{t('languages.ES')}</option>
              <option value="PT">{t('languages.PT')}</option>
              <option value="EN">{t('languages.EN')}</option>
            </select>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Usuario</label>
            <select
              value={selectedUserId}
              onChange={(e) => {
                setSelectedUserId(e.target.value)
                setPassword('')
                setError('')
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teradyne-secondary focus:border-transparent outline-none text-sm"
            >
              <option value="">-- Selecciona un usuario --</option>
              {usuariosRegion.map(usuario => (
                <option key={usuario.id} value={usuario.id}>
                  {usuario.nombreCompleto}
                </option>
              ))}
            </select>
          </div>

          {usuarioSeleccionado && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2">
              <div>
                <p className="text-xs text-gray-600 font-semibold">USUARIO</p>
                <p className="text-sm font-semibold text-gray-900">{usuarioSeleccionado.nombreCompleto}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600 font-semibold">CORREO</p>
                <p className="text-sm text-gray-800">{usuarioSeleccionado.email}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600 font-semibold">ROL</p>
                <p className="text-sm text-gray-800">{usuarioSeleccionado.rol.replace('_', ' ')}</p>
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={!usuarioSeleccionado}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teradyne-secondary focus:border-transparent outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading || !usuarioSeleccionado || !password}
            className="w-full bg-teradyne-secondary hover:bg-blue-600 text-white font-semibold py-2.5 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? t('login.signing') : t('login.signin')}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-gray-200 text-center">
          <p className="text-gray-600 text-sm">
            {t('login.noAccount')}{' '}
            <Link to="/register" className="text-teradyne-secondary hover:underline font-semibold">
              {t('login.register')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
