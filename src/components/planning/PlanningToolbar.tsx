import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { fr } from "date-fns/locale"

interface PlanningToolbarProps {
  currentDate: Date
  onDateChange: (date: Date) => void
  viewMode: 'day' | 'week'
  onViewModeChange: (mode: 'day' | 'week') => void
  siteId: string
  onSiteChange: (siteId: string) => void
  sites: { id: string; name: string }[]
}

export function PlanningToolbar({
  currentDate,
  onDateChange,
  viewMode,
  onViewModeChange,
  siteId,
  onSiteChange,
  sites
}: PlanningToolbarProps) {

  const handlePrevious = () => {
    const newDate = new Date(currentDate)
    if (viewMode === 'day') {
      newDate.setDate(newDate.getDate() - 1)
    } else {
      newDate.setDate(newDate.getDate() - 7)
    }
    onDateChange(newDate)
  }

  const handleNext = () => {
    const newDate = new Date(currentDate)
    if (viewMode === 'day') {
      newDate.setDate(newDate.getDate() + 1)
    } else {
      newDate.setDate(newDate.getDate() + 7)
    }
    onDateChange(newDate)
  }

  const handleToday = () => {
    onDateChange(new Date())
  }

  return (
    <div className="flex flex-col sm:flex-row justify-between items-center gap-4 p-4 bg-background border-b">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" onClick={handlePrevious}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button variant="outline" onClick={handleToday}>
          Aujourd'hui
        </Button>
        <Button variant="outline" size="icon" onClick={handleNext}>
          <ChevronRight className="h-4 w-4" />
        </Button>
        <div className="flex items-center gap-2 ml-2 font-semibold text-lg">
          <CalendarIcon className="h-5 w-5 text-muted-foreground" />
          <span className="capitalize">
            {format(currentDate, viewMode === 'day' ? 'EEEE d MMMM yyyy' : "'Semaine du' d MMMM", { locale: fr })}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <Select value={siteId} onValueChange={onSiteChange}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Sélectionner un site" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les sites</SelectItem>
            {sites.map(site => (
              <SelectItem key={site.id} value={site.id}>{site.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="flex items-center bg-muted rounded-lg p-1">
          <Button
            variant={viewMode === 'day' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => onViewModeChange('day')}
            className="text-xs"
          >
            Jour
          </Button>
          <Button
            variant={viewMode === 'week' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => onViewModeChange('week')}
            className="text-xs"
          >
            Semaine
          </Button>
        </div>
      </div>
    </div>
  )
}
