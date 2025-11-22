import { useDashboardStats } from '@/hooks/useDashboardStats'
import { useAuth } from '@/contexts/AuthContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Users, MapPin, Calendar, AlertCircle, TrendingUp, Clock, CheckCircle2, XCircle } from 'lucide-react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'

export default function DashboardPage() {
  const { organization } = useAuth()
  const { data: stats, isLoading } = useDashboardStats()

  // Fetch recent leave requests
  const { data: leaveRequests } = useQuery({
    queryKey: ['recent-leave-requests', organization?.id],
    queryFn: async () => {
      if (!organization?.id) return []
      
      const { data, error } = await supabase
        .from('leave_requests')
        .select(`
          *,
          employees:employee_id (
            first_name,
            last_name,
            color
          )
        `)
        .order('created_at', { ascending: false })
        .limit(5)

      if (error) throw error
      return data
    },
    enabled: !!organization?.id
  })

  if (isLoading) {
    return <div className="p-8">Chargement du tableau de bord...</div>
  }

  return (
    <div className="p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Tableau de Bord</h2>
        <p className="text-muted-foreground">Vue d'ensemble de votre activité</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Employés</CardTitle>
            <Users className="h-5 w-5 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats?.totalEmployees || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Dans toute l'organisation</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sites Actifs</CardTitle>
            <MapPin className="h-5 w-5 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats?.activeSites || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Lieux d'intervention</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Shifts à Venir</CardTitle>
            <Calendar className="h-5 w-5 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats?.upcomingShiftsCount || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Sur les 7 prochains jours</p>
          </CardContent>
        </Card>

        <Card className="border-red-200 hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Shifts Incomplets</CardTitle>
            <AlertCircle className="h-5 w-5 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-500">{stats?.unfilledShiftsCount || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Nécessitent une attention</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Upcoming Shifts */}
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Planning de la semaine
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stats?.upcomingShifts && stats.upcomingShifts.length > 0 ? (
              <div className="space-y-4">
                {stats.upcomingShifts.slice(0, 5).map((shift: any) => (
                  <div key={shift.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Calendar className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium leading-none">{shift.title || 'Shift sans titre'}</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          {shift.site?.name || 'Site non assigné'}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {format(new Date(shift.date), 'EEEE d MMMM', { locale: fr })}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant="outline">
                        <Clock className="mr-1 h-3 w-3" />
                        {shift.start_time?.slice(0, 5)} - {shift.end_time?.slice(0, 5)}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <Calendar className="h-12 w-12 mx-auto mb-4 opacity-20" />
                <p>Aucun shift prévu cette semaine</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Leave Requests */}
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Demandes de Congés
            </CardTitle>
          </CardHeader>
          <CardContent>
            {leaveRequests && leaveRequests.length > 0 ? (
              <div className="space-y-3">
                {leaveRequests.map((request: any) => (
                  <div key={request.id} className="flex items-start gap-3 p-3 rounded-lg bg-secondary/50">
                    <div 
                      className="h-8 w-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                      style={{ backgroundColor: request.employees?.color || '#3b82f6' }}
                    >
                      {request.employees?.first_name?.[0]}{request.employees?.last_name?.[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {request.employees?.first_name} {request.employees?.last_name}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {format(new Date(request.start_date), 'd MMM', { locale: fr })} - {format(new Date(request.end_date), 'd MMM', { locale: fr })}
                      </p>
                      <div className="mt-2">
                        {request.status === 'PENDING' && (
                          <Badge variant="outline" className="text-xs">
                            <Clock className="mr-1 h-3 w-3" />
                            En attente
                          </Badge>
                        )}
                        {request.status === 'APPROVED' && (
                          <Badge variant="default" className="bg-green-500 text-xs">
                            <CheckCircle2 className="mr-1 h-3 w-3" />
                            Approuvé
                          </Badge>
                        )}
                        {request.status === 'REJECTED' && (
                          <Badge variant="destructive" className="text-xs">
                            <XCircle className="mr-1 h-3 w-3" />
                            Refusé
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <CheckCircle2 className="h-12 w-12 mx-auto mb-4 opacity-20" />
                <p className="text-sm">Aucune demande récente</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
