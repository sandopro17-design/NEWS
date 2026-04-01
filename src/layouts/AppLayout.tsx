import { NavLink, Outlet } from 'react-router-dom'
import { useAppStore } from '../store/useAppStore'

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  [
    'rounded-md px-3 py-2 text-sm font-medium transition-colors',
    isActive
      ? 'bg-surface-elevated text-foreground'
      : 'text-muted hover:bg-surface-elevated/80 hover:text-foreground',
  ].join(' ')

export function AppLayout() {
  const sidebarOpen = useAppStore((s) => s.sidebarOpen)
  const setSidebarOpen = useAppStore((s) => s.setSidebarOpen)

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <header className="border-b border-border bg-surface/80 px-4 py-3 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
          <span className="font-display text-lg font-semibold tracking-tight text-primary">
            TrueFlow
          </span>
          <button
            type="button"
            className="rounded-md border border-border px-2 py-1 text-xs text-muted hover:bg-surface-elevated md:hidden"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-expanded={sidebarOpen}
          >
            Menu
          </button>
          <nav
            className="flex flex-wrap items-center gap-1"
            aria-label="Principale"
          >
            <NavLink to="/" end className={navLinkClass}>
              Home
            </NavLink>
            <NavLink to="/feed" className={navLinkClass}>
              Feed
            </NavLink>
            <NavLink to="/profile" className={navLinkClass}>
              Profilo
            </NavLink>
            <NavLink to="/explore" className={navLinkClass}>
              Esplora
            </NavLink>
            <NavLink to="/settings" className={navLinkClass}>
              Impostazioni
            </NavLink>
          </nav>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-6xl flex-1 gap-6 px-4 py-6">
        <aside
          className={`w-52 shrink-0 rounded-lg border border-dashed border-border bg-surface/40 p-4 text-sm text-subtle ${sidebarOpen ? 'block' : 'hidden'} md:block`}
          aria-label="Sidebar placeholder"
        >
          <p className="font-medium text-muted">Sidebar</p>
          <p className="mt-2">Placeholder — navigazione secondaria / widget.</p>
        </aside>

        <main className="min-w-0 flex-1 rounded-lg border border-border bg-surface/30 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
