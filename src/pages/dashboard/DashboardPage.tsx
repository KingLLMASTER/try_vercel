import { useDashboardStats } from '@/hooks/useDashboardStats'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, MapPin, Calendar, AlertCircle } from 'lucide-react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

export default function DashboardPage() {
  const { data: stats, isLoading } = useDashboardStats()

  if (isLoading) {
    return <div className="p-8">Chargement du tableau de bord...</div>
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Tableau de Bord</h2>
        <p className="text-muted-foreground">Vue d'ensemble de votre activité.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Employés</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalEmployees}</div>
            <p className="text-xs text-muted-foreground">Actifs sur la plateforme</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sites Actifs</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.activeSites}</div>
            <p className="text-xs text-muted-foreground">Lieux d'intervention</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Shifts à Venir</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.upcomingShiftsCount}</div>
            <p className="text-xs text-muted-foreground">Sur les 7 prochains jours</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Shifts Incomplets</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">{stats?.unfilledShiftsCount}</div>
            <p className="text-xs text-muted-foreground">Nécessitent une attention</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Planning de la semaine</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-8">
              {stats?.upcomingShifts.slice(0, 5).map((shift: any) => (
                <div key={shift.id} className="flex items-center">
                  <div className="ml-4 space-y-1">
                    <p className="text-sm font-medium leading-none">{shift.title || 'Shift sans titre'}</p>
                    <p className="text-sm text-muted-foreground">
                      {shift.site?.name} • {format(new Date(shift.date), 'EEEE d MMMM', { locale: fr })}
                    </p>
                  </div>
                  <div className="ml-auto font-medium">
                    {shift.start_time.slice(0, 5)} - {shift.end_time.slice(0, 5)}
                  </div>
                </div>
              ))}
              {stats?.upcomingShifts.length === 0 && (
                <div className="text-center text-muted-foreground py-8">
                  Aucun shift prévu cette semaine.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
