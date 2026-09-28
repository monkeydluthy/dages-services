import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Session-aware client for admin. Never put the service role key in VITE_ vars or src/.
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Public funnel inserts must stay anon. The session-aware client would send Joe's
// admin JWT, and authenticated has no INSERT policy on leads.
export const publicSupabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
  },
})
