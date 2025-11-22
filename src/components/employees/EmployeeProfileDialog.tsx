import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { supabase } from '@/integrations/supabase/client'
import { useSites } from '@/hooks/useSites'
import { useEmployees } from '@/hooks/useEmployees'
import { toast } from 'sonner'
import { Loader2, Mail, Phone, Briefcase, MapPin, DollarSign, Calendar, User, Users } from 'lucide-react'

interface EmployeeProfileDialogProps {
  employee: any
  isOpen: boolean
  onClose: () => void
  onUpdate: () => void
  canEdit: boolean // Admin or Super Manager
}

export function EmployeeProfileDialog({ employee, isOpen, onClose, onUpdate, canEdit }: EmployeeProfileDialogProps) {
  const { sites } = useSites()
  const { employees } = useEmployees()
  const [isLoading, setIsLoading] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    contract_type: 'CDI',
    experience_level: 'NOUVEAU',
    hourly_rate: 0,
    weekly_hours: 35,
    site_id: '',
    manager_id: '',
    color: '#3b82f6',
    is_student: false,
    hire_date: ''
  })

  useEffect(() => {
    if (employee) {
      setFormData({
        first_name: employee.first_name || '',
        last_name: employee.last_name || '',
        email: employee.email || '',
        phone: employee.phone || '',
        contract_type: employee.contract_type || 'CDI',
        experience_level: employee.experience_level || 'NOUVEAU',
        hourly_rate: employee.hourly_rate || 0,
        weekly_hours: employee.weekly_hours || 35,
        site_id: employee.site_id || '',
        manager_id: employee.manager_id || '',
        color: employee.color || '#3b82f6',
        is_student: employee.is_student || false,
        hire_date: employee.hire_date || ''
      })
    }
  }, [employee])

  const handleSave = async () => {
    setIsLoading(true)
    try {
      const { error } = await supabase
        .from('employees')
        .update({
          ...formData,
          contract_type: formData.contract_type as any,
          experience_level: formData.experience_level as any
        })
        .eq('id', employee.id)

      if (error) throw error

      toast.success('Profil mis à jour avec succès')
      setIsEditing(false)
      onUpdate()
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de la mise à jour')
    } finally {
      setIsLoading(false)
    }
  }

  if (!employee) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div 
              className="w-12 h-12 rounded-full flex items-center justify-center text-white text-lg font-bold" 
              style={{ backgroundColor: formData.color }}
            >
              {formData.first_name[0]}{formData.last_name[0]}
            </div>
            <div>
              <DialogTitle>{formData.first_name} {formData.last_name}</DialogTitle>
              <DialogDescription>
                {employee.sites?.name || 'Non assigné'} • {formData.contract_type}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <Tabs defaultValue="info" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="info">Informations</TabsTrigger>
            <TabsTrigger value="contract">Contrat & Horaires</TabsTrigger>
          </TabsList>

          <TabsContent value="info" className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="first_name">
                  <User className="w-4 h-4 inline mr-2" />
                  Prénom
                </Label>
                <Input
                  id="first_name"
                  value={formData.first_name}
                  onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                  disabled={!isEditing}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="last_name">
                  <User className="w-4 h-4 inline mr-2" />
                  Nom
                </Label>
                <Input
                  id="last_name"
                  value={formData.last_name}
                  onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                  disabled={!isEditing}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">
                  <Mail className="w-4 h-4 inline mr-2" />
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  disabled={!isEditing}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">
                  <Phone className="w-4 h-4 inline mr-2" />
                  Téléphone
                </Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  disabled={!isEditing}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="site">
                  <MapPin className="w-4 h-4 inline mr-2" />
                  Site de rattachement
                </Label>
                <Select 
                  value={formData.site_id} 
                  onValueChange={(value) => setFormData({ ...formData, site_id: value })}
                  disabled={!isEditing}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un site" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Aucun</SelectItem>
                    {sites?.map(site => (
                      <SelectItem key={site.id} value={site.id}>{site.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="manager">
                  <Users className="w-4 h-4 inline mr-2" />
                  Manager (N+1)
                </Label>
                <Select 
                  value={formData.manager_id} 
                  onValueChange={(value) => setFormData({ ...formData, manager_id: value })}
                  disabled={!isEditing}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un manager" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Aucun</SelectItem>
                    {employees?.filter(emp => emp.id !== employee.id).map(emp => (
                      <SelectItem key={emp.id} value={emp.id}>
                        {emp.first_name} {emp.last_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="color">Couleur</Label>
                <div className="flex gap-2">
                  <Input
                    id="color"
                    type="color"
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    disabled={!isEditing}
                    className="h-10 w-20"
                  />
                  <Input
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    disabled={!isEditing}
                    className="flex-1"
                  />
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="contract" className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contract_type">
                  <Briefcase className="w-4 h-4 inline mr-2" />
                  Type de contrat
                </Label>
                <Select 
                  value={formData.contract_type} 
                  onValueChange={(value) => setFormData({ ...formData, contract_type: value })}
                  disabled={!isEditing}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CDI">CDI</SelectItem>
                    <SelectItem value="CDD">CDD</SelectItem>
                    <SelectItem value="INTERIM">INTERIM</SelectItem>
                    <SelectItem value="STAGE">STAGE</SelectItem>
                    <SelectItem value="APPRENTISSAGE">APPRENTISSAGE</SelectItem>
                    <SelectItem value="STUDENT">STUDENT</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="experience">Niveau d'expérience</Label>
                <Select 
                  value={formData.experience_level} 
                  onValueChange={(value) => setFormData({ ...formData, experience_level: value })}
                  disabled={!isEditing}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NOUVEAU">Nouveau</SelectItem>
                    <SelectItem value="VETERANT">Vétéran</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="hire_date">
                  <Calendar className="w-4 h-4 inline mr-2" />
                  Date d'embauche
                </Label>
                <Input
                  id="hire_date"
                  type="date"
                  value={formData.hire_date}
                  onChange={(e) => setFormData({ ...formData, hire_date: e.target.value })}
                  disabled={!isEditing}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="hourly_rate">
                  <DollarSign className="w-4 h-4 inline mr-2" />
                  Taux horaire (€)
                </Label>
                <Input
                  id="hourly_rate"
                  type="number"
                  step="0.01"
                  value={formData.hourly_rate}
                  onChange={(e) => setFormData({ ...formData, hourly_rate: parseFloat(e.target.value) })}
                  disabled={!isEditing}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="weekly_hours">Heures hebdomadaires</Label>
                <Input
                  id="weekly_hours"
                  type="number"
                  value={formData.weekly_hours}
                  onChange={(e) => setFormData({ ...formData, weekly_hours: parseFloat(e.target.value) })}
                  disabled={!isEditing}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="is_student">Statut</Label>
                <div className="flex items-center space-x-2 pt-2">
                  <input
                    type="checkbox"
                    id="is_student"
                    checked={formData.is_student}
                    onChange={(e) => setFormData({ ...formData, is_student: e.target.checked })}
                    disabled={!isEditing}
                    className="h-4 w-4"
                  />
                  <Label htmlFor="is_student" className="font-normal cursor-pointer">
                    Étudiant
                  </Label>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-between items-center mt-6 pt-4 border-t">
          <div>
            {employee.profile_id && (
              <Badge variant="outline" className="mr-2">
                Compte lié
              </Badge>
            )}
          </div>
          <div className="flex gap-2">
            {canEdit && !isEditing && (
              <Button onClick={() => setIsEditing(true)}>
                Modifier
              </Button>
            )}
            {isEditing && (
              <>
                <Button variant="ghost" onClick={() => {
                  setIsEditing(false)
                  // Reset form data
                  setFormData({
                    first_name: employee.first_name || '',
                    last_name: employee.last_name || '',
                    email: employee.email || '',
                    phone: employee.phone || '',
                    contract_type: employee.contract_type || 'CDI',
                    experience_level: employee.experience_level || 'NOUVEAU',
                    hourly_rate: employee.hourly_rate || 0,
                    weekly_hours: employee.weekly_hours || 35,
                    site_id: employee.site_id || '',
                    manager_id: employee.manager_id || '',
                    color: employee.color || '#3b82f6',
                    is_student: employee.is_student || false,
                    hire_date: employee.hire_date || ''
                  })
                }}>
                  Annuler
                </Button>
                <Button onClick={handleSave} disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Enregistrer
                </Button>
              </>
            )}
            {!isEditing && (
              <Button variant="outline" onClick={onClose}>
                Fermer
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
