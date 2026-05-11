import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { robotService } from '../services/robot.service'
import { prestamoService } from '../services/prestamo.service'
import { configuracionService } from '../services/configuracion.service'
import { useRegionLanguage } from '../contexts/RegionLanguageContext'
import { useAuth } from '../contexts/AuthContext'

const PASOS = ['Familia', 'Robots', 'Fechas', 'Motivo', 'Adjuntar PDF', 'Confirmar']

const isWeekend = (date: Date): boolean => {
  const day = date.getDay();
  return day === 0 || day === 6; // 0 = Sunday, 6 = Saturday
};

const getNextWorkday = (date: Date): Date => {
  const next = new Date(date);
  while (isWeekend(next)) {
    next.setDate(next.getDate() + 1);
  }
  return next;
};

export default function NuevaSolicitudPage() {
  const navigate = useNavigate()
  const { currentRegion } = useRegionLanguage()
  const { user } = useAuth()
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
  const [pdfFile, setPdfFile] = useState<{ name: string; size: number; data: string } | null>(null)

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

  const hasWeekendDates = () => {
    if (!fechaInicio || !fechaFin) return false;
    const inicio = new Date(fechaInicio);
    const fin = new Date(fechaFin);
    return isWeekend(inicio) || isWeekend(fin);
  };

  const puedeAvanzar = () => {
    switch (paso) {
      case 0: return !!familiaId
      case 1: return robotsSeleccionados.length > 0
      case 2: return !!fechaInicio && !!fechaFin && new Date(fechaInicio) >= fechaMinima && new Date(fechaFin) > new Date(fechaInicio) && !hasWeekendDates()
      case 3: return motivo.length >= 10
      case 4: return !!pdfFile // Requiere PDF para avanzar
      default: return true
    }
  }

  const handlePdfUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (file.type !== 'application/pdf') {
      setError('El archivo debe ser un PDF')
      return
    }

    if (file.size > 2 * 1024 * 1024) {
      setError('El PDF no debe exceder 2MB (límite reducido para evitar errores de almacenamiento)')
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      const result = e.target?.result as string
      setPdfFile({ name: file.name, size: file.size, data: result })
      setError('')
      console.log('✅ PDF cargado:', file.name, `${(file.size / 1024).toFixed(2)}KB`)
    }
    reader.onerror = () => {
      setError('Error al leer el archivo')
    }
    reader.readAsDataURL(file)
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
        pdfAdjunto: pdfFile,
        usuarioSolicitante: user ? {
          id: user.id,
          nombreCompleto: user.nombreCompleto,
          email: user.email,
          rol: user.rol,
        } : undefined,
        region: currentRegion,
      } as any)
      console.log('✅ Solicitud creada con PDF adjunto:', solicitud);
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
              {hasWeekendDates() && (
                <div className="bg-red-50 border border-red-200 rounded p-3 mb-6 text-sm text-red-800">
                  ❌ <strong>No se permiten fines de semana.</strong> Los préstamos solo pueden ser en días de semana (lunes a viernes).
                </div>
              )}

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">📅 Fecha de inicio</label>
                  <input
                    type="date"
                    value={fechaInicio}
                    min={fechaMinimaStr}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value && isWeekend(new Date(value))) {
                        const next = getNextWorkday(new Date(value));
                        setFechaInicio(next.toISOString().split('T')[0]);
                      } else {
                        setFechaInicio(value);
                      }
                    }}
                    className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-teradyne-secondary outline-none text-lg ${
                      fechaInicio && isWeekend(new Date(fechaInicio)) ? 'border-red-400 bg-red-50' : 'border-gray-300'
                    }`}
                  />
                  {fechaInicio && (
                    <p className={`text-sm mt-2 ${isWeekend(new Date(fechaInicio)) ? 'text-red-600 font-semibold' : 'text-gray-600'}`}>
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
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value && isWeekend(new Date(value))) {
                        const next = getNextWorkday(new Date(value));
                        setFechaFin(next.toISOString().split('T')[0]);
                      } else {
                        setFechaFin(value);
                      }
                    }}
                    className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-teradyne-secondary outline-none text-lg ${
                      fechaFin && isWeekend(new Date(fechaFin)) ? 'border-red-400 bg-red-50' : 'border-gray-300'
                    }`}
                  />
                  {fechaFin && (
                    <p className={`text-sm mt-2 ${isWeekend(new Date(fechaFin)) ? 'text-red-600 font-semibold' : 'text-gray-600'}`}>
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
              <h2 className="text-xl font-semibold mb-4">📎 Adjuntar PDF de Solicitud</h2>
              <p className="text-sm text-gray-600 mb-6">Sube el documento PDF de respaldo de tu solicitud (máximo 2MB).</p>

              <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg mb-4 text-sm">
                <p className="font-semibold text-gray-700 mb-2">Resumen de la solicitud:</p>
                <p className="text-gray-600">📦 {robotsSeleccionados.length} robot(s) por {diasDuracion} días</p>
                <p className="text-gray-600 mt-1">📝 {motivo.substring(0, 80)}{motivo.length > 80 ? '...' : ''}</p>
              </div>

              {!pdfFile ? (
                <label className="block">
                  <div className="w-full px-6 py-12 border-2 border-dashed border-gray-300 hover:border-teradyne-secondary rounded-lg cursor-pointer text-center transition bg-gray-50 hover:bg-blue-50">
                    <div className="text-4xl mb-3">📄</div>
                    <p className="text-gray-700 font-medium mb-1">Haz clic para subir el PDF</p>
                    <p className="text-xs text-gray-500">Solo archivos PDF · Máx 2MB</p>
                  </div>
                  <input
                    type="file"
                    accept="application/pdf"
                    onChange={handlePdfUpload}
                    className="hidden"
                  />
                </label>
              ) : (
                <div className="border-2 border-green-300 bg-green-50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="text-3xl">✅</div>
                      <div>
                        <p className="font-semibold text-gray-900">{pdfFile.name}</p>
                        <p className="text-xs text-gray-600">{(pdfFile.size / 1024).toFixed(2)} KB</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setPdfFile(null)}
                      className="px-3 py-1 text-sm text-red-600 hover:bg-red-100 rounded transition"
                    >
                      🗑️ Eliminar
                    </button>
                  </div>
                </div>
              )}
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
                {pdfFile && (
                  <div className="bg-blue-50 border border-blue-200 p-4 rounded">
                    <div className="text-xs font-semibold text-blue-700 mb-1">PDF ADJUNTO</div>
                    <div className="flex items-center gap-2 text-sm">
                      <span>📎</span>
                      <span className="font-semibold">{pdfFile.name}</span>
                      <span className="text-gray-500">({(pdfFile.size / 1024).toFixed(2)} KB)</span>
                    </div>
                  </div>
                )}
                <div className="bg-green-50 border border-green-200 p-4 rounded text-sm text-green-900">
                  ✅ Al confirmar, se enviará la solicitud completa con el PDF adjunto para aprobación.
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
