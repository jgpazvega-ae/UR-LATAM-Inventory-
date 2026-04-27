import StatCard from '../components/StatCard'

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">Bienvenido al sistema de control de inventarios</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Solicitudes Pendientes"
          value="5"
          icon="📋"
          color="blue"
        />
        <StatCard
          title="Solicitudes Aprobadas"
          value="12"
          icon="✅"
          color="green"
        />
        <StatCard
          title="Robots en Préstamo"
          value="8"
          icon="🤖"
          color="purple"
        />
        <StatCard
          title="Alertas Críticas"
          value="2"
          icon="⚠️"
          color="red"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Solicitudes Recientes</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">ID</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Solicitante</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Robot</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                <tr>
                  <td className="px-6 py-4 text-sm">SOL-0001</td>
                  <td className="px-6 py-4 text-sm">Juan Pérez</td>
                  <td className="px-6 py-4 text-sm">CB3-001</td>
                  <td className="px-6 py-4 text-sm">
                    <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-xs">
                      Pendiente
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Estado de Robots</h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-700">Disponibles</span>
              <span className="text-2xl font-bold text-green-600">15</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-700">En Préstamo</span>
              <span className="text-2xl font-bold text-blue-600">8</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-700">Mantenimiento</span>
              <span className="text-2xl font-bold text-orange-600">2</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
