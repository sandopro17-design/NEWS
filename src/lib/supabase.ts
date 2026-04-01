import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (import.meta.env.DEV && (!url || !anonKey)) {
  console.warn(
    'TrueFlow: imposta VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY (vedi .env.example)',
  )
}

export const supabase = createClient(url ?? '', anonKey ?? '', {
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
