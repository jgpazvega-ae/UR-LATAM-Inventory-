import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ubicacionService, Ubicacion, EstadoUbicacion, TipoUbicacion } from '../services/ubicacion.service'
import { robotService } from '../services/robot.service'
import { useAuth } from '../contexts/AuthContext'
import { useRegionLanguage } from '../contexts/RegionLanguageContext'
import { useNotification } from '../contexts/NotificationContext'
import { validateLocationForm, formatErrorMessage } from '../utils/validation'

const iconoPorTipo = {
  Oficina: '🏢',
  Cliente: '👥',
  Almacén: '📦',
  Taller: '🔧',
  Otro: '📍',
};

const colorPorTipo: Record<TipoUbicacion, string> = {
  Oficina: 'bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-100',
  Cliente: 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-100',
  Almacén: 'bg-gradient-to-br from-yellow-50 to-amber-50 border-yellow-100',
  Taller: 'bg-gradient-to-br from-orange-50 to-red-50 border-orange-100',
  Otro: 'bg-gradient-to-br from-gray-50 to-slate-50 border-gray-100',
};

const accentPorTipo: Record<TipoUbicacion, string> = {
  Oficina: 'text-blue-600 bg-blue-100',
  Cliente: 'text-green-600 bg-green-100',
  Almacén: 'text-yellow-600 bg-yellow-100',
  Taller: 'text-orange-600 bg-orange-100',
  Otro: 'text-gray-600 bg-gray-100',
};

