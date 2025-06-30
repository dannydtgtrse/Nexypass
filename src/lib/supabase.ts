import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://demo.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'demo-key'

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
})

// Database types
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          username: string
          email: string
          role: 'user' | 'admin'
          wallet_balance: number
          is_approved: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          username: string
          email: string
          role?: 'user' | 'admin'
          wallet_balance?: number
          is_approved?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          username?: string
          email?: string
          role?: 'user' | 'admin'
          wallet_balance?: number
          is_approved?: boolean
          updated_at?: string
        }
      }
      products: {
        Row: {
          id: string
          name: string
          price: number
          image_url: string
          category: string
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          price: number
          image_url: string
          category?: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          price?: number
          image_url?: string
          category?: string
          is_active?: boolean
          updated_at?: string
        }
      }
      stock_items: {
        Row: {
          id: string
          product_id: string
          credentials: string
          is_sold: boolean
          sold_to: string | null
          order_id: string | null
          sold_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          product_id: string
          credentials: string
          is_sold?: boolean
          sold_to?: string | null
          order_id?: string | null
          sold_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          product_id?: string
          credentials?: string
          is_sold?: boolean
          sold_to?: string | null
          order_id?: string | null
          sold_at?: string | null
        }
      }
      orders: {
        Row: {
          id: string
          code: string
          product_name: string
          price_at_purchase: number
          credentials_delivered: string
          purchase_url: string
          profile_info: string
          supplier: string
          customer_name: string
          customer_phone: string
          user_id: string
          product_id: string
          status: 'active' | 'expired'
          created_at: string
          expires_at: string
        }
        Insert: {
          id?: string
          code: string
          product_name: string
          price_at_purchase: number
          credentials_delivered: string
          purchase_url: string
          profile_info: string
          supplier: string
          customer_name: string
          customer_phone: string
          user_id: string
          product_id: string
          status?: 'active' | 'expired'
          created_at?: string
          expires_at: string
        }
        Update: {
          id?: string
          code?: string
          product_name?: string
          price_at_purchase?: number
          credentials_delivered?: string
          purchase_url?: string
          profile_info?: string
          supplier?: string
          customer_name?: string
          customer_phone?: string
          user_id?: string
          product_id?: string
          status?: 'active' | 'expired'
          expires_at?: string
        }
      }
      transactions: {
        Row: {
          id: string
          type: 'purchase' | 'balance_add' | 'system'
          amount: number
          description: string
          user_id: string
          product_id: string | null
          status: 'completed' | 'pending'
          created_at: string
        }
        Insert: {
          id?: string
          type: 'purchase' | 'balance_add' | 'system'
          amount: number
          description: string
          user_id: string
          product_id?: string | null
          status?: 'completed' | 'pending'
          created_at?: string
        }
        Update: {
          id?: string
          type?: 'purchase' | 'balance_add' | 'system'
          amount?: number
          description?: string
          user_id?: string
          product_id?: string | null
          status?: 'completed' | 'pending'
        }
      }
      recharge_requests: {
        Row: {
          id: string
          user_id: string
          amount: number
          method: string
          status: 'pending' | 'approved' | 'rejected'
          created_at: string
          processed_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          amount: number
          method: string
          status?: 'pending' | 'approved' | 'rejected'
          created_at?: string
          processed_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          amount?: number
          method?: string
          status?: 'pending' | 'approved' | 'rejected'
          processed_at?: string | null
        }
      }
    }
  }
}