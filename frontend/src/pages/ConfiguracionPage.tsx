import { useEffect, useState } from 'react'
import { configuracionService } from '../services/configuracion.service'
import { useAuth } from '../contexts/AuthContext'
import { useNotification } from '../contexts/NotificationContext'

export default function ConfiguracionPage() {
  const { isAdmin } = useAuth()
  const { addNotification } = useNotification()
  const [config, setConfig] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const cargar = async () => {
      try {
        const c = await configuracionService.obtener()
        let horarios = ['08:00', '12:00', '16:00']
        try {
          if (c.horariosNotificacion) {
            horarios = Array.isArray(c.horariosNotificacion)
              ? c.horariosNotificacion
              : JSON.parse(c.horariosNotificacion)
          }
        } catch {}
        setConfig({ ...c, horariosArr: horarios })
      } catch (err) {
        addNotification('Error al cargar configuración', 'error')
      } finally {
        setLoading(false)
      }
    }
    cargar()
  }, [addNotification])

  const guardar = async () => {
    setSaving(true)
    try {
      const { horariosArr, ...rest } = config
      await configuracionService.actualizar({
        ...rest,
        horariosNotificacion: horariosArr,
      })
      addNotification('Configuración guardada correctamente', 'success')
    } catch {
      addNotification('Error al guardar configuración', 'error')
    } finally {
      setSaving(false)
    }
  }

  if (!isAdmin) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
        <p className="text-yellow-800">Solo administradores pueden acceder a esta sección</p>
      </div>
    )
  }

  if (loading) return <div className="text-center py-8">Cargando...</div>
  if (!config) return <div className="text-center py-8">No hay configuración disponible</div>

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Configuración del Sistema</h1>
        <p className="text-gray-600 mt-1">Parámetros generales y notificaciones</p>
      </div>

      <div className="bg-white rounded-lg shadow p-6 space-y-4">
        <h2 className="text-lg font-semibold text-gray-900 border-b pb-2">Tiempos</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Días mínimos de anticipación
            </label>
            <input
              type="number"
              min="1"
              value={config.diasMinimosAnticipacion}
              onChange={(e) => setConfig({ ...config, diasMinimosAnticipacion: parseInt(e.target.value) })}
              className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-teradyne-secondary outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Días para alerta de vencimiento
            </label>
            <input
              type="number"
              min="1"
              value={config.diasVencimientoAlerta}
              onChange={(e) => setConfig({ ...config, diasVencimientoAlerta: parseInt(e.target.value) })}
              className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-teradyne-secondary outline-none"
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6 space-y-4">
        <h2 className="text-lg font-semibold text-gray-900 border-b pb-2">Correos administrativos</h2>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Correo principal (aprobador)</label>
          <input
            type="email"
            value={config.correoAdminPrincipal}
            onChange={(e) => setConfig({ ...config, correoAdminPrincipal: e.target.value })}
            className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-teradyne-secondary outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Correo en copia 1</label>
          <input
            type="email"
            value={config.correoAdminCopia1 || ''}
            onChange={(e) => setConfig({ ...config, correoAdminCopia1: e.target.value })}
            className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-teradyne-secondary outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Correo en copia 2</label>
          <input
            type="email"
            value={config.correoAdminCopia2 || ''}
            onChange={(e) => setConfig({ ...config, correoAdminCopia2: e.target.value })}
            className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-teradyne-secondary outline-none"
          />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6 space-y-4">
        <h2 className="text-lg font-semibold text-gray-900 border-b pb-2">Horarios de notificación</h2>
        <p className="text-sm text-gray-600">Horarios diarios para envío de recordatorios (Lunes a Viernes)</p>
        <div className="grid grid-cols-3 gap-4">
          {config.horariosArr.map((hora: string, i: number) => (
            <input
              key={i}
              type="time"
              value={hora}
              onChange={(e) => {
                const nuevos = [...config.horariosArr]
                nuevos[i] = e.target.value
                setConfig({ ...config, horariosArr: nuevos })
              }}
              className="px-3 py-2 border rounded focus:ring-2 focus:ring-teradyne-secondary outline-none"
            />
          ))}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6 space-y-4">
        <h2 className="text-lg font-semibold text-gray-900 border-b pb-2">Estado del sistema</h2>
        <div className="flex gap-4">
          <label className="flex items-center gap-2">
            <input
              type="radio"
              checked={config.estadoSistema === 'ACTIVO'}
              onChange={() => setConfig({ ...config, estadoSistema: 'ACTIVO' })}
            />
            <span>Activo</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              checked={config.estadoSistema === 'MANTENIMIENTO'}
              onChange={() => setConfig({ ...config, estadoSistema: 'MANTENIMIENTO' })}
            />
            <span>Mantenimiento</span>
          </label>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={guardar}
          disabled={saving}
          className="bg-teradyne-secondary hover:bg-blue-600 text-white px-6 py-2.5 rounded-lg font-medium disabled:opacity-50"
        >
          {saving ? 'Guardando...' : 'Guardar Configuración'}
        </button>
      </div>
    </div>
  )
}
