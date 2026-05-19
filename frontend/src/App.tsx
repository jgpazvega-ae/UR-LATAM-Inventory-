import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { RegionLanguageProvider } from './contexts/RegionLanguageContext'
import { NotificationProvider } from './contexts/NotificationContext'
import Layout from './components/Layout'
import Notifications from './components/Notifications'
import ErrorBoundary from './components/ErrorBoundary'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import DashboardPage from './pages/DashboardPage'
import UsuariosPage from './pages/UsuariosPage'
import SolicitudesPage from './pages/SolicitudesPage'
import NuevaSolicitudPage from './pages/NuevaSolicitudPage'
import SolicitudDetallePage from './pages/SolicitudDetallePage'
import RobotsPage from './pages/RobotsPage'
import ConfiguracionPage from './pages/ConfiguracionPage'
import ReporteDemosPage from './pages/ReporteDemosPage'
import GestionContraseñasPage from './pages/GestionContraseñasPage'
import NotificacionesPage from './pages/NotificacionesPage'
import UbicacionesPage from './pages/UbicacionesPage'

function PrivateRoute({ children }: { children: JSX.Element }) {
  const { user, loading } = useAuth()
  if (loading) {
    return <div className="flex items-center justify-center h-screen">Cargando...</div>
  }
  return user ? children : <Navigate to="/login" />
}

// Usar BASE_URL de Vite (/ en dev, /UR-LATAM-Inventory-/ en GitHub Pages)
const basename = ((import.meta as any).env?.BASE_URL || '/').replace(/\/$/, '') || '/'

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <RegionLanguageProvider>
          <NotificationProvider>
            <div className="w-full">
              <Notifications />
              <BrowserRouter basename={basename}>
                <Routes>
                  <Route path="/login" element={<ErrorBoundary><LoginPage /></ErrorBoundary>} />
                  <Route path="/register" element={<ErrorBoundary><RegisterPage /></ErrorBoundary>} />
                  <Route element={<PrivateRoute><Layout /></PrivateRoute>}>
                    <Route path="/" element={<ErrorBoundary><DashboardPage /></ErrorBoundary>} />
                    <Route path="/notificaciones" element={<ErrorBoundary><NotificacionesPage /></ErrorBoundary>} />
                    <Route path="/ubicaciones" element={<ErrorBoundary><UbicacionesPage /></ErrorBoundary>} />
                    <Route path="/usuarios" element={<ErrorBoundary><UsuariosPage /></ErrorBoundary>} />
                    <Route path="/solicitudes" element={<ErrorBoundary><SolicitudesPage /></ErrorBoundary>} />
                    <Route path="/solicitudes/nueva" element={<ErrorBoundary><NuevaSolicitudPage /></ErrorBoundary>} />
                    <Route path="/solicitudes/:id" element={<ErrorBoundary><SolicitudDetallePage /></ErrorBoundary>} />
                    <Route path="/robots" element={<ErrorBoundary><RobotsPage /></ErrorBoundary>} />
                    <Route path="/configuracion" element={<ErrorBoundary><ConfiguracionPage /></ErrorBoundary>} />
                    <Route path="/reportes/demos" element={<ErrorBoundary><ReporteDemosPage /></ErrorBoundary>} />
                    <Route path="/gestion-contrasenas" element={<ErrorBoundary><GestionContraseñasPage /></ErrorBoundary>} />
                    <Route path="*" element={<Navigate to="/" />} />
                  </Route>
                </Routes>
              </BrowserRouter>
            </div>
          </NotificationProvider>
        </RegionLanguageProvider>
      </AuthProvider>
    </ErrorBoundary>
  )
}

export default App
