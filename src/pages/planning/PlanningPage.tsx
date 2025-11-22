import { useState } from 'react'
import { startOfDay, endOfDay, startOfWeek, endOfWeek } from 'date-fns'
import { useShifts } from '@/hooks/useShifts'
import { useEmployees } from '@/hooks/useEmployees'
import { useSites } from '@/hooks/useSites'
import { PlanningToolbar } from '@/components/planning/PlanningToolbar'
import { TimelineGrid } from '@/components/planning/TimelineGrid'
import { Loader2 } from 'lucide-react'

export default function PlanningPage() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [viewMode, setViewMode] = useState<'day' | 'week'>('week')
  const [siteId, setSiteId] = useState<string>('all')

  // Calculate date range for query
  const startDate = viewMode === 'day' 
    ? startOfDay(currentDate).toISOString()
    : startOfWeek(currentDate, { weekStartsOn: 1 }).toISOString()
    
  const endDate = viewMode === 'day'
    ? endOfDay(currentDate).toISOString()
    : endOfWeek(currentDate, { weekStartsOn: 1 }).toISOString()

  // Fetch Data
  const { sites } = useSites()
  const { employees, isLoading: isLoadingEmployees } = useEmployees()
  const { shifts, isLoading: isLoadingShifts } = useShifts(
    siteId === 'all' ? undefined : siteId,
    startDate,
    endDate
  )

  const isLoading = isLoadingEmployees || isLoadingShifts

  // Transform shifts for grid
  // The hook returns ShiftWithAssignments, we need to flatten it for the grid if needed
  // But TimelineGrid expects a simpler Shift interface. Let's map it.
  const gridShifts = shifts?.map(s => ({
    id: s.id,
    employee_id: s.shift_assignments?.[0]?.employee?.id || 'unassigned', // Handle multiple assignments later?
    start_time: `${s.date}T${s.start_time}`,
    end_time: `${s.date}T${s.end_time}`,
    site: s.site || undefined,
    role: s.shift_assignments?.[0]?.employee?.contract_type || undefined // Or role from shift?
  })) || []

  // Filter employees if site is selected? 
  // Ideally we should filter employees who work at this site. 
  // For now, show all employees.

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col">
      <PlanningToolbar
        currentDate={currentDate}
        onDateChange={setCurrentDate}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        siteId={siteId}
        onSiteChange={setSiteId}
        sites={sites || []}
      />

      <div className="flex-1 overflow-auto p-4">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <TimelineGrid
            employees={employees || []}
            shifts={gridShifts}
            currentDate={currentDate}
            viewMode={viewMode}
          />
        )}
      </div>
    </div>
  )
}
