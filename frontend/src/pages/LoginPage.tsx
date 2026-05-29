import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useRegionLanguage } from '../contexts/RegionLanguageContext'
import { userService } from '../services/user.service'

export default function LoginPage() {
  const [selectedUserId, setSelectedUserId] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [usuariosRegion, setUsuariosRegion] = useState<any[]>([])
  const navigate = useNavigate()
  const { login } = useAuth()
  const { currentRegion, currentIdioma, setRegion, setIdioma, t } = useRegionLanguage()

  useEffect(() => {
    const cargarUsuarios = async () => {
      try {
        const users = await userService.listarPorRegion(currentRegion)
        setUsuariosRegion(users)
      } catch (err) {
        console.error('Error cargando usuarios:', err)
        setUsuariosRegion([])
      }
    }
    cargarUsuarios()
  }, [currentRegion])

  const usuarioSeleccionado = usuariosRegion.find((u: any) => u.id === selectedUserId)

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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-900 to-blue-900 px-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="card-premium overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-blue-600 to-blue-700"></div>

          <div className="p-8 sm:p-10">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl mb-4 shadow-lg">
                <span className="text-2xl font-bold text-white">T</span>
              </div>
              <h1 className="text-3xl font-bold gradient-text-primary">{t('login.title')}</h1>
              <p className="text-gray-600 mt-2 font-medium">{t('login.subtitle')}</p>
            </div>

            <div className="space-y-4 mb-6 pb-6 border-b border-gray-100">
              <div>
                <label className="form-label">{t('login.region')}</label>
                <select
                  value={currentRegion}
                  onChange={(e) => {
                    setRegion(e.target.value)
                    setSelectedUserId('')
                    setPassword('')
                    setError('')
                  }}
                  className="input-field text-sm"
                >
                  <option value="MX">{t('regions.MX')}</option>
                  <option value="BR">{t('regions.BR')}</option>
                  <option value="USA">{t('regions.USA')}</option>
                </select>
              </div>

              <div>
                <label className="form-label">{t('login.language')}</label>
                <select
                  value={currentIdioma}
                  onChange={(e) => setIdioma(e.target.value as 'ES' | 'PT' | 'EN')}
                  className="input-field text-sm"
                >
                  <option value="ES">{t('languages.ES')}</option>
                  <option value="PT">{t('languages.PT')}</option>
                  <option value="EN">{t('languages.EN')}</option>
                </select>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-gradient-to-r from-red-50 to-rose-50 border border-red-200 text-red-700 px-4 py-3.5 rounded-xl text-sm font-medium">
                  <span className="mr-2">⚠️</span>
                  {error}
                </div>
              )}

              <div>
                <label className="form-label">Usuario</label>
                <select
                  value={selectedUserId}
                  onChange={(e) => {
                    setSelectedUserId(e.target.value)
                    setPassword('')
                    setError('')
                  }}
                  className="input-field"
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
                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200 rounded-xl p-4 space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs font-bold text-gray-600 uppercase tracking-wider mb-1">Usuario</p>
                      <p className="text-sm font-semibold text-gray-900">{usuarioSeleccionado.nombreCompleto}</p>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-600 uppercase tracking-wider mb-1">Rol</p>
                      <p className="text-sm font-semibold text-blue-700">{usuarioSeleccionado.rol.replace('_', ' ')}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-600 uppercase tracking-wider mb-1">Correo</p>
                    <p className="text-sm text-gray-700">{usuarioSeleccionado.email}</p>
                  </div>
                </div>
              )}

              <div>
                <label className="form-label">Contraseña</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={!usuarioSeleccionado}
                  className="input-field disabled:bg-gray-50 disabled:cursor-not-allowed"
                  placeholder="••••••••"
                />
              </div>

              <button
                type="submit"
                disabled={loading || !usuarioSeleccionado || !password}
                className="w-full btn-primary justify-center mt-6"
              >
                {loading ? (
                  <>
                    <span className="animate-spin mr-2">⏳</span>
                    {t('login.signing')}
                  </>
                ) : (
                  t('login.signin')
                )}
              </button>
            </form>

            <div className="mt-8 pt-6 border-t border-gray-100 text-center">
              <p className="text-gray-600 text-sm">
                {t('login.noAccount')}{' '}
                <Link to="/register" className="text-blue-600 hover:text-blue-700 font-semibold transition-colors">
                  {t('login.register')}
                </Link>
              </p>
            </div>
          </div>
        </div>

        <p className="text-center text-gray-400 text-xs mt-6">
          Teradyne Robotics © 2024 · Gestión de Inventarios
        </p>
      </div>
    </div>
  )
}
