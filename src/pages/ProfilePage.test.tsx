import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { ProfilePage } from './ProfilePage'

const authMocks = vi.hoisted(() => ({
  updateProfile: vi.fn(),
  signOut: vi.fn(),
}))

vi.mock('../lib/auth', () => ({
  updateProfile: authMocks.updateProfile,
}))

vi.mock('../lib/supabase', () => ({
  supabase: {
    auth: {
      signOut: authMocks.signOut,
    },
  },
}))

const useAuthMocks = vi.hoisted(() => ({
  useAuth: vi.fn(),
  refreshProfile: vi.fn(),
}))

vi.mock('../providers/useAuth', () => ({
  useAuth: useAuthMocks.useAuth,
}))

const taxonomyMocks = vi.hoisted(() => ({
  listUserTags: vi.fn(),
  listUserMetatags: vi.fn(),
  listTagMetatagLinks: vi.fn(),
  listVerifiedSources: vi.fn(),
  listTagSourceLinks: vi.fn(),
}))

vi.mock('../lib/taxonomy', () => ({
  listUserTags: taxonomyMocks.listUserTags,
  listUserMetatags: taxonomyMocks.listUserMetatags,
  listTagMetatagLinks: taxonomyMocks.listTagMetatagLinks,
  listVerifiedSources: taxonomyMocks.listVerifiedSources,
  listTagSourceLinks: taxonomyMocks.listTagSourceLinks,
}))

function renderProfile() {
  const router = createMemoryRouter(
    [
      { path: '/profile', element: <ProfilePage /> },
    ],
    { initialEntries: ['/profile'] },
  )
  return render(<RouterProvider router={router} />)
}

describe('ProfilePage', () => {
  afterEach(() => {
    cleanup()
  })

  beforeEach(() => {
    vi.clearAllMocks()
    useAuthMocks.refreshProfile.mockResolvedValue(undefined)
    useAuthMocks.useAuth.mockReturnValue({
      user: { id: 'u1', email: 'test@example.com' },
      profile: { id: 'p1', display_name: 'Mario', headline: 'Dev' },
      refreshProfile: useAuthMocks.refreshProfile,
    })
    
    // Default taxonomy mocks per ProfileTaxonomyManager
    taxonomyMocks.listUserTags.mockResolvedValue([])
    taxonomyMocks.listUserMetatags.mockResolvedValue([])
    taxonomyMocks.listTagMetatagLinks.mockResolvedValue([])
    taxonomyMocks.listVerifiedSources.mockResolvedValue([])
    taxonomyMocks.listTagSourceLinks.mockResolvedValue([])
  })

  it('Profile submit valido: update profilo chiamato con payload corretto', async () => {
    authMocks.updateProfile.mockResolvedValue(undefined)
    renderProfile()
    
    // Modifica campi
    const nameInput = screen.getByLabelText(/Display name/i)
    fireEvent.change(nameInput, { target: { value: 'Luigi' } })
    
    const headlineInput = screen.getByLabelText(/Headline/i)
    fireEvent.change(headlineInput, { target: { value: 'CTO' } })
    
    fireEvent.click(screen.getByRole('button', { name: 'Salva profilo' }))
    
    await waitFor(() => {
      expect(authMocks.updateProfile).toHaveBeenCalledWith('u1', {
        display_name: 'Luigi',
        headline: 'CTO',
      })
    })
    
    expect(useAuthMocks.refreshProfile).toHaveBeenCalled()
    expect(await screen.findByRole('status')).toHaveTextContent(/Profilo aggiornato/i)
  })

  it('Profile submit fallito: errore gestito e UI non bloccata', async () => {
    authMocks.updateProfile.mockRejectedValue(new Error('Errore server'))
    renderProfile()
    
    // Provo a salvare
    fireEvent.click(screen.getByRole('button', { name: 'Salva profilo' }))
    
    await waitFor(() => {
      expect(authMocks.updateProfile).toHaveBeenCalled()
    })
    
    expect(await screen.findByRole('alert')).toHaveTextContent('Errore server')
    
    // UI non deve essere bloccata
    const saveButton = screen.getByRole('button', { name: 'Salva profilo' })
    expect(saveButton).not.toBeDisabled()
  })
})
