import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { AuthPage } from './AuthPage'

const authMocks = vi.hoisted(() => ({
  signInWithPassword: vi.fn(),
  signUp: vi.fn(),
}))

vi.mock('../lib/supabase', () => ({
  supabase: {
    auth: {
      signInWithPassword: authMocks.signInWithPassword,
      signUp: authMocks.signUp,
    },
  },
}))

const useAuthMocks = vi.hoisted(() => ({
  useAuth: vi.fn(),
}))

vi.mock('../providers/useAuth', () => ({
  useAuth: useAuthMocks.useAuth,
}))

function renderAuth() {
  const router = createMemoryRouter(
    [
      { path: '/auth', element: <AuthPage /> },
      { path: '/', element: <div data-testid="home-page">Home</div> },
    ],
    { initialEntries: ['/auth'] },
  )
  return render(<RouterProvider router={router} />)
}

describe('AuthPage', () => {
  afterEach(() => {
    cleanup()
  })

  beforeEach(() => {
    vi.clearAllMocks()
    useAuthMocks.useAuth.mockReturnValue({ user: null, loading: false })
  })

  it('Login valido: redirect verso feed', async () => {
    authMocks.signInWithPassword.mockResolvedValue({ data: {}, error: null })
    
    // Al primo render non siamo loggati
    const { unmount } = renderAuth()
    
    // Inseriamo dati e facciamo login
    fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'test@example.com' } })
    fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: 'password123' } })
    fireEvent.click(screen.getByRole('button', { name: 'Accedi' }))
    
    await waitFor(() => {
      expect(authMocks.signInWithPassword).toHaveBeenCalledWith({ email: 'test@example.com', password: 'password123' })
    })

    // Simuliamo che dopo il login il provider cambi stato
    useAuthMocks.useAuth.mockReturnValue({ user: { id: 'u1' }, loading: false })
    unmount()
    renderAuth()
    
    expect(await screen.findByTestId('home-page')).toBeInTheDocument()
  })

  it('Login invalido: messaggio errore visibile', async () => {
    authMocks.signInWithPassword.mockResolvedValue({ data: null, error: new Error('Credenziali non valide') })
    renderAuth()
    
    fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'test@example.com' } })
    fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: 'wrong' } })
    fireEvent.click(screen.getByRole('button', { name: 'Accedi' }))
    
    expect(await screen.findByRole('alert')).toHaveTextContent('Credenziali non valide')
  })

  it('Signup valido: submit invoca servizio auth senza errori', async () => {
    authMocks.signUp.mockResolvedValue({ data: {}, error: null })
    renderAuth()
    
    // Switch a modalità signup
    fireEvent.click(screen.getByRole('button', { name: /Non hai un account\? Registrati/i }))
    
    fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'new@example.com' } })
    fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: 'password123' } })
    fireEvent.change(screen.getByLabelText(/Nome visualizzato/i), { target: { value: 'Mario Rossi' } })
    fireEvent.click(screen.getByRole('button', { name: 'Registrati' }))
    
    await waitFor(() => {
      expect(authMocks.signUp).toHaveBeenCalledWith({
        email: 'new@example.com',
        password: 'password123',
        options: {
          data: { display_name: 'Mario Rossi' },
        },
      })
    })
    
    expect(await screen.findByRole('status')).toHaveTextContent(/Registrazione inviata/i)
  })
})
