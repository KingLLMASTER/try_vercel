import { useState } from 'react'
import { useSites } from '@/hooks/useSites'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, MapPin, Users, Clock } from 'lucide-react'

export default function SitesPage() {
  const { sites, isLoading, createSite, deleteSite } = useSites()
  const [isCreating, setIsCreating] = useState(false)
  const [newSite, setNewSite] = useState({ name: '', code: '', address: '', capacity: 0 })

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await createSite.mutateAsync({
        ...newSite,
        opening_hours: {}, // Default empty
        is_active: true
      })
      setIsCreating(false)
      setNewSite({ name: '', code: '', address: '', capacity: 0 })
    } catch (error) {
      console.error(error)
      alert("Erreur lors de la création du site")
    }
  }

  if (isLoading) return <div>Chargement des sites...</div>

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Sites</h1>
        <Button onClick={() => setIsCreating(!isCreating)}>
          <Plus className="mr-2 h-4 w-4" /> Nouveau Site
        </Button>
      </div>

      {isCreating && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Ajouter un site</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nom</Label>
                  <Input 
                    value={newSite.name} 
                    onChange={e => setNewSite({...newSite, name: e.target.value})}
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label>Code</Label>
                  <Input 
                    value={newSite.code} 
                    onChange={e => setNewSite({...newSite, code: e.target.value})}
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label>Adresse</Label>
                  <Input 
                    value={newSite.address} 
                    onChange={e => setNewSite({...newSite, address: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Capacité</Label>
                  <Input 
                    type="number"
                    value={newSite.capacity} 
                    onChange={e => setNewSite({...newSite, capacity: parseInt(e.target.value)})}
                  />
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
        {sites?.map((site) => (
          <Card key={site.id}>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                {site.name}
                <span className="text-sm font-normal text-muted-foreground bg-secondary px-2 py-1 rounded">
                  {site.code}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center text-sm text-muted-foreground">
                <MapPin className="mr-2 h-4 w-4" />
                {site.address || "Pas d'adresse"}
              </div>
              <div className="flex items-center text-sm text-muted-foreground">
                <Users className="mr-2 h-4 w-4" />
                Capacité: {site.capacity}
              </div>
              <div className="flex items-center text-sm text-muted-foreground">
                <Clock className="mr-2 h-4 w-4" />
                {site.is_active ? "Actif" : "Inactif"}
              </div>
              <div className="pt-4 flex justify-end">
                <Button 
                  variant="destructive" 
                  size="sm"
                  onClick={() => {
                    if(confirm('Supprimer ce site ?')) deleteSite.mutate(site.id)
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
