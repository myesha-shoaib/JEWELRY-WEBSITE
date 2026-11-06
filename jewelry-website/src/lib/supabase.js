import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim()
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim()

export const supabaseConfigError = supabaseUrl && !supabaseAnonKey
  ? 'VITE_SUPABASE_ANON_KEY is missing from .env.local.'
  : !supabaseUrl && supabaseAnonKey
    ? 'VITE_SUPABASE_URL is missing from .env.local.'
    : ''

export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null
