import { useEffect, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { Button, Card, CardDescription, CardHeader, CardTitle, Input } from '../components/ui'
import { supabase } from '../lib/supabase'
import { useAuth } from '../providers/useAuth'

export function OnboardingPage() {
  const { user, profile, loading, refreshProfile } = useAuth()
  const navigate = useNavigate()
  const [displayName, setDisplayName] = useState('')
  const [headline, setHeadline] = useState('')
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setDisplayName(profile?.display_name ?? '')
    setHeadline(profile?.headline ?? '')
  }, [profile?.display_name, profile?.headline])

  if (!loading && !user) return <Navigate to="/auth" replace />
  if (!loading && profile?.display_name?.trim()) return <Navigate to="/" replace />

  return (
    <div className="mx-auto flex min-h-screen max-w-lg items-center px-4 py-10">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Completa il tuo profilo</CardTitle>
          <CardDescription>
            Primo step onboarding: nome pubblico e headline professionale.
          </CardDescription>
        </CardHeader>
        <form
          className="space-y-3"
          aria-busy={busy}
          onSubmit={async (e) => {
            e.preventDefault()
            if (!user) return
            setBusy(true)
            setMessage('Salvataggio profilo in corso...')
            setError(null)
            try {
              const cleanName = displayName.trim()
              if (!cleanName) {
                throw new Error('Il nome visualizzato e obbligatorio.')
              }
              const { error: upsertError } = await supabase.from('profiles').upsert(
                {
                  id: user.id,
                  display_name: cleanName,
                  headline: headline.trim() || null,
                },
                { onConflict: 'id' },
              )
              if (upsertError) throw upsertError
              await refreshProfile()
              setMessage('Profilo salvato con successo. Reindirizzamento in corso...')
              navigate('/', { replace: true })
            } catch (err) {
              setMessage(null)
              setError(
                err instanceof Error
                  ? err.message
                  : 'Errore durante il salvataggio del profilo.',
              )
            } finally {
              setBusy(false)
            }
          }}
        >
          <div className="space-y-2">
            <label className="text-sm text-muted" htmlFor="onboarding-name">
              Nome visualizzato
            </label>
            <Input
              id="onboarding-name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="es. Mario Rossi"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm text-muted" htmlFor="onboarding-headline">
              Headline
            </label>
            <Input
              id="onboarding-headline"
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
              placeholder="es. Product Engineer @ TrueFlow"
            />
          </div>
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
          <Button type="submit" disabled={busy}>
            {busy ? 'Salvataggio...' : 'Continua'}
          </Button>
        </form>
      </Card>
    </div>
  )
}
