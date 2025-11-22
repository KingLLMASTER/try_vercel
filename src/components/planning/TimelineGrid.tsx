import { useMemo, useState } from 'react'
import { format, addHours, startOfDay, addDays, startOfWeek, isSameDay, differenceInMinutes } from 'date-fns'
import { fr } from 'date-fns/locale'
import { DraggableShiftCard } from './DraggableShiftCard'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DndContext, DragEndEvent, useDroppable, DragOverlay } from '@dnd-kit/core'
import { ShiftCard } from './ShiftCard'
import { useShifts } from '@/hooks/useShifts'
import { toast } from 'sonner'

interface Employee {
  id: string
  first_name: string
  last_name: string
  profile?: {
    avatar_url?: string | null
  }
}

interface Shift {
  id: string
  employee_id: string
  start_time: string
  end_time: string
  site?: { name: string }
  role?: string
}

interface TimelineGridProps {
  employees: Employee[]
  shifts: Shift[]
  currentDate: Date
  viewMode: 'day' | 'week'
}

function EmployeeRow({ 
  employee, 
  shifts, 
  timeSlots, 
  viewMode, 
  currentDate,
  getGridPosition 
}: { 
  employee: Employee
  shifts: Shift[]
  timeSlots: any[]
  viewMode: 'day' | 'week'
  currentDate: Date
  getGridPosition: (shift: Shift) => any
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: employee.id,
    data: { employee }
  })

  return (
    <div 
      ref={setNodeRef}
      className={`flex group transition-colors ${isOver ? 'bg-primary/5' : 'hover:bg-muted/20'}`}
    >
      {/* Employee Info */}
      <div className="w-48 flex-shrink-0 p-4 border-r flex items-center gap-3 bg-background z-10">
        <Avatar className="h-8 w-8">
          <AvatarImage src={employee.profile?.avatar_url || undefined} />
          <AvatarFallback>{employee.first_name[0]}{employee.last_name[0]}</AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <div className="font-medium text-sm truncate">{employee.first_name} {employee.last_name}</div>
          <div className="text-xs text-muted-foreground truncate">Contrat 35h</div>
        </div>
      </div>

      {/* Timeline Area */}
      <div className="flex-1 relative h-20">
        {/* Grid Lines */}
        {timeSlots.map((_, i) => (
          <div 
            key={i}
            className="absolute top-0 bottom-0 border-l border-dashed group-hover:border-solid border-muted/50"
            style={{ left: `${(i / timeSlots.length) * 100}%` }}
          />
        ))}

        {/* Shifts */}
        {shifts
          .filter(s => s.employee_id === employee.id)
          .filter(s => {
             // Filter shifts visible in current view
             const shiftStart = new Date(s.start_time)
             if (viewMode === 'day') {
               return isSameDay(shiftStart, currentDate)
             } else {
               const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 })
               const weekEnd = addDays(weekStart, 7)
               return shiftStart >= weekStart && shiftStart < weekEnd
             }
          })
          .map(shift => {
            const style = getGridPosition(shift)
            return (
              <div
                key={shift.id}
                className="absolute top-2 bottom-2 px-1"
                style={style}
              >
                <DraggableShiftCard shift={shift} />
              </div>
            )
          })}
      </div>
    </div>
  )
}

export function TimelineGrid({ employees, shifts, currentDate, viewMode }: TimelineGridProps) {
  const { assignEmployee } = useShifts()
  const [activeShift, setActiveShift] = useState<Shift | null>(null)

  // Generate time slots (columns)
  const timeSlots = useMemo(() => {
    if (viewMode === 'day') {
      // 24 hours
      return Array.from({ length: 24 }, (_, i) => ({
        label: format(addHours(startOfDay(currentDate), i), 'HH:mm'),
        date: addHours(startOfDay(currentDate), i)
      }))
    } else {
      // 7 days
      const start = startOfWeek(currentDate, { weekStartsOn: 1 })
      return Array.from({ length: 7 }, (_, i) => ({
        label: format(addDays(start, i), 'EEE d', { locale: fr }),
        date: addDays(start, i)
      }))
    }
  }, [currentDate, viewMode])

  // Helper to calculate grid position
  const getGridPosition = (shift: Shift) => {
    const start = new Date(shift.start_time)
    const end = new Date(shift.end_time)
    
    if (viewMode === 'day') {
      const dayStart = startOfDay(currentDate)
      const offsetMinutes = differenceInMinutes(start, dayStart)
      const durationMinutes = differenceInMinutes(end, start)
      
      // Total minutes in day = 1440
      const startPercent = (offsetMinutes / 1440) * 100
      const widthPercent = (durationMinutes / 1440) * 100
      
      return {
        left: `${startPercent}%`,
        width: `${widthPercent}%`
      }
    } else {
      // Week view
      const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 })
      const dayIndex = differenceInMinutes(start, weekStart) / (24 * 60) // Days from start of week
      
      const colIndex = Math.floor(dayIndex)
      
      return {
        left: `${(colIndex / 7) * 100}%`,
        width: `${(1 / 7) * 100}%`
      }
    }
  }

  const handleDragStart = (event: any) => {
    setActiveShift(event.active.data.current.shift)
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    setActiveShift(null)

    if (!over) return

    const shift = active.data.current?.shift as Shift
    const newEmployeeId = over.id as string
    
    if (shift.employee_id !== newEmployeeId) {
      try {
        // Optimistic update handled by query invalidation for now
        await assignEmployee.mutateAsync({
           shiftId: shift.id,
           employeeId: newEmployeeId
        })
        toast.success("Shift réassigné")
      } catch (error) {
        toast.error("Erreur lors de la réassignation")
      }
    }
  }

  return (
    <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="border rounded-lg overflow-hidden bg-background shadow-sm select-none">
        {/* Header Row (Time Slots) */}
        <div className="flex border-b bg-muted/40">
          <div className="w-48 flex-shrink-0 p-4 font-semibold border-r">Employés</div>
          <div className="flex-1 relative h-12">
            {timeSlots.map((slot, i) => (
              <div 
                key={i} 
                className="absolute top-0 bottom-0 border-l text-xs text-muted-foreground p-1 truncate"
                style={{ left: `${(i / timeSlots.length) * 100}%`, width: `${(1 / timeSlots.length) * 100}%` }}
              >
                {slot.label}
              </div>
            ))}
          </div>
        </div>

        {/* Employee Rows */}
        <div className="divide-y">
          {employees.map(employee => (
            <EmployeeRow
              key={employee.id}
              employee={employee}
              shifts={shifts}
              timeSlots={timeSlots}
              viewMode={viewMode}
              currentDate={currentDate}
              getGridPosition={getGridPosition}
            />
          ))}
          
          {employees.length === 0 && (
            <div className="p-8 text-center text-muted-foreground">
              Aucun employé trouvé.
            </div>
          )}
        </div>
      </div>
      
      <DragOverlay>
        {activeShift ? (
          <div style={{ width: '200px', height: '100%' }}>
             <ShiftCard shift={activeShift} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}
