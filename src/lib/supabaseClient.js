import { createClient } from '@supabase/supabase-js'

// Anon/browser client only. Never put the service role key in VITE_ vars or src/.
export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY,
)
