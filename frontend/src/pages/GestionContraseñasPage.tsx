import { useEffect, useState } from 'react'
import { userService } from '../services/user.service'
import api from '../services/api'

export default function GestionContraseñasPage() {
  const [usuarios, setUsuarios] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [resetandoId, setResetandoId] = useState<string | null>(null)

  useEffect(() => {
    const cargar = async () => {
      try {
        const data = await userService.listar()
        setUsuarios(data || [])
      } catch (err) {
        console.error(err)
        setError('Error al cargar usuarios')
      } finally {
        setLoading(false)
      }
    }
    cargar()
  }, [])

  const resetearPassword = async (usuarioId: string, nombreUsuario: string) => {
    if (!window.confirm(`¿Seguro que deseas resetear la contraseña de ${nombreUsuario}?`)) {
      return
    }

    setResetandoId(usuarioId)
    setError('')
    setSuccess('')

    try {
      await api.post(`/usuarios/${usuarioId}/resetear-password`)
      setSuccess(`Contraseña de ${nombreUsuario} ha sido reseteada`)
      setTimeout(() => setSuccess(''), 3000)
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al resetear contraseña')
    } finally {
      setResetandoId(null)
    }
  }

  if (loading) return <div className="text-center py-8">Cargando usuarios...</div>

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">🔐 Gestión de Contraseñas</h1>
        <p className="text-gray-600 mt-1">Resetear contraseñas de usuarios (solo disponible para admin)</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded">
          ✓ {success}
        </div>
      )}

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-sm text-yellow-800">
          <strong>ℹ️ Nota:</strong> Al resetear la contraseña de un usuario, se establecerá a la contraseña por defecto del sistema.
        </p>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        {usuarios.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No hay usuarios en el sistema</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Usuario</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Correo</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Rol</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Estado</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {usuarios.map((usuario) => (
                  <tr key={usuario.id} className="hover:bg-gray-50">
                    <td className="px-6 py-3 text-sm font-medium text-gray-900">
                      {usuario.nombreCompleto}
                    </td>
                    <td className="px-6 py-3 text-sm text-gray-600">{usuario.email}</td>
                    <td className="px-6 py-3 text-sm">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {usuario.rol}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-sm">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        usuario.activo
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {usuario.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-sm">
                      <button
                        onClick={() => resetearPassword(usuario.id, usuario.nombreCompleto)}
                        disabled={resetandoId === usuario.id}
                        className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-sm font-medium transition disabled:opacity-50"
                      >
                        {resetandoId === usuario.id ? 'Reseteando...' : 'Resetear'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
