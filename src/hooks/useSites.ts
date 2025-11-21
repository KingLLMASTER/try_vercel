import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { Database } from '@/integrations/supabase/types'

type Site = Database['public']['Tables']['sites']['Row']
type SiteInsert = Database['public']['Tables']['sites']['Insert']
type SiteUpdate = Database['public']['Tables']['sites']['Update']

export function useSites() {
  const queryClient = useQueryClient()

  const { data: sites, isLoading, error } = useQuery({
    queryKey: ['sites'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sites')
        .select('*')
        .order('name')
      
      if (error) throw error
      return data as Site[]
    },
  })

  const createSite = useMutation({
    mutationFn: async (newSite: SiteInsert) => {
      const { data, error } = await (supabase
        .from('sites') as any)
        .insert(newSite)
        .select()
        .single()
      
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sites'] })
    },
  })

  const updateSite = useMutation({
    mutationFn: async ({ id, ...updates }: SiteUpdate & { id: string }) => {
      const { data, error } = await (supabase
        .from('sites') as any)
        .update(updates)
        .eq('id', id)
        .select()
        .single()
      
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sites'] })
    },
  })

  const deleteSite = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('sites')
        .delete()
        .eq('id', id)
      
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sites'] })
    },
  })

  return {
    sites,
    isLoading,
    error,
    createSite,
    updateSite,
    deleteSite,
  }
}
