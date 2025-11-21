import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider, useAuth } from '@/contexts/AuthContext'
import Login from '@/pages/auth/Login'
import SitesPage from '@/pages/sites/SitesPage'
import EmployeesPage from '@/pages/employees/EmployeesPage'
import PlanningPage from '@/pages/planning/PlanningPage'
import DashboardPage from '@/pages/dashboard/DashboardPage'
import { NotificationsPopover } from '@/components/notifications/NotificationsPopover'
import { MobileNav } from '@/components/layout/MobileNav'

const queryClient = new QueryClient()

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { session, loading } = useAuth()

  if (loading) {
    return <div>Chargement...</div> // Replace with a proper spinner later
  }

  if (!session) {
    return <Navigate to="/login" />
  }

  return <>{children}</>
}

function Dashboard() {
  const { signOut, user } = useAuth()
  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900 flex-col md:flex-row">
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4 bg-white dark:bg-gray-800 border-b">
        <div className="flex items-center gap-2">
          <MobileNav />
          <span className="font-bold text-lg">Flux Plan</span>
        </div>
        <NotificationsPopover />
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden md:flex w-64 bg-white dark:bg-gray-800 border-r p-4 flex-col">
        <div className="font-bold text-xl mb-8">Flux Plan</div>
        <nav className="space-y-2 flex-1">
          <Link to="/" className="block p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">Dashboard</Link>
          <Link to="/sites" className="block p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">Sites</Link>
          <Link to="/employees" className="block p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">Employés</Link>
          <Link to="/planning" className="block p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">Planning</Link>
        </nav>
        <div className="pt-4 border-t space-y-4">
          <div className="flex items-center justify-between px-2">
            <div className="text-sm truncate max-w-[120px]">{user?.email}</div>
            <NotificationsPopover />
          </div>
          <button onClick={() => signOut()} className="w-full px-4 py-2 bg-red-500 text-white rounded text-sm">
            Se déconnecter
          </button>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/sites" element={<SitesPage />} />
          <Route path="/employees" element={<EmployeesPage />} />
          <Route path="/planning" element={<PlanningPage />} />
        </Routes>
      </div>
    </div>
  )
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route 
              path="/*" 
              element={
                <PrivateRoute>
                  <Dashboard />
                </PrivateRoute>
              } 
            />
          </Routes>
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  )
}

export default App
