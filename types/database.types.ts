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
      squares: {
        Row: {
          id: string
          x: number
          y: number
          user_name: string | null
          user_email: string | null
          created_at: string
          paid: boolean | null
        }
        Insert: {
          id?: string
          x: number
          y: number
          user_name?: string | null
          user_email?: string | null
          created_at?: string
          paid?: boolean | null
        }
        Update: {
          id?: string
          x?: number
          y?: number
          user_name?: string | null
          user_email?: string | null
          created_at?: string
          paid?: boolean | null
        }
        Relationships: []
      }
      game_state: {
        Row: {
          id: string
          row_numbers: number[] | null
          col_numbers: number[] | null
          is_locked: boolean
          created_at: string
          q1_home: number | null
          q1_away: number | null
          q2_home: number | null
          q2_away: number | null
          q3_home: number | null
          q3_away: number | null
          final_home: number | null
          final_away: number | null
        }
        Insert: {
          id?: string
          row_numbers?: number[] | null
          col_numbers?: number[] | null
          is_locked?: boolean
          created_at?: string
          q1_home?: number | null
          q1_away?: number | null
          q2_home?: number | null
          q2_away?: number | null
          q3_home?: number | null
          q3_away?: number | null
          final_home?: number | null
          final_away?: number | null
        }
        Update: {
          id?: string
          row_numbers?: number[] | null
          col_numbers?: number[] | null
          is_locked?: boolean
          created_at?: string
          q1_home?: number | null
          q1_away?: number | null
          q2_home?: number | null
          q2_away?: number | null
          q3_home?: number | null
          q3_away?: number | null
          final_home?: number | null
          final_away?: number | null
        }
        Relationships: []
      }
    }
  }
}
