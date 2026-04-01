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
      <header className="border-b border-border bg-surface/90 px-4 py-3 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center gap-4">
          <span className="font-display shrink-0 text-lg font-semibold tracking-tight text-primary">
            TrueFlow
          </span>
          <form className="hidden flex-1 md:block" role="search" aria-label="Ricerca globale TrueFlow">
            <label id="global-search-label" htmlFor="global-search" className="sr-only">
              Cerca persone, tag e fonti nel network TrueFlow
            </label>
            <input
              id="global-search"
              type="search"
              name="global-search"
              placeholder="Cerca persone, tag, fonti"
              aria-labelledby="global-search-label"
              autoComplete="off"
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-subtle focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </form>
          <button
            type="button"
            className="rounded-md border border-border px-2 py-1 text-xs text-muted hover:bg-surface-elevated md:hidden"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-expanded={sidebarOpen}
            aria-controls="mobile-primary-nav"
            aria-label={sidebarOpen ? 'Chiudi menu principale' : 'Apri menu principale'}
          >
            Menu
          </button>
          <nav className="ml-auto hidden items-center gap-1 lg:flex" aria-label="Principale">
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
        <nav
          id="mobile-primary-nav"
          className={`mx-auto mt-3 max-w-6xl flex-wrap items-center gap-1 lg:hidden ${sidebarOpen ? 'flex' : 'hidden'}`}
          aria-label="Principale mobile"
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
      </header>

      <div className="mx-auto flex w-full max-w-6xl flex-1 gap-6 px-4 py-6">
        <aside
          className={`w-60 shrink-0 space-y-4 rounded-lg border border-border bg-surface/50 p-4 text-sm ${sidebarOpen ? 'block' : 'hidden'} md:block`}
          aria-label="Colonna sinistra"
        >
          <section className="rounded-md border border-border bg-surface-elevated/50 p-3">
            <p className="text-xs uppercase tracking-wide text-subtle">Profilo rapido</p>
            <p className="mt-2 font-medium text-foreground">Benvenuto in TrueFlow</p>
            <p className="mt-1 text-xs text-muted">
              Tag, metatag e fonti RSS si configurano dal Profilo; qui trovi account e aspetto.
            </p>
          </section>
          <section className="rounded-md border border-border bg-surface-elevated/50 p-3">
            <p className="text-xs uppercase tracking-wide text-subtle">Navigazione</p>
            <div className="mt-2 flex flex-col gap-1">
              <NavLink to="/feed" className={navLinkClass}>
                Feed personale
              </NavLink>
              <NavLink to="/explore" className={navLinkClass}>
                Scopri fonti
              </NavLink>
              <NavLink to="/profile" className={navLinkClass}>
                Tag, metatag e fonti
              </NavLink>
              <NavLink to="/settings" className={navLinkClass}>
                Impostazioni account
              </NavLink>
            </div>
          </section>
        </aside>

        <main className="min-w-0 flex-1 rounded-lg border border-border bg-surface/30 p-6">
          <Outlet />
        </main>

        <aside className="hidden w-64 shrink-0 space-y-4 rounded-lg border border-border bg-surface/40 p-4 text-sm xl:block">
          <section>
            <p className="text-xs uppercase tracking-wide text-subtle">Insight</p>
            <ul className="mt-2 space-y-2 text-muted">
              <li>Fonti verificate attive: 24</li>
              <li>Tag personali collegati: 6</li>
              <li>Aggiornamenti nelle ultime 24h: 39</li>
            </ul>
          </section>
          <section className="rounded-md border border-border bg-surface-elevated/50 p-3">
            <p className="text-xs uppercase tracking-wide text-subtle">Qualita feed</p>
            <p className="mt-2 text-muted">
              Ranking basato su trusted sources, deduplica e pertinenza tag/metatag.
            </p>
          </section>
        </aside>
      </div>
    </div>
  )
}
