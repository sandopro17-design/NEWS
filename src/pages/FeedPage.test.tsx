import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { FeedPost } from '../lib/social'
import type { ThematicFeedItem, UserTag } from '../lib/taxonomy'
import { FeedPage } from './FeedPage'

type GetPersonalFeedFn = (userId: string, page: number, pageSize: number) => Promise<FeedPost[]>
type ListUserTagsFn = (userId: string) => Promise<UserTag[]>
type GetUserRssFeedFn = (params?: { tag?: string; metatag?: string; limit?: number }) => Promise<
  ThematicFeedItem[]
>

const socialMocks = vi.hoisted(() => ({
  getFollowingIds: vi.fn(() => Promise.resolve([] as string[])),
  getSuggestedProfiles: vi.fn(async () => []),
  getPersonalFeed: vi.fn<GetPersonalFeedFn>(async () => []),
  followUser: vi.fn(),
  unfollowUser: vi.fn(),
  createProfilePost: vi.fn(),
}))

vi.mock('../lib/social', () => ({
  getFollowingIds: socialMocks.getFollowingIds,
  getSuggestedProfiles: socialMocks.getSuggestedProfiles,
  getPersonalFeed: socialMocks.getPersonalFeed,
  followUser: socialMocks.followUser,
  unfollowUser: socialMocks.unfollowUser,
  createProfilePost: socialMocks.createProfilePost,
}))

const taxonomyMocks = vi.hoisted(() => ({
  listUserTags: vi.fn<ListUserTagsFn>(async () => []),
  getUserRssFeed: vi.fn<GetUserRssFeedFn>(async () => []),
}))

vi.mock('../lib/taxonomy', () => ({
  listUserTags: taxonomyMocks.listUserTags,
  getUserRssFeed: taxonomyMocks.getUserRssFeed,
}))

const feedTestUser = vi.hoisted(() => ({
  id: 'u-feed',
  email: 'feed@example.com',
}))

vi.mock('../providers/useAuth', () => ({
  useAuth: () => ({ user: feedTestUser }),
}))

function renderFeed(initialPath = '/feed') {
  const router = createMemoryRouter([{ path: '/feed', element: <FeedPage /> }], {
    initialEntries: [initialPath],
  })
  return render(<RouterProvider router={router} />)
}

