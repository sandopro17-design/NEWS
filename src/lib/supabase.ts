import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
export const isSupabaseConfigured = Boolean(url && anonKey)
const fallbackUrl = 'http://127.0.0.1:54321'
const fallbackAnonKey = 'public-anon-key'

if (import.meta.env.DEV && (!url || !anonKey)) {
  console.warn(
    'TrueFlow: imposta VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY (vedi .env.example)',
  )
}

export const supabase = createClient(url ?? fallbackUrl, anonKey ?? fallbackAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
})

if (import.meta.env.DEV && url && anonKey) {
  // Conferma lato console per Definition of Done (connessione client configurata)
  console.info('TrueFlow: client Supabase inizializzato', { url })
}
