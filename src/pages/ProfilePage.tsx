import { useCallback, useEffect, useMemo, useState } from 'react'
import type { User } from '@supabase/supabase-js'
import { Badge, Button, Input } from '../components/ui'
import { updateProfile, type UserProfile } from '../lib/auth'
import { supabase } from '../lib/supabase'
import {
  attachTagToMetatag,
  attachTagToSource,
  createUserMetatag,
  createUserTag,
  deleteUserMetatag,
  deleteUserTag,
  detachTagFromMetatag,
  detachTagFromSource,
  listTagMetatagLinks,
  listTagSourceLinks,
  listUserMetatags,
  listUserTags,
  listVerifiedSources,
  type TagMetatagLink,
  type TagSourceLink,
  type UserMetatag,
  type UserTag,
  type VerifiedSource,
} from '../lib/taxonomy'
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
        <p className="text-sm text-primary" role="status" aria-live="polite">
          {message}
        </p>
      ) : null}
      {error ? (
        <p className="text-sm text-red-400" role="alert" aria-live="assertive">
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

function ProfileTaxonomyManager({ user }: { user: User }) {
  const [tagDraft, setTagDraft] = useState('')
  const [metatagDraft, setMetatagDraft] = useState('')
  const [tags, setTags] = useState<UserTag[]>([])
  const [metatags, setMetatags] = useState<UserMetatag[]>([])
  const [tagMetatagLinks, setTagMetatagLinks] = useState<TagMetatagLink[]>([])
  const [sources, setSources] = useState<VerifiedSource[]>([])
  const [tagSourceLinks, setTagSourceLinks] = useState<TagSourceLink[]>([])
  const [selectedTagId, setSelectedTagId] = useState('')
  const [selectedSourceId, setSelectedSourceId] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refreshTaxonomy = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [nextTags, nextMetatags, nextLinks, nextSources, nextSourceLinks] = await Promise.all([
        listUserTags(user.id),
        listUserMetatags(user.id),
        listTagMetatagLinks(user.id),
        listVerifiedSources(100),
        listTagSourceLinks(user.id),
      ])
      setTags(nextTags)
      setMetatags(nextMetatags)
      setTagMetatagLinks(nextLinks)
      setSources(nextSources)
      setTagSourceLinks(nextSourceLinks)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore caricamento preferenze.')
    } finally {
      setLoading(false)
    }
  }, [user.id])

  useEffect(() => {
    void refreshTaxonomy()
  }, [refreshTaxonomy])

  const effectiveSelectedTagId = tags.some((tag) => tag.id === selectedTagId)
    ? selectedTagId
    : (tags[0]?.id ?? '')
  const effectiveSelectedSourceId = sources.some((source) => source.id === selectedSourceId)
    ? selectedSourceId
    : (sources[0]?.id ?? '')

  const tagToMetatagSet = useMemo(() => {
    const lookup = new Set<string>()
    for (const link of tagMetatagLinks) {
      lookup.add(`${link.user_tag_id}:${link.user_metatag_id}`)
    }
    return lookup
  }, [tagMetatagLinks])

  return (
    <section className="space-y-4 rounded-lg border border-border bg-surface/40 p-4">
      <div>
        <h2 className="text-sm font-semibold text-foreground">Tag e metatag feed</h2>
        <p className="text-sm text-muted">
          Gestisci tassonomia personale e collegamenti con fonti RSS verificate.
        </p>
      </div>

      <div className="space-y-3">
        <h3 className="text-sm font-medium text-foreground">Tag</h3>
        <form
          className="flex max-w-md flex-col gap-2 sm:flex-row sm:items-end"
          onSubmit={(e) => {
            e.preventDefault()
            setError(null)
            void createUserTag(user.id, tagDraft)
              .then(() => {
                setTagDraft('')
                return refreshTaxonomy()
              })
              .catch((err) => {
                setError(err instanceof Error ? err.message : 'Errore creazione tag.')
              })
          }}
        >
          <div className="min-w-0 flex-1 space-y-2">
            <label htmlFor="profile-tag" className="text-sm text-muted">
              Aggiungi tag
            </label>
            <Input
              id="profile-tag"
              value={tagDraft}
              onChange={(e) => setTagDraft(e.target.value)}
              placeholder="es. tech, climate..."
            />
          </div>
          <Button type="submit" variant="secondary" size="sm">
            Aggiungi
          </Button>
        </form>
        {tags.length > 0 ? (
          <ul className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <li key={tag.id} className="inline-flex items-center gap-1">
                <Badge tone="accent">{tag.tag}</Badge>
                <button
                  type="button"
                  className="rounded-md px-1.5 text-sm text-muted hover:bg-surface-elevated hover:text-foreground"
                  onClick={() => {
                    setError(null)
                    void deleteUserTag(tag.id)
                      .then(() => refreshTaxonomy())
                      .catch((err) => {
                        setError(err instanceof Error ? err.message : 'Errore rimozione tag.')
                      })
                  }}
                  aria-label={`Rimuovi tag ${tag.tag}`}
                >
                  x
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-subtle">Nessun tag ancora.</p>
        )}
      </div>

      <div className="space-y-3">
        <h3 className="text-sm font-medium text-foreground">Metatag</h3>
        <form
          className="flex max-w-md flex-col gap-2 sm:flex-row sm:items-end"
          onSubmit={(e) => {
            e.preventDefault()
            setError(null)
            void createUserMetatag(user.id, metatagDraft)
              .then(() => {
                setMetatagDraft('')
                return refreshTaxonomy()
              })
              .catch((err) => {
                setError(err instanceof Error ? err.message : 'Errore creazione metatag.')
              })
          }}
        >
          <div className="min-w-0 flex-1 space-y-2">
            <label htmlFor="profile-metatag" className="text-sm text-muted">
              Aggiungi metatag
            </label>
            <Input
              id="profile-metatag"
              value={metatagDraft}
              onChange={(e) => setMetatagDraft(e.target.value)}
              placeholder="es. Macroeconomia"
            />
          </div>
          <Button type="submit" variant="secondary" size="sm">
            Aggiungi
          </Button>
        </form>
        <div className="space-y-2">
          {metatags.map((metatag) => (
            <div key={metatag.id} className="space-y-2 rounded-lg border border-border p-3">
              <div className="flex items-center justify-between gap-3">
                <Badge tone="default">{metatag.name}</Badge>
                <button
                  type="button"
                  className="rounded-md px-1.5 text-sm text-muted hover:bg-surface-elevated hover:text-foreground"
                  onClick={() => {
                    setError(null)
                    void deleteUserMetatag(metatag.id)
                      .then(() => refreshTaxonomy())
                      .catch((err) => {
                        setError(err instanceof Error ? err.message : 'Errore rimozione metatag.')
                      })
                  }}
                >
                  Rimuovi
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => {
                  const key = `${tag.id}:${metatag.id}`
                  const linked = tagToMetatagSet.has(key)
                  return (
                    <Button
                      key={key}
                      size="sm"
                      variant={linked ? 'primary' : 'secondary'}
                      onClick={() => {
                        setError(null)
                        const op = linked
                          ? detachTagFromMetatag(tag.id, metatag.id)
                          : attachTagToMetatag(tag.id, metatag.id)
                        void op
                          .then(() => refreshTaxonomy())
                          .catch((err) => {
                            setError(
                              err instanceof Error ? err.message : 'Errore update tag/metatag.',
                            )
                          })
                      }}
                    >
                      {tag.tag}
                    </Button>
                  )
                })}
              </div>
            </div>
          ))}
          {metatags.length === 0 ? <p className="text-sm text-subtle">Nessun metatag ancora.</p> : null}
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="text-sm font-medium text-foreground">Mapping tag -&gt; fonti RSS</h3>
        <p className="text-sm text-muted">
          Seleziona un tag e una fonte verificata per alimentare il feed tematico.
        </p>
        <div className="grid gap-2 sm:grid-cols-2">
          <label className="space-y-1 text-sm text-muted">
            Tag
            <select
              className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-foreground"
              value={effectiveSelectedTagId}
              onChange={(e) => setSelectedTagId(e.target.value)}
            >
              {tags.map((tag) => (
                <option key={tag.id} value={tag.id}>
                  {tag.tag}
                </option>
              ))}
            </select>
          </label>
          <label className="space-y-1 text-sm text-muted">
            Fonte verificata
            <select
              className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-foreground"
              value={effectiveSelectedSourceId}
              onChange={(e) => setSelectedSourceId(e.target.value)}
            >
              {sources.map((source) => (
                <option key={source.id} value={source.id}>
                  {source.name}
                </option>
              ))}
            </select>
          </label>
        </div>
        <Button
          size="sm"
          variant="secondary"
          disabled={!effectiveSelectedTagId || !effectiveSelectedSourceId}
          onClick={() => {
            setError(null)
            void attachTagToSource(effectiveSelectedTagId, effectiveSelectedSourceId)
              .then(() => refreshTaxonomy())
              .catch((err) => {
                setError(err instanceof Error ? err.message : 'Errore mapping tag/fonte.')
              })
          }}
        >
          Collega tag alla fonte
        </Button>
        <ul className="space-y-2">
          {tagSourceLinks.map((link) => {
            const tag = tags.find((item) => item.id === link.user_tag_id)
            const source = sources.find((item) => item.id === link.verified_source_id)
            if (!tag || !source) return null
            return (
              <li key={`${link.user_tag_id}:${link.verified_source_id}`} className="flex items-center gap-2">
                <Badge tone="accent">{tag.tag}</Badge>
                <span className="text-sm text-muted">-&gt; {source.name}</span>
                <button
                  type="button"
                  className="rounded-md px-1.5 text-sm text-muted hover:bg-surface-elevated hover:text-foreground"
                  onClick={() => {
                    setError(null)
                    void detachTagFromSource(link.user_tag_id, link.verified_source_id)
                      .then(() => refreshTaxonomy())
                      .catch((err) => {
                        setError(err instanceof Error ? err.message : 'Errore rimozione mapping.')
                      })
                  }}
                >
                  Rimuovi
                </button>
              </li>
            )
          })}
          {!loading && tagSourceLinks.length === 0 ? (
            <li className="text-sm text-subtle">Nessun collegamento tag/fonte ancora.</li>
          ) : null}
        </ul>
      </div>

      {error ? <p className="text-sm text-red-400">{error}</p> : null}
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
      <p className="text-muted">
        Identità, dati account e configurazione verticale del feed: tag, metatag e collegamenti
        con fonti verificate.
      </p>
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
      {user ? <ProfileTaxonomyManager user={user} /> : null}
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
