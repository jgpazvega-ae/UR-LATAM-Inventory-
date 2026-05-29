import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authService } from '../services/auth.service'

export default function RegisterPage() {
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    nombreCompleto: '',
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    try {
      await authService.register(form)
      setSuccess('Cuenta creada. El administrador la activará pronto.')
      setTimeout(() => navigate('/login'), 3000)
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al registrarse')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-900 to-blue-900 px-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute bottom-10 right-20 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-40 left-20 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="card-premium overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-purple-600 to-blue-600"></div>

          <div className="p-8 sm:p-10">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl mb-4 shadow-lg">
                <span className="text-2xl font-bold text-white">T</span>
              </div>
              <h1 className="text-3xl font-bold gradient-text-primary">Crear Cuenta</h1>
              <p className="text-gray-600 mt-2 font-medium">Únete al sistema de gestión</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-gradient-to-r from-red-50 to-rose-50 border border-red-200 text-red-700 px-4 py-3.5 rounded-xl text-sm font-medium flex items-start gap-3">
                  <span>⚠️</span>
                  <span>{error}</span>
                </div>
              )}
              {success && (
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 text-green-700 px-4 py-3.5 rounded-xl text-sm font-medium flex items-start gap-3">
                  <span>✅</span>
                  <span>{success}</span>
                </div>
              )}

              <div className="form-group">
                <label className="form-label">Nombre Completo</label>
                <input
                  name="nombreCompleto"
                  value={form.nombreCompleto}
                  onChange={handleChange}
                  required
                  className="input-field"
                  placeholder="Juan Pérez"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Usuario</label>
                <input
                  name="username"
                  value={form.username}
                  onChange={handleChange}
                  required
                  className="input-field"
                  placeholder="mi_usuario"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  className="input-field"
                  placeholder="email@empresa.com"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Contraseña</label>
                <input
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  required
                  className="input-field"
                  placeholder="••••••••"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary justify-center mt-6"
              >
                {loading ? (
                  <>
                    <span className="animate-spin mr-2">⏳</span>
                    Creando cuenta...
                  </>
                ) : (
                  <>
                    <span>✨</span> Crear Cuenta
                  </>
                )}
              </button>
            </form>

            <div className="mt-8 pt-6 border-t border-gray-100 text-center">
              <p className="text-gray-600 text-sm">
                ¿Ya tienes cuenta?{' '}
                <Link to="/login" className="text-blue-600 hover:text-blue-700 font-semibold transition-colors">
                  Inicia sesión →
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
