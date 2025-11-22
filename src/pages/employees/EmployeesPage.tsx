import { useState } from 'react'
import { useEmployees } from '@/hooks/useEmployees'
import { useSites } from '@/hooks/useSites'
import { useAuth } from '@/contexts/AuthContext'
import { useProfile } from '@/hooks/useProfile'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, Mail, Phone, Briefcase, Eye, Trash2, Search } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import InvitationDialog from '@/components/users/InvitationDialog'
import { EmployeeProfileDialog } from '@/components/employees/EmployeeProfileDialog'

export default function EmployeesPage() {
  const { employees, isLoading, createEmployee, deleteEmployee } = useEmployees()
  const { sites } = useSites()
  const { profile } = useAuth()
  const { profile: userProfile } = useProfile()
  const [isCreating, setIsCreating] = useState(false)
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [newEmployee, setNewEmployee] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    contract_type: 'CDI',
    site_id: ''
  })

  const canEdit = profile?.role === 'ADMIN' || profile?.role === 'SUPER_MANAGER'

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await createEmployee.mutateAsync({
        ...newEmployee,
        // @ts-ignore
        contract_type: newEmployee.contract_type,
        site_id: newEmployee.site_id || null,
        organization_id: userProfile!.organization_id
      })
      setIsCreating(false)
      setNewEmployee({ first_name: '', last_name: '', email: '', phone: '', contract_type: 'CDI', site_id: '' })
    } catch (error) {
      console.error(error)
      alert("Erreur lors de la création de l'employé")
    }
  }

  const filteredEmployees = employees?.filter(emp =>
    `${emp.first_name} ${emp.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.email?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (isLoading) return <div className="p-8">Chargement des employés...</div>

  return (
    <div className="p-8 space-y-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Employés</h1>
          <p className="text-muted-foreground">Gérez votre équipe</p>
        </div>
        <div className="flex gap-2">
          {canEdit && <InvitationDialog />}
          {canEdit && (
            <Button onClick={() => setIsCreating(!isCreating)}>
              <Plus className="mr-2 h-4 w-4" /> Nouvel Employé
            </Button>
          )}
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Rechercher un employé..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {isCreating && canEdit && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Ajouter un employé</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Prénom</Label>
                  <Input 
                    value={newEmployee.first_name} 
                    onChange={e => setNewEmployee({...newEmployee, first_name: e.target.value})}
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label>Nom</Label>
                  <Input 
                    value={newEmployee.last_name} 
                    onChange={e => setNewEmployee({...newEmployee, last_name: e.target.value})}
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input 
                    type="email"
                    value={newEmployee.email} 
                    onChange={e => setNewEmployee({...newEmployee, email: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Téléphone</Label>
                  <Input 
                    value={newEmployee.phone} 
                    onChange={e => setNewEmployee({...newEmployee, phone: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Type de Contrat</Label>
                  <select 
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={newEmployee.contract_type}
                    onChange={e => setNewEmployee({...newEmployee, contract_type: e.target.value})}
                  >
                    <option value="CDI">CDI</option>
                    <option value="CDD">CDD</option>
                    <option value="INTERIM">INTERIM</option>
                    <option value="STAGE">STAGE</option>
                    <option value="APPRENTISSAGE">APPRENTISSAGE</option>
                    <option value="STUDENT">STUDENT</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Site de rattachement</Label>
                  <select 
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={newEmployee.site_id}
                    onChange={e => setNewEmployee({...newEmployee, site_id: e.target.value})}
                  >
                    <option value="">Aucun</option>
                    {sites?.map(site => (
                      <option key={site.id} value={site.id}>{site.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" type="button" onClick={() => setIsCreating(false)}>Annuler</Button>
                <Button type="submit">Créer</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredEmployees?.map((employee) => (
          <Card key={employee.id} className="group hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-12 h-12 rounded-full flex items-center justify-center text-white text-lg font-bold" 
                    style={{ backgroundColor: employee.color || '#3b82f6' }}
                  >
                    {employee.first_name[0]}{employee.last_name[0]}
                  </div>
                  <div>
                    <CardTitle className="text-lg">
                      {employee.first_name} {employee.last_name}
                    </CardTitle>
                    <Badge variant="secondary" className="mt-1">
                      {employee.contract_type}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center text-sm text-muted-foreground">
                <Mail className="mr-2 h-4 w-4 flex-shrink-0" />
                <span className="truncate">{employee.email || "Pas d'email"}</span>
              </div>
              <div className="flex items-center text-sm text-muted-foreground">
                <Phone className="mr-2 h-4 w-4 flex-shrink-0" />
                {employee.phone || "Pas de téléphone"}
              </div>
              <div className="flex items-center text-sm text-muted-foreground">
                <Briefcase className="mr-2 h-4 w-4 flex-shrink-0" />
                {/* @ts-ignore */}
                {employee.sites?.name || "Non assigné"}
              </div>

              <div className="pt-3 flex gap-2 border-t">
                <Button 
                  variant="outline" 
                  size="sm"
                  className="flex-1"
                  onClick={() => setSelectedEmployee(employee)}
                >
                  <Eye className="mr-2 h-4 w-4" />
                  Voir le profil
                </Button>
                {canEdit && (
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => {
                      if(confirm('Supprimer cet employé ?')) deleteEmployee.mutate(employee.id)
                    }}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredEmployees?.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          {searchTerm ? 'Aucun employé trouvé' : 'Aucun employé enregistré'}
        </div>
      )}

      {selectedEmployee && (
        <EmployeeProfileDialog
          employee={selectedEmployee}
          isOpen={!!selectedEmployee}
          onClose={() => setSelectedEmployee(null)}
          onUpdate={() => {
            // Refresh the list
            window.location.reload()
          }}
          canEdit={canEdit}
        />
      )}
    </div>
  )
}
