import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { prestamoService } from '../services/prestamo.service'

const estadoBadge: Record<string, string> = {
  PENDIENTE_APROBACION: 'bg-yellow-100 text-yellow-800',
  APROBADO: 'bg-blue-100 text-blue-800',
  RECHAZADO: 'bg-red-100 text-red-800',
  ACTIVO: 'bg-green-100 text-green-800',
  COMPLETADO: 'bg-gray-100 text-gray-800',
  VENCIDO: 'bg-orange-100 text-orange-800',
}

const formatFecha = (fecha: string) =>
  new Date(fecha).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })

export default function SolicitudesPage() {
  const [solicitudes, setSolicitudes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filtro, setFiltro] = useState('TODAS')
  const navigate = useNavigate()

  useEffect(() => {
    const cargar = async () => {
      setLoading(true)
      try {
        const data = await prestamoService.listar(
          filtro !== 'TODAS' ? { estado: filtro } : {}
        )
        setSolicitudes(data)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    cargar()
  }, [filtro])

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Solicitudes</h1>
          <p className="text-gray-600 mt-1">Gestión de solicitudes de demos</p>
        </div>
        <button
          onClick={() => navigate('/solicitudes/nueva')}
          className="bg-teradyne-secondary hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition"
        >
          + Nueva Solicitud
        </button>
      </div>

      <div className="flex gap-2 flex-wrap">
        {['TODAS', 'PENDIENTE_APROBACION', 'APROBADO', 'ACTIVO', 'VENCIDO', 'COMPLETADO'].map(e => (
          <button
            key={e}
            onClick={() => setFiltro(e)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
              filtro === e ? 'bg-teradyne-primary text-white' : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            {e === 'TODAS' ? 'Todas' : e.replace('_', ' ')}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Cargando...</div>
        ) : solicitudes.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No hay solicitudes</div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">N° Solicitud</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Solicitante</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Robots</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Período</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Estado</th>
                <th className="px-6 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {solicitudes.map(s => (
                <tr key={s.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-mono text-sm font-semibold text-gray-900">{s.numeroSolicitud}</td>
                  <td className="px-6 py-4 text-sm">
                    <div className="font-medium text-gray-900">{s.usuarioSolicitante.nombreCompleto}</div>
                    <div className="text-gray-500 text-xs">{s.distribuidor?.nombre}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">
                    {s.detalles.length} robot(s)
                    <div className="text-xs text-gray-500">
                      {s.detalles.slice(0, 2).map((d: any) => d.robot.numeroSerie).join(', ')}
                      {s.detalles.length > 2 && '...'}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">
                    {formatFecha(s.fechaInioSolicitada)} - {formatFecha(s.fechaFinSolicitada)}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${estadoBadge[s.estado]}`}>
                      {s.estado.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link to={`/solicitudes/${s.id}`} className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                      Ver detalles
                    </Link>
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
