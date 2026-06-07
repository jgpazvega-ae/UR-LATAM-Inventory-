import { NavLink } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function Sidebar() {
  const { isAdmin, isGerente } = useAuth()

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 px-4 py-3.5 mx-2 rounded-xl transition-all duration-200 ${
      isActive
        ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg scale-105 origin-left'
        : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
    }`

  return (
    <aside className="w-64 bg-gradient-to-b from-slate-900 via-slate-900 to-slate-800 text-white flex flex-col border-r border-slate-700/50">
      <div className="p-6 border-b border-slate-700/50 backdrop-blur-sm">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center font-bold text-lg">
            T
          </div>
          <h1 className="text-lg font-bold leading-tight">Teradyne</h1>
        </div>
        <p className="text-xs text-gray-400">Gestión de Inventarios</p>
      </div>

      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">Principal</div>
        <NavLink to="/" end className={linkClass}>
          <span className="text-lg">📊</span>
          <span className="font-medium">Dashboard</span>
        </NavLink>

        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3 mt-4">Operaciones</div>
        <NavLink to="/solicitudes" className={linkClass}>
          <span className="text-lg">📋</span>
          <span className="font-medium">Solicitudes</span>
        </NavLink>
        <NavLink to="/robots" className={linkClass}>
          <span className="text-lg">🤖</span>
          <span className="font-medium">Robots</span>
        </NavLink>
        <NavLink to="/ubicaciones" className={linkClass}>
          <span className="text-lg">📍</span>
          <span className="font-medium">Ubicaciones</span>
        </NavLink>
        <NavLink to="/mantenimiento" className={linkClass}>
          <span className="text-lg">🔧</span>
          <span className="font-medium">Mantenimiento</span>
        </NavLink>

        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3 mt-4">Informes</div>
        <NavLink to="/notificaciones" className={linkClass}>
          <span className="text-lg">🔔</span>
          <span className="font-medium">Notificaciones</span>
        </NavLink>
        {(isGerente || isAdmin) && (
          <>
            <NavLink to="/reportes" className={linkClass}>
              <span className="text-lg">📊</span>
              <span className="font-medium">Reportes</span>
            </NavLink>
            <NavLink to="/reportes/demos" className={linkClass}>
              <span className="text-lg">📈</span>
              <span className="font-medium">Demos</span>
            </NavLink>
          </>
        )}

        {isGerente && (
          <>
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3 mt-4">Gestión</div>
            <NavLink to="/usuarios" className={linkClass}>
              <span className="text-lg">👥</span>
              <span className="font-medium">Usuarios</span>
            </NavLink>
          </>
        )}

        {isAdmin && (
          <>
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3 mt-4">Admin</div>
            <NavLink to="/gestion-contrasenas" className={linkClass}>
              <span className="text-lg">🔐</span>
              <span className="font-medium">Seguridad</span>
            </NavLink>
            <NavLink to="/configuracion" className={linkClass}>
              <span className="text-lg">⚙️</span>
              <span className="font-medium">Configuración</span>
            </NavLink>
          </>
        )}
      </nav>

      <div className="p-4 border-t border-slate-700/50 text-xs text-gray-500 text-center">
        <div className="px-3 py-2 rounded-lg bg-white/5 backdrop-blur-sm">
          v0.1.0
        </div>
      </div>
    </aside>
  )
}