export default function UbicacionesPage() {
  const navigate = useNavigate()
  const { isAdmin } = useAuth()
  const { currentRegion } = useRegionLanguage()
  const { addNotification } = useNotification()

  const [ubicaciones, setUbicaciones] = useState<Ubicacion[]>([])
  const [robots, setRobots] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filtro, setFiltro] = useState<'todas' | 'activas' | 'inactivas'>('activas')
  const [showModal, setShowModal] = useState(false)
  const [editando, setEditando] = useState<Ubicacion | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [formData, setFormData] = useState({
    nombre: '',
    tipo: 'Oficina' as TipoUbicacion,
    direccion: '',
    ciudad: '',
    contactoNombre: '',
    contactoEmail: '',
    contactoTelefono: '',
  })

  const cargar = async () => {
    setLoading(true)
    try {
      const ubs = await ubicacionService.listar({ region: currentRegion })
      const robs = await robotService.listar({ region: currentRegion })
      setUbicaciones(ubs)
      setRobots(robs)
    } catch (err) {
      console.error('Error cargando ubicaciones:', err)
      addNotification(
        'No se pudieron cargar las ubicaciones',
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
  }, [currentRegion])

  const ubicacionesFiltradas = ubicaciones.filter((u) => {
    if (filtro === 'activas') return u.estado === 'Activa'
    if (filtro === 'inactivas') return u.estado !== 'Activa'
    return true
  })

  const getRobotsEnUbicacion = (ubicacionId: string) => {
    return robots.filter((r) => r.ubicacionActual === ubicacionId)
  }

  const handleOpenModal = (ubicacion?: Ubicacion) => {
    setFormErrors({})
    if (ubicacion) {
      setEditando(ubicacion)
      setFormData({
        nombre: ubicacion.nombre,
        tipo: ubicacion.tipo,
        direccion: ubicacion.direccion,
        ciudad: ubicacion.ciudad,
        contactoNombre: ubicacion.contacto.nombre,
        contactoEmail: ubicacion.contacto.email,
        contactoTelefono: ubicacion.contacto.telefono,
      })
    } else {
      setEditando(null)
      setFormData({
        nombre: '',
        tipo: 'Oficina',
        direccion: '',
        ciudad: '',
        contactoNombre: '',
        contactoEmail: '',
        contactoTelefono: '',
      })
    }
    setShowModal(true)
  }

  const handleSave = async (validationErrors?: Record<string, string>) => {
    // Validar antes de enviar
    const validation = validateLocationForm(formData)
    setFormErrors(validation.errors)

    if (!validation.valid) {
      const errores = Object.values(validation.errors).join(', ')
      addNotification(`Validación fallida: ${errores}`, 'error')
      return { validation }
    }

    setSubmitting(true)
    try {
      const data = {
        nombre: formData.nombre,
        tipo: formData.tipo,
        direccion: formData.direccion,
        ciudad: formData.ciudad,
        region: currentRegion as 'MX' | 'BR' | 'USA',
        contacto: {
          nombre: formData.contactoNombre,
          email: formData.contactoEmail,
          telefono: formData.contactoTelefono,
        },
        estado: 'Activa' as EstadoUbicacion,
      }

      if (editando) {
        await ubicacionService.actualizar(editando.id, data)
        addNotification('Ubicación actualizada correctamente', 'success')
      } else {
        await ubicacionService.crear(data)
        addNotification('Ubicación creada correctamente', 'success')
      }
      setShowModal(false)
      cargar()
    } catch (err: any) {
      const errorMsg = formatErrorMessage(err)
      addNotification(`Error al guardar: ${errorMsg}`, 'error')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Cargando ubicaciones...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-4xl font-bold gradient-text-primary">Ubicaciones</h1>
          <p className="text-gray-600 mt-3 font-medium">Gestiona todas las ubicaciones y visualiza dónde están los robots</p>
        </div>
        {isAdmin && (
          <button
            onClick={() => handleOpenModal()}
            className="btn-primary shadow-lg"
          >
            <span>+</span> Nueva Ubicación
          </button>
        )}
      </div>

      {/* Filter Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {[
          { key: 'todas', label: 'Total', count: ubicaciones.length, icon: '📍' },
          { key: 'activas', label: 'Activas', count: ubicaciones.filter((u) => u.estado === 'Activa').length, icon: '✅' },
          { key: 'inactivas', label: 'Inactivas', count: ubicaciones.filter((u) => u.estado !== 'Activa').length, icon: '❌' },
        ].map(f => (
          <button
            key={f.key}
            onClick={() => setFiltro(f.key as any)}
            className={`card-premium p-4 transition-all duration-300 hover:scale-102 ${
              filtro === f.key ? 'ring-2 ring-blue-500 shadow-lg' : ''
            }`}
          >
            <div className="text-2xl mb-2">{f.icon}</div>
            <div className="text-3xl font-bold text-gray-900">{f.count}</div>
            <div className="text-xs text-gray-600 mt-2 font-semibold">{f.label}</div>
          </button>
        ))}
      </div>

      {/* Grid de Ubicaciones */}
      {ubicacionesFiltradas.length === 0 ? (
        <div className="card-premium p-12 text-center">
          <div className="text-5xl mb-4">📭</div>
          <p className="text-gray-600 font-medium mb-4">No hay ubicaciones disponibles</p>
          {isAdmin && (
            <button
              onClick={() => handleOpenModal()}
              className="btn-primary"
            >
              + Crear primera ubicación
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {ubicacionesFiltradas.map((ubicacion) => {
            const robotsEnUbicacion = getRobotsEnUbicacion(ubicacion.id)
            return (
              <div
                key={ubicacion.id}
                className={`card-premium p-6 cursor-pointer transition-all hover:shadow-premium-lg ${colorPorTipo[ubicacion.tipo]}`}
                onClick={() => navigate(`/robots?ubicacion=${ubicacion.id}`)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="text-4xl mb-2">{iconoPorTipo[ubicacion.tipo]}</div>
                    <h3 className="text-lg font-bold text-gray-900">{ubicacion.nombre}</h3>
                    <p className="text-sm text-gray-600 mt-1 font-semibold">{ubicacion.tipo}</p>
                  </div>
                  <div className={`px-3 py-1.5 rounded-lg text-xs font-bold ${
                    ubicacion.estado === 'Activa' ? 'badge-success' : 'badge-error'
                  }`}>
                    {ubicacion.estado}
                  </div>
                </div>

                <div className="space-y-2 mb-4 text-sm text-gray-700 border-b border-gray-200 pb-4">
                  <p className="flex items-center gap-2"><span>📍</span> {ubicacion.direccion}</p>
                  <p className="flex items-center gap-2"><span>🏙️</span> {ubicacion.ciudad}</p>
                  <p className="flex items-center gap-2"><span>📞</span> {ubicacion.contacto.telefono}</p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-gray-700">Robots</span>
                    <span className={`text-xl font-bold ${accentPorTipo[ubicacion.tipo]} px-3 py-1 rounded-lg`}>
                      {robotsEnUbicacion.length}
                    </span>
                  </div>

                  {robotsEnUbicacion.length > 0 ? (
                    <div className="space-y-2">
                      {robotsEnUbicacion.slice(0, 3).map((robot) => (
                        <div key={robot.id} className="text-xs bg-white/60 p-2.5 rounded-lg flex items-center gap-2 hover:bg-white transition">
                          <span>🤖</span>
                          <span className="font-mono font-semibold text-blue-600">{robot.numeroSerie}</span>
                          <span className="text-gray-500 flex-1 text-xs">{robot.modelo}</span>
                          <span className={`text-xs px-2 py-1 rounded font-medium ${
                            robot.estado === 'EN_PRESTAMO' ? 'badge-info' :
                            robot.estado === 'DISPONIBLE' ? 'badge-success' :
                            'badge-warning'
                          }`}>
                            {robot.estado.replace('_', ' ')}
                          </span>
                        </div>
                      ))}
                      {robotsEnUbicacion.length > 3 && (
                        <p className="text-xs text-gray-500 font-medium p-2 text-center">+{robotsEnUbicacion.length - 3} más...</p>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 italic text-center py-2">Sin robots aquí</p>
                  )}
                </div>

                {isAdmin && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleOpenModal(ubicacion)
                    }}
                    className="w-full mt-4 btn-secondary"
                  >
                    ✏️ Editar
                  </button>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay p-4">
          <div className="modal-content w-full max-w-lg">
            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-6 border-b border-blue-100">
              <h2 className="text-2xl font-bold gradient-text-primary">
                {editando ? '✏️ Editar Ubicación' : '📍 Nueva Ubicación'}
              </h2>
            </div>

            <div className="p-8 space-y-5">
              <div className="form-group">
                <label className="form-label">Nombre</label>
                <input
                  type="text"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  className="input-field"
                  placeholder="Oficina Central"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Tipo</label>
                <select
                  value={formData.tipo}
                  onChange={(e) => setFormData({ ...formData, tipo: e.target.value as TipoUbicacion })}
                  className="input-field"
                >
                  <option>Oficina</option>
                  <option>Cliente</option>
                  <option>Almacén</option>
                  <option>Taller</option>
                  <option>Otro</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="form-label">Dirección</label>
                  <input
                    type="text"
                    value={formData.direccion}
                    onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                    className="input-field"
                    placeholder="Calle 123"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Ciudad</label>
                  <input
                    type="text"
                    value={formData.ciudad}
                    onChange={(e) => setFormData({ ...formData, ciudad: e.target.value })}
                    className="input-field"
                    placeholder="México"
                  />
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4">
                <h3 className="text-sm font-bold text-gray-700 uppercase mb-4">Contacto</h3>

                <div className="form-group">
                  <label className="form-label">Nombre Contacto</label>
                  <input
                    type="text"
                    value={formData.contactoNombre}
                    onChange={(e) => setFormData({ ...formData, contactoNombre: e.target.value })}
                    className="input-field"
                    placeholder="Juan García"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="form-group">
                    <label className="form-label">Email</label>
                    <input
                      type="email"
                      value={formData.contactoEmail}
                      onChange={(e) => {
                        setFormData({ ...formData, contactoEmail: e.target.value })
                        if (formErrors.contactoEmail) setFormErrors({ ...formErrors, contactoEmail: '' })
                      }}
                      className={`input-field ${formErrors.contactoEmail ? 'border-red-500' : ''}`}
                      placeholder="juan@empresa.com"
                    />
                    {formErrors.contactoEmail && (
                      <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                        <span>⚠️</span> {formErrors.contactoEmail}
                      </p>
                    )}
                  </div>

                  <div className="form-group">
                    <label className="form-label">Teléfono</label>
                    <input
                      type="tel"
                      value={formData.contactoTelefono}
                      onChange={(e) => {
                        setFormData({ ...formData, contactoTelefono: e.target.value })
                        if (formErrors.contactoTelefono) setFormErrors({ ...formErrors, contactoTelefono: '' })
                      }}
                      className={`input-field ${formErrors.contactoTelefono ? 'border-red-500' : ''}`}
                      placeholder="+55 1234 5678"
                    />
                    {formErrors.contactoTelefono && (
                      <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                        <span>⚠️</span> {formErrors.contactoTelefono}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3 justify-end p-6 border-t border-gray-200 bg-gray-50">
              <button
                onClick={() => setShowModal(false)}
                disabled={submitting}
                className="btn-secondary disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={submitting}
                className="btn-primary disabled:opacity-50 flex items-center gap-2"
              >
                {submitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Guardando...
                  </>
                ) : (
                  '💾 Guardar'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
