import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { prestamoService } from '../services/prestamo.service'
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
  const { isGerente, isServicio } = useAuth()
  const [solicitud, setSolicitud] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [showRechazo, setShowRechazo] = useState(false)
  const [motivoRechazo, setMotivoRechazo] = useState('')

  const cargar = async () => {
    if (!id) return
    setLoading(true)
    try {
      const data = await prestamoService.obtener(id)
      setSolicitud(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { cargar() }, [id])

  const handleAprobar = async () => {
    if (!confirm('¿Aprobar esta solicitud?')) return
    await prestamoService.aprobar(id!)
    cargar()
  }

  const handleRechazar = async () => {
    if (!motivoRechazo.trim()) return
    await prestamoService.rechazar(id!, motivoRechazo)
    setShowRechazo(false)
    cargar()
  }

  const handleSalida = async () => {
    if (!confirm('¿Confirmar salida de los robots?')) return
    await prestamoService.confirmarSalida(id!)
    cargar()
  }

  const handleRecepcion = async () => {
    if (!confirm('¿Confirmar recepción de los robots?')) return
    await prestamoService.confirmarRecepcion(id!)
    cargar()
  }

  if (loading) return <div className="text-center py-8">Cargando...</div>
  if (!solicitud) return <div className="text-center py-8">Solicitud no encontrada</div>

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/solicitudes" className="text-gray-500 hover:text-gray-700">← Volver</Link>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <div className="text-xs font-semibold text-gray-500">SOLICITUD</div>
            <h1 className="text-3xl font-mono font-bold text-gray-900">{solicitud.numeroSolicitud}</h1>
          </div>
          <span className={`px-3 py-1.5 rounded-full text-sm font-medium ${estadoBadge[solicitud.estado]}`}>
            {solicitud.estado.replace('_', ' ')}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <h3 className="text-sm font-semibold text-gray-500 mb-2">SOLICITANTE</h3>
            <div className="text-gray-900">{solicitud.usuarioSolicitante.nombreCompleto}</div>
            <div className="text-sm text-gray-600">{solicitud.usuarioSolicitante.email}</div>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-500 mb-2">DISTRIBUIDOR</h3>
            <div className="text-gray-900">{solicitud.distribuidor?.nombre}</div>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-500 mb-2">PERÍODO SOLICITADO</h3>
            <div className="text-gray-900">{formatFecha(solicitud.fechaInioSolicitada)}</div>
            <div className="text-sm text-gray-600">hasta {formatFecha(solicitud.fechaFinSolicitada)}</div>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-500 mb-2">FECHA CREACIÓN</h3>
            <div className="text-gray-900">{formatFecha(solicitud.fechaCreacion)}</div>
          </div>
        </div>

        <div className="mt-6">
          <h3 className="text-sm font-semibold text-gray-500 mb-2">ROBOTS SOLICITADOS</h3>
          <div className="space-y-2">
            {solicitud.detalles.map((d: any) => (
              <div key={d.id} className="bg-gray-50 p-3 rounded flex justify-between items-center">
                <div>
                  <div className="font-mono font-semibold">{d.robot.numeroSerie}</div>
                  <div className="text-sm text-gray-600">{d.robot.modelo} - {d.robot.familia.nombreFamilia}</div>
                </div>
                <span className="text-xs px-2 py-1 bg-white rounded">{d.robot.estado}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6">
          <h3 className="text-sm font-semibold text-gray-500 mb-2">MOTIVO</h3>
          <p className="text-gray-900">{solicitud.motivo}</p>
        </div>

        {(solicitud.fechaSalidaReal || solicitud.fechaRecepcionReal) && (
          <div className="mt-6 grid grid-cols-2 gap-4">
            {solicitud.fechaSalidaReal && (
              <div className="bg-green-50 p-4 rounded">
                <div className="text-xs font-semibold text-green-700">SALIDA CONFIRMADA</div>
                <div className="text-sm text-gray-700 mt-1">{formatFecha(solicitud.fechaSalidaReal)}</div>
                {solicitud.usuarioServicioSalida && (
                  <div className="text-xs text-gray-500">por {solicitud.usuarioServicioSalida.nombreCompleto}</div>
                )}
              </div>
            )}
            {solicitud.fechaRecepcionReal && (
              <div className="bg-green-50 p-4 rounded">
                <div className="text-xs font-semibold text-green-700">RECEPCIÓN CONFIRMADA</div>
                <div className="text-sm text-gray-700 mt-1">{formatFecha(solicitud.fechaRecepcionReal)}</div>
                {solicitud.usuarioServicioRecepcion && (
                  <div className="text-xs text-gray-500">por {solicitud.usuarioServicioRecepcion.nombreCompleto}</div>
                )}
              </div>
            )}
          </div>
        )}

        <div className="mt-6 pt-6 border-t flex flex-wrap gap-3">
          {isGerente && solicitud.estado === 'PENDIENTE_APROBACION' && (
            <>
              <button onClick={handleAprobar} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded font-medium">
                ✓ Aprobar Solicitud
              </button>
              <button onClick={() => setShowRechazo(true)} className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded font-medium">
                ✗ Rechazar
              </button>
            </>
          )}
          {isServicio && solicitud.estado === 'APROBADO' && (
            <button onClick={handleSalida} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded font-medium">
              📦 Confirmar Salida
            </button>
          )}
          {isServicio && (solicitud.estado === 'ACTIVO' || solicitud.estado === 'VENCIDO') && (
            <button onClick={handleRecepcion} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded font-medium">
              ✓ Confirmar Recepción
            </button>
          )}
        </div>
      </div>

      {showRechazo && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <h2 className="text-xl font-bold mb-4">Rechazar Solicitud</h2>
            <textarea
              value={motivoRechazo}
              onChange={(e) => setMotivoRechazo(e.target.value)}
              rows={4}
              required
              placeholder="Motivo del rechazo..."
              className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-teradyne-secondary outline-none"
            />
            <div className="flex justify-end gap-3 mt-4">
              <button onClick={() => setShowRechazo(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded">
                Cancelar
              </button>
              <button onClick={handleRechazar} disabled={!motivoRechazo.trim()} className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded disabled:opacity-50">
                Rechazar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
