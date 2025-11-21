import { useState } from 'react'
import { useSites } from '@/hooks/useSites'
import { useShifts, checkConflict } from '@/hooks/useShifts'
import { Button } from '@/components/ui/button'
import { format, startOfWeek, addDays } from 'date-fns'
import { fr } from 'date-fns/locale'
import { ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon } from 'lucide-react'
import { ShiftDialog } from '@/components/shifts/ShiftDialog'
import { Database } from '@/integrations/supabase/types'
import { DndContext, DragEndEvent, useSensor, useSensors, PointerSensor } from '@dnd-kit/core'
import { DraggableShift } from '@/components/planning/DraggableShift'
import { DroppableCell } from '@/components/planning/DroppableCell'

type Shift = Database['public']['Tables']['shifts']['Row']

export default function PlanningPage() {
  const { sites } = useSites()
  const [selectedSiteId, setSelectedSiteId] = useState<string>('')
  const [currentDate, setCurrentDate] = useState(new Date())
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [editingShift, setEditingShift] = useState<Shift | null>(null)

  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 }) // Monday
  const weekEnd = addDays(weekStart, 6)
  const weekDays = Array.from({ length: 7 }).map((_, i) => addDays(weekStart, i))

  const { shifts } = useShifts(
    selectedSiteId, 
    format(weekStart, 'yyyy-MM-dd'), 
    format(weekEnd, 'yyyy-MM-dd')
  )

  // Auto-select first site
  if (!selectedSiteId && sites && sites.length > 0) {
    setSelectedSiteId(sites[0].id)
  }

  const handlePrevWeek = () => setCurrentDate(addDays(currentDate, -7))
  const handleNextWeek = () => setCurrentDate(addDays(currentDate, 7))

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  )

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    
    if (over && active.id !== over.id) {
      const shiftId = active.id as string
      const newDate = over.id as string
      
      // Find the shift to get its assignments
      const shift = shifts?.find(s => s.id === shiftId)
      
      if (shift) {
        // Check for conflicts
        // @ts-ignore
        const assignedEmployeeIds = (shift.shift_assignments?.map(a => a.employee?.id).filter(Boolean) || []) as string[];
        
        if (assignedEmployeeIds.length > 0) {
          // We assume the time remains the same, only date changes
          const conflicts = await checkConflict(
            assignedEmployeeIds,
            newDate,
            shift.start_time,
            shift.end_time,
            shiftId
          );

          if (conflicts.length > 0) {
            const confirm = window.confirm(
              `Conflits détectés pour le déplacement :\n${conflicts.join('\n')}\n\nVoulez-vous quand même déplacer ce shift ?`
            );
            if (!confirm) return;
          }
        }

        // @ts-ignore
        updateShift.mutate({ 
          id: shiftId, 
          date: newDate 
        })
      }
    }
  }

  return (
    <div className="p-8 h-full flex flex-col">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <CalendarIcon className="w-8 h-8" />
          Planning
        </h1>
        
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4 w-full md:w-auto">
          <select 
            className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm w-full md:w-auto"
            value={selectedSiteId}
            onChange={(e) => setSelectedSiteId(e.target.value)}
          >
            <option value="" disabled>Choisir un site</option>
            {sites?.map(site => (
              <option key={site.id} value={site.id}>{site.name}</option>
            ))}
          </select>

          <div className="flex items-center justify-between gap-2 bg-white dark:bg-gray-800 rounded-md border p-1 w-full md:w-auto">
            <Button variant="ghost" size="icon" onClick={handlePrevWeek}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="font-medium px-2 text-center flex-1 md:flex-none">
              {format(weekStart, 'd MMM', { locale: fr })} - {format(weekEnd, 'd MMM yyyy', { locale: fr })}
            </span>
            <Button variant="ghost" size="icon" onClick={handleNextWeek}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          <Button className="w-full md:w-auto" onClick={() => {
            setEditingShift(null)
            setSelectedDate(new Date())
            setIsDialogOpen(true)
          }}>
            <Plus className="mr-2 h-4 w-4" /> Nouveau Shift
          </Button>
        </div>
      </div>

      <ShiftDialog 
        open={isDialogOpen} 
        onOpenChange={setIsDialogOpen}
        initialDate={selectedDate}
        initialSiteId={selectedSiteId}
        shiftToEdit={editingShift}
      />

      <div className="flex-1 overflow-auto bg-white dark:bg-gray-800 rounded-lg border shadow">
        <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
          <div className="grid grid-cols-7 h-full min-w-[1000px]">
            {/* Headers */}
            {weekDays.map(day => (
              <div key={day.toString()} className="border-b border-r p-4 bg-gray-50 dark:bg-gray-900 text-center">
                <div className="font-medium text-lg capitalize">{format(day, 'EEEE', { locale: fr })}</div>
                <div className="text-muted-foreground">{format(day, 'd MMM')}</div>
              </div>
            ))}

            {/* Grid Body */}
            {weekDays.map(day => {
              const dateStr = format(day, 'yyyy-MM-dd')
              const dayShifts = shifts?.filter(s => s.date === dateStr)
              return (
                <DroppableCell 
                  key={day.toString()} 
                  id={dateStr}
                  date={dateStr}
                  className="border-r p-2 min-h-[500px] relative group"
                >
                  {/* Add Button on Hover */}
                  <button 
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-200 rounded transition-opacity z-10"
                    onClick={(e) => {
                      e.stopPropagation()
                      setEditingShift(null)
                      setSelectedDate(day)
                      setIsDialogOpen(true)
                    }}
                  >
                    <Plus className="w-4 h-4 text-gray-500" />
                  </button>

                  <div className="space-y-2 mt-6">
                    {dayShifts?.map(shift => (
                      <DraggableShift 
                        key={shift.id} 
                        id={shift.id}
                        className="p-2 rounded border text-sm shadow-sm cursor-pointer hover:shadow-md transition-shadow bg-white dark:bg-gray-800"
                      >
                        <div
                          style={{ borderLeftColor: shift.color || '#3b82f6', borderLeftWidth: '4px' }}
                          className="h-full pl-2"
                          onClick={(e) => {
                            e.stopPropagation()
                            // @ts-ignore
                            setEditingShift(shift)
                            setIsDialogOpen(true)
                          }}
                        >
                          <div className="font-semibold">
                            {shift.start_time.slice(0, 5)} - {shift.end_time.slice(0, 5)}
                          </div>
                          <div className="truncate text-muted-foreground">
                            {shift.title || "Sans titre"}
                          </div>
                          {/* Assignments */}
                          <div className="mt-2 flex -space-x-2 overflow-hidden">
                            {/* @ts-ignore */}
                            {shift.shift_assignments?.map((assignment) => (
                              <div 
                                key={assignment.id}
                                className="inline-block h-6 w-6 rounded-full ring-2 ring-white dark:ring-gray-800 bg-gray-200 flex items-center justify-center text-xs font-bold"
                                title={`${assignment.employee?.first_name} ${assignment.employee?.last_name}`}
                              >
                                {assignment.employee?.first_name?.[0]}
                              </div>
                            ))}
                          </div>
                        </div>
                      </DraggableShift>
                    ))}
                  </div>
                </DroppableCell>
              )
            })}
          </div>
        </DndContext>
      </div>
    </div>
  )
}
