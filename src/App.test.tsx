import { render, screen, waitFor, within } from '@testing-library/react'
import { Suspense } from 'react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { App } from './App'
import { AppLayout } from './layouts/AppLayout'
import type { AuthContextValue } from './providers/AuthContext'

const authState: AuthContextValue = {
  session: null,
  user: null,
  profile: null,
  loading: false,
  refreshProfile: async () => {},
}

vi.mock('./lib/supabase', async () => {
  const actual = await vi.importActual<typeof import('./lib/supabase')>('./lib/supabase')
  return {
    ...actual,
    isSupabaseConfigured: true,
  }
})

vi.mock('./providers/useAuth', () => ({
  useAuth: () => authState,
}))

describe('App', () => {
  beforeEach(() => {
    authState.session = null
    authState.user = null
    authState.profile = null
    authState.loading = false
  })

  it('renders the home page', async () => {
    authState.user = { id: 'u1', email: 'demo@example.com' } as AuthContextValue['user']
    authState.profile = {
      id: 'u1',
      display_name: 'Demo User',
      headline: null,
      avatar_url: null,
    }

    render(
      <MemoryRouter initialEntries={['/']}>
        <Suspense fallback={null}>
          <App />
        </Suspense>
      </MemoryRouter>
    )
    expect(
      await screen.findByRole('heading', { name: /home/i })
    ).toBeInTheDocument()
  })

  it('renders feed page for authenticated profiles', async () => {
    authState.user = { id: 'u3', email: 'feed@example.com' } as AuthContextValue['user']
    authState.profile = {
      id: 'u3',
      display_name: 'Feed User',
      headline: null,
      avatar_url: null,
    }

    render(
      <MemoryRouter initialEntries={['/feed']}>
        <Suspense fallback={null}>
          <App />
        </Suspense>
      </MemoryRouter>
    )

    expect(
      await screen.findByRole('heading', { name: /feed personale/i })
    ).toBeInTheDocument()
  })

  it('redirects anonymous users to auth', async () => {
    render(
      <MemoryRouter initialEntries={['/feed']}>
        <Suspense fallback={null}>
          <App />
        </Suspense>
      </MemoryRouter>
    )

    const authHeadings = await screen.findAllByRole('heading', { name: /^Accedi$/i })
    expect(authHeadings.length).toBeGreaterThan(0)
  })

  it('redirects anonymous users from profile to auth', async () => {
    render(
      <MemoryRouter initialEntries={['/profile']}>
        <Suspense fallback={null}>
          <App />
        </Suspense>
      </MemoryRouter>,
    )
    const authHeadings = await screen.findAllByRole('heading', { name: /^Accedi$/i })
    expect(authHeadings.length).toBeGreaterThan(0)
  })

  it('redirects anonymous users from settings to auth', async () => {
    render(
      <MemoryRouter initialEntries={['/settings']}>
        <Suspense fallback={null}>
          <App />
        </Suspense>
      </MemoryRouter>,
    )
    const authHeadings = await screen.findAllByRole('heading', { name: /^Accedi$/i })
    expect(authHeadings.length).toBeGreaterThan(0)
  })

  it('redirects users without display name to onboarding', async () => {
    authState.user = { id: 'u2', email: 'new@example.com' } as AuthContextValue['user']
    authState.profile = {
      id: 'u2',
      display_name: '',
      headline: null,
      avatar_url: null,
    }

    render(
      <MemoryRouter initialEntries={['/']}>
        <Suspense fallback={null}>
          <App />
        </Suspense>
      </MemoryRouter>
    )

    expect(
      await screen.findByRole('heading', { name: /completa il tuo profilo/i })
    ).toBeInTheDocument()
  })

  it('redirects authenticated users from auth to onboarding when profile is incomplete', async () => {
    authState.user = { id: 'u4', email: 'pending@example.com' } as AuthContextValue['user']
    authState.profile = {
      id: 'u4',
      display_name: ' ',
      headline: null,
      avatar_url: null,
    }

    render(
      <MemoryRouter initialEntries={['/auth']}>
        <Suspense fallback={null}>
          <App />
        </Suspense>
      </MemoryRouter>
    )

    const onboardingHeadings = await screen.findAllByRole('heading', {
      name: /completa il tuo profilo/i,
    })
    expect(onboardingHeadings.length).toBeGreaterThan(0)
  })

  it('allows authenticated complete profiles on profile route', async () => {
    authState.user = { id: 'u5', email: 'ready@example.com' } as AuthContextValue['user']
    authState.profile = {
      id: 'u5',
      display_name: 'Ready User',
      headline: 'Engineer',
      avatar_url: null,
    }

    render(
      <MemoryRouter initialEntries={['/profile']}>
        <Suspense fallback={null}>
          <App />
        </Suspense>
      </MemoryRouter>,
    )
    expect(await screen.findByRole('heading', { name: /^profilo$/i })).toBeInTheDocument()
  })

  it('allows authenticated complete profiles on settings route', async () => {
    authState.user = { id: 'u6', email: 'settings@example.com' } as AuthContextValue['user']
    authState.profile = {
      id: 'u6',
      display_name: 'Settings User',
      headline: 'Designer',
      avatar_url: null,
    }

    render(
      <MemoryRouter initialEntries={['/settings']}>
        <Suspense fallback={null}>
          <App />
        </Suspense>
      </MemoryRouter>,
    )
    expect(await screen.findByRole('heading', { name: /impostazioni/i })).toBeInTheDocument()
  })

  it('routes tag and feed taxonomy shortcuts from sidebar to profile', async () => {
    authState.user = { id: 'u7', email: 'nav@example.com' } as AuthContextValue['user']
    authState.profile = {
      id: 'u7',
      display_name: 'Nav User',
      headline: null,
      avatar_url: null,
    }

    const { container } = render(
      <MemoryRouter initialEntries={['/']}>
        <Suspense fallback={null}>
          <App />
        </Suspense>
      </MemoryRouter>,
    )

    await waitFor(() => {
      expect(container.querySelector('aside[aria-label="Colonna sinistra"]')).toBeTruthy()
    })
    const sidebar = container.querySelector('aside[aria-label="Colonna sinistra"]')
    expect(sidebar).toBeInstanceOf(HTMLElement)
    const taxonomyLink = within(sidebar as HTMLElement).getByRole('link', {
      name: /tag, metatag e fonti/i,
    })
    expect(taxonomyLink).toHaveAttribute('href', '/profile')
    const accountSettingsLink = within(sidebar as HTMLElement).getByRole('link', {
      name: /impostazioni account/i,
    })
    expect(accountSettingsLink).toHaveAttribute('href', '/settings')
  })

  it('header search field is named via label id association in the DOM', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route element={<AppLayout />}>
            <Route index element={<div />} />
          </Route>
        </Routes>
      </MemoryRouter>,
    )

    const input = document.getElementById('global-search') as HTMLInputElement
    expect(input).toBeTruthy()
    expect(input).toHaveAttribute('type', 'search')
    expect(input.getAttribute('aria-labelledby')).toBe('global-search-label')
    const label = document.getElementById('global-search-label')
    expect(label?.tagName.toLowerCase()).toBe('label')
    expect(label?.getAttribute('for')).toBe('global-search')
    expect(label?.textContent).toMatch(/cerca persone, tag e fonti nel network trueflow/i)

    const header = document.querySelector('header')
    expect(header).toBeInstanceOf(HTMLElement)
    const inHeader = within(header as HTMLElement).getAllByRole('searchbox', {
      name: /cerca persone, tag e fonti nel network trueflow/i,
      hidden: true,
    })
    expect(inHeader).toHaveLength(1)
    expect(inHeader[0]).toBe(input)
  })
})
