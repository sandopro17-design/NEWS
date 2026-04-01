import { useState } from 'react'
import type { User } from '@supabase/supabase-js'
import { Button } from '../components/ui'
import { updateProfile, type UserProfile } from '../lib/auth'
import { supabase } from '../lib/supabase'
import { useAuth } from '../providers/useAuth'

type ProfileEditorProps = {
  user: User
  profile: UserProfile
  refreshProfile: () => Promise<void>
}

function ProfileEditor({ user, profile, refreshProfile }: ProfileEditorProps) {
  const [displayName, setDisplayName] = useState(profile.display_name ?? '')
  const [headline, setHeadline] = useState(profile.headline ?? '')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  return (
    <section className="space-y-3 rounded-lg border border-border bg-surface/40 p-4">
      <h2 className="text-sm font-semibold text-foreground">Modifica profilo</h2>
      <div className="space-y-2">
        <label className="text-sm text-muted" htmlFor="profile-display-name">
          Display name
        </label>
        <input
          id="profile-display-name"
          className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-foreground"
          value={displayName}
          onChange={(event) => setDisplayName(event.target.value)}
          placeholder="Nome visualizzato"
        />
      </div>
      <div className="space-y-2">
        <label className="text-sm text-muted" htmlFor="profile-headline">
          Headline
        </label>
        <input
          id="profile-headline"
          className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-foreground"
          value={headline}
          onChange={(event) => setHeadline(event.target.value)}
          placeholder="Ruolo o descrizione breve"
        />
      </div>
      {message ? (
        <p className="text-sm text-primary" role="status">
          {message}
        </p>
      ) : null}
      {error ? (
        <p className="text-sm text-red-400" role="alert">
          {error}
        </p>
      ) : null}
      <Button
        onClick={() => {
          const cleanName = displayName.trim()
          if (!cleanName) {
            setError('Il display name e obbligatorio.')
            return
          }
          setSaving(true)
          setMessage(null)
          setError(null)
          void updateProfile(user.id, {
            display_name: cleanName,
            headline: headline.trim() || null,
          })
            .then(async () => {
              await refreshProfile()
              setMessage('Profilo aggiornato con successo.')
            })
            .catch((err) => {
              setError(err instanceof Error ? err.message : 'Errore aggiornamento profilo.')
            })
            .finally(() => {
              setSaving(false)
            })
        }}
        disabled={saving}
      >
        {saving ? 'Salvataggio...' : 'Salva profilo'}
      </Button>
    </section>
  )
}

export function ProfilePage() {
  const { user, profile, refreshProfile } = useAuth()

  return (
    <div className="space-y-4">
      <h1 className="font-display text-2xl font-semibold text-foreground">
        Profilo
      </h1>
      <p className="text-muted">Gestione profilo base con dati Supabase.</p>
      <dl className="space-y-2 text-sm">
        <div>
          <dt className="text-subtle">User ID</dt>
          <dd className="text-foreground">{user?.id ?? '-'}</dd>
        </div>
        <div>
          <dt className="text-subtle">Email</dt>
          <dd className="text-foreground">{user?.email ?? '-'}</dd>
        </div>
        <div>
          <dt className="text-subtle">Display name</dt>
          <dd className="text-foreground">{profile?.display_name ?? '-'}</dd>
        </div>
        <div>
          <dt className="text-subtle">Headline</dt>
          <dd className="text-foreground">{profile?.headline ?? '-'}</dd>
        </div>
      </dl>
      {user && profile ? (
        <ProfileEditor
          key={profile.id}
          user={user}
          profile={profile}
          refreshProfile={refreshProfile}
        />
      ) : null}
      <Button
        variant="secondary"
        onClick={async () => {
          await supabase.auth.signOut()
        }}
      >
        Logout
      </Button>
    </div>
  )
}
