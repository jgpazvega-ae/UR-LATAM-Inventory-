import { useEffect, useState } from 'react'
import { maintenanceService, MaintenanceRecord } from '../services/maintenance.service'
import { robotService } from '../services/robot.service'
import { useRegionLanguage } from '../contexts/RegionLanguageContext'
import { useAuth } from '../contexts/AuthContext'
import { useNotification } from '../contexts/NotificationContext'

type TabType = 'proximos' | 'vencidos' | 'historial' | 'crear'

const colorPorTipo: Record<string, string> = {
  Preventivo: 'bg-blue-50 border-blue-200',
  Correctivo: 'bg-red-50 border-red-200',
  Inspección: 'bg-yellow-50 border-yellow-200',
}

const colorPorEstado: Record<string, string> = {
  Pendiente: 'bg-orange-100 text-orange-800',
  'En Progreso': 'bg-blue-100 text-blue-800',
  Completado: 'bg-green-100 text-green-800',
  Cancelado: 'bg-gray-100 text-gray-800',
}

export default function MaintenancePage() {
  const { currentRegion } = useRegionLanguage()
  const { isAdmin } = useAuth()
  const { addNotification } = useNotification()

  const [activeTab, setActiveTab] = useState<TabType>('proximos')
  const [mantenimientos, setMantenimientos] = useState<MaintenanceRecord[]>([])
  const [robots, setRobots] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [vencidos, setVencidos] = useState<MaintenanceRecord[]>([])
  const [showModal, setShowModal] = useState(false)
  const [formData, setFormData] = useState({
    robotId: '',
    tipo: 'Preventivo' as const,
    descripcion: '',
    tecnicoNombre: '',
    tecnicoEmail: '',
    tecnicoTelefono: '',
    fechaProgramada: '',
    notas: '',
  })

  useEffect(() => {
    cargar()
  }, [currentRegion, activeTab])

  const cargar = async () => {
    setLoading(true)
    try {
      const [robs, mants, venc] = await Promise.all([
        robotService.listar({ region: currentRegion }),
        maintenanceService.listar(),
        maintenanceService.obtenerVencidos(),
      ])

      setRobots(robs)
      setMantenimientos(mants)
      setVencidos(venc)
    } catch (err: any) {
      addNotification('Error al cargar mantenimientos', 'error')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const getRobotInfo = (robotId: string) => {
    return robots.find((r) => r.id === robotId)
  }

  const handleCrearMantenimiento = async () => {
    try {
      if (!formData.robotId || !formData.fechaProgramada) {
        addNotification('Robot y fecha son requeridos', 'error')
        return
      }

      await maintenanceService.crear({
        robotId: formData.robotId,
        tipo: formData.tipo as any,
        estado: 'Pendiente',
        descripcion: formData.descripcion,
        tecnico: {
          nombre: formData.tecnicoNombre,
          email: formData.tecnicoEmail,
          telefono: formData.tecnicoTelefono,
        },
        fechaProgramada: formData.fechaProgramada,
      })

      setShowModal(false)
      setFormData({
        robotId: '',
        tipo: 'Preventivo',
        descripcion: '',
        tecnicoNombre: '',
        tecnicoEmail: '',
        tecnicoTelefono: '',
        fechaProgramada: '',
        notas: '',
      })
      addNotification('Mantenimiento creado exitosamente', 'success')
      cargar()
    } catch (err: any) {
      addNotification('Error al crear mantenimiento', 'error')
    }
  }

  const handleCompletarMantenimiento = async (id: string) => {
    try {
      await maintenanceService.completar(id)
      addNotification('Mantenimiento marcado como completado', 'success')
      cargar()
    } catch (err: any) {
      addNotification('Error al completar mantenimiento', 'error')
    }
  }

  const filtrarPorTab = () => {
    switch (activeTab) {
      case 'proximos':
        return mantenimientos.filter(
          (m) => m.estado === 'Pendiente' || m.estado === 'En Progreso'
        )
      case 'vencidos':
        return vencidos
      case 'historial':
        return mantenimientos.filter((m) => m.estado === 'Completado').slice(0, 50)
      default:
        return []
    }
  }

  const displayedMantenimientos = filtrarPorTab()

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">🔧 Gestión de Mantenimiento</h1>
          <p className="text-gray-600 mt-1">
            Programa y controla el mantenimiento preventivo de robots
          </p>
        </div>
        {isAdmin && (
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition"
          >
            + Nuevo Mantenimiento
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="text-sm text-orange-600 font-medium">Vencidos/Atrasados</div>
          <div className="text-3xl font-bold text-orange-700 mt-2">{vencidos.length}</div>
          <p className="text-xs text-orange-600 mt-1">Requieren atención inmediata</p>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="text-sm text-blue-600 font-medium">Programados</div>
          <div className="text-3xl font-bold text-blue-700 mt-2">
            {mantenimientos.filter((m) => m.estado === 'Pendiente' || m.estado === 'En Progreso')
              .length}
          </div>
          <p className="text-xs text-blue-600 mt-1">Próximos en programación</p>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="text-sm text-green-600 font-medium">Completados (30d)</div>
          <div className="text-3xl font-bold text-green-700 mt-2">
            {mantenimientos.filter((m) => m.estado === 'Completado').length}
          </div>
          <p className="text-xs text-green-600 mt-1">Historial reciente</p>
        </div>
      </div>

      <div className="flex gap-2 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('proximos')}
          className={`px-4 py-2 font-medium border-b-2 transition ${
            activeTab === 'proximos'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          📅 Próximos
        </button>
        {vencidos.length > 0 && (
          <button
            onClick={() => setActiveTab('vencidos')}
            className={`px-4 py-2 font-medium border-b-2 transition ${
              activeTab === 'vencidos'
                ? 'border-red-600 text-red-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            ⚠️ Vencidos ({vencidos.length})
          </button>
        )}
        <button
          onClick={() => setActiveTab('historial')}
          className={`px-4 py-2 font-medium border-b-2 transition ${
            activeTab === 'historial'
              ? 'border-green-600 text-green-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          ✅ Completados
        </button>
      </div>

      {loading ? (
        <div className="text-center py-8">Cargando mantenimientos...</div>
      ) : displayedMantenimientos.length === 0 ? (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
          <p className="text-gray-600">No hay mantenimientos en esta categoría</p>
        </div>
      ) : (
        <div className="space-y-4">
          {displayedMantenimientos.map((mant) => {
            const robot = getRobotInfo(mant.robotId)
            return (
              <div
                key={mant.id}
                className={`rounded-lg border-2 p-6 ${colorPorTipo[mant.tipo]}`}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-bold text-lg text-gray-900">{mant.tipo}</h3>
                      <span
                        className={`text-xs px-2 py-1 rounded font-medium ${
                          colorPorEstado[mant.estado]
                        }`}
                      >
                        {mant.estado}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700">{mant.descripcion}</p>
                  </div>
                  {mant.estado !== 'Completado' && mant.estado !== 'Cancelado' && isAdmin && (
                    <button
                      onClick={() => handleCompletarMantenimiento(mant.id)}
                      className="ml-4 px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-sm rounded transition"
                    >
                      Marcar Completado
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <p className="text-xs text-gray-600 uppercase font-semibold">Robot</p>
                    <p className="font-medium">
                      {robot?.numeroSerie || mant.robotId}
                    </p>
                    <p className="text-xs text-gray-600">{robot?.modelo}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 uppercase font-semibold">Programado</p>
                    <p className="font-medium">
                      {new Date(mant.fechaProgramada).toLocaleDateString('es-ES')}
                    </p>
                    <p className="text-xs text-gray-600">
                      {new Date(mant.fechaProgramada).toLocaleTimeString('es-ES', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 uppercase font-semibold">Técnico</p>
                    <p className="font-medium">{mant.tecnico.nombre}</p>
                    <p className="text-xs text-gray-600">{mant.tecnico.email}</p>
                  </div>
                </div>

                {mant.estado === 'Completado' && (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pt-4 border-t border-current border-opacity-30">
                    {mant.fechaCompletado && (
                      <div>
                        <p className="text-xs text-gray-600 uppercase font-semibold">
                          Completado
                        </p>
                        <p className="font-medium">
                          {new Date(mant.fechaCompletado).toLocaleDateString('es-ES')}
                        </p>
                      </div>
                    )}
                    {mant.tiempoEmpleado && (
                      <div>
                        <p className="text-xs text-gray-600 uppercase font-semibold">Tiempo</p>
                        <p className="font-medium">{mant.tiempoEmpleado} horas</p>
                      </div>
                    )}
                    {mant.proximaFechaMantenimiento && (
                      <div>
                        <p className="text-xs text-gray-600 uppercase font-semibold">
                          Próximo
                        </p>
                        <p className="font-medium">
                          {new Date(mant.proximaFechaMantenimiento).toLocaleDateString('es-ES')}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {mant.piezasReemplazadas && mant.piezasReemplazadas.length > 0 && (
                  <div className="pt-4 border-t border-current border-opacity-30">
                    <p className="text-xs text-gray-600 uppercase font-semibold mb-2">
                      Piezas Reemplazadas
                    </p>
                    <div className="space-y-1">
                      {mant.piezasReemplazadas.map((pieza, idx) => (
                        <div key={idx} className="flex justify-between text-sm">
                          <span>{pieza.nombre} (x{pieza.cantidad})</span>
                          {pieza.costo && <span className="font-medium">${pieza.costo}</span>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {showModal && isAdmin && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Nuevo Mantenimiento</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Robot</label>
                <select
                  value={formData.robotId}
                  onChange={(e) => setFormData({ ...formData, robotId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="">Selecciona un robot</option>
                  {robots.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.numeroSerie} - {r.modelo}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                <select
                  value={formData.tipo}
                  onChange={(e) =>
                    setFormData({ ...formData, tipo: e.target.value as any })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option>Preventivo</option>
                  <option>Correctivo</option>
                  <option>Inspección</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descripción
                </label>
                <textarea
                  value={formData.descripcion}
                  onChange={(e) =>
                    setFormData({ ...formData, descripcion: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                  rows={3}
                  placeholder="Describe el mantenimiento a realizar"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha Programada
                </label>
                <input
                  type="datetime-local"
                  value={formData.fechaProgramada}
                  onChange={(e) =>
                    setFormData({ ...formData, fechaProgramada: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Técnico Responsable
                </label>
                <input
                  type="text"
                  value={formData.tecnicoNombre}
                  onChange={(e) =>
                    setFormData({ ...formData, tecnicoNombre: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Nombre del técnico"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={formData.tecnicoEmail}
                    onChange={(e) =>
                      setFormData({ ...formData, tecnicoEmail: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                  <input
                    type="tel"
                    value={formData.tecnicoTelefono}
                    onChange={(e) =>
                      setFormData({ ...formData, tecnicoTelefono: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
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
                onClick={handleCrearMantenimiento}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition"
              >
                Crear Mantenimiento
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
