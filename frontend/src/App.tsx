import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import BoardPage from './pages/BoardPage'
import AccessPage from './pages/AccessPage'
import AdminLayout from './pages/admin/AdminLayout'
import DashboardPage from './pages/admin/DashboardPage'
import RoomsPage from './pages/admin/RoomsPage'
import UsersPage from './pages/admin/UsersPage'
import LogsPage from './pages/admin/LogsPage'

function RequireAdmin({ children }: { children: React.ReactElement }) {
  const { user, isAdmin } = useAuth()
  if (!user) return <Navigate to="/login" state={{ from: '/admin' }} replace />
  if (!isAdmin) return <Navigate to="/login" replace />
  return children
}

function Root() {
  const { isAdmin } = useAuth()
  if (isAdmin) return <Navigate to="/admin" replace />
  return <Navigate to="/board" replace />
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Root />} />
          <Route path="/board" element={<BoardPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/access/:roomId" element={<AccessPage />} />
          <Route path="/admin" element={<RequireAdmin><AdminLayout /></RequireAdmin>}>
            <Route index element={<DashboardPage />} />
            <Route path="rooms" element={<RoomsPage />} />
            <Route path="users" element={<UsersPage />} />
            <Route path="logs" element={<LogsPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/board" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
