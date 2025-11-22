-- Add manager_id column to employees table for organizational hierarchy
alter table public.employees add column if not exists manager_id uuid references public.employees(id);

-- Add index for better query performance
create index if not exists idx_employees_manager_id on public.employees(manager_id);

-- Optional: Add a comment to document the column
comment on column public.employees.manager_id is 'References the employee who is the direct manager (N+1) of this employee';
