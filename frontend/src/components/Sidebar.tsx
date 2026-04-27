import { NavLink } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function Sidebar() {
  const { isAdmin, isGerente } = useAuth()

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `block px-4 py-3 rounded transition ${
      isActive ? 'bg-teradyne-secondary text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'
    }`

  return (
    <aside className="w-64 bg-teradyne-primary text-white flex flex-col">
      <div className="p-6 border-b border-gray-700">
        <h1 className="text-xl font-bold">Teradyne Robotics</h1>
        <p className="text-xs text-gray-400 mt-1">Control de Inventarios</p>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        <NavLink to="/" end className={linkClass}>
          Dashboard
        </NavLink>
        <NavLink to="/solicitudes" className={linkClass}>
          Solicitudes
        </NavLink>
        <NavLink to="/robots" className={linkClass}>
          Robots
        </NavLink>
        {isGerente && (
          <NavLink to="/usuarios" className={linkClass}>
            Usuarios
          </NavLink>
        )}
        {isAdmin && (
          <NavLink to="/configuracion" className={linkClass}>
            Configuración
          </NavLink>
        )}
      </nav>

      <div className="p-4 border-t border-gray-700 text-xs text-gray-500 text-center">
        v0.1.0
      </div>
    </aside>
  )
}
