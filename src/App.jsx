import { BrowserRouter, Routes, Route } from 'react-router-dom'

import Home from './pages/Home'
import EventDetail from './pages/EventDetail'
import Evenements from './pages/Evenements'

import MainLayout from './layouts/MainLayout'
import DashboardLayout from './layouts/DashboardLayout'
import OrgaLayout from './layouts/OrgaLayout'

import ClientDashboard from './pages/client/ClientDashBoard'
import OrganizerDashboard from './pages/orga/OrganizerDashboard'
import AdminDashboard from './pages/admin/AdminDashboard'

import { AuthProvider } from './context/AuthContext' // ← ajouter
import RoleGuard from './utils/ProtectedRoutes'

// IMPORTANT
import AuthPages from './pages/AuthPages'
import UnauthorizedPage from './pages/UnauthorizedPage'
import Organisateurs from './pages/Organisateurs'
import Paiement from './pages/Paiement'


function App() {
  return (
    <AuthProvider> {/* ← envelopper toute l'app */}
      <BrowserRouter>
        <Routes>

          {/* Authentification */}
          <Route path="/auth" element={<AuthPages />} />

          <Route path="/unauthorized" element={<UnauthorizedPage />} />

          {/* routes publiques ... */}
          <Route element={<MainLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/events" element={<Evenements />} />
            <Route path="/events/:id" element={<EventDetail />} />
            <Route path="/organisateurs" element={<Organisateurs />} />
            <Route path="/paiement/:id" element={<Paiement />} />
          </Route>

          {/* Routes protégées par rôle */}
          <Route path="/admin/dashboard" element={
            <RoleGuard allowedRoles={["ADMIN"]}>
              <AdminDashboard />
            </RoleGuard>
          }/>
          <Route path="/organisateur/dashboard" element={
            <RoleGuard allowedRoles={["ORGANISATEUR"]}>
              <OrganizerDashboard />
            </RoleGuard>
          }/>
          <Route path="/client/dashboard" element={
            <RoleGuard allowedRoles={["CLIENT"]}>
              <ClientDashboard />
            </RoleGuard>
          }/>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App