export default function Header() {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200 px-8 py-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-800">Sistema de Control de Inventarios</h2>
        <div className="flex items-center space-x-4">
          <span className="text-gray-600">Usuario Demo</span>
          <button className="px-4 py-2 text-red-600 hover:bg-red-50 rounded transition">
            Cerrar sesión
          </button>
        </div>
      </div>
    </header>
  )
}
