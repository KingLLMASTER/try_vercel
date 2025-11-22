import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

interface ShiftCardProps {
  shift: {
    id: string
    start_time: string
    end_time: string
    site?: { name: string }
    role?: string
  }
  onClick?: () => void
}

export function ShiftCard({ shift, onClick }: ShiftCardProps) {
  const start = new Date(shift.start_time)
  const end = new Date(shift.end_time)
  
  // Calculate duration in hours for potential width adjustment (if not handled by grid)
  // const duration = (end.getTime() - start.getTime()) / (1000 * 60 * 60)

  return (
    <Card 
      className={cn(
        "h-full overflow-hidden hover:shadow-md transition-shadow cursor-pointer border-l-4",
        "bg-primary/10 border-l-primary hover:bg-primary/20"
      )}
      onClick={onClick}
    >
      <CardContent className="p-2 text-xs flex flex-col justify-between h-full">
        <div className="font-semibold truncate">
          {format(start, 'HH:mm')} - {format(end, 'HH:mm')}
        </div>
        {shift.site && (
          <div className="truncate font-medium text-muted-foreground">
            {shift.site.name}
          </div>
        )}
        {shift.role && (
          <Badge variant="outline" className="w-fit text-[10px] px-1 py-0 h-4">
            {shift.role}
          </Badge>
        )}
      </CardContent>
    </Card>
  )
}