describe('FeedPage', () => {
  afterEach(() => {
    cleanup()
  })

  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
    socialMocks.getFollowingIds.mockResolvedValue([])
    socialMocks.getSuggestedProfiles.mockResolvedValue([])
    socialMocks.getPersonalFeed.mockResolvedValue([])
    taxonomyMocks.listUserTags.mockResolvedValue([])
    taxonomyMocks.getUserRssFeed.mockResolvedValue([])
  })

  it('mostra solo lo stream social quando il tab Social è attivo', async () => {
    renderFeed('/feed?tab=social')

    expect(await screen.findByRole('tab', { name: /^Social$/i })).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByRole('heading', { name: /Aggiornamenti/i })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: /Feed RSS verificato/i })).not.toBeInTheDocument()
  })

  it('mostra solo lo stream RSS quando il tab RSS verificato è attivo', async () => {
    renderFeed('/feed?tab=social')

    await screen.findByRole('tab', { name: /^Social$/i })

    fireEvent.click(screen.getByRole('tab', { name: /RSS verificato/i }))

    await waitFor(() => {
      expect(screen.getByRole('tab', { name: /RSS verificato/i })).toHaveAttribute('aria-selected', 'true')
    })

    expect(screen.getByRole('heading', { name: /Feed RSS verificato/i })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: /Aggiornamenti/i })).not.toBeInTheDocument()
  })

  it('rispetta tab=rss nell URL al primo render', async () => {
    renderFeed('/feed?tab=rss')

    await waitFor(() => {
      expect(screen.getByRole('tab', { name: /RSS verificato/i })).toHaveAttribute('aria-selected', 'true')
    })
    expect(screen.getByRole('heading', { name: /Feed RSS verificato/i })).toBeInTheDocument()
  })

  it('sul tab Social non chiama il fetch RSS (stream separati)', async () => {
    renderFeed('/feed?tab=social')

    await waitFor(() => {
      expect(socialMocks.getPersonalFeed).toHaveBeenCalled()
    })

    expect(taxonomyMocks.getUserRssFeed).not.toHaveBeenCalled()
  })

  it('paginazione social: Carica altri appende senza duplicare id', async () => {
    const mk = (id: string, body: string) => ({
      id,
      body,
      created_at: '2026-01-01T12:00:00Z',
      author_id: 'author-1',
      author: {
        id: 'author-1',
        display_name: 'Autore',
        headline: null,
        avatar_url: null,
      },
    })
    const page0 = Array.from({ length: 10 }, (_, i) => mk(`post-${i}`, `testo-${i}`))
    const page1 = [
      mk('post-10', 'testo-10'),
      mk('post-0', 'dup-bad'),
      mk('post-11', 'testo-11'),
    ]

    socialMocks.getPersonalFeed.mockImplementation((_uid, page: number) => {
      if (page === 0) return Promise.resolve(page0)
      if (page === 1) return Promise.resolve(page1)
      return Promise.resolve([])
    })

    renderFeed('/feed?tab=social')

    await screen.findByText('testo-0')

    fireEvent.click(screen.getByRole('button', { name: /Carica altri/i }))

    await waitFor(() => {
      expect(screen.getByText('testo-11')).toBeInTheDocument()
    })

    expect(screen.queryAllByText(/^testo-0$/)).toHaveLength(1)

    const calls = socialMocks.getPersonalFeed.mock.calls
    expect(calls.some((c) => c[1] === 0)).toBe(true)
    expect(calls.some((c) => c[1] === 1)).toBe(true)
  })

  it('disabilita Carica altri quando la prima pagina è corta (hasMore false)', async () => {
    socialMocks.getPersonalFeed.mockResolvedValue([
      {
        id: 'only',
        body: 'unico',
        created_at: '2026-01-01T12:00:00Z',
        author_id: 'author-1',
        author: {
          id: 'author-1',
          display_name: 'Autore',
          headline: null,
          avatar_url: null,
        },
      },
    ])

    renderFeed('/feed?tab=social')

    const loadMore = await screen.findByRole('button', { name: /Carica altri/i })
    await waitFor(() => {
      expect(loadMore).toBeDisabled()
    })
  })

  it('filtro tag RSS richiama getUserRssFeed con il tag selezionato e aggiorna la lista', async () => {
    taxonomyMocks.listUserTags.mockResolvedValue([
      { id: 't1', tag: 'tech' },
      { id: 't2', tag: 'news' },
    ])

    const itemAll = {
      feed_item_id: 'fi-all',
      title: 'Tutti gli articoli',
      link: 'https://ex.test/all',
      summary: null,
      published_at: null,
      source_id: 's1',
      source_name: 'Fonte',
      source_feed_url: 'https://ex.test/feed',
      tag_id: 't0',
      tag: 'misc',
      metatag_id: null,
      metatag_name: null,
    }
    const itemTech = {
      ...itemAll,
      feed_item_id: 'fi-tech',
      title: 'Solo tech',
      link: 'https://ex.test/tech',
      tag: 'tech',
      tag_id: 't1',
    }

    taxonomyMocks.getUserRssFeed.mockImplementation(({ tag } = {}) => {
      if (tag === 'tech') return Promise.resolve([itemTech])
      return Promise.resolve([itemAll])
    })

    renderFeed('/feed?tab=rss')

    expect(await screen.findByText('Tutti gli articoli')).toBeInTheDocument()

    const select = document.getElementById('thematic-tag-filter') as HTMLSelectElement
    fireEvent.change(select, { target: { value: 'tech' } })

    await waitFor(() => {
      expect(screen.getByText('Solo tech')).toBeInTheDocument()
    })
    expect(screen.queryByText('Tutti gli articoli')).not.toBeInTheDocument()

    const rssCalls = taxonomyMocks.getUserRssFeed.mock.calls
    expect(rssCalls.some((c) => c[0]?.tag === undefined || c[0]?.tag === '')).toBe(true)
    expect(rssCalls.some((c) => c[0]?.tag === 'tech')).toBe(true)
  })

  it('passando da RSS a Social e ritorno, il feed RSS si ricarica senza errori', async () => {
    taxonomyMocks.listUserTags.mockResolvedValue([{ id: 't1', tag: 'tech' }])
    taxonomyMocks.getUserRssFeed.mockResolvedValue([
      {
        feed_item_id: 'fi1',
        title: 'Articolo',
        link: 'https://ex.test/a',
        summary: null,
        published_at: null,
        source_id: 's1',
        source_name: 'Fonte',
        source_feed_url: 'https://ex.test/feed',
        tag_id: 't1',
        tag: 'tech',
        metatag_id: null,
        metatag_name: null,
      },
    ])

    renderFeed('/feed?tab=rss')

    await screen.findByText('Articolo')

    fireEvent.click(screen.getByRole('tab', { name: /^Social$/i }))
    await screen.findByRole('heading', { name: /Aggiornamenti/i })

    fireEvent.click(screen.getByRole('tab', { name: /RSS verificato/i }))

    await waitFor(() => {
      expect(screen.getByText('Articolo')).toBeInTheDocument()
    })
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })
})
