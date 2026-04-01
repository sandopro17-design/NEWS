import {
  Avatar,
  Badge,
  Button,
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
} from '../components/ui'

export function HomePage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-semibold text-foreground">
          Home
        </h1>
        <p className="mt-2 text-muted">
          TrueFlow — design system base (palette, font, componenti UI).
        </p>
      </div>

      <section className="space-y-4">
        <h2 className="font-display text-lg font-semibold text-foreground">
          Componenti
        </h2>
        <div className="flex flex-wrap gap-2">
          <Button variant="primary" size="sm">
            Primary
          </Button>
          <Button variant="secondary" size="md">
            Secondary
          </Button>
          <Button variant="ghost" size="lg">
            Ghost
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge>metatag</Badge>
          <Badge tone="accent">#azione</Badge>
          <Badge tone="verified">Verificato</Badge>
          <Badge tone="warning">Attenzione</Badge>
          <Badge tone="error">Errore</Badge>
        </div>
        <div className="flex max-w-md flex-col gap-3 sm:flex-row sm:items-end">
          <div className="min-w-0 flex-1 space-y-2">
            <label htmlFor="demo-input" className="text-sm text-muted">
              Input testo
            </label>
            <Input id="demo-input" placeholder="Scrivi qualcosa…" />
          </div>
          <div className="min-w-0 flex-1 space-y-2">
            <label htmlFor="demo-search" className="text-sm text-muted">
              Ricerca
            </label>
            <Input
              id="demo-search"
              variant="search"
              placeholder="Cerca fonti, tag…"
              aria-label="Ricerca"
            />
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <Avatar label="Mario Rossi" size="sm" />
          <Avatar label="Giulia Bianchi" size="md" />
          <Avatar label="True Flow" size="lg" />
        </div>
      </section>

      <Card className="max-w-lg">
        <CardHeader>
          <CardTitle>Card</CardTitle>
          <CardDescription>
            Container con bordo e superficie dal tema CSS (light/dark da
            Impostazioni).
          </CardDescription>
        </CardHeader>
        <Button variant="primary" className="mt-2">
          Azione
        </Button>
      </Card>
    </div>
  )
}
