import { Link } from 'react-router-dom'

export default function Sidebar() {
  return (
    <aside className="w-64 bg-teradyne-primary text-white p-4">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Teradyne Robotics</h1>
        <p className="text-sm text-gray-400">Control de Inventarios</p>
      </div>

      <nav className="space-y-4">
        <Link to="/" className="block px-4 py-2 rounded hover:bg-teradyne-secondary transition">
          📊 Dashboard
        </Link>
        <Link to="/robots" className="block px-4 py-2 rounded hover:bg-teradyne-secondary transition">
          🤖 Robots
        </Link>
        <Link to="/prestamos" className="block px-4 py-2 rounded hover:bg-teradyne-secondary transition">
          📋 Solicitudes
        </Link>
        <Link to="/usuarios" className="block px-4 py-2 rounded hover:bg-teradyne-secondary transition">
          👥 Usuarios
        </Link>
        <Link to="/configuracion" className="block px-4 py-2 rounded hover:bg-teradyne-secondary transition">
          ⚙️ Configuración
        </Link>
      </nav>
    </aside>
  )
}
