import { useState } from 'react'
import { Badge, Button, Input } from '../components/ui'
import { useAppStore, type ThemeMode } from '../store/useAppStore'

export function SettingsPage() {
  const theme = useAppStore((s) => s.theme)
  const setTheme = useAppStore((s) => s.setTheme)
  const userTags = useAppStore((s) => s.userTags)
  const addUserTag = useAppStore((s) => s.addUserTag)
  const removeUserTag = useAppStore((s) => s.removeUserTag)
  const [tagDraft, setTagDraft] = useState('')

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
          Aspetto, tag, metatag e preferenze (in evoluzione).
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

      <section className="space-y-3">
        <h2 className="text-sm font-medium text-foreground">Tag feed (locale)</h2>
        <p className="text-sm text-muted">
          Preferenze salvate in browser con Zustand <code>persist</code> (chiave{' '}
          <code className="text-foreground">trueflow-app</code>) — allineato a M0
          foundation.
        </p>
        <form
          className="flex max-w-md flex-col gap-2 sm:flex-row sm:items-end"
          onSubmit={(e) => {
            e.preventDefault()
            addUserTag(tagDraft)
            setTagDraft('')
          }}
        >
          <div className="min-w-0 flex-1 space-y-2">
            <label htmlFor="settings-tag" className="text-sm text-muted">
              Aggiungi tag
            </label>
            <Input
              id="settings-tag"
              value={tagDraft}
              onChange={(e) => setTagDraft(e.target.value)}
              placeholder="es. tech, climate…"
            />
          </div>
          <Button type="submit" variant="secondary" size="sm">
            Aggiungi
          </Button>
        </form>
        {userTags.length > 0 ? (
          <ul className="flex flex-wrap gap-2">
            {userTags.map((t) => (
              <li key={t} className="inline-flex items-center gap-1">
                <Badge tone="accent">{t}</Badge>
                <button
                  type="button"
                  className="rounded-md px-1.5 text-sm text-muted hover:bg-surface-elevated hover:text-foreground"
                  onClick={() => removeUserTag(t)}
                  aria-label={`Rimuovi tag ${t}`}
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-subtle">Nessun tag ancora.</p>
        )}
      </section>
    </div>
  )
}
