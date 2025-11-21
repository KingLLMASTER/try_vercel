import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Menu } from "lucide-react"
import { Link, useLocation } from "react-router-dom"
import { useState } from "react"
import { useAuth } from "@/contexts/AuthContext"

export function MobileNav() {
  const [open, setOpen] = useState(false)
  const location = useLocation()
  const { signOut, user } = useAuth()

  const closeSheet = () => setOpen(false)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-6 w-6" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[240px] sm:w-[300px] flex flex-col">
        <SheetTitle className="text-left font-bold text-xl mb-4">Flux Plan</SheetTitle>
        <nav className="flex flex-col gap-2 flex-1">
          <Link 
            to="/" 
            onClick={closeSheet}
            className={`p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 ${location.pathname === '/' ? 'bg-gray-100 dark:bg-gray-700 font-medium' : ''}`}
          >
            Dashboard
          </Link>
          <Link 
            to="/sites" 
            onClick={closeSheet}
            className={`p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 ${location.pathname === '/sites' ? 'bg-gray-100 dark:bg-gray-700 font-medium' : ''}`}
          >
            Sites
          </Link>
          <Link 
            to="/employees" 
            onClick={closeSheet}
            className={`p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 ${location.pathname === '/employees' ? 'bg-gray-100 dark:bg-gray-700 font-medium' : ''}`}
          >
            Employés
          </Link>
          <Link 
            to="/planning" 
            onClick={closeSheet}
            className={`p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 ${location.pathname === '/planning' ? 'bg-gray-100 dark:bg-gray-700 font-medium' : ''}`}
          >
            Planning
          </Link>
        </nav>
        <div className="pt-4 border-t space-y-4">
          <div className="text-sm truncate">{user?.email}</div>
          <button onClick={() => { signOut(); closeSheet(); }} className="w-full px-4 py-2 bg-red-500 text-white rounded text-sm">
            Se déconnecter
          </button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
