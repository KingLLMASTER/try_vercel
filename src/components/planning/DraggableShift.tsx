import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { cn } from '@/lib/utils';

interface DraggableShiftProps {
  id: string;
  children: React.ReactNode;
  className?: string;
}

export function DraggableShift({ id, children, className }: DraggableShiftProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: id,
  });

  const style = {
    transform: CSS.Translate.toString(transform),
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={cn(
        "cursor-grab active:cursor-grabbing touch-none",
        isDragging ? "opacity-50 z-50" : "",
        className
      )}
    >
      {children}
    </div>
  );
}
