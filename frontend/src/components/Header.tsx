import { useAuth } from '../contexts/AuthContext'

export default function Header() {
  const { user, logout } = useAuth()

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 px-8 py-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-800">Sistema de Control de Inventarios</h2>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-sm font-medium text-gray-800">{user?.nombreCompleto}</div>
            <div className="text-xs text-gray-500">{user?.rol.replace('_', ' ').toLowerCase()}</div>
          </div>
          <button
            onClick={logout}
            className="px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded transition"
          >
            Cerrar sesión
          </button>
        </div>
      </div>
    </header>
  )
}
