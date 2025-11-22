import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/integrations/supabase/client'
import { useProfile } from '@/hooks/useProfile'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from 'sonner'
import { Loader2, Upload, Calendar as CalendarIcon } from 'lucide-react'

export default function EmployeePortal() {
  const { user } = useAuth()
  const { profile } = useProfile()
  const [isLoading, setIsLoading] = useState(false)

  // Leave Request State
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [leaveType, setLeaveType] = useState('PAID_LEAVE')
  const [reason, setReason] = useState('')

  // Document Upload State
  const [file, setFile] = useState<File | null>(null)
  const [docName, setDocName] = useState('')

  const handleLeaveRequest = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return
    setIsLoading(true)

    try {
      // Get employee ID first
      const { data: employee } = await supabase
        .from('employees')
        .select('id')
        .eq('profile_id', user.id)
        .single()

      if (!employee) throw new Error("Profil employé non trouvé")

      const { error } = await supabase.from('leave_requests').insert({
        employee_id: employee.id,
        start_date: startDate,
        end_date: endDate,
        type: leaveType as any,
        reason,
        status: 'PENDING',
        organization_id: profile!.organization_id
      })

      if (error) throw error
      toast.success("Demande envoyée avec succès")
      setReason('')
      setStartDate('')
      setEndDate('')
    } catch (error: any) {
      toast.error(error.message || "Erreur lors de l'envoi")
    } finally {
      setIsLoading(false)
    }
  }

  const handleFileUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !file) return
    setIsLoading(true)

    try {
      // Get employee ID
      const { data: employee } = await supabase
        .from('employees')
        .select('id')
        .eq('profile_id', user.id)
        .single()

      if (!employee) throw new Error("Profil employé non trouvé")

      const fileExt = file.name.split('.').pop()
      const filePath = `${employee.id}/${Math.random()}.${fileExt}`

      // Upload to Storage
      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      // Save record in DB
      const { error: dbError } = await supabase.from('documents').insert({
        employee_id: employee.id,
        name: docName || file.name,
        file_path: filePath,
        type: file.type,
        organization_id: profile!.organization_id
      })

      if (dbError) throw dbError

      toast.success("Document téléchargé avec succès")
      setFile(null)
      setDocName('')
    } catch (error: any) {
      toast.error(error.message || "Erreur lors du téléchargement")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-500">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Mon Espace</h2>
        <p className="text-muted-foreground">Gérez vos congés et documents administratifs.</p>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        {/* Leave Requests */}
        <Card>
          <CardHeader>
            <CardTitle>Demande de Congés / Examens</CardTitle>
            <CardDescription>Soumettez vos demandes d'absence ici.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLeaveRequest} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Date de début</Label>
                  <Input 
                    type="date" 
                    value={startDate} 
                    onChange={(e) => setStartDate(e.target.value)} 
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label>Date de fin</Label>
                  <Input 
                    type="date" 
                    value={endDate} 
                    onChange={(e) => setEndDate(e.target.value)} 
                    required 
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Type d'absence</Label>
                <Select value={leaveType} onValueChange={setLeaveType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PAID_LEAVE">Congés Payés</SelectItem>
                    <SelectItem value="SICK_LEAVE">Arrêt Maladie</SelectItem>
                    <SelectItem value="EXAM">Examen (Étudiant)</SelectItem>
                    <SelectItem value="OTHER">Autre</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Motif (Optionnel)</Label>
                <Input 
                  value={reason} 
                  onChange={(e) => setReason(e.target.value)} 
                  placeholder="Détails supplémentaires..." 
                />
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CalendarIcon className="mr-2 h-4 w-4" />}
                Envoyer la demande
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Documents */}
        <Card>
          <CardHeader>
            <CardTitle>Mes Documents</CardTitle>
            <CardDescription>Certificats médicaux, justificatifs, etc.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleFileUpload} className="space-y-4">
              <div className="space-y-2">
                <Label>Nom du document</Label>
                <Input 
                  value={docName} 
                  onChange={(e) => setDocName(e.target.value)} 
                  placeholder="Ex: Certificat Médical - Janvier" 
                  required 
                />
              </div>

              <div className="space-y-2">
                <Label>Fichier</Label>
                <Input 
                  type="file" 
                  onChange={(e) => setFile(e.target.files?.[0] || null)} 
                  required 
                />
              </div>

              <Button type="submit" className="w-full" variant="secondary" disabled={isLoading}>
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
                Télécharger
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
