import { useEmployees } from '@/hooks/useEmployees'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, User, Building2 } from 'lucide-react'

interface EmployeeNode {
  id: string
  first_name: string
  last_name: string
  color: string | null
  contract_type: string | null
  email: string | null
}

function EmployeeCard({ employee, children }: { employee: EmployeeNode; children?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-4">
      <Card className="w-64 hover:shadow-lg transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            <div 
              className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
              style={{ backgroundColor: employee.color || '#3b82f6' }}
            >
              {employee.first_name[0]}{employee.last_name[0]}
            </div>
            <div className="flex-1 min-w-0">
              <CardTitle className="text-base truncate">
                {employee.first_name} {employee.last_name}
              </CardTitle>
              <p className="text-xs text-muted-foreground">{employee.contract_type}</p>
            </div>
          </div>
        </CardHeader>
        {employee.email && (
          <CardContent className="pt-0 text-xs text-muted-foreground truncate">
            {employee.email}
          </CardContent>
        )}
      </Card>
      {children && children}
    </div>
  )
}

function buildHierarchy(employees: EmployeeNode[]) {
  const employeeMap = new Map<string, EmployeeNode>()
  const roots: EmployeeNode[] = employees // All employees shown as roots for now
  const childrenMap = new Map<string, EmployeeNode[]>()

  // Créate maps
  employees.forEach(emp => {
    employeeMap.set(emp.id, emp)
    childrenMap.set(emp.id, [])
  })

  // Note: Hierarchy functionality will be implemented when manager relationships are added to schema

  return { roots, childrenMap }
}

function HierarchyTree({ employee, childrenMap }: { employee: EmployeeNode; childrenMap: Map<string, EmployeeNode[]> }) {
  const children = childrenMap.get(employee.id) || []

  return (
    <div className="flex flex-col items-center">
      <EmployeeCard employee={employee} />
      
      {children.length > 0 && (
        <>
          <div className="h-8 w-0.5 bg-border" />
          <div className="flex gap-8">
            {children.map((child, index) => (
              <div key={child.id} className="relative">
                {index > 0 && (
                  <div className="absolute top-0 -left-4 w-8 h-0.5 bg-border" style={{ top: '0px' }} />
                )}
                <HierarchyTree employee={child} childrenMap={childrenMap} />
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

export default function OrgChartPage() {
  const { employees, isLoading } = useEmployees()

  if (isLoading) {
    return <div className="p-8">Chargement de l'organigramme...</div>
  }

  const { roots, childrenMap } = buildHierarchy(employees || [])

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Building2 className="h-8 w-8" />
            Organigramme
          </h1>
          <p className="text-muted-foreground">Structure hiérarchique de l'organisation</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Users className="h-4 w-4" />
          <span>{employees?.length || 0} employés</span>
        </div>
      </div>

      <Card className="overflow-x-auto">
        <CardContent className="p-8">
          {roots.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <User className="h-12 w-12 mx-auto mb-4 opacity-20" />
              <p>Aucun employé trouvé</p>
              <p className="text-sm mt-2">Commencez par ajouter des employés et définir leurs relations hiérarchiques</p>
            </div>
          ) : (
            <div className="flex gap-12 justify-center">
              {roots.map(root => (
                <HierarchyTree key={root.id} employee={root} childrenMap={childrenMap} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="text-sm text-muted-foreground bg-muted/50 p-4 rounded-lg">
        <p><strong>💡 Astuce :</strong> Pour modifier la hiérarchie, ouvrez le profil d'un employé et sélectionnez son manager (N+1) dans l'onglet "Informations".</p>
      </div>
    </div>
  )
}
