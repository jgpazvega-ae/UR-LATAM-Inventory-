import { useState, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useRegionLanguage } from '../contexts/RegionLanguageContext'
import { usuariosPorRegion, passwordDemo } from '../data/usuarios'

export default function LoginPage() {
  const [selectedUser, setSelectedUser] = useState('')
  const [email, setEmail] = useState('')
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

  const handleSelectUser = (userId: string) => {
    setSelectedUser(userId)
    const usuario = usuariosRegion.find(u => u.id === userId)
    if (usuario) {
      setEmail(usuario.email)
      setPassword(passwordDemo)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await login(email, password)
      navigate('/')
    } catch (err: any) {
      setError(err.response?.data?.error || t('login.error'))
    } finally {
      setLoading(false)
    }
  }

  const usuarioSeleccionado = usuariosRegion.find(u => u.id === selectedUser)

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
                setSelectedUser('')
                setEmail('')
                setPassword('')
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
            <label className="block text-sm font-medium text-gray-700 mb-2">Seleccionar Usuario</label>
            <select
              value={selectedUser}
              onChange={(e) => handleSelectUser(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teradyne-secondary focus:border-transparent outline-none"
            >
              <option value="">-- Selecciona un usuario --</option>
              {usuariosRegion.map(usuario => (
                <option key={usuario.id} value={usuario.id}>
                  {usuario.nombre} ({usuario.rol})
                </option>
              ))}
            </select>
          </div>

          {usuarioSeleccionado && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-gray-700">
                <span className="font-semibold">Usuario:</span> {usuarioSeleccionado.nombre}
              </p>
              <p className="text-sm text-gray-700">
                <span className="font-semibold">Rol:</span> {usuarioSeleccionado.rol.replace('_', ' ')}
              </p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{t('login.email')}</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={!!selectedUser}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teradyne-secondary focus:border-transparent outline-none disabled:bg-gray-100"
              placeholder="correo@empresa.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{t('login.password')}</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={!!selectedUser}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teradyne-secondary focus:border-transparent outline-none disabled:bg-gray-100"
              placeholder="••••••••"
            />
          </div>

          {selectedUser && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-2 text-xs text-yellow-800">
              Demo: Contraseña: <span className="font-mono font-bold">{passwordDemo}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !email || !password}
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

        <div className="mt-4 p-3 bg-gray-50 rounded-lg text-xs text-gray-600">
          <p className="font-semibold mb-2">Demo Info:</p>
          <ul className="space-y-1">
            <li>✓ Selecciona una región para ver usuarios</li>
            <li>✓ Elige un usuario para precargarlo</li>
            <li>✓ Admins pueden agregar robots y personal</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
