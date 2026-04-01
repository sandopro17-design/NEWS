import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { Button, Card, CardDescription, CardHeader, CardTitle, Input } from '../components/ui'
import { supabase } from '../lib/supabase'
import { useAuth } from '../providers/useAuth'

type Mode = 'signin' | 'signup'

export function AuthPage() {
  const { user, loading } = useAuth()
  const [mode, setMode] = useState<Mode>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  if (!loading && user) return <Navigate to="/" replace />

  return (
    <div className="mx-auto flex min-h-screen max-w-md items-center px-4 py-10">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>{mode === 'signin' ? 'Accedi' : 'Crea account'}</CardTitle>
          <CardDescription>
            Accesso TrueFlow via Supabase Auth (email/password).
          </CardDescription>
        </CardHeader>
        <form
          className="space-y-3"
          aria-busy={busy}
          onSubmit={async (e) => {
            e.preventDefault()
            setBusy(true)
            setError(null)
            setMessage(null)
            try {
              if (mode === 'signin') {
                const { error: signInError } =
                  await supabase.auth.signInWithPassword({
                    email,
                    password,
                  })
                if (signInError) throw signInError
              } else {
                const { error: signUpError } = await supabase.auth.signUp({
                  email,
                  password,
                  options: {
                    data: { display_name: displayName.trim() || null },
                  },
                })
                if (signUpError) throw signUpError
                setMessage(
                  'Registrazione inviata. Se la conferma email è attiva, verifica la casella di posta.',
                )
              }
            } catch (err) {
              const text =
                err instanceof Error ? err.message : 'Errore di autenticazione.'
              setError(text)
            } finally {
              setBusy(false)
            }
          }}
        >
          <div className="space-y-2">
            <label className="text-sm text-muted" htmlFor="auth-email">
              Email
            </label>
            <Input
              id="auth-email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              autoComplete="email"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm text-muted" htmlFor="auth-password">
              Password
            </label>
            <Input
              id="auth-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              autoComplete={
                mode === 'signin' ? 'current-password' : 'new-password'
              }
              minLength={8}
              required
            />
          </div>
          {mode === 'signup' ? (
            <div className="space-y-2">
              <label className="text-sm text-muted" htmlFor="auth-display-name">
                Nome visualizzato
              </label>
              <Input
                id="auth-display-name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="es. Mario Rossi"
                required
              />
            </div>
          ) : null}
          {message ? (
            <p className="text-sm text-primary" role="status" aria-live="polite">
              {message}
            </p>
          ) : null}
          {error ? (
            <p className="text-sm text-red-400" role="alert" aria-live="assertive">
              {error}
            </p>
          ) : null}
          <Button type="submit" disabled={busy} className="w-full">
            {busy
              ? 'Attendere...'
              : mode === 'signin'
                ? 'Accedi'
                : 'Registrati'}
          </Button>
          <button
            type="button"
            className="w-full text-sm text-muted underline-offset-2 hover:text-foreground hover:underline"
            onClick={() => {
              setMode((m) => (m === 'signin' ? 'signup' : 'signin'))
              setError(null)
              setMessage(null)
            }}
          >
            {mode === 'signin'
              ? 'Non hai un account? Registrati'
              : 'Hai già un account? Accedi'}
          </button>
        </form>
      </Card>
    </div>
  )
}
