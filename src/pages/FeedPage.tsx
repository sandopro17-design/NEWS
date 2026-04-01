import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Button, Card, CardDescription, CardHeader, CardTitle } from '../components/ui'
import {
  createProfilePost,
  followUser,
  getFollowingIds,
  getPersonalFeed,
  getSuggestedProfiles,
  type FeedPost,
  type SocialProfile,
  unfollowUser,
} from '../lib/social'
import { getUserRssFeed, listUserTags, type ThematicFeedItem, type UserTag } from '../lib/taxonomy'
import { useAuth } from '../providers/useAuth'

const PAGE_SIZE = 10
const TAB_STORAGE_KEY = 'news.feed.tab'

type FeedTab = 'social' | 'rss'

function readTabFromStorage(): FeedTab | null {
  try {
    const raw = localStorage.getItem(TAB_STORAGE_KEY)
    if (raw === 'rss' || raw === 'social') return raw
  } catch {
    /* ignore */
  }
  return null
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat('it-IT', { dateStyle: 'medium', timeStyle: 'short' }).format(
    new Date(value),
  )
}

export function FeedPage() {
  const { user } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()
  const lastRssFetchKey = useRef<string | null>(null)

  const activeTab: FeedTab = useMemo(() => {
    const q = searchParams.get('tab')
    if (q === 'rss') return 'rss'
    if (q === 'social') return 'social'
    return readTabFromStorage() ?? 'social'
  }, [searchParams])

  const [socialLoading, setSocialLoading] = useState(false)
  const [rssLoading, setRssLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [followingIds, setFollowingIds] = useState<string[]>([])
  const [suggestedProfiles, setSuggestedProfiles] = useState<SocialProfile[]>([])
  const [posts, setPosts] = useState<FeedPost[]>([])
  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  const [thematicItems, setThematicItems] = useState<ThematicFeedItem[]>([])
  const [userTags, setUserTags] = useState<UserTag[]>([])
  const [selectedTag, setSelectedTag] = useState<string>('')
  const [draftPost, setDraftPost] = useState('')
  const [publishing, setPublishing] = useState(false)
  const [thematicLoading, setThematicLoading] = useState(false)
  const [thematicStatus, setThematicStatus] = useState<string | null>(null)

  const refreshSocialGraph = useCallback(async () => {
    if (!user) return
    const [followed, suggested] = await Promise.all([
      getFollowingIds(user.id),
      getSuggestedProfiles(user.id, 6),
    ])
    setFollowingIds(followed)
    setSuggestedProfiles(suggested)
  }, [user])

  const loadPosts = useCallback(
    async (nextPage: number) => {
      if (!user) return
      const nextChunk = await getPersonalFeed(user.id, nextPage, PAGE_SIZE)
      setPosts((prev) => {
        if (nextPage === 0) return nextChunk
        const seen = new Set(prev.map((p) => p.id))
        const appended = nextChunk.filter((p) => !seen.has(p.id))
        return [...prev, ...appended]
      })
      setHasMore(nextChunk.length === PAGE_SIZE)
      setPage(nextPage)
    },
    [user],
  )

  const setActiveTab = useCallback(
    (next: FeedTab) => {
      try {
        localStorage.setItem(TAB_STORAGE_KEY, next)
      } catch {
        /* ignore */
      }
      setSearchParams({ tab: next }, { replace: true })
      setError(null)
    },
    [setSearchParams],
  )

  useEffect(() => {
    if (!user) return
    const q = searchParams.get('tab')
    if (q === 'rss' || q === 'social') return
    const stored = readTabFromStorage()
    if (stored) {
      setSearchParams({ tab: stored }, { replace: true })
    }
  }, [user, searchParams, setSearchParams])

  useEffect(() => {
    if (!user) return
    if (activeTab !== 'social') return
    let cancelled = false
    ;(async () => {
      setSocialLoading(true)
      setError(null)
      try {
        await refreshSocialGraph()
        await loadPosts(0)
      } catch (err) {
        if (!cancelled) {
          const message = err instanceof Error ? err.message : 'Errore inatteso'
          setError(message)
        }
      } finally {
        if (!cancelled) setSocialLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [user, activeTab, loadPosts, refreshSocialGraph])

  useEffect(() => {
    if (!user) return
    if (activeTab !== 'rss') {
      lastRssFetchKey.current = null
      return
    }
    let cancelled = false
    const key = `${user.id}:${selectedTag}`
    if (lastRssFetchKey.current === key) {
      return
    }
    ;(async () => {
      setRssLoading(true)
      setError(null)
      try {
        const needFull = lastRssFetchKey.current === null
        if (needFull) {
          const [tags, items] = await Promise.all([
            listUserTags(user.id),
            getUserRssFeed({ tag: selectedTag || undefined, limit: 20 }),
          ])
          if (!cancelled) {
            setUserTags(tags)
            setThematicItems(items)
          }
        } else {
          const items = await getUserRssFeed({ tag: selectedTag || undefined, limit: 20 })
          if (!cancelled) setThematicItems(items)
        }
        if (!cancelled) lastRssFetchKey.current = key
      } catch (err) {
        if (!cancelled) {
          const message = err instanceof Error ? err.message : 'Errore inatteso'
          setError(message)
        }
      } finally {
        if (!cancelled) setRssLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [user, activeTab, selectedTag])

  const followingSet = useMemo(() => new Set(followingIds), [followingIds])

  const toggleFollow = useCallback(
    async (targetId: string) => {
      if (!user) return
      setError(null)
      try {
        if (followingSet.has(targetId)) {
          await unfollowUser(user.id, targetId)
        } else {
          await followUser(user.id, targetId)
        }
        await Promise.all([refreshSocialGraph(), loadPosts(0)])
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Errore inatteso'
        setError(message)
      }
    },
    [followingSet, loadPosts, refreshSocialGraph, user],
  )

  const reloadThematicFeed = useCallback(async () => {
    if (!user) return
    setThematicLoading(true)
    setThematicStatus('Aggiornamento feed RSS in corso...')
    setError(null)
    try {
      const items = await getUserRssFeed({ tag: selectedTag || undefined, limit: 20 })
      setThematicItems(items)
      lastRssFetchKey.current = `${user.id}:${selectedTag}`
      setThematicStatus('Feed RSS aggiornato.')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Errore aggiornamento feed RSS.'
      setError(message)
      setThematicStatus('Aggiornamento feed RSS non riuscito.')
    } finally {
      setThematicLoading(false)
    }
  }, [selectedTag, user])

  const refreshSocialTab = useCallback(async () => {
    if (!user) return
    setSocialLoading(true)
    setError(null)
    try {
      await refreshSocialGraph()
      await loadPosts(0)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Errore inatteso'
      setError(message)
    } finally {
      setSocialLoading(false)
    }
  }, [loadPosts, refreshSocialGraph, user])

  const tabBusy = activeTab === 'social' ? socialLoading : rssLoading

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-foreground">Feed personale</h1>
        <p className="mt-2 text-muted">
          {activeTab === 'social'
            ? 'Aggiornamenti dalle persone che segui e i tuoi post.'
            : 'Articoli da fonti RSS verificate collegate ai tuoi tag.'}
        </p>
      </div>

      <div
        role="tablist"
        aria-label="Tipo di stream"
        className="flex gap-1 rounded-lg border border-border bg-surface-elevated/40 p-1"
      >
        <button
          type="button"
          role="tab"
          id="feed-tab-social"
          aria-selected={activeTab === 'social'}
          aria-controls="feed-panel-social"
          className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
            activeTab === 'social'
              ? 'bg-surface text-foreground shadow-sm'
              : 'text-muted hover:text-foreground'
          }`}
          onClick={() => {
            setActiveTab('social')
          }}
        >
          Social
        </button>
        <button
          type="button"
          role="tab"
          id="feed-tab-rss"
          aria-selected={activeTab === 'rss'}
          aria-controls="feed-panel-rss"
          className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
            activeTab === 'rss'
              ? 'bg-surface text-foreground shadow-sm'
              : 'text-muted hover:text-foreground'
          }`}
          onClick={() => {
            setActiveTab('rss')
          }}
        >
          RSS verificato
        </button>
      </div>

      {error ? (
        <Card className="border-danger/40" role="alert" aria-live="assertive">
          <CardHeader>
            <CardTitle className="text-base">Errore caricamento feed</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
        </Card>
      ) : null}

      <div
        role="tabpanel"
        id="feed-panel-social"
        aria-labelledby="feed-tab-social"
        hidden={activeTab !== 'social'}
        className="space-y-6"
      >
        {socialLoading && posts.length === 0 && !suggestedProfiles.length ? (
          <Card>
            <CardDescription role="status" aria-live="polite">
              Caricamento feed social…
            </CardDescription>
          </Card>
        ) : null}

        <section className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-subtle">Scrivi un aggiornamento</h2>
          <Card>
            <label htmlFor="feed-post-body" className="sr-only">
              Testo aggiornamento profilo
            </label>
            <textarea
              id="feed-post-body"
              className="min-h-28 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-foreground placeholder:text-subtle focus:outline-none focus:ring-2 focus:ring-primary/40"
              placeholder="Condividi un aggiornamento con il tuo network..."
              value={draftPost}
              onChange={(event) => setDraftPost(event.target.value)}
              maxLength={500}
            />
            <div className="mt-3 flex items-center justify-between gap-2">
              <span className="text-xs text-subtle">{draftPost.length}/500</span>
              <Button
                size="sm"
                disabled={publishing || draftPost.trim().length === 0 || socialLoading}
                onClick={() => {
                  if (!user) return
                  setError(null)
                  setPublishing(true)
                  void createProfilePost(user.id, draftPost)
                    .then(() => {
                      setDraftPost('')
                      return loadPosts(0)
                    })
                    .catch((err) => {
                      setError(err instanceof Error ? err.message : 'Errore pubblicazione post.')
                    })
                    .finally(() => {
                      setPublishing(false)
                    })
                }}
              >
                {publishing ? 'Pubblicazione...' : 'Pubblica'}
              </Button>
            </div>
          </Card>
        </section>

        <section className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-subtle">Persone da seguire</h2>
          <div className="grid gap-3 md:grid-cols-2">
            {suggestedProfiles.map((profile) => {
              const isFollowing = followingSet.has(profile.id)
              return (
                <Card key={profile.id}>
                  <CardHeader>
                    <CardTitle className="text-base">
                      {profile.display_name?.trim() || 'Utente senza nome'}
                    </CardTitle>
                    <CardDescription>{profile.headline || 'Nessuna headline disponibile'}</CardDescription>
                  </CardHeader>
                  <Button
                    variant={isFollowing ? 'secondary' : 'primary'}
                    size="sm"
                    disabled={socialLoading}
                    onClick={() => {
                      void toggleFollow(profile.id)
                    }}
                  >
                    {isFollowing ? 'Non seguire' : 'Segui'}
                  </Button>
                </Card>
              )
            })}
            {!socialLoading && suggestedProfiles.length === 0 ? (
              <Card>
                <CardDescription>Nessun suggerimento disponibile al momento.</CardDescription>
              </Card>
            ) : null}
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-subtle">Aggiornamenti</h2>
          <div className="space-y-3">
            {posts.map((post) => (
              <Card key={post.id}>
                <CardHeader>
                  <CardTitle className="text-base">
                    {post.author?.display_name?.trim() || 'Utente senza nome'}
                  </CardTitle>
                  <CardDescription>
                    {post.author?.headline || 'Nessuna headline'} · {formatDate(post.created_at)}
                  </CardDescription>
                </CardHeader>
                <p className="text-sm text-foreground">{post.body}</p>
              </Card>
            ))}
            {!socialLoading && posts.length === 0 ? (
              <Card>
                <CardDescription>
                  Nessun contenuto nel feed social. Segui qualcuno o pubblica un aggiornamento per iniziare.
                </CardDescription>
              </Card>
            ) : null}
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="secondary"
              onClick={() => {
                void refreshSocialTab()
              }}
              disabled={socialLoading}
            >
              Aggiorna
            </Button>
            <Button
              onClick={() => {
                void loadPosts(page + 1)
              }}
              disabled={socialLoading || !hasMore}
            >
              Carica altri
            </Button>
          </div>
        </section>
      </div>

      <div
        role="tabpanel"
        id="feed-panel-rss"
        aria-labelledby="feed-tab-rss"
        hidden={activeTab !== 'rss'}
        className="space-y-6"
      >
        {rssLoading && thematicItems.length === 0 ? (
          <Card>
            <CardDescription role="status" aria-live="polite">
              Caricamento articoli RSS verificati…
            </CardDescription>
          </Card>
        ) : null}

        <section className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-subtle">Feed RSS verificato</h2>
            <label htmlFor="thematic-tag-filter" className="flex items-center gap-2 text-sm text-muted">
              Tag
              <select
                id="thematic-tag-filter"
                className="rounded-md border border-border bg-surface px-2 py-1 text-sm text-foreground"
                value={selectedTag}
                disabled={rssLoading && userTags.length === 0}
                onChange={(e) => setSelectedTag(e.target.value)}
              >
                <option value="">Tutti</option>
                {userTags.map((tag) => (
                  <option key={tag.id} value={tag.tag}>
                    {tag.tag}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <p className="sr-only" role="status" aria-live="polite">
            {thematicStatus ?? ''}
          </p>
          <div className="space-y-3">
            {thematicItems.map((item) => (
              <Card key={`${item.feed_item_id}:${item.tag_id}`}>
                <CardHeader>
                  <CardTitle className="text-base">{item.title}</CardTitle>
                  <CardDescription>
                    {item.source_name} · tag: {item.tag}
                    {item.metatag_name ? ` · metatag: ${item.metatag_name}` : ''}
                  </CardDescription>
                </CardHeader>
                {item.summary ? <p className="text-sm text-muted">{item.summary}</p> : null}
                <a className="text-sm text-primary hover:underline" href={item.link} target="_blank" rel="noreferrer">
                  Apri articolo
                </a>
              </Card>
            ))}
            {!rssLoading && thematicItems.length === 0 ? (
              <Card>
                <CardDescription>
                  Nessun articolo RSS al momento: collega un tag a una fonte verificata dal profilo oppure prova un altro
                  filtro tag.
                </CardDescription>
              </Card>
            ) : null}
          </div>
          <Button
            variant="secondary"
            onClick={() => {
              void reloadThematicFeed()
            }}
            disabled={tabBusy || thematicLoading}
          >
            {thematicLoading ? 'Aggiornamento...' : 'Aggiorna feed RSS'}
          </Button>
        </section>
      </div>
    </div>
  )
}
