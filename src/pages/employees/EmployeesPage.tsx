import { useState } from 'react'
import { useEmployees } from '@/hooks/useEmployees'
import { useSites } from '@/hooks/useSites'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, Mail, Phone, Briefcase } from 'lucide-react'

export default function EmployeesPage() {
  const { employees, isLoading, createEmployee, deleteEmployee } = useEmployees()
  const { sites } = useSites()
  const [isCreating, setIsCreating] = useState(false)
  const [newEmployee, setNewEmployee] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    contract_type: 'CDI',
    site_id: ''
  })

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await createEmployee.mutateAsync({
        ...newEmployee,
        // @ts-ignore
        contract_type: newEmployee.contract_type,
        site_id: newEmployee.site_id || null
      })
      setIsCreating(false)
      setNewEmployee({ first_name: '', last_name: '', email: '', phone: '', contract_type: 'CDI', site_id: '' })
    } catch (error) {
      console.error(error)
      alert("Erreur lors de la création de l'employé")
    }
  }

  if (isLoading) return <div>Chargement des employés...</div>

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Employés</h1>
        <Button onClick={() => setIsCreating(!isCreating)}>
          <Plus className="mr-2 h-4 w-4" /> Nouvel Employé
        </Button>
      </div>

      {isCreating && (
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {employees?.map((employee) => (
          <Card key={employee.id}>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold" style={{ backgroundColor: employee.color || '#3b82f6' }}>
                    {employee.first_name[0]}{employee.last_name[0]}
                  </div>
                  {employee.first_name} {employee.last_name}
                </div>
                <span className="text-xs font-normal text-muted-foreground bg-secondary px-2 py-1 rounded">
                  {employee.contract_type}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center text-sm text-muted-foreground">
                <Mail className="mr-2 h-4 w-4" />
                {employee.email || "Pas d'email"}
              </div>
              <div className="flex items-center text-sm text-muted-foreground">
                <Phone className="mr-2 h-4 w-4" />
                {employee.phone || "Pas de téléphone"}
              </div>
              <div className="flex items-center text-sm text-muted-foreground">
                <Briefcase className="mr-2 h-4 w-4" />
                {/* @ts-ignore */}
                {employee.sites?.name || "Non assigné"}
              </div>
              <div className="pt-4 flex justify-end">
                <Button 
                  variant="destructive" 
                  size="sm"
                  onClick={() => {
                    if(confirm('Supprimer cet employé ?')) deleteEmployee.mutate(employee.id)
                  }}
                >
                  Supprimer
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
