import { useEffect, useState } from 'react'
import { robotService } from '../services/robot.service'
import { useAuth } from '../contexts/AuthContext'

const estadoBadge: Record<string, string> = {
  DISPONIBLE: 'bg-green-100 text-green-800',
  EN_PRESTAMO: 'bg-blue-100 text-blue-800',
  MANTENIMIENTO: 'bg-orange-100 text-orange-800',
  RETIRADO: 'bg-gray-100 text-gray-800',
}

export default function RobotsPage() {
  const { isAdmin, user } = useAuth()
  const puedeEditar = isAdmin || user?.rol === 'SERVICIO'

  const [robots, setRobots] = useState<any[]>([])
  const [familias, setFamilias] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filtroFamilia, setFiltroFamilia] = useState('')
  const [filtroEstado, setFiltroEstado] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<any>(null)
  const [mensaje, setMensaje] = useState('')

  const cargar = async () => {
    setLoading(true)
    try {
      const filtros: any = {}
      if (filtroFamilia) filtros.familiaId = filtroFamilia
      if (filtroEstado) filtros.estado = filtroEstado
      const [rs, fs] = await Promise.all([
        robotService.listar(filtros),
        robotService.listarFamilias(),
      ])
      setRobots(rs)
      setFamilias(fs)
    } catch (err) {
      console.error(err)
      setMensaje('Error al cargar robots')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    cargar()
  }, [filtroFamilia, filtroEstado])

  const handleGuardar = async (data: any) => {
    try {
      setMensaje('')
      if (editing?.id) {
        await robotService.actualizar(editing.id, data)
        setMensaje('✅ Robot actualizado')
      } else {
        await robotService.crear(data)
        setMensaje('✅ Robot creado')
      }
      setShowModal(false)
      setEditing(null)
      setTimeout(() => setMensaje(''), 3000)
      cargar()
    } catch (err: any) {
      setMensaje(err.response?.data?.error || 'Error al guardar')
    }
  }

  const handleEliminar = async (id: string) => {
    if (!confirm('¿Eliminar este robot? Esta acción no se puede deshacer.')) return
    try {
      await robotService.eliminar(id)
      setMensaje('✅ Robot eliminado')
      setTimeout(() => setMensaje(''), 3000)
      cargar()
    } catch (err: any) {
      setMensaje(err.response?.data?.error || 'Error al eliminar')
    }
  }

  return (
    <div className="space-y-6">
      {mensaje && (
        <div className={`px-4 py-3 rounded ${
          mensaje.includes('Error')
            ? 'bg-red-50 border border-red-200 text-red-800'
            : 'bg-green-50 border border-green-200 text-green-800'
        }`}>
          {mensaje}
        </div>
      )}

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Inventario de Robots</h1>
          <p className="text-gray-600 mt-1">{robots.length} robots en el sistema</p>
        </div>
        {puedeEditar && (
          <button
            onClick={() => { setEditing(null); setShowModal(true) }}
            className="bg-teradyne-secondary hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition"
          >
            + Nuevo Robot
          </button>
        )}
      </div>

      <div className="flex gap-4 flex-wrap">
        <select
          value={filtroFamilia}
          onChange={(e) => setFiltroFamilia(e.target.value)}
          className="px-3 py-2 border rounded bg-white"
        >
          <option value="">Todas las familias</option>
          {familias.map(f => <option key={f.id} value={f.id}>{f.nombreFamilia}</option>)}
        </select>
        <select
          value={filtroEstado}
          onChange={(e) => setFiltroEstado(e.target.value)}
          className="px-3 py-2 border rounded bg-white"
        >
          <option value="">Todos los estados</option>
          <option value="DISPONIBLE">Disponibles</option>
          <option value="EN_PRESTAMO">En Préstamo</option>
          <option value="MANTENIMIENTO">Mantenimiento</option>
          <option value="RETIRADO">Retirados</option>
        </select>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Cargando...</div>
        ) : robots.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No hay robots registrados.
            {puedeEditar && <div className="mt-2 text-sm">Crea uno nuevo con el botón de arriba.</div>}
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">N° Serie</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Modelo</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Familia</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Ubicación</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Estado</th>
                {puedeEditar && <th className="px-6 py-3 text-right text-sm font-medium text-gray-500">Acciones</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {robots.map(r => (
                <tr key={r.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-mono font-semibold text-gray-900">{r.numeroSerie}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">{r.modelo || '-'}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">{r.familia?.nombreFamilia}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">{r.ubicacionActual || '-'}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${estadoBadge[r.estado]}`}>
                      {r.estado.replace('_', ' ')}
                    </span>
                  </td>
                  {puedeEditar && (
                    <td className="px-6 py-4 text-right text-sm space-x-2">
                      <button
                        onClick={() => { setEditing(r); setShowModal(true) }}
                        className="text-blue-600 hover:text-blue-800 font-medium"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleEliminar(r.id)}
                        className="text-red-600 hover:text-red-800 font-medium"
                      >
                        Eliminar
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showModal && puedeEditar && (
        <RobotModal
          robot={editing}
          familias={familias}
          onSave={handleGuardar}
          onClose={() => { setShowModal(false); setEditing(null) }}
        />
      )}
    </div>
  )
}

function RobotModal({ robot, familias, onSave, onClose }: any) {
  const [form, setForm] = useState({
    numeroSerie: robot?.numeroSerie || '',
    modelo: robot?.modelo || '',
    familiaId: robot?.familiaId || '',
    estado: robot?.estado || 'DISPONIBLE',
    ubicacionActual: robot?.ubicacionActual || '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.numeroSerie || !form.familiaId) {
      alert('Número de serie y familia son requeridos')
      return
    }
    onSave(form)
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
        <div className="p-6 border-b">
          <h2 className="text-xl font-bold text-gray-900">
            {robot?.id ? 'Editar Robot' : 'Nuevo Robot'}
          </h2>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Número de Serie *
            </label>
            <input
              type="text"
              value={form.numeroSerie}
              onChange={(e) => setForm({ ...form, numeroSerie: e.target.value })}
              required
              disabled={!!robot?.id}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-teradyne-secondary outline-none disabled:bg-gray-100"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Modelo</label>
              <input
                type="text"
                value={form.modelo}
                onChange={(e) => setForm({ ...form, modelo: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-teradyne-secondary outline-none"
                placeholder="UR10e"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Familia *</label>
              <select
                value={form.familiaId}
                onChange={(e) => setForm({ ...form, familiaId: e.target.value })}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-teradyne-secondary outline-none"
              >
                <option value="">Selecciona familia</option>
                {familias.map((f: any) => (
                  <option key={f.id} value={f.id}>{f.nombreFamilia}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
              <select
                value={form.estado}
                onChange={(e) => setForm({ ...form, estado: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-teradyne-secondary outline-none"
              >
                <option value="DISPONIBLE">Disponible</option>
                <option value="EN_PRESTAMO">En Préstamo</option>
                <option value="MANTENIMIENTO">Mantenimiento</option>
                <option value="RETIRADO">Retirado</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ubicación</label>
              <input
                type="text"
                value={form.ubicacionActual}
                onChange={(e) => setForm({ ...form, ubicacionActual: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-teradyne-secondary outline-none"
                placeholder="Almacén..."
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-teradyne-secondary hover:bg-blue-600 text-white rounded font-medium transition"
            >
              {robot?.id ? 'Guardar' : 'Crear'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
