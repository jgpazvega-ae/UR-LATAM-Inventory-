import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { jsPDF } from 'jspdf'
import { robotService } from '../services/robot.service'
import { prestamoService } from '../services/prestamo.service'
import { configuracionService } from '../services/configuracion.service'
import { useRegionLanguage } from '../contexts/RegionLanguageContext'

const PASOS = ['Familia', 'Robots', 'Fechas', 'Motivo', 'PDF', 'Confirmar']

export default function NuevaSolicitudPage() {
  const navigate = useNavigate()
  const { currentRegion } = useRegionLanguage()
  const [paso, setPaso] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [prestamoActivo, setPrestamoActivo] = useState<any>(null)

  // Datos del wizard
  const [familias, setFamilias] = useState<any[]>([])
  const [robots, setRobots] = useState<any[]>([])
  const [diasMin, setDiasMin] = useState(7)

  // Selecciones
  const [familiaId, setFamiliaId] = useState('')
  const [robotsSeleccionados, setRobotsSeleccionados] = useState<any[]>([])
  const [fechaInicio, setFechaInicio] = useState('')
  const [fechaFin, setFechaFin] = useState('')
  const [motivo, setMotivo] = useState('')

  const fechaMinima = new Date()
  fechaMinima.setDate(fechaMinima.getDate() + diasMin)
  const fechaMinimaStr = fechaMinima.toISOString().split('T')[0]

  useEffect(() => {
    const cargar = async () => {
      try {
        console.log('📋 Cargando datos para nueva solicitud...');

        const [fams, config, solicitudes] = await Promise.all([
          robotService.listarFamilias(),
          configuracionService.obtener(),
          prestamoService.listar({ estado: 'ACTIVO', usuario: 'mias' }),
        ])

        console.log('✅ Familias cargadas:', fams?.length || 0, fams);
        console.log('✅ Configuración:', config);
        console.log('✅ Solicitudes activas:', solicitudes?.length || 0);

        if (!fams || fams.length === 0) {
          console.warn('⚠️ ALERTA: No hay familias disponibles');
          setError('No hay familias de robots. Contacta al administrador.');
        }

        setFamilias(fams || [])
        if (config?.diasMinimosAnticipacion) setDiasMin(config.diasMinimosAnticipacion)

        // Verificar si hay un préstamo activo sin confirmar recepción
        if (solicitudes && solicitudes.length > 0) {
          const prestamoSinRecepcion = solicitudes.find((s: any) => !s.estadoRecepcion)
          if (prestamoSinRecepcion) {
            setPrestamoActivo(prestamoSinRecepcion)
          }
        }
      } catch (err) {
        console.error('❌ Error cargando datos:', err);
        setError(`Error: ${(err as any).message || 'Error desconocido'}`);
      }
    }
    cargar()
  }, [])

  useEffect(() => {
    if (familiaId) {
      robotService.listar({ familiaId, disponibles: true, region: currentRegion }).then(setRobots)
    }
  }, [familiaId, currentRegion])

  const toggleRobot = (robot: any) => {
    if (robotsSeleccionados.find(r => r.id === robot.id)) {
      setRobotsSeleccionados(robotsSeleccionados.filter(r => r.id !== robot.id))
    } else {
      setRobotsSeleccionados([...robotsSeleccionados, robot])
    }
  }

  const puedeAvanzar = () => {
    switch (paso) {
      case 0: return !!familiaId
      case 1: return robotsSeleccionados.length > 0
      case 2: return !!fechaInicio && !!fechaFin && new Date(fechaInicio) >= fechaMinima && new Date(fechaFin) > new Date(fechaInicio)
      case 3: return motivo.length >= 10
      case 4: return true // PDF review, siempre puede avanzar
      default: return true
    }
  }

  const enviar = async () => {
    setLoading(true)
    setError('')
    try {
      const solicitud = await prestamoService.crear({
        robotIds: robotsSeleccionados.map(r => r.id),
        fechaInicio,
        fechaFin,
        motivo,
      })
      console.log('✅ Solicitud creada:', solicitud);
      // Mostrar mensaje de éxito y redirigir
      setTimeout(() => {
        navigate('/solicitudes')
      }, 1000)
    } catch (err: any) {
      console.error('❌ Error al crear solicitud:', err);
      setError(err.message || 'Error al crear solicitud')
    } finally {
      setLoading(false)
    }
  }

  const diasDuracion = fechaInicio && fechaFin
    ? Math.ceil((new Date(fechaFin).getTime() - new Date(fechaInicio).getTime()) / (1000 * 60 * 60 * 24))
    : 0

  const descargarPDF = () => {
    try {
      const doc = new jsPDF()
      const pageWidth = doc.internal.pageSize.getWidth()
      const pageHeight = doc.internal.pageSize.getHeight()
      let yPosition = 20

      // Header
      doc.setFontSize(20)
      doc.text('SOLICITUD DE PRÉSTAMO DE ROBOTS', pageWidth / 2, yPosition, { align: 'center' })

      yPosition += 15
      doc.setFontSize(10)
      doc.setTextColor(100)
      const fecha = new Date()
      doc.text(`Fecha: ${fecha.toLocaleDateString('es-ES')} - ${fecha.toLocaleTimeString('es-ES')}`, pageWidth / 2, yPosition, { align: 'center' })

      yPosition += 15
      doc.setTextColor(0)
      doc.setFontSize(12)
      doc.text('DETALLES DE LA SOLICITUD', 15, yPosition)

      yPosition += 10
      doc.setFontSize(10)
      doc.text(`Número de Robots: ${robotsSeleccionados.length}`, 15, yPosition)
      yPosition += 7

      // Robots
      doc.text('Robots Solicitados:', 15, yPosition)
      yPosition += 5
      doc.setFontSize(9)
      robotsSeleccionados.forEach(r => {
        if (yPosition > pageHeight - 20) {
          doc.addPage()
          yPosition = 20
        }
        doc.text(`• ${r.numeroSerie} (${r.modelo})`, 20, yPosition)
        yPosition += 5
      })

      yPosition += 3
      doc.setFontSize(10)
      doc.text(`Período: ${new Date(fechaInicio).toLocaleDateString('es-ES')} al ${new Date(fechaFin).toLocaleDateString('es-ES')} (${diasDuracion} días)`, 15, yPosition)
      yPosition += 7

      doc.text(`Motivo: ${motivo}`, 15, yPosition)
      yPosition += 10

      // Footer
      doc.setFontSize(9)
      doc.setTextColor(150)
      doc.text('Este documento es generado automáticamente por el Sistema de Control de Inventarios de Teradyne Robotics', 15, pageHeight - 10)

      // Descargar
      doc.save(`Solicitud-Prestamo-${fecha.getTime()}.pdf`)
      console.log('✅ PDF descargado exitosamente')
    } catch (err) {
      console.error('❌ Error generando PDF:', err)
    }
  }

  if (prestamoActivo) {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="bg-red-50 border-2 border-red-200 rounded-lg p-6">
          <h2 className="text-2xl font-bold text-red-800 mb-3">⚠️ Préstamo Activo Pendiente de Devolución</h2>
          <p className="text-red-700 mb-4">
            No puedes crear una nueva solicitud mientras tengas un préstamo activo sin confirmar recepción.
          </p>
          <div className="bg-white rounded p-4 mb-4 border border-red-200">
            <p className="text-sm text-gray-700 mb-2"><strong>Solicitud Activa:</strong> {prestamoActivo.numeroSolicitud}</p>
            <p className="text-sm text-gray-700 mb-2"><strong>Fecha de Retorno Teórico:</strong> {prestamoActivo.fechaFin || prestamoActivo.fechaFinSolicitada ? new Date(prestamoActivo.fechaFin || prestamoActivo.fechaFinSolicitada).toLocaleDateString('es-ES') : 'N/A'}</p>
            <p className="text-sm text-gray-700"><strong>Estado:</strong> {prestamoActivo.estado}</p>
          </div>
          <p className="text-red-700 mb-6">
            Por favor, devuelve los robots antes de crear una nueva solicitud. El personal de servicio debe confirmar la recepción.
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => navigate(`/solicitudes/${prestamoActivo.id}`)}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-medium transition"
            >
              Ver Solicitud Activa
            </button>
            <button
              onClick={() => navigate('/solicitudes')}
              className="px-6 py-2 text-gray-700 hover:bg-gray-200 rounded transition"
            >
              Volver a Solicitudes
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Nueva Solicitud de Demo</h1>
        <p className="text-gray-600 mt-1">Paso {paso + 1} de {PASOS.length}: {PASOS[paso]}</p>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-2 border-b bg-gray-50">
          <div className="flex">
            {PASOS.map((nombre, i) => (
              <div
                key={i}
                className={`flex-1 text-center py-2 text-xs font-medium ${
                  i === paso ? 'text-teradyne-secondary' : i < paso ? 'text-green-600' : 'text-gray-400'
                }`}
              >
                {i < paso ? '✓ ' : ''}{nombre}
              </div>
            ))}
          </div>
        </div>

        <div className="p-8 min-h-[400px]">
          {error && <div className="mb-4 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded">{error}</div>}

          {paso === 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Selecciona la familia de robot</h2>
              <div className="grid grid-cols-2 gap-3">
                {familias.map(f => (
                  <button
                    key={f.id}
                    onClick={() => { setFamiliaId(f.id); setRobotsSeleccionados([]) }}
                    className={`p-4 border-2 rounded-lg text-left transition ${
                      familiaId === f.id ? 'border-teradyne-secondary bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="font-semibold text-gray-900">{f.nombreFamilia}</div>
                    <div className="text-sm text-gray-500 mt-1">{f._count?.robots || 0} robots</div>
                    {f.descripcion && <div className="text-xs text-gray-600 mt-2">{f.descripcion}</div>}
                  </button>
                ))}
                {familias.length === 0 && (
                  <div className="col-span-2 text-center text-gray-500 py-8">
                    No hay familias de robots configuradas. Contacta al administrador.
                  </div>
                )}
              </div>
            </div>
          )}

          {paso === 1 && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Selecciona los robots</h2>
              <p className="text-sm text-gray-600 mb-4">Robots disponibles en familia seleccionada</p>
              <div className="space-y-2">
                {robots.length === 0 && (
                  <div className="text-center text-gray-500 py-8">
                    No hay robots disponibles en esta familia
                  </div>
                )}
                {robots.map(r => {
                  const seleccionado = robotsSeleccionados.find(rs => rs.id === r.id)
                  return (
                    <button
                      key={r.id}
                      onClick={() => toggleRobot(r)}
                      className={`w-full p-3 border-2 rounded-lg text-left transition flex items-center justify-between ${
                        seleccionado ? 'border-teradyne-secondary bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div>
                        <div className="font-semibold">{r.numeroSerie}</div>
                        <div className="text-sm text-gray-500">{r.modelo} - {r.ubicacionActual || 'Sin ubicación'}</div>
                      </div>
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                        seleccionado ? 'bg-teradyne-secondary border-teradyne-secondary text-white' : 'border-gray-300'
                      }`}>
                        {seleccionado && '✓'}
                      </div>
                    </button>
                  )
                })}
              </div>
              {robotsSeleccionados.length > 0 && (
                <div className="mt-4 p-3 bg-blue-50 rounded">
                  <strong>{robotsSeleccionados.length}</strong> robot(s) seleccionado(s)
                </div>
              )}
            </div>
          )}

          {paso === 2 && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Fechas de préstamo</h2>
              <div className="bg-yellow-50 border border-yellow-200 rounded p-3 mb-6 text-sm text-yellow-800">
                ⚠️ <strong>Mínimo {diasMin} días de anticipación.</strong> Fecha mínima: {new Date(fechaMinimaStr).toLocaleDateString('es-ES')}
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">📅 Fecha de inicio</label>
                  <input
                    type="date"
                    value={fechaInicio}
                    min={fechaMinimaStr}
                    onChange={(e) => setFechaInicio(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-teradyne-secondary focus:ring-2 focus:ring-teradyne-secondary outline-none text-lg"
                  />
                  {fechaInicio && (
                    <p className="text-sm text-gray-600 mt-2">
                      {new Date(fechaInicio).toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                  )}
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded p-4 text-center">
                  <p className="text-sm text-blue-700 font-medium">
                    {diasDuracion > 0 ? `Duración seleccionada: ${diasDuracion} días` : 'Selecciona ambas fechas'}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">📅 Fecha de fin</label>
                  <input
                    type="date"
                    value={fechaFin}
                    min={fechaInicio || fechaMinimaStr}
                    onChange={(e) => setFechaFin(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-teradyne-secondary focus:ring-2 focus:ring-teradyne-secondary outline-none text-lg"
                  />
                  {fechaFin && (
                    <p className="text-sm text-gray-600 mt-2">
                      {new Date(fechaFin).toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {paso === 3 && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Motivo de la solicitud</h2>
              <p className="text-sm text-gray-600 mb-4">Describe el propósito del préstamo (mínimo 10 caracteres)</p>
              <textarea
                value={motivo}
                onChange={(e) => setMotivo(e.target.value)}
                rows={6}
                maxLength={500}
                className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-teradyne-secondary outline-none"
                placeholder="Ej: Demostración a cliente XYZ para evaluar automatización en línea de ensamblaje..."
              />
              <div className="text-right text-xs text-gray-500 mt-1">
                {motivo.length}/500 caracteres
              </div>
            </div>
          )}

          {paso === 4 && (
            <div>
              <h2 className="text-xl font-semibold mb-4">📄 Descargar PDF</h2>
              <p className="text-sm text-gray-600 mb-6">Tu solicitud está lista. Descarga el PDF para tener un registro de los detalles.</p>
              <div className="bg-blue-50 border border-blue-200 p-6 rounded-lg mb-6">
                <div className="space-y-3">
                  <div>
                    <span className="font-semibold text-gray-700">Robots solicitados:</span>
                    <p className="text-sm text-gray-600 mt-1">{robotsSeleccionados.length} robot(s)</p>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-700">Período:</span>
                    <p className="text-sm text-gray-600 mt-1">{diasDuracion} días</p>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-700">Motivo:</span>
                    <p className="text-sm text-gray-600 mt-1">{motivo}</p>
                  </div>
                </div>
              </div>
              <button
                onClick={() => descargarPDF()}
                className="w-full px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition"
              >
                📥 Descargar PDF de Solicitud
              </button>
            </div>
          )}

          {paso === 5 && (
            <div>
              <h2 className="text-xl font-semibold mb-4">✅ Confirmar Solicitud</h2>
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded">
                  <div className="text-xs font-semibold text-gray-500 mb-1">ROBOTS</div>
                  <div className="text-sm">{robotsSeleccionados.map(r => `${r.numeroSerie} (${r.modelo || ''})`).join(', ')}</div>
                </div>
                <div className="bg-gray-50 p-4 rounded">
                  <div className="text-xs font-semibold text-gray-500 mb-1">PERÍODO</div>
                  <div className="text-sm">{new Date(fechaInicio).toLocaleDateString('es-ES')} - {new Date(fechaFin).toLocaleDateString('es-ES')} ({diasDuracion} días)</div>
                </div>
                <div className="bg-gray-50 p-4 rounded">
                  <div className="text-xs font-semibold text-gray-500 mb-1">MOTIVO</div>
                  <div className="text-sm">{motivo}</div>
                </div>
                <div className="bg-green-50 border border-green-200 p-4 rounded text-sm text-green-900">
                  ✅ Tu solicitud será creada con los detalles anteriores. Puedes descargar el PDF antes de confirmar.
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="p-4 border-t bg-gray-50 flex justify-between">
          <button
            onClick={() => paso === 0 ? navigate('/solicitudes') : setPaso(paso - 1)}
            className="px-4 py-2 text-gray-700 hover:bg-gray-200 rounded transition"
          >
            ← {paso === 0 ? 'Cancelar' : 'Atrás'}
          </button>
          {paso < PASOS.length - 1 ? (
            <button
              onClick={() => setPaso(paso + 1)}
              disabled={!puedeAvanzar()}
              className="px-6 py-2 bg-teradyne-secondary hover:bg-blue-600 text-white rounded font-medium transition disabled:opacity-50"
            >
              Siguiente →
            </button>
          ) : (
            <button
              onClick={enviar}
              disabled={loading}
              className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded font-medium transition disabled:opacity-50"
            >
              {loading ? 'Enviando...' : 'Confirmar Solicitud'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
