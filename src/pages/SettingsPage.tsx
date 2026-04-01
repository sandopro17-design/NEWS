import { Link } from 'react-router-dom'
import { Button } from '../components/ui'
import { useAuth } from '../providers/useAuth'
import { useAppStore, type ThemeMode } from '../store/useAppStore'

export function SettingsPage() {
  const { user } = useAuth()
  const theme = useAppStore((s) => s.theme)
  const setTheme = useAppStore((s) => s.setTheme)

  const options: { mode: ThemeMode; label: string }[] = [
    { mode: 'dark', label: 'Scuro' },
    { mode: 'light', label: 'Chiaro' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-foreground">
          Impostazioni
        </h1>
        <p className="mt-2 text-muted">
          Aspetto dell&apos;app e preferenze base dell&apos;account. La configurazione del feed (tag,
          metatag, fonti) vive nel{' '}
          <Link
            to="/profile"
            className="font-medium text-primary underline-offset-2 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 rounded-sm"
          >
            Profilo
          </Link>
          .
        </p>
      </div>

      <section className="space-y-3">
        <h2 className="text-sm font-medium text-foreground">Tema</h2>
        <p className="text-sm text-muted">
          La palette usa variabili CSS su <code className="text-foreground">html</code>{' '}
          (classe <code className="text-foreground">dark</code> per la variante scura).
        </p>
        <div className="flex flex-wrap gap-2">
          {options.map(({ mode, label }) => (
            <Button
              key={mode}
              variant={theme === mode ? 'primary' : 'secondary'}
              size="sm"
              type="button"
              onClick={() => setTheme(mode)}
            >
              {label}
            </Button>
          ))}
        </div>
      </section>
      <section className="space-y-2 rounded-lg border border-border bg-surface/40 p-4">
        <h2 className="text-sm font-medium text-foreground">Account</h2>
        <p className="text-sm text-muted">
          Identità e campi del profilo pubblico si modificano da{' '}
          <Link
            to="/profile"
            className="font-medium text-primary underline-offset-2 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 rounded-sm"
          >
            Profilo
          </Link>
          ; qui restano solo tema e riepilogo accesso.
        </p>
        <p className="text-sm text-subtle">Utente attivo: {user?.email ?? 'non disponibile'}</p>
      </section>
    </div>
  )
}
