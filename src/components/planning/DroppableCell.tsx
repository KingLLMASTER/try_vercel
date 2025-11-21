import { useDroppable } from '@dnd-kit/core';
import { cn } from '@/lib/utils';

interface DroppableCellProps {
  id: string;
  date: string;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export function DroppableCell({ id, date, children, className, onClick }: DroppableCellProps) {
  const { isOver, setNodeRef } = useDroppable({
    id: id,
    data: {
      date: date,
    },
  });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "min-h-[150px] p-2 transition-colors",
        isOver ? "bg-accent/50" : "",
        className
      )}
      onClick={onClick}
    >
      {children}
    </div>
  );
}
