import { useEffect, useState } from 'react'
import { userService } from '../services/user.service'
import { useAuth } from '../contexts/AuthContext'
import { useNotification } from '../contexts/NotificationContext'

const ROLES = [
  { value: 'VENDEDOR', label: 'Vendedor' },
  { value: 'GERENTE_VENTAS', label: 'Gerente de Ventas' },
  { value: 'SERVICIO', label: 'Servicio Técnico' },
  { value: 'ADMIN', label: 'Administrador' },
]

const REGIONS = [
  { value: 'MX', label: '🇲🇽 México' },
  { value: 'BR', label: '🇧🇷 Brasil' },
  { value: 'USA', label: '🇺🇸 USA' },
]

const badgeRol: Record<string, string> = {
  VENDEDOR: 'bg-blue-100 text-blue-800',
  GERENTE_VENTAS: 'bg-purple-100 text-purple-800',
  SERVICIO: 'bg-orange-100 text-orange-800',
  ADMIN: 'bg-red-100 text-red-800',
}

export default function UsuariosPage() {
  const { isAdmin } = useAuth()
  const { addNotification } = useNotification()
  const [usuarios, setUsuarios] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<any>(null)
  const [formData, setFormData] = useState({
    nombreCompleto: '',
    email: '',
    username: '',
    rol: 'VENDEDOR',
    region: 'MX',
  })

  const cargar = async () => {
    setLoading(true)
    try {
      const users = await userService.listar()
      setUsuarios(users)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    cargar()
  }, [])

  const handleOpenModal = (usuarioToEdit?: any) => {
    if (usuarioToEdit) {
      setEditing(usuarioToEdit)
      setFormData({
        nombreCompleto: usuarioToEdit.nombreCompleto,
        email: usuarioToEdit.email,
        username: usuarioToEdit.username,
        rol: usuarioToEdit.rol,
        region: usuarioToEdit.region,
      })
    } else {
      setEditing(null)
      setFormData({
        nombreCompleto: '',
        email: '',
        username: '',
        rol: 'VENDEDOR',
        region: 'MX',
      })
    }
    setShowModal(true)
  }

  const handleSave = async () => {
    try {
      const dataToSave = {
        nombreCompleto: formData.nombreCompleto,
        email: formData.email,
        username: formData.username,
        rol: formData.rol as 'VENDEDOR' | 'GERENTE_VENTAS' | 'SERVICIO' | 'ADMIN',
        ...(editing ? {} : { region: formData.region }),
      }

      if (editing) {
        await userService.actualizar(editing.id, dataToSave)
        addNotification('Usuario actualizado', 'success')
      } else {
        await userService.crear({ ...dataToSave, region: formData.region } as any)
        addNotification('Usuario creado', 'success')
      }
      setShowModal(false)
      cargar()
    } catch (err: any) {
      addNotification(err.message || 'Error al guardar usuario', 'error')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar este usuario?')) return
    try {
      await userService.eliminar(id)
      addNotification('Usuario eliminado', 'success')
      cargar()
    } catch (err: any) {
      addNotification(err.message || 'Error al eliminar usuario', 'error')
    }
  }

  if (!isAdmin) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
        <p className="text-yellow-800">Solo administradores pueden acceder a esta sección</p>
      </div>
    )
  }

  if (loading) return <div className="text-center py-8">Cargando usuarios...</div>

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Usuarios</h1>
          <p className="text-gray-600 mt-1">Total de usuarios: {usuarios.length}</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="bg-teradyne-secondary hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition"
        >
          + Agregar Usuario
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Nombre</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Usuario</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Rol</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Región</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Estado</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {usuarios.map((u: any) => (
              <tr key={u.id} className="hover:bg-gray-50">
                <td className="px-6 py-3 text-sm font-medium text-gray-900">{u.nombreCompleto}</td>
                <td className="px-6 py-3 text-sm text-gray-600">{u.email}</td>
                <td className="px-6 py-3 text-sm font-mono text-gray-600">{u.username}</td>
                <td className="px-6 py-3">
                  <span className={`text-xs px-2 py-1 rounded-full ${badgeRol[u.rol]}`}>
                    {ROLES.find((r) => r.value === u.rol)?.label}
                  </span>
                </td>
                <td className="px-6 py-3 text-sm text-gray-600">
                  {REGIONS.find((r) => r.value === u.region)?.label}
                </td>
                <td className="px-6 py-3">
                  <span className={`text-xs px-2 py-1 rounded-full ${u.activo ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                    {u.activo ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td className="px-6 py-3 text-sm space-x-2">
                  <button
                    onClick={() => handleOpenModal(u)}
                    className="text-blue-600 hover:text-blue-900 font-medium"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(u.id)}
                    className="text-red-600 hover:text-red-900 font-medium"
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {editing ? 'Editar Usuario' : 'Agregar Usuario'}
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre Completo</label>
                <input
                  type="text"
                  value={formData.nombreCompleto}
                  onChange={(e) => setFormData({ ...formData, nombreCompleto: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teradyne-secondary outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teradyne-secondary outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Usuario</label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teradyne-secondary outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Rol</label>
                <select
                  value={formData.rol}
                  onChange={(e) => setFormData({ ...formData, rol: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teradyne-secondary outline-none"
                >
                  {ROLES.map((r) => (
                    <option key={r.value} value={r.value}>
                      {r.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Región</label>
                <select
                  value={formData.region}
                  onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teradyne-secondary outline-none"
                >
                  {REGIONS.map((r) => (
                    <option key={r.value} value={r.value}>
                      {r.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
                <p>Contraseña por defecto: <span className="font-mono font-bold">latamrules123</span></p>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                className="flex-1 px-4 py-2 bg-teradyne-secondary text-white rounded-lg hover:bg-blue-600 transition"
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
