export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          first_name: string | null
          last_name: string | null
          email: string | null
          role: 'ADMIN' | 'SUPER_MANAGER' | 'MANAGER' | 'EMPLOYEE'
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          first_name?: string | null
          last_name?: string | null
          email?: string | null
          role?: 'ADMIN' | 'SUPER_MANAGER' | 'MANAGER' | 'EMPLOYEE'
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          first_name?: string | null
          last_name?: string | null
          email?: string | null
          role?: 'ADMIN' | 'SUPER_MANAGER' | 'MANAGER' | 'EMPLOYEE'
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      sites: {
        Row: {
          id: string
          name: string
          code: string
          address: string | null
          capacity: number
          opening_hours: Json | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          code: string
          address?: string | null
          capacity?: number
          opening_hours?: Json | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          code?: string
          address?: string | null
          capacity?: number
          opening_hours?: Json | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      employees: {
        Row: {
          id: string
          profile_id: string | null
          first_name: string
          last_name: string
          email: string | null
          phone: string | null
          employee_number: string | null
          contract_type: 'CDI' | 'CDD' | 'INTERIM' | 'STAGE' | 'APPRENTISSAGE' | 'STUDENT'
          experience_level: 'NOUVEAU' | 'VETERANT'
          hire_date: string | null
          weekly_hours: number
          hourly_rate: number | null
          color: string | null
          is_student: boolean
          is_archived: boolean
          site_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          profile_id?: string | null
          first_name: string
          last_name: string
          email?: string | null
          phone?: string | null
          employee_number?: string | null
          contract_type?: 'CDI' | 'CDD' | 'INTERIM' | 'STAGE' | 'APPRENTISSAGE' | 'STUDENT'
          experience_level?: 'NOUVEAU' | 'VETERANT'
          hire_date?: string | null
          weekly_hours?: number
          hourly_rate?: number | null
          color?: string | null
          is_student?: boolean
          is_archived?: boolean
          site_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          profile_id?: string | null
          first_name?: string
          last_name?: string
          email?: string | null
          phone?: string | null
          employee_number?: string | null
          contract_type?: 'CDI' | 'CDD' | 'INTERIM' | 'STAGE' | 'APPRENTISSAGE' | 'STUDENT'
          experience_level?: 'NOUVEAU' | 'VETERANT'
          hire_date?: string | null
          weekly_hours?: number
          hourly_rate?: number | null
          color?: string | null
          is_student?: boolean
          is_archived?: boolean
          site_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      shifts: {
        Row: {
          id: string
          site_id: string
          date: string
          start_time: string
          end_time: string
          title: string | null
          color: string | null
          required_skills: Json | null
          max_employees: number
          status: 'DRAFT' | 'PUBLISHED' | 'LOCKED' | 'CLOSED'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          site_id: string
          date: string
          start_time: string
          end_time: string
          title?: string | null
          color?: string | null
          required_skills?: Json | null
          max_employees?: number
          status?: 'DRAFT' | 'PUBLISHED' | 'LOCKED' | 'CLOSED'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          site_id?: string
          date?: string
          start_time?: string
          end_time?: string
          title?: string | null
          color?: string | null
          required_skills?: Json | null
          max_employees?: number
          status?: 'DRAFT' | 'PUBLISHED' | 'LOCKED' | 'CLOSED'
          created_at?: string
          updated_at?: string
        }
      }
      shift_assignments: {
        Row: {
          id: string
          shift_id: string
          employee_id: string
          status: 'PROPOSED' | 'CONFIRMED' | 'CANCELLED'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          shift_id: string
          employee_id: string
          status?: 'PROPOSED' | 'CONFIRMED' | 'CANCELLED'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          shift_id?: string
          employee_id?: string
          status?: 'PROPOSED' | 'CONFIRMED' | 'CANCELLED'
          created_at?: string
          updated_at?: string
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string | null
          title: string
          message: string
          type: 'info' | 'success' | 'warning' | 'error'
          read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          title: string
          message: string
          type?: 'info' | 'success' | 'warning' | 'error'
          read?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          title?: string
          message?: string
          type?: 'info' | 'success' | 'warning' | 'error'
          read?: boolean
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      assignment_status: 'PROPOSED' | 'CONFIRMED' | 'CANCELLED'
      shift_status: 'DRAFT' | 'PUBLISHED' | 'LOCKED' | 'CLOSED'
      notification_type: 'info' | 'success' | 'warning' | 'error'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
