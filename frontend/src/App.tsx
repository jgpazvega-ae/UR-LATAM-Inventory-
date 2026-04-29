import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import Layout from './components/Layout'
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

function PrivateRoute({ children }: { children: JSX.Element }) {
  const { user, loading } = useAuth()
  if (loading) {
    return <div className="flex items-center justify-center h-screen">Cargando...</div>
  }
  return user ? children : <Navigate to="/login" />
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route element={<PrivateRoute><Layout /></PrivateRoute>}>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/usuarios" element={<UsuariosPage />} />
            <Route path="/solicitudes" element={<SolicitudesPage />} />
            <Route path="/solicitudes/nueva" element={<NuevaSolicitudPage />} />
            <Route path="/solicitudes/:id" element={<SolicitudDetallePage />} />
            <Route path="/robots" element={<RobotsPage />} />
            <Route path="/configuracion" element={<ConfiguracionPage />} />
            <Route path="/reportes/demos" element={<ReporteDemosPage />} />
            <Route path="/gestion-contrasenas" element={<GestionContraseñasPage />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
