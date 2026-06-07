import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { robotService } from '../services/robot.service'
import { ubicacionService, Ubicacion } from '../services/ubicacion.service'
import { movimientoService } from '../services/movimiento.service'
import { useAuth } from '../contexts/AuthContext'
import { useNotification } from '../contexts/NotificationContext'
import { useRegionLanguage } from '../contexts/RegionLanguageContext'
import { validateRobotForm, formatErrorMessage } from '../utils/validation'

const estadoBadge: Record<string, string> = {
  DISPONIBLE: 'badge-success',
  EN_PRESTAMO: 'badge-info',
  MANTENIMIENTO: 'badge-warning',
  RETIRADO: 'badge-error',
}

export default function RobotsPage() {
  const navigate = useNavigate()
  const { isAdmin, user } = useAuth()
  const { addNotification } = useNotification()
  const { currentRegion } = useRegionLanguage()
  const puedeEditar = isAdmin || user?.rol === 'SERVICIO'

  const [robots, setRobots] = useState<any[]>([])
  const [familias, setFamilias] = useState<any[]>([])
  const [ubicaciones, setUbicaciones] = useState<Ubicacion[]>([])
  const [loading, setLoading] = useState(true)
  const [filtroFamilia, setFiltroFamilia] = useState('')
  const [filtroEstado, setFiltroEstado] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<any>(null)

  const cargar = async () => {
    setLoading(true)
    try {
      const filtros: any = {
        region: currentRegion,
      }
      if (filtroFamilia) filtros.familiaId = filtroFamilia
      if (filtroEstado) filtros.estado = filtroEstado

      console.log('Cargando robots con filtros:', filtros)

      const [rs, fs, ubs] = await Promise.all([
        robotService.listar(filtros),
        robotService.listarFamilias(),
        ubicacionService.listar({ region: currentRegion as any }),
      ])

      console.log('Robots cargados:', rs.length, rs)
      console.log('Familias cargadas:', fs)

      setRobots(rs)
      setFamilias(fs)
      setUbicaciones(ubs)
    } catch (err) {
      console.error(err)
      addNotification(
        'No se pudieron cargar los robots. Intenta nuevamente',
        'error',
        4000,
        '❌ Error al Cargar'
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    cargar()
  }, [filtroFamilia, filtroEstado, currentRegion])

  const handleGuardar = async (data: any) => {
    // Validar antes de enviar
    const validation = validateRobotForm(data)
    if (!validation.valid) {
      const errores = Object.values(validation.errors).join(', ')
      addNotification(`Validación fallida: ${errores}`, 'error')
      return { validation }
    }

    try {
      if (editing?.id) {
        const ubicacionAnterior = editing.ubicacionActual || ''
        await robotService.actualizar(editing.id, data)

        // Registrar movimiento de transferencia si cambió la ubicación
        if (data.ubicacionActual && data.ubicacionActual !== ubicacionAnterior) {
          const nombreDestino =
            ubicaciones.find((u) => u.id === data.ubicacionActual)?.nombre || data.ubicacionActual
          await movimientoService.registrar({
            robotId: editing.id,
            ubicacionOrigen: ubicacionAnterior,
            ubicacionDestino: data.ubicacionActual,
            tipo: 'Transferencia',
            razon: `Transferencia a ${nombreDestino}`,
            usuarioResponsable: {
              id: user?.id || 'sistema',
              nombreCompleto: user?.nombreCompleto || 'Sistema',
              email: user?.email || '',
            },
            fechaMovimiento: new Date().toISOString(),
          })
          addNotification(`Robot actualizado y transferido a ${nombreDestino}`, 'success')
        } else {
          addNotification('Robot actualizado correctamente', 'success')
        }
      } else {
        await robotService.crear(data)
        addNotification('Robot creado correctamente', 'success')
      }
      setShowModal(false)
      setEditing(null)
      cargar()
    } catch (err: any) {
      const errorMsg = formatErrorMessage(err)
      addNotification(`Error al guardar: ${errorMsg}`, 'error')
    }
  }

  const getNombreUbicacion = (id?: string) => {
    if (!id) return '-'
    return ubicaciones.find((u) => u.id === id)?.nombre || id
  }

  const handleEliminar = async (id: string) => {
    const robot = robots.find((r) => r.id === id)
    if (!confirm(`¿Eliminar el robot ${robot?.numeroSerie}? Esta acción no se puede deshacer.`)) return
    try {
      await robotService.eliminar(id)
      addNotification(
        `Robot ${robot?.numeroSerie} eliminado del sistema`,
        'success',
        3000,
        '✅ Robot Eliminado'
      )
      cargar()
    } catch (err: any) {
      addNotification(
        err.message || 'No se pudo eliminar el robot',
        'error',
        4000,
        '❌ Error al Eliminar'
      )
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Cargando robots...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-4xl font-bold gradient-text-primary">Inventario de Robots</h1>
          <p className="text-gray-600 mt-3 font-medium">
            <span className="text-lg font-bold text-gray-900">{robots.length}</span> robots en el sistema
          </p>
        </div>
        {puedeEditar && (
          <button
            onClick={() => { setEditing(null); setShowModal(true) }}
            className="btn-primary shadow-lg"
          >
            <span>+</span> Nuevo Robot
          </button>
        )}
      </div>

      <div className="card-premium">
        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-6 border-b border-blue-100 flex flex-wrap gap-4 items-center">
          <div className="flex-1 min-w-xs">
            <label className="block text-xs font-bold text-gray-600 uppercase mb-2">Familia</label>
            <select
              value={filtroFamilia}
              onChange={(e) => setFiltroFamilia(e.target.value)}
              className="input-field"
            >
              <option value="">Todas las familias</option>
              {familias.map(f => <option key={f.id} value={f.id}>{f.nombreFamilia}</option>)}
            </select>
          </div>
          <div className="flex-1 min-w-xs">
            <label className="block text-xs font-bold text-gray-600 uppercase mb-2">Estado</label>
            <select
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
              className="input-field"
            >
              <option value="">Todos los estados</option>
              <option value="DISPONIBLE">✅ Disponibles</option>
              <option value="EN_PRESTAMO">🤖 En Préstamo</option>
              <option value="MANTENIMIENTO">🔧 Mantenimiento</option>
              <option value="RETIRADO">📦 Retirados</option>
            </select>
          </div>
        </div>

        {robots.length === 0 ? (
          <div className="p-12 text-center">
            <div className="text-5xl mb-4">🤖</div>
            <p className="text-gray-600 font-medium mb-2">No hay robots registrados</p>
            {puedeEditar && <p className="text-sm text-gray-500">Crea uno nuevo con el botón de arriba</p>}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table-premium">
              <thead>
                <tr>
                  <th>N° Serie</th>
                  <th>Modelo</th>
                  <th>Familia</th>
                  <th>Ubicación</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {robots.map(r => (
                  <tr key={r.id}>
                    <td className="font-mono font-bold text-blue-700">{r.numeroSerie}</td>
                    <td className="font-medium text-gray-900">{r.modelo || '-'}</td>
                    <td className="text-gray-700">{r.familia?.nombreFamilia}</td>
                    <td className="text-gray-700">{getNombreUbicacion(r.ubicacionActual)}</td>
                    <td>
                      <span className={estadoBadge[r.estado]}>
                        {r.estado.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="text-right text-sm space-x-3">
                      <button
                        onClick={() => navigate(`/robots/${r.id}/movements`)}
                        className="btn-ghost text-purple-600 hover:text-purple-700"
                        title="Ver historial de movimientos"
                      >
                        📊
                      </button>
                      {puedeEditar && (
                        <>
                          <button
                            onClick={() => { setEditing(r); setShowModal(true) }}
                            className="btn-ghost text-blue-600 hover:text-blue-700"
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => handleEliminar(r.id)}
                            className="btn-ghost text-red-600 hover:text-red-700"
                          >
                            🗑️
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && puedeEditar && (
        <RobotModal
          robot={editing}
          familias={familias}
          ubicaciones={ubicaciones}
          region={currentRegion}
          onSave={handleGuardar}
          onClose={() => { setShowModal(false); setEditing(null) }}
        />
      )}
    </div>
  )
}

function RobotModal({ robot, familias, ubicaciones, region, onSave, onClose }: any) {
  const [form, setForm] = useState({
    numeroSerie: robot?.numeroSerie || '',
    modelo: robot?.modelo || '',
    familiaId: robot?.familiaId || '',
    estado: robot?.estado || 'DISPONIBLE',
    ubicacionActual: robot?.ubicacionActual || '',
    region: robot?.region || region,
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const validation = validateRobotForm(form)
    setErrors(validation.errors)

    if (!validation.valid) {
      return
    }

    setSubmitting(true)
    const result = await onSave(form)
    setSubmitting(false)

    if (result?.validation && !result.validation.valid) {
      setErrors(result.validation.errors)
    }
  }

  return (
    <div className="modal-overlay flex items-center justify-center p-4">
      <div className="modal-content w-full max-w-lg">
        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-6 border-b border-blue-100">
          <h2 className="text-2xl font-bold gradient-text-primary">
            {robot?.id ? '✏️ Editar Robot' : '🤖 Nuevo Robot'}
          </h2>
        </div>
        <form onSubmit={handleSubmit} className="p-8 space-y-5">
          <div>
            <label className="form-label">Número de Serie *</label>
            <input
              type="text"
              value={form.numeroSerie}
              onChange={(e) => {
                setForm({ ...form, numeroSerie: e.target.value })
                if (errors.numeroSerie) setErrors({ ...errors, numeroSerie: '' })
              }}
              required
              disabled={!!robot?.id}
              className={`input-field disabled:bg-gray-50 disabled:cursor-not-allowed ${
                errors.numeroSerie ? 'border-red-500' : ''
              }`}
            />
            {errors.numeroSerie && (
              <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                <span>⚠️</span> {errors.numeroSerie}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="form-group">
              <label className="form-label">Modelo</label>
              <input
                type="text"
                value={form.modelo}
                onChange={(e) => setForm({ ...form, modelo: e.target.value })}
                className="input-field"
                placeholder="UR10e"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Familia *</label>
              <select
                value={form.familiaId}
                onChange={(e) => {
                  setForm({ ...form, familiaId: e.target.value })
                  if (errors.familiaId) setErrors({ ...errors, familiaId: '' })
                }}
                required
                className={`input-field ${errors.familiaId ? 'border-red-500' : ''}`}
              >
                <option value="">Selecciona familia</option>
                {familias.map((f: any) => (
                  <option key={f.id} value={f.id}>{f.nombreFamilia}</option>
                ))}
              </select>
              {errors.familiaId && (
                <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                  <span>⚠️</span> {errors.familiaId}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="form-group">
              <label className="form-label">Estado</label>
              <select
                value={form.estado}
                onChange={(e) => setForm({ ...form, estado: e.target.value })}
                className="input-field"
              >
                <option value="DISPONIBLE">✅ Disponible</option>
                <option value="EN_PRESTAMO">🤖 En Préstamo</option>
                <option value="MANTENIMIENTO">🔧 Mantenimiento</option>
                <option value="RETIRADO">📦 Retirado</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Ubicación</label>
              <select
                value={form.ubicacionActual}
                onChange={(e) => setForm({ ...form, ubicacionActual: e.target.value })}
                className="input-field"
              >
                <option value="">Sin ubicación</option>
                {(ubicaciones || []).map((u: any) => (
                  <option key={u.id} value={u.id}>{u.nombre}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Región *</label>
            <select
              value={form.region}
              onChange={(e) => setForm({ ...form, region: e.target.value })}
              disabled={!!robot?.id}
              required
              className="input-field disabled:bg-gray-50 disabled:cursor-not-allowed"
            >
              <option value="">Selecciona región</option>
              <option value="MX">🇲🇽 México</option>
              <option value="BR">🇧🇷 Brasil</option>
              <option value="USA">🇺🇸 USA</option>
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="btn-secondary disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="btn-primary disabled:opacity-50 flex items-center gap-2"
            >
              {submitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Guardando...
                </>
              ) : robot?.id ? (
                '💾 Guardar'
              ) : (
                '✨ Crear'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
