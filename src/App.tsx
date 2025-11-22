import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider, useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { LayoutDashboard, Building, Users, Calendar, User, LogOut } from 'lucide-react'
import Login from '@/pages/auth/Login'
import SitesPage from '@/pages/sites/SitesPage'
import EmployeesPage from '@/pages/employees/EmployeesPage'
import PlanningPage from '@/pages/planning/PlanningPage'
import DashboardPage from '@/pages/dashboard/DashboardPage'
import { NotificationsPopover } from '@/components/notifications/NotificationsPopover'
import { MobileNav } from '@/components/layout/MobileNav'
import EmployeePortal from '@/pages/employee-portal/EmployeePortal'

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
          <Link to="/" className="flex items-center gap-2 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded">
            <LayoutDashboard className="w-5 h-5" />
            <span className="hidden md:inline">Dashboard</span>
          </Link>
          <Link to="/sites" className="flex items-center gap-2 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded">
            <Building className="w-5 h-5" />
            <span className="hidden md:inline">Sites</span>
          </Link>
          <Link to="/employees" className="flex items-center gap-2 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded">
            <Users className="w-5 h-5" />
            <span className="hidden md:inline">Employés</span>
          </Link>
          <Link to="/planning" className="flex items-center gap-2 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded">
            <Calendar className="w-5 h-5" />
            <span className="hidden md:inline">Planning</span>
          </Link>
          <Link to="/my-space" className="flex items-center gap-2 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded text-blue-600">
            <User className="w-5 h-5" />
            <span className="hidden md:inline">Mon Espace</span>
          </Link>
        </nav>

        <div className="border-t pt-4 mt-auto">
          <div className="flex items-center gap-2 p-2">
            <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
              {user?.email?.[0].toUpperCase()}
            </div>
            <div className="hidden md:block overflow-hidden">
              <p className="text-sm font-medium truncate">{user?.email}</p>
            </div>
          </div>
          <Button variant="ghost" className="w-full justify-start mt-2" onClick={signOut}>
            <LogOut className="w-5 h-5 mr-2" />
            <span className="hidden md:inline">Déconnexion</span>
          </Button>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/sites" element={<SitesPage />} />
          <Route path="/employees" element={<EmployeesPage />} />
          <Route path="/planning" element={<PlanningPage />} />
          <Route path="/my-space" element={<EmployeePortal />} />
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
