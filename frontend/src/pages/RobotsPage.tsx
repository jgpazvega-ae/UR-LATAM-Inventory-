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
  const { isAdmin } = useAuth()
  const [robots, setRobots] = useState<any[]>([])
  const [familias, setFamilias] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filtroFamilia, setFiltroFamilia] = useState('')
  const [filtroEstado, setFiltroEstado] = useState('')

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
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { cargar() }, [filtroFamilia, filtroEstado])

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Inventario de Robots</h1>
          <p className="text-gray-600 mt-1">{robots.length} robots en el sistema</p>
        </div>
        {isAdmin && (
          <div className="flex gap-2">
            <button className="bg-teradyne-secondary hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium">
              + Nuevo Robot
            </button>
          </div>
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
            No hay robots registrados. Envía la lista al administrador para cargarlos.
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
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
