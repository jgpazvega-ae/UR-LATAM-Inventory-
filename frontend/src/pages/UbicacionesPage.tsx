import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ubicacionService, Ubicacion, EstadoUbicacion, TipoUbicacion } from '../services/ubicacion.service'
import { robotService } from '../services/robot.service'
import { useAuth } from '../contexts/AuthContext'
import { useRegionLanguage } from '../contexts/RegionLanguageContext'
import { useNotification } from '../contexts/NotificationContext'

const iconoPorTipo = {
  Oficina: '🏢',
  Cliente: '👥',
  Almacén: '📦',
  Taller: '🔧',
  Otro: '📍',
};

const colorPorTipo: Record<TipoUbicacion, string> = {
  Oficina: 'bg-blue-50 border-blue-200',
  Cliente: 'bg-green-50 border-green-200',
  Almacén: 'bg-yellow-50 border-yellow-200',
  Taller: 'bg-orange-50 border-orange-200',
  Otro: 'bg-gray-50 border-gray-200',
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

  const handleSave = async () => {
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
        addNotification('Ubicación actualizada', 'success')
      } else {
        await ubicacionService.crear(data)
        addNotification('Ubicación creada', 'success')
      }
      setShowModal(false)
      cargar()
    } catch (err: any) {
      addNotification(err.message || 'Error al guardar ubicación', 'error')
    }
  }

  if (loading) {
    return <div className="text-center py-8">Cargando ubicaciones...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">📍 Ubicaciones de Robots</h1>
          <p className="text-gray-600 mt-1">Gestiona todas las ubicaciones y visualiza dónde están los robots</p>
        </div>
        {isAdmin && (
          <button
            onClick={() => handleOpenModal()}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition"
          >
            + Nueva Ubicación
          </button>
        )}
      </div>

      {/* Filtros */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <button
          onClick={() => setFiltro('todas')}
          className={`p-3 rounded-lg border-2 transition ${
            filtro === 'todas' ? 'border-gray-400 bg-gray-50' : 'border-gray-200 bg-white hover:border-gray-300'
          }`}
        >
          <div className="text-2xl font-bold text-gray-900">{ubicaciones.length}</div>
          <div className="text-xs text-gray-500 mt-1">Total</div>
        </button>
        <button
          onClick={() => setFiltro('activas')}
          className={`p-3 rounded-lg border-2 transition ${
            filtro === 'activas' ? 'border-green-400 bg-green-50' : 'border-gray-200 bg-white hover:border-gray-300'
          }`}
        >
          <div className="text-2xl font-bold text-green-700">{ubicaciones.filter((u) => u.estado === 'Activa').length}</div>
          <div className="text-xs text-gray-500 mt-1">Activas</div>
        </button>
        <button
          onClick={() => setFiltro('inactivas')}
          className={`p-3 rounded-lg border-2 transition ${
            filtro === 'inactivas' ? 'border-orange-400 bg-orange-50' : 'border-gray-200 bg-white hover:border-gray-300'
          }`}
        >
          <div className="text-2xl font-bold text-orange-700">{ubicaciones.filter((u) => u.estado !== 'Activa').length}</div>
          <div className="text-xs text-gray-500 mt-1">Inactivas</div>
        </button>
      </div>

      {/* Grid de Ubicaciones */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {ubicacionesFiltradas.map((ubicacion) => {
          const robotsEnUbicacion = getRobotsEnUbicacion(ubicacion.id)
          return (
            <div
              key={ubicacion.id}
              className={`rounded-lg border-2 p-6 transition hover:shadow-lg cursor-pointer ${colorPorTipo[ubicacion.tipo]}`}
              onClick={() => navigate(`/robots?ubicacion=${ubicacion.id}`)}
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="text-3xl mb-2">{iconoPorTipo[ubicacion.tipo]}</div>
                  <h3 className="text-lg font-semibold text-gray-900">{ubicacion.nombre}</h3>
                  <p className="text-sm text-gray-600 mt-1">{ubicacion.tipo}</p>
                </div>
                <div className={`px-3 py-1 rounded text-xs font-medium ${
                  ubicacion.estado === 'Activa' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {ubicacion.estado}
                </div>
              </div>

              <div className="space-y-2 mb-4 text-sm text-gray-700">
                <p>📍 {ubicacion.direccion}</p>
                <p>🏙️ {ubicacion.ciudad}</p>
                <p>📞 {ubicacion.contacto.telefono}</p>
              </div>

              <div className="pt-4 border-t border-gray-300">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-semibold text-gray-700">Robots en ubicación</span>
                  <span className="text-xl font-bold text-teradyne-secondary">{robotsEnUbicacion.length}</span>
                </div>

                {robotsEnUbicacion.length > 0 ? (
                  <div className="space-y-2">
                    {robotsEnUbicacion.slice(0, 3).map((robot) => (
                      <div key={robot.id} className="text-xs bg-white bg-opacity-50 p-2 rounded flex items-center gap-2">
                        <span>🤖</span>
                        <span className="font-mono font-semibold">{robot.numeroSerie}</span>
                        <span className="text-gray-500 flex-1">{robot.modelo}</span>
                        <span className={`text-xs px-2 py-1 rounded ${
                          robot.estado === 'EN_PRESTAMO' ? 'bg-blue-100 text-blue-800' :
                          robot.estado === 'DISPONIBLE' ? 'bg-green-100 text-green-800' :
                          'bg-orange-100 text-orange-800'
                        }`}>
                          {robot.estado}
                        </span>
                      </div>
                    ))}
                    {robotsEnUbicacion.length > 3 && (
                      <p className="text-xs text-gray-500 p-2">+{robotsEnUbicacion.length - 3} más...</p>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 italic">Sin robots en esta ubicación</p>
                )}
              </div>

              {isAdmin && (
                <div className="mt-4 flex gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleOpenModal(ubicacion)
                    }}
                    className="flex-1 px-3 py-2 text-sm bg-blue-100 hover:bg-blue-200 text-blue-800 rounded transition"
                  >
                    Editar
                  </button>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {ubicacionesFiltradas.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">No hay ubicaciones disponibles</p>
          {isAdmin && (
            <button
              onClick={() => handleOpenModal()}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
            >
              Crear primera ubicación
            </button>
          )}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              {editando ? 'Editar Ubicación' : 'Nueva Ubicación'}
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                <input
                  type="text"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                <select
                  value={formData.tipo}
                  onChange={(e) => setFormData({ ...formData, tipo: e.target.value as TipoUbicacion })}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option>Oficina</option>
                  <option>Cliente</option>
                  <option>Almacén</option>
                  <option>Taller</option>
                  <option>Otro</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Dirección</label>
                <input
                  type="text"
                  value={formData.direccion}
                  onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ciudad</label>
                <input
                  type="text"
                  value={formData.ciudad}
                  onChange={(e) => setFormData({ ...formData, ciudad: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contacto (Nombre)</label>
                <input
                  type="text"
                  value={formData.contactoNombre}
                  onChange={(e) => setFormData({ ...formData, contactoNombre: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={formData.contactoEmail}
                  onChange={(e) => setFormData({ ...formData, contactoEmail: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                <input
                  type="tel"
                  value={formData.contactoTelefono}
                  onChange={(e) => setFormData({ ...formData, contactoTelefono: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>

            <div className="flex gap-3 justify-end mt-6">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded transition"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition"
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
