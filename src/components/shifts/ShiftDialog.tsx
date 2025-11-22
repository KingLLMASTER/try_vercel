import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useSites } from '@/hooks/useSites'
import { useEmployees } from '@/hooks/useEmployees'
import { useShifts, checkConflict, assignEmployeesToShift } from '@/hooks/useShifts'
import { Database } from '@/integrations/supabase/types'
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"

type Shift = Database['public']['Tables']['shifts']['Row']

const shiftSchema = z.object({
  title: z.string().optional(),
  site_id: z.string().min(1, "Le site est requis"),
  date: z.string().min(1, "La date est requise"),
  start_time: z.string().min(1, "L'heure de début est requise"),
  end_time: z.string().min(1, "L'heure de fin est requise"),
  max_employees: z.coerce.number().min(1, "Au moins 1 employé requis"),
  assigned_employees: z.array(z.string()).optional(),
})

type ShiftFormValues = z.infer<typeof shiftSchema>

interface ShiftDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialDate?: Date
  initialSiteId?: string
  shiftToEdit?: Shift | null
}

export function ShiftDialog({ open, onOpenChange, initialDate, initialSiteId, shiftToEdit }: ShiftDialogProps) {
  const { sites } = useSites()
  const { employees } = useEmployees()
  const { createShift, updateShift } = useShifts()
  const [error, setError] = useState<string | null>(null)
  const [openCombobox, setOpenCombobox] = useState(false)

  const form = useForm<ShiftFormValues>({
    resolver: zodResolver(shiftSchema) as any,
    defaultValues: {
      title: '',
      site_id: initialSiteId || '',
      date: initialDate ? initialDate.toISOString().split('T')[0] : '',
      start_time: '09:00',
      end_time: '17:00',
      max_employees: 1,
      assigned_employees: [],
    }
  })

  useEffect(() => {
    if (shiftToEdit) {
      form.reset({
        title: shiftToEdit.title || '',
        site_id: shiftToEdit.site_id || '',
        date: shiftToEdit.date,
        start_time: shiftToEdit.start_time.slice(0, 5),
        end_time: shiftToEdit.end_time.slice(0, 5),
        max_employees: shiftToEdit.max_employees,
        // @ts-ignore
        assigned_employees: shiftToEdit.shift_assignments?.map(a => a.employee?.id).filter(Boolean) || [],
      })
    } else {
      form.reset({
        title: '',
        site_id: initialSiteId || '',
        date: initialDate ? initialDate.toISOString().split('T')[0] : '',
        start_time: '09:00',
        end_time: '17:00',
        max_employees: 1,
        assigned_employees: [],
      })
    }
  }, [shiftToEdit, initialDate, initialSiteId, form])

  const onSubmit = async (data: ShiftFormValues) => {
    setError(null)
    try {
      let shiftId = shiftToEdit?.id

      // 1. Check conflicts
      const assignedEmployeeIds = data.assigned_employees || []
      
      if (assignedEmployeeIds.length > 0) {
        const conflicts = await checkConflict(
          assignedEmployeeIds,
          data.date,
          data.start_time,
          data.end_time,
          shiftId
        );

        if (conflicts.length > 0) {
          const confirm = window.confirm(
            `Conflits détectés :\n${conflicts.join('\n')}\n\nVoulez-vous quand même enregistrer ?`
          );
          if (!confirm) return;
        }
      }

      // 2. Create or Update Shift
      const shiftData = {
        title: data.title,
        site_id: data.site_id,
        date: data.date,
        start_time: data.start_time,
        end_time: data.end_time,
        max_employees: data.max_employees,
        // @ts-ignore
        required_skills: []
      }

      if (shiftToEdit) {
        await updateShift.mutateAsync({
          id: shiftToEdit.id,
          ...shiftData
        })
      } else {
        const newShift = await createShift.mutateAsync(shiftData)
        if (newShift) shiftId = newShift.id
      }

      // 3. Update Assignments
      if (shiftId && data.assigned_employees) {
        await assignEmployeesToShift(shiftId, data.assigned_employees)
      }

      onOpenChange(false)
    } catch (e) {
      console.error(e)
      setError("Une erreur est survenue lors de l'enregistrement.")
    }
  }

  const selectedSiteId = form.watch('site_id')
  const availableEmployees = employees?.filter(e => !selectedSiteId || e.site_id === selectedSiteId) || []
  const selectedEmployeeIds = form.watch('assigned_employees') || []

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{shiftToEdit ? 'Modifier le Shift' : 'Nouveau Shift'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit((data) => onSubmit(data))} className="space-y-4">
          {error && <div className="text-red-500 text-sm">{error}</div>}
          
          <div className="space-y-2">
            <Label htmlFor="title">Titre (Optionnel)</Label>
            <Input id="title" {...form.register('title')} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="site">Site</Label>
            <Select 
              onValueChange={(val: string) => form.setValue('site_id', val)} 
              defaultValue={form.getValues('site_id')}
              value={form.watch('site_id')}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un site" />
              </SelectTrigger>
              <SelectContent>
                {sites?.map(site => (
                  <SelectItem key={site.id} value={site.id}>{site.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.formState.errors.site_id && <span className="text-red-500 text-xs">{form.formState.errors.site_id.message}</span>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input type="date" id="date" {...form.register('date')} />
              {form.formState.errors.date && <span className="text-red-500 text-xs">{form.formState.errors.date.message}</span>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="max_employees">Besoin (Pers.)</Label>
              <Input type="number" id="max_employees" {...form.register('max_employees')} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start_time">Début</Label>
              <Input type="time" id="start_time" {...form.register('start_time')} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end_time">Fin</Label>
              <Input type="time" id="end_time" {...form.register('end_time')} />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Employés assignés</Label>
            <Popover open={openCombobox} onOpenChange={setOpenCombobox}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={openCombobox}
                  className="w-full justify-between h-auto min-h-[2.5rem]"
                >
                  {selectedEmployeeIds.length > 0
                    ? <div className="flex flex-wrap gap-1">
                        {selectedEmployeeIds.map(id => {
                          const emp = employees?.find(e => e.id === id)
                          return emp ? <Badge key={id} variant="secondary" className="mr-1">{emp.first_name} {emp.last_name}</Badge> : null
                        })}
                      </div>
                    : "Sélectionner des employés..."}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[400px] p-0">
                <Command>
                  <CommandInput placeholder="Rechercher un employé..." />
                  <CommandList>
                    <CommandEmpty>Aucun employé trouvé.</CommandEmpty>
                    <CommandGroup>
                      {availableEmployees.map((employee) => (
                        <CommandItem
                          key={employee.id}
                          value={`${employee.first_name} ${employee.last_name}`}
                          onSelect={() => {
                            const current = form.getValues('assigned_employees') || []
                            const isSelected = current.includes(employee.id)
                            if (isSelected) {
                              form.setValue('assigned_employees', current.filter(id => id !== employee.id))
                            } else {
                              form.setValue('assigned_employees', [...current, employee.id])
                            }
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              selectedEmployeeIds.includes(employee.id) ? "opacity-100" : "opacity-0"
                            )}
                          />
                          {employee.first_name} {employee.last_name}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          <DialogFooter>
            <Button type="submit">{shiftToEdit ? 'Mettre à jour' : 'Créer'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
