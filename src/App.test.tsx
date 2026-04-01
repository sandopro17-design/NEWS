import { render, screen } from '@testing-library/react'
import { Suspense } from 'react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { App } from './App'

describe('App', () => {
  it('renders the home page', async () => {
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
})
