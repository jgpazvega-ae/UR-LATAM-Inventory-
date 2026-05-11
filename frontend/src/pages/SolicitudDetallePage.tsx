import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { prestamoService } from '../services/prestamo.service'
import { robotService } from '../services/robot.service'
import { useAuth } from '../contexts/AuthContext'
import { useNotification } from '../contexts/NotificationContext'

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
  const { user, isGerente, isServicio } = useAuth()
  const { addNotification } = useNotification()
  const [solicitud, setSolicitud] = useState<any>(null)
  const [robots, setRobots] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showRechazo, setShowRechazo] = useState(false)
  const [motivoRechazo, setMotivoRechazo] = useState('')
  const [procesando, setProcesando] = useState(false)

  const handleAprobar = async () => {
    if (!confirm('¿Aprobar esta solicitud?')) return
    setProcesando(true)
    try {
      await prestamoService.aprobar(id!, user ? { id: user.id, nombreCompleto: user.nombreCompleto } : undefined)
      addNotification('Solicitud aprobada', 'success')
      cargar()
    } catch (err: any) {
      addNotification(err.message || 'Error al aprobar', 'error')
    } finally {
      setProcesando(false)
    }
  }

  const handleRechazar = async () => {
    if (!motivoRechazo.trim() || motivoRechazo.length < 5) {
      addNotification('Indica el motivo del rechazo (mínimo 5 caracteres)', 'warning')
      return
    }
    setProcesando(true)
    try {
      await prestamoService.rechazar(id!, motivoRechazo, user ? { id: user.id, nombreCompleto: user.nombreCompleto } : undefined)
      addNotification('Solicitud rechazada', 'success')
      setShowRechazo(false)
      setMotivoRechazo('')
      cargar()
    } catch (err: any) {
      addNotification(err.message || 'Error al rechazar', 'error')
    } finally {
      setProcesando(false)
    }
  }

  const handleConfirmarSalida = async () => {
    if (!confirm('¿Confirmar la salida de los robots?')) return
    setProcesando(true)
    try {
      await prestamoService.confirmarSalida(id!, user ? { id: user.id, nombreCompleto: user.nombreCompleto } : undefined)
      addNotification('Salida confirmada - Robots en préstamo', 'success')
      cargar()
    } catch (err: any) {
      addNotification(err.message || 'Error al confirmar salida', 'error')
    } finally {
      setProcesando(false)
    }
  }

  const handleConfirmarRecepcion = async () => {
    if (!confirm('¿Confirmar la recepción/devolución de los robots?')) return
    setProcesando(true)
    try {
      await prestamoService.confirmarRecepcion(id!, user ? { id: user.id, nombreCompleto: user.nombreCompleto } : undefined)
      addNotification('Recepción confirmada - Préstamo cerrado', 'success')
      cargar()
    } catch (err: any) {
      addNotification(err.message || 'Error al confirmar recepción', 'error')
    } finally {
      setProcesando(false)
    }
  }

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
            <h3 className="text-sm font-semibold text-gray-500 mb-2">SOLICITANTE</h3>
            <div className="text-gray-900">{solicitud.usuarioSolicitante?.nombreCompleto || 'No registrado'}</div>
            <div className="text-sm text-gray-600">{solicitud.usuarioSolicitante?.email || ''}</div>
            {solicitud.usuarioSolicitante?.rol && (
              <div className="text-xs text-gray-500 mt-1">{solicitud.usuarioSolicitante.rol.replace('_', ' ')}</div>
            )}
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

        {/* Historial de Acciones */}
        {(solicitud.usuarioAprobador || solicitud.usuarioRechazo || solicitud.usuarioSalida || solicitud.usuarioRecepcion) && (
          <div>
            <h3 className="text-sm font-semibold text-gray-500 mb-3">HISTORIAL DE ACCIONES</h3>
            <div className="space-y-2">
              {solicitud.usuarioAprobador && (
                <div className="flex items-center gap-3 bg-blue-50 p-3 rounded text-sm">
                  <span className="text-xl">✅</span>
                  <div className="flex-1">
                    <div><strong>Aprobada</strong> por {solicitud.usuarioAprobador.nombreCompleto}</div>
                    <div className="text-xs text-gray-600">{formatFecha(solicitud.fechaAprobacion)}</div>
                  </div>
                </div>
              )}
              {solicitud.usuarioRechazo && (
                <div className="flex items-center gap-3 bg-red-50 p-3 rounded text-sm">
                  <span className="text-xl">❌</span>
                  <div className="flex-1">
                    <div><strong>Rechazada</strong> por {solicitud.usuarioRechazo.nombreCompleto}</div>
                    <div className="text-xs text-gray-600">{formatFecha(solicitud.fechaRechazo)}</div>
                  </div>
                </div>
              )}
              {solicitud.usuarioSalida && (
                <div className="flex items-center gap-3 bg-green-50 p-3 rounded text-sm">
                  <span className="text-xl">📤</span>
                  <div className="flex-1">
                    <div><strong>Salida confirmada</strong> por {solicitud.usuarioSalida.nombreCompleto}</div>
                    <div className="text-xs text-gray-600">{formatFecha(solicitud.fechaSalida)}</div>
                  </div>
                </div>
              )}
              {solicitud.usuarioRecepcion && (
                <div className="flex items-center gap-3 bg-purple-50 p-3 rounded text-sm">
                  <span className="text-xl">📥</span>
                  <div className="flex-1">
                    <div><strong>Recepción confirmada</strong> por {solicitud.usuarioRecepcion.nombreCompleto}</div>
                    <div className="text-xs text-gray-600">{formatFecha(solicitud.fechaRecepcion)}</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* PDF Adjunto */}
        {solicitud.pdfAdjunto && (
          <div>
            <h3 className="text-sm font-semibold text-gray-500 mb-3">PDF ADJUNTO</h3>
            <div className="bg-blue-50 border border-blue-200 p-4 rounded flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="text-3xl">📎</div>
                <div>
                  <p className="font-semibold text-gray-900">{solicitud.pdfAdjunto.name}</p>
                  <p className="text-xs text-gray-600">{(solicitud.pdfAdjunto.size / 1024).toFixed(2)} KB</p>
                  {solicitud.pdfAdjunto.archivado && (
                    <p className="text-xs text-orange-600 mt-1">📁 PDF archivado (préstamo completado)</p>
                  )}
                </div>
              </div>
              {solicitud.pdfAdjunto.data ? (
                <a
                  href={solicitud.pdfAdjunto.data}
                  download={solicitud.pdfAdjunto.name}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm font-medium transition"
                >
                  📥 Descargar
                </a>
              ) : (
                <span className="px-4 py-2 bg-gray-200 text-gray-500 rounded text-sm font-medium">
                  No disponible
                </span>
              )}
            </div>
          </div>
        )}

        {/* Motivo de Rechazo (si existe) */}
        {solicitud.estado === 'RECHAZADO' && solicitud.motivoRechazo && (
          <div>
            <h3 className="text-sm font-semibold text-red-600 mb-3">MOTIVO DEL RECHAZO</h3>
            <div className="bg-red-50 border border-red-200 p-4 rounded text-red-900">
              {solicitud.motivoRechazo}
            </div>
          </div>
        )}

        {/* Botones de Acción según rol y estado */}
        <hr />
        <div className="flex gap-3 justify-end flex-wrap">
          {/* Gerente: Aprobar/Rechazar pendientes */}
          {isGerente && solicitud.estado === 'PENDIENTE_APROBACION' && (
            <>
              <button
                onClick={() => setShowRechazo(true)}
                disabled={procesando}
                className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded font-medium transition disabled:opacity-50"
              >
                ❌ Rechazar
              </button>
              <button
                onClick={handleAprobar}
                disabled={procesando}
                className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded font-medium transition disabled:opacity-50"
              >
                ✅ Aprobar
              </button>
            </>
          )}

          {/* Servicio: Confirmar salida cuando aprobada */}
          {isServicio && solicitud.estado === 'APROBADO' && (
            <button
              onClick={handleConfirmarSalida}
              disabled={procesando}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-medium transition disabled:opacity-50"
            >
              📤 Confirmar Salida de Robots
            </button>
          )}

          {/* Servicio: Confirmar recepción cuando activa */}
          {isServicio && solicitud.estado === 'ACTIVO' && !solicitud.estadoRecepcion && (
            <button
              onClick={handleConfirmarRecepcion}
              disabled={procesando}
              className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded font-medium transition disabled:opacity-50"
            >
              📥 Confirmar Recepción de Robots
            </button>
          )}

          {/* Estado Completado o sin acciones */}
          {(solicitud.estado === 'COMPLETADO' || solicitud.estadoRecepcion === 'CONFIRMADA') && (
            <div className="px-4 py-2 bg-gray-100 text-gray-700 rounded text-sm">
              ✅ Préstamo completado
            </div>
          )}
        </div>

      </div>

      {/* Modal de Rechazo */}
      {showRechazo && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Rechazar Solicitud</h2>
            <p className="text-sm text-gray-600 mb-4">
              Indica el motivo por el cual rechazas esta solicitud:
            </p>
            <textarea
              value={motivoRechazo}
              onChange={(e) => setMotivoRechazo(e.target.value)}
              rows={4}
              maxLength={500}
              placeholder="Ej: No hay disponibilidad de los robots solicitados en las fechas indicadas..."
              className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-red-500 outline-none"
            />
            <div className="text-right text-xs text-gray-500 mt-1">
              {motivoRechazo.length}/500
            </div>
            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={() => { setShowRechazo(false); setMotivoRechazo('') }}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded transition"
              >
                Cancelar
              </button>
              <button
                onClick={handleRechazar}
                disabled={procesando || motivoRechazo.length < 5}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded font-medium transition disabled:opacity-50"
              >
                Confirmar Rechazo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
