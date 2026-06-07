import { useEffect, useState } from 'react'
import { maintenanceService, MaintenanceRecord } from '../services/maintenance.service'
import { robotService } from '../services/robot.service'
import { useRegionLanguage } from '../contexts/RegionLanguageContext'
import { useAuth } from '../contexts/AuthContext'
import { useNotification } from '../contexts/NotificationContext'

type TabType = 'proximos' | 'vencidos' | 'historial' | 'crear'

const colorPorTipo: Record<string, string> = {
  Preventivo: 'bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-100',
  Correctivo: 'bg-gradient-to-br from-red-50 to-rose-50 border-red-100',
  Inspección: 'bg-gradient-to-br from-yellow-50 to-amber-50 border-yellow-100',
}

const colorPorEstado: Record<string, string> = {
  Pendiente: 'badge-warning',
  'En Progreso': 'badge-info',
  Completado: 'badge-success',
  Cancelado: 'badge-error',
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

      if (venc.length > 0) {
        addNotification(
          `⚠️ Hay ${venc.length} mantenimiento${venc.length !== 1 ? 's' : ''} vencido${venc.length !== 1 ? 's' : ''}`,
          'warning',
          4000,
          '⏰ Mantenimientos Vencidos'
        )
      }
    } catch (err: any) {
      addNotification(
        'No se pudieron cargar los mantenimientos',
        'error',
        4000,
        '❌ Error al Cargar'
      )
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
        addNotification(
          'Selecciona un robot y una fecha de programación',
          'error',
          3500,
          '⚠️ Información Incompleta'
        )
        return
      }

      const robot = getRobotInfo(formData.robotId)
      const fechaFormato = new Date(formData.fechaProgramada).toLocaleDateString('es-ES')

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
      addNotification(
        `Mantenimiento ${formData.tipo.toLowerCase()} programado para ${robot?.numeroSerie || 'robot'} el ${fechaFormato}`,
        'success',
        3000,
        '🔧 Mantenimiento Programado'
      )
      cargar()
    } catch (err: any) {
      addNotification(
        err.message || 'No se pudo crear el mantenimiento',
        'error',
        4000,
        '❌ Error al Programar'
      )
    }
  }

  const handleCompletarMantenimiento = async (id: string) => {
    try {
      const mantenimiento = mantenimientos.find((m) => m.id === id)
      const robot = getRobotInfo(mantenimiento?.robotId || '')

      await maintenanceService.completar(id)
      addNotification(
        `Mantenimiento completado para ${robot?.numeroSerie || 'robot'}. Robot disponible nuevamente`,
        'success',
        3000,
        '✅ Mantenimiento Completado'
      )
      cargar()
    } catch (err: any) {
      addNotification(
        err.message || 'No se pudo completar el mantenimiento',
        'error',
        4000,
        '❌ Error al Completar'
      )
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Cargando mantenimientos...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-4xl font-bold gradient-text-primary">Mantenimiento</h1>
          <p className="text-gray-600 mt-3 font-medium">
            Programa y controla el mantenimiento preventivo de robots
          </p>
        </div>
        {isAdmin && (
          <button
            onClick={() => setShowModal(true)}
            className="btn-primary shadow-lg"
          >
            <span>+</span> Nuevo Mantenimiento
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="card-premium bg-gradient-to-br from-orange-50 to-red-50 p-6 border-l-4 border-orange-500">
          <div className="text-2xl mb-2">⚠️</div>
          <p className="text-sm text-orange-700 font-bold uppercase">Vencidos/Atrasados</p>
          <p className="text-3xl font-bold text-orange-700 mt-2">{vencidos.length}</p>
          <p className="text-xs text-orange-600 mt-2">Requieren atención inmediata</p>
        </div>
        <div className="card-premium bg-gradient-to-br from-blue-50 to-cyan-50 p-6 border-l-4 border-blue-500">
          <div className="text-2xl mb-2">📅</div>
          <p className="text-sm text-blue-700 font-bold uppercase">Programados</p>
          <p className="text-3xl font-bold text-blue-700 mt-2">
            {mantenimientos.filter((m) => m.estado === 'Pendiente' || m.estado === 'En Progreso')
              .length}
          </p>
          <p className="text-xs text-blue-600 mt-2">Próximos en programación</p>
        </div>
        <div className="card-premium bg-gradient-to-br from-green-50 to-emerald-50 p-6 border-l-4 border-green-500">
          <div className="text-2xl mb-2">✅</div>
          <p className="text-sm text-green-700 font-bold uppercase">Completados (30d)</p>
          <p className="text-3xl font-bold text-green-700 mt-2">
            {mantenimientos.filter((m) => m.estado === 'Completado').length}
          </p>
          <p className="text-xs text-green-600 mt-2">Historial reciente</p>
        </div>
      </div>

      <div className="card-premium">
        <div className="flex gap-2 border-b border-gray-200 p-4">
          {[
            { key: 'proximos', label: '📅 Próximos', active: activeTab === 'proximos' },
            ...(vencidos.length > 0 ? [{ key: 'vencidos', label: `⚠️ Vencidos (${vencidos.length})`, active: activeTab === 'vencidos' }] : []),
            { key: 'historial', label: '✅ Completados', active: activeTab === 'historial' },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as TabType)}
              className={`px-4 py-2 font-semibold border-b-2 transition-all ${
                tab.active
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {displayedMantenimientos.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-gray-600 font-medium text-lg">No hay mantenimientos en esta categoría</p>
          </div>
        ) : (
          <div className="p-6 space-y-4">
            {displayedMantenimientos.map((mant) => {
              const robot = getRobotInfo(mant.robotId)
              return (
                <div
                  key={mant.id}
                  className={`card-premium border-l-4 p-6 ${colorPorTipo[mant.tipo]}`}
                >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="font-bold text-lg text-gray-900">{mant.tipo}</h3>
                      <span className={colorPorEstado[mant.estado]}>
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
      </div>

      {showModal && isAdmin && (
        <div className="modal-overlay p-4">
          <div className="modal-content w-full max-w-lg">
            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-6 border-b border-blue-100">
              <h2 className="text-2xl font-bold gradient-text-primary">🔧 Nuevo Mantenimiento</h2>
            </div>

            <div className="p-8 space-y-5">
              <div className="form-group">
                <label className="form-label">Robot *</label>
                <select
                  value={formData.robotId}
                  onChange={(e) => setFormData({ ...formData, robotId: e.target.value })}
                  className="input-field"
                >
                  <option value="">Selecciona un robot</option>
                  {robots.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.numeroSerie} - {r.modelo}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="form-label">Tipo *</label>
                  <select
                    value={formData.tipo}
                    onChange={(e) =>
                      setFormData({ ...formData, tipo: e.target.value as any })
                    }
                    className="input-field"
                  >
                    <option>Preventivo</option>
                    <option>Correctivo</option>
                    <option>Inspección</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Fecha Programada *</label>
                  <input
                    type="datetime-local"
                    value={formData.fechaProgramada}
                    onChange={(e) =>
                      setFormData({ ...formData, fechaProgramada: e.target.value })
                    }
                    className="input-field"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Descripción</label>
                <textarea
                  value={formData.descripcion}
                  onChange={(e) =>
                    setFormData({ ...formData, descripcion: e.target.value })
                  }
                  className="input-field"
                  rows={3}
                  placeholder="Describe el mantenimiento a realizar"
                />
              </div>

              <div className="border-t border-gray-200 pt-4">
                <h3 className="text-sm font-bold text-gray-700 uppercase mb-4">Técnico Responsable</h3>

                <div className="form-group">
                  <label className="form-label">Nombre</label>
                  <input
                    type="text"
                    value={formData.tecnicoNombre}
                    onChange={(e) =>
                      setFormData({ ...formData, tecnicoNombre: e.target.value })
                    }
                    className="input-field"
                    placeholder="Nombre del técnico"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="form-group">
                    <label className="form-label">Email</label>
                    <input
                      type="email"
                      value={formData.tecnicoEmail}
                      onChange={(e) =>
                        setFormData({ ...formData, tecnicoEmail: e.target.value })
                      }
                      className="input-field"
                      placeholder="tecnico@empresa.com"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Teléfono</label>
                    <input
                      type="tel"
                      value={formData.tecnicoTelefono}
                      onChange={(e) =>
                        setFormData({ ...formData, tecnicoTelefono: e.target.value })
                      }
                      className="input-field"
                      placeholder="+55 1234 5678"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3 justify-end p-6 border-t border-gray-200 bg-gray-50">
              <button
                onClick={() => setShowModal(false)}
                className="btn-secondary"
              >
                Cancelar
              </button>
              <button
                onClick={handleCrearMantenimiento}
                className="btn-primary"
              >
                💾 Crear Mantenimiento
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
