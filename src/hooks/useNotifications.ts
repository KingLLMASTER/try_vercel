import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/contexts/AuthContext'
import { Database } from '@/integrations/supabase/types'

type Notification = Database['public']['Tables']['notifications']['Row']

export function useNotifications() {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  const { data: notifications, isLoading } = useQuery({
    queryKey: ['notifications', user?.id],
    queryFn: async () => {
      if (!user) return []
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
      
      if (error) throw error
      return data as Notification[]
    },
    enabled: !!user
  })

  const markAsRead = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase
        .from('notifications') as any)
        .update({ read: true })
        .eq('id', id)
      
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
    },
  })

  const markAllAsRead = useMutation({
    mutationFn: async () => {
      if (!user) return
      const { error } = await (supabase
        .from('notifications') as any)
        .update({ read: true })
        .eq('user_id', user.id)
        .eq('read', false)
      
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
    },
  })

  return {
    notifications,
    isLoading,
    markAsRead,
    markAllAsRead,
    unreadCount: notifications?.filter(n => !n.read).length || 0
  }
}

export const sendNotification = async (
  userId: string,
  title: string,
  message: string,
  type: 'info' | 'success' | 'warning' | 'error' = 'info'
) => {
  const { error } = await (supabase
    .from('notifications') as any)
    .insert({
      user_id: userId,
      title,
      message,
      type
    })
  
  if (error) {
    console.error('Error sending notification:', error)
  }
}
