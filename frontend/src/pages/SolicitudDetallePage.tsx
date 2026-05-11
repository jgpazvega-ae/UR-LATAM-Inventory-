import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { prestamoService } from '../services/prestamo.service'
import { robotService } from '../services/robot.service'
import { useAuth } from '../contexts/AuthContext'

const estadoBadge: Record<string, string> = {
  PENDIENTE_APROBACION: 'bg-yellow-100 text-yellow-800',
  APROBADO: 'bg-blue-100 text-blue-800',
  RECHAZADO: 'bg-red-100 text-red-800',
  ACTIVO: 'bg-green-100 text-green-800',
  COMPLETADO: 'bg-gray-100 text-gray-800',
  VENCIDO: 'bg-orange-100 text-orange-800',
}

const formatFecha = (fecha?: string) =>
  fecha ? new Date(fecha).toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' }) : '-'

export default function SolicitudDetallePage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [solicitud, setSolicitud] = useState<any>(null)
  const [robots, setRobots] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const cargar = async () => {
    if (!id) return
    setLoading(true)
    try {
      console.log('📋 Cargando solicitud:', id)
      const data = await prestamoService.obtener(id)
      const robotsData = await robotService.obtenerTodosLosRobots()

      console.log('✅ Solicitud cargada:', data)
      console.log('✅ Robots cargados:', robotsData?.length)

      setSolicitud(data)
      setRobots(robotsData || [])
    } catch (err) {
      console.error('❌ Error cargando solicitud:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    cargar()
  }, [id])

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Cargando solicitud...</div>
  }

  if (!solicitud) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-500 mb-4">Solicitud no encontrada</p>
        <button
          onClick={() => navigate('/solicitudes')}
          className="px-4 py-2 bg-teradyne-secondary text-white rounded hover:bg-blue-600"
        >
          Volver a Solicitudes
        </button>
      </div>
    )
  }

  const diasDuracion = solicitud.fechaInicio && solicitud.fechaFin
    ? Math.ceil((new Date(solicitud.fechaFin).getTime() - new Date(solicitud.fechaInicio).getTime()) / (1000 * 60 * 60 * 24))
    : 0

  const getRobotsInfo = () => {
    return (solicitud.robotIds || [])
      .map((id: string) => robots.find(r => r.id === id))
      .filter(Boolean)
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Detalle de Solicitud</h1>
          <p className="text-gray-600 mt-1">{solicitud.numeroSolicitud}</p>
        </div>
        <button
          onClick={() => navigate('/solicitudes')}
          className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
        >
          ← Volver
        </button>
      </div>

      <div className="bg-white rounded-lg shadow p-6 space-y-6">

        {/* Estado */}
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Estado de la Solicitud</h2>
            <p className="text-sm text-gray-600 mt-1">Creada: {formatFecha(solicitud.createdAt)}</p>
          </div>
          <span className={`px-3 py-1.5 rounded-full text-sm font-medium ${estadoBadge[solicitud.estado]}`}>
            {solicitud.estado?.replace('_', ' ') || 'DESCONOCIDO'}
          </span>
        </div>

        <hr />

        {/* Información General */}
        <div className="grid grid-cols-2 gap-6">
          <div>
            <h3 className="text-sm font-semibold text-gray-500 mb-2">NÚMERO DE SOLICITUD</h3>
            <div className="font-mono text-lg font-semibold text-gray-900">{solicitud.numeroSolicitud}</div>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-500 mb-2">USUARIO ACTUAL</h3>
            <div className="text-gray-900">{user?.nombreCompleto}</div>
            <div className="text-sm text-gray-600">{user?.email}</div>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-500 mb-2">CANTIDAD DE ROBOTS</h3>
            <div className="text-2xl font-bold text-teradyne-secondary">{solicitud.robotIds?.length || 0}</div>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-500 mb-2">DURACIÓN</h3>
            <div className="text-gray-900">{diasDuracion} días</div>
          </div>
        </div>

        <hr />

        {/* Período */}
        <div>
          <h3 className="text-sm font-semibold text-gray-500 mb-3">PERÍODO SOLICITADO</h3>
          <div className="bg-blue-50 p-4 rounded">
            <p className="text-gray-900 font-semibold">
              {formatFecha(solicitud.fechaInicio)} → {formatFecha(solicitud.fechaFin)}
            </p>
          </div>
        </div>

        {/* Robots Solicitados */}
        <div>
          <h3 className="text-sm font-semibold text-gray-500 mb-3">ROBOTS SOLICITADOS</h3>
          <div className="space-y-2">
            {getRobotsInfo().length > 0 ? (
              getRobotsInfo().map((r: any) => (
                <div key={r.id} className="bg-gray-50 p-3 rounded flex justify-between items-center">
                  <div>
                    <div className="font-mono font-semibold text-gray-900">{r.numeroSerie}</div>
                    <div className="text-sm text-gray-600">{r.modelo}</div>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded font-medium ${
                    r.estado === 'DISPONIBLE' ? 'bg-green-100 text-green-800' :
                    r.estado === 'EN_PRESTAMO' ? 'bg-blue-100 text-blue-800' :
                    r.estado === 'MANTENIMIENTO' ? 'bg-orange-100 text-orange-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {r.estado}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">No hay robots asociados</p>
            )}
          </div>
        </div>

        <hr />

        {/* Motivo */}
        <div>
          <h3 className="text-sm font-semibold text-gray-500 mb-3">MOTIVO DE LA SOLICITUD</h3>
          <div className="bg-gray-50 p-4 rounded text-gray-900">
            {solicitud.motivo || 'Sin motivo especificado'}
          </div>
        </div>

      </div>
    </div>
  )
}
