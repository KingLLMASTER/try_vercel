import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { Database } from '@/integrations/supabase/types'

type Shift = Database['public']['Tables']['shifts']['Row']
type ShiftInsert = Database['public']['Tables']['shifts']['Insert']
type ShiftUpdate = Database['public']['Tables']['shifts']['Update']

type ShiftWithAssignments = Shift & {
  shift_assignments: {
    id: string
    status: Database['public']['Enums']['assignment_status']
    employee: {
      id: string
      first_name: string
      last_name: string
      color: string | null
    } | null
  }[]
}

export function useShifts(siteId?: string, startDate?: string, endDate?: string) {
  const queryClient = useQueryClient()

  const { data: shifts, isLoading, error } = useQuery({
    queryKey: ['shifts', siteId, startDate, endDate],
    queryFn: async () => {
      let query = supabase
        .from('shifts')
        .select(`
          *,
          shift_assignments (
            id,
            status,
            employee:employees (
              id,
              first_name,
              last_name,
              color
            )
          )
        `)
      
      if (siteId) {
        query = query.eq('site_id', siteId)
      }
      
      if (startDate) {
        query = query.gte('date', startDate)
      }
      
      if (endDate) {
        query = query.lte('date', endDate)
      }

      const { data, error } = await query.order('date').order('start_time')
      
      if (error) throw error
      return data as unknown as ShiftWithAssignments[]
    },
    enabled: !!siteId, // Only fetch if siteId is provided
  })

  const createShift = useMutation({
    mutationFn: async (newShift: ShiftInsert) => {
      const { data, error } = await (supabase
        .from('shifts') as any)
        .insert(newShift)
        .select()
        .single()
      
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shifts'] })
    },
  })

  const updateShift = useMutation({
    mutationFn: async ({ id, ...updates }: ShiftUpdate & { id: string }) => {
      const { data, error } = await (supabase
        .from('shifts') as any)
        .update(updates)
        .eq('id', id)
        .select()
        .single()
      
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shifts'] })
    },
  })

  const deleteShift = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('shifts')
        .delete()
        .eq('id', id)
      
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shifts'] })
    },
  })

  return {
    shifts,
    isLoading,
    error,
    createShift,
    updateShift,
    deleteShift,
  }
}

export const checkConflict = async (
  employeeIds: string[],
  date: string,
  startTime: string,
  endTime: string,
  excludeShiftId?: string
) => {
  if (employeeIds.length === 0) return [];

  const { data: overlappingShifts, error } = await supabase
    .from('shifts')
    .select(`
      id,
      title,
      start_time,
      end_time,
      shift_assignments (
        employee_id,
        employee:employees (
          first_name,
          last_name
        )
      )
    `)
    .eq('date', date)
    .lt('start_time', endTime)
    .gt('end_time', startTime)
  
  if (error) throw error;

  const conflicts: string[] = [];

  for (const shift of (overlappingShifts as any[])) {
    if (excludeShiftId && shift.id === excludeShiftId) continue;

    for (const assignment of shift.shift_assignments) {
      if (employeeIds.includes(assignment.employee_id)) {
        // @ts-ignore
        const empName = `${assignment.employee?.first_name} ${assignment.employee?.last_name}`;
        conflicts.push(`${empName} est déjà planifié sur "${shift.title || 'Sans titre'}" (${shift.start_time.slice(0, 5)}-${shift.end_time.slice(0, 5)})`);
      }
    }
  }
  
  return conflicts;
}

import { sendNotification } from './useNotifications'

export const assignEmployeesToShift = async (shiftId: string, employeeIds: string[]) => {
  // 1. Get existing assignments
  const { data: existingAssignments, error: fetchError } = await supabase
    .from('shift_assignments')
    .select('employee_id')
    .eq('shift_id', shiftId)
  
  if (fetchError) throw fetchError

  const existingIds = (existingAssignments as any[]).map(a => a.employee_id)

  // 2. Determine additions and removals
  const toAdd = employeeIds.filter(id => !existingIds.includes(id))
  const toRemove = existingIds.filter(id => !employeeIds.includes(id))

  // 3. Execute updates
  if (toRemove.length > 0) {
    const { error: deleteError } = await supabase
      .from('shift_assignments')
      .delete()
      .eq('shift_id', shiftId)
      .in('employee_id', toRemove)
    
    if (deleteError) throw deleteError
  }

  if (toAdd.length > 0) {
    const { error: insertError } = await supabase
      .from('shift_assignments')
      .insert(
        toAdd.map(employeeId => ({
          shift_id: shiftId,
          employee_id: employeeId,
          status: 'PROPOSED'
        })) as any
      )
    
    
    if (insertError) throw insertError

    // Send notifications
    // 1. Get shift details
    const { data: shift } = await supabase
      .from('shifts')
      .select('title, date, start_time, end_time, site:sites(name)')
      .eq('id', shiftId)
      .single() as any
    
    // 2. Get employee profiles
    const { data: employees } = await supabase
      .from('employees')
      .select('id, profile_id')
      .in('id', toAdd) as any
    
    if (shift && employees) {
      for (const emp of employees) {
        if (emp.profile_id) {
          // @ts-ignore
          const siteName = shift.site?.name || 'Site inconnu'
          const dateStr = shift.date
          const timeStr = `${shift.start_time.slice(0, 5)} - ${shift.end_time.slice(0, 5)}`
          
          await sendNotification(
            emp.profile_id,
            "Nouveau Shift Assigné",
            `Vous avez été assigné au shift "${shift.title || 'Sans titre'}" le ${dateStr} (${timeStr}) à ${siteName}.`,
            "info"
          )
        }
      }
    }
  }
}
