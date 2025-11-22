import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { supabase } from '@/integrations/supabase/client'
import { toast } from 'sonner'
import { Loader2, Mail, Copy } from 'lucide-react'

export default function InvitationDialog() {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [role, setRole] = useState('EMPLOYEE')
  const [inviteLink, setInviteLink] = useState('')

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setInviteLink('')

    try {
      const { data, error } = await supabase
        .from('invitations')
        .insert({
          email,
          role: role as any
        })
        .select()
        .single()

      if (error) throw error

      const link = `${window.location.origin}/login?token=${data.token}&email=${encodeURIComponent(email)}`
      setInviteLink(link)
      toast.success("Invitation créée avec succès")
    } catch (error: any) {
      toast.error(error.message || "Erreur lors de la création de l'invitation")
    } finally {
      setIsLoading(false)
    }
  }

  const copyLink = () => {
    navigator.clipboard.writeText(inviteLink)
    toast.success("Lien copié !")
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <Mail className="mr-2 h-4 w-4" />
          Inviter un utilisateur
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Inviter un nouvel utilisateur</DialogTitle>
          <DialogDescription>
            Générez un lien d'invitation pour permettre à un utilisateur de rejoindre l'équipe.
          </DialogDescription>
        </DialogHeader>

        {!inviteLink ? (
          <form onSubmit={handleInvite} className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>Email</Label>
              <Input 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                placeholder="nouveau@employe.com"
                required 
              />
            </div>

            <div className="space-y-2">
              <Label>Rôle</Label>
              <Select value={role} onValueChange={setRole}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="EMPLOYEE">Employé</SelectItem>
                  <SelectItem value="MANAGER">Manager</SelectItem>
                  <SelectItem value="SUPER_MANAGER">Super Manager</SelectItem>
                  <SelectItem value="ADMIN">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Générer l'invitation
            </Button>
          </form>
        ) : (
          <div className="space-y-4 mt-4">
            <div className="p-4 bg-muted rounded-lg break-all text-sm font-mono">
              {inviteLink}
            </div>
            <Button onClick={copyLink} className="w-full" variant="secondary">
              <Copy className="mr-2 h-4 w-4" />
              Copier le lien
            </Button>
            <Button onClick={() => { setIsOpen(false); setInviteLink(''); setEmail(''); }} variant="ghost" className="w-full">
              Fermer
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
