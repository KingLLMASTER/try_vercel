import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { addDays, format } from 'date-fns'

export interface DashboardStats {
  totalEmployees: number
  activeSites: number
  upcomingShiftsCount: number
  unfilledShiftsCount: number
  upcomingShifts: any[]
}

export function useDashboardStats() {
  return useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async (): Promise<DashboardStats> => {
      const today = new Date()
      const nextWeek = addDays(today, 7)
      const todayStr = format(today, 'yyyy-MM-dd')
      const nextWeekStr = format(nextWeek, 'yyyy-MM-dd')

      // 1. Total Employees
      const { count: totalEmployees, error: empError } = await supabase
        .from('employees')
        .select('*', { count: 'exact', head: true })
        .eq('is_archived', false)
      
      if (empError) throw empError

      // 2. Active Sites
      const { count: activeSites, error: siteError } = await supabase
        .from('sites')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true)

      if (siteError) throw siteError

      // 3. Upcoming Shifts (Next 7 days)
      const { data: upcomingShifts, error: shiftError } = await supabase
        .from('shifts')
        .select(`
          *,
          site:sites(name),
          shift_assignments(count)
        `)
        .gte('date', todayStr)
        .lte('date', nextWeekStr)
        .order('date', { ascending: true })
        .order('start_time', { ascending: true })

      if (shiftError) throw shiftError

      // 4. Calculate Unfilled Shifts
      // A shift is unfilled if assignments count < max_employees
      const unfilledShiftsCount = (upcomingShifts as any[])?.filter(shift => {
        const assignmentCount = shift.shift_assignments?.[0]?.count || 0
        return assignmentCount < shift.max_employees
      }).length || 0

      return {
        totalEmployees: totalEmployees || 0,
        activeSites: activeSites || 0,
        upcomingShiftsCount: upcomingShifts?.length || 0,
        unfilledShiftsCount,
        upcomingShifts: upcomingShifts || []
      }
    }
  })
}
