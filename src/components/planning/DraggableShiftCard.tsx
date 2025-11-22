import { useDraggable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import { ShiftCard } from './ShiftCard'
import { cn } from '@/lib/utils'

interface DraggableShiftCardProps {
  shift: {
    id: string
    start_time: string
    end_time: string
    site?: { name: string }
    role?: string
  }
  onClick?: () => void
}

export function DraggableShiftCard({ shift, onClick }: DraggableShiftCardProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: shift.id,
    data: {
      shift,
      type: 'SHIFT'
    }
  })

  const style = {
    transform: CSS.Translate.toString(transform),
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={cn(
        "h-full touch-none",
        isDragging ? "opacity-50 z-50 relative" : ""
      )}
    >
      <ShiftCard shift={shift} onClick={onClick} />
    </div>
  )
}
