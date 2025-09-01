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
      polls: {
        Row: {
          id: string
          title: string
          description: string | null
          created_by: string
          created_at: string
          is_active: boolean
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          created_by: string
          created_at?: string
          is_active?: boolean
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          created_by?: string
          created_at?: string
          is_active?: boolean
        }
      }
      poll_options: {
        Row: {
          id: string
          poll_id: string
          text: string
          votes: number
        }
        Insert: {
          id?: string
          poll_id: string
          text: string
          votes?: number
        }
        Update: {
          id?: string
          poll_id?: string
          text?: string
          votes?: number
        }
      }
      votes: {
        Row: {
          id: string
          poll_id: string
          option_id: string
          user_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          poll_id: string
          option_id: string
          user_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          poll_id?: string
          option_id?: string
          user_id?: string | null
          created_at?: string
        }
      }
    }
  }
}