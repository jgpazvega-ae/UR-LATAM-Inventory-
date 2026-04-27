import { useEffect, useState } from 'react'
import { userService } from '../services/user.service'

const ROLES = [
  { value: 'VENDEDOR', label: 'Vendedor' },
  { value: 'GERENTE_VENTAS', label: 'Gerente de Ventas' },
  { value: 'SERVICIO', label: 'Servicio Técnico' },
  { value: 'ADMIN', label: 'Administrador' },
]

const badgeRol: Record<string, string> = {
  VENDEDOR: 'bg-blue-100 text-blue-800',
  GERENTE_VENTAS: 'bg-purple-100 text-purple-800',
  SERVICIO: 'bg-orange-100 text-orange-800',
  ADMIN: 'bg-red-100 text-red-800',
}

export default function UsuariosPage() {
  const [usuarios, setUsuarios] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>('todos')
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<any>(null)
  const [distribuidores, setDistribuidores] = useState<any[]>([])

  const cargar = async () => {
    setLoading(true)
    try {
      const [users, dists] = await Promise.all([
        userService.listar(filter === 'pendientes' ? { activo: false } : filter === 'activos' ? { activo: true } : {}),
        userService.listarDistribuidores(),
      ])
      setUsuarios(users)
      setDistribuidores(dists)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    cargar()
  }, [filter])

  const handleActivar = async (id: string) => {
    if (!confirm('¿Activar este usuario? Se le enviará un correo.')) return
    await userService.activar(id)
    cargar()
  }

  const handleEliminar = async (id: string) => {
    if (!confirm('¿Eliminar este usuario? Esta acción no se puede deshacer.')) return
    await userService.eliminar(id)
    cargar()
  }

  const handleSave = async (data: any) => {
    if (editing?.id) {
      await userService.actualizar(editing.id, data)
    } else {
      await userService.crear(data)
    }
    setShowModal(false)
    setEditing(null)
    cargar()
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Usuarios</h1>
          <p className="text-gray-600 mt-1">Administra usuarios y roles del sistema</p>
        </div>
        <button
          onClick={() => { setEditing({}); setShowModal(true) }}
          className="bg-teradyne-secondary hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition"
        >
          + Nuevo Usuario
        </button>
      </div>

      <div className="flex gap-2">
        {['todos', 'pendientes', 'activos'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              filter === f ? 'bg-teradyne-primary text-white' : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            {f === 'todos' ? 'Todos' : f === 'pendientes' ? 'Pendientes Activación' : 'Activos'}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Cargando...</div>
        ) : usuarios.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No hay usuarios</div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Usuario</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Email</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Rol</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Distribuidor</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Estado</th>
                <th className="px-6 py-3 text-right text-sm font-medium text-gray-500">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {usuarios.map(u => (
                <tr key={u.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">{u.nombreCompleto}</div>
                    <div className="text-sm text-gray-500">@{u.username}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">{u.email}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${badgeRol[u.rol]}`}>
                      {u.rol.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">{u.distribuidor?.nombre || '-'}</td>
                  <td className="px-6 py-4">
                    {u.activo ? (
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium">Activo</span>
                    ) : (
                      <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs font-medium">Pendiente</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right text-sm space-x-2">
                    {!u.activo && (
                      <button onClick={() => handleActivar(u.id)} className="text-green-600 hover:text-green-800 font-medium">
                        Activar
                      </button>
                    )}
                    <button onClick={() => { setEditing(u); setShowModal(true) }} className="text-blue-600 hover:text-blue-800 font-medium">
                      Editar
                    </button>
                    <button onClick={() => handleEliminar(u.id)} className="text-red-600 hover:text-red-800 font-medium">
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <UsuarioModal
          usuario={editing}
          distribuidores={distribuidores}
          onSave={handleSave}
          onClose={() => { setShowModal(false); setEditing(null) }}
        />
      )}
    </div>
  )
}

function UsuarioModal({ usuario, distribuidores, onSave, onClose }: any) {
  const [form, setForm] = useState({
    username: usuario?.username || '',
    email: usuario?.email || '',
    nombreCompleto: usuario?.nombreCompleto || '',
    password: '',
    rol: usuario?.rol || 'VENDEDOR',
    distribuidorId: usuario?.distribuidorId || '',
    activo: usuario?.activo ?? false,
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const data: any = { ...form }
    if (!data.password) delete data.password
    if (!data.distribuidorId) data.distribuidorId = null
    onSave(data)
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
        <div className="p-6 border-b">
          <h2 className="text-xl font-bold text-gray-900">
            {usuario?.id ? 'Editar Usuario' : 'Nuevo Usuario'}
          </h2>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Usuario</label>
              <input
                type="text"
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-teradyne-secondary outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-teradyne-secondary outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre Completo</label>
            <input
              type="text"
              value={form.nombreCompleto}
              onChange={(e) => setForm({ ...form, nombreCompleto: e.target.value })}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-teradyne-secondary outline-none"
            />
          </div>

          {!usuario?.id && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
              <input
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-teradyne-secondary outline-none"
                placeholder="(opcional)"
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Rol</label>
              <select
                value={form.rol}
                onChange={(e) => setForm({ ...form, rol: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-teradyne-secondary outline-none"
              >
                {ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Distribuidor</label>
              <select
                value={form.distribuidorId}
                onChange={(e) => setForm({ ...form, distribuidorId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-teradyne-secondary outline-none"
              >
                <option value="">Sin asignar</option>
                {distribuidores.map((d: any) => (
                  <option key={d.id} value={d.id}>{d.nombre}</option>
                ))}
              </select>
            </div>
          </div>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={form.activo}
              onChange={(e) => setForm({ ...form, activo: e.target.checked })}
              className="w-4 h-4"
            />
            <span className="text-sm text-gray-700">Cuenta activa</span>
          </label>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <button type="button" onClick={onClose} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded">
              Cancelar
            </button>
            <button type="submit" className="px-4 py-2 bg-teradyne-secondary hover:bg-blue-600 text-white rounded font-medium">
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
