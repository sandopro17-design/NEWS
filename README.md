# TrueFlow

**Repository canonico:** [github.com/sandopro17-design/NEWS](https://github.com/sandopro17-design/NEWS) — _legacy mirror:_ [trueflow](https://github.com/sandopro17-design/trueflow)

Social network in cui le persone seguono persone (modello LinkedIn), con tag e metatag configurabili che alimentano feed RSS collegati a **fonti certificate e verificate**. Nessun algoritmo “potrebbe piacerti”: solo informazioni verticali scelte dall’utente.

## Stack tecnico

| Area     | Tecnologia                     |
| -------- | ------------------------------ |
| Frontend | React 18, Vite                 |
| Styling  | Tailwind CSS                   |
| Backend  | Supabase (Auth, Postgres, RLS) |
| Hosting  | GitHub Pages                   |
| CI/CD    | GitHub Actions                 |

## Struttura repository

```
src/           # Applicazione React (scaffold Vite — vedi subtask frontend)
workers/       # Edge/worker e job (futuro)
supabase/      # Migrazioni SQL, config CLI Supabase
docs/          # Architettura, fonti verificate, guide operative
```

## Sviluppo locale

Dopo lo scaffold Vite (subtask dedicato):

```bash
npm install
cp .env.example .env.local   # valorizzare VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY
npm run dev
```

## Variabili ambiente

Definire in `.env.local` (non committato):

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

## Deploy

L’app sarà pubblicata su GitHub Pages all’URL:

`https://<username>.github.io/NEWS/`

Il segmento path coincide con il **nome del repository** su GitHub Pages (progetto `NEWS`). Il mirror [`trueflow`](https://github.com/sandopro17-design/trueflow) andrebbe allineato su `base: '/trueflow/'` solo se il deploy Pages usa quel repo.

### Deep-link SPA (GitHub Pages)

Per supportare refresh/apertura diretta delle route client-side (`/NEWS/feed`, `/NEWS/profile`, `/NEWS/settings`), la build copia automaticamente `dist/index.html` in `dist/404.html` (`scripts/copy-spa-404.mjs`).

Comportamento atteso in produzione:

- deep-link su route protette con utente non autenticato -> redirect a `/NEWS/auth`
- utente autenticato ma senza `display_name` -> redirect a `/NEWS/onboarding`
- utente autenticato con profilo completo -> accesso alla route richiesta (`feed`, `profile`, `settings`)

### Smoke post-deploy (hosted)

Eseguire **sempre dalla root del repository** (la cartella che contiene `package.json`, es. `~/Gianni/projects/news`), non da una directory padre generica:

```bash
cd /percorso/al/clone/NEWS
HOSTED_PAGES_URL="https://sandopro17-design.github.io/NEWS" \
SUPABASE_URL="https://<ref>.supabase.co" \
SUPABASE_ANON_KEY="<anon-jwt>" \
npm run smoke:hosted
```

Se npm segnala `ENOENT` su `package.json`, il `cd` non è sulla root del progetto.

## Branch protection

Su `main` è richiesta **protezione con pull request** (nessun push diretto). Istruzioni operative: [docs/branch-protection.md](docs/branch-protection.md).

## Contribuire

Vedi [CONTRIBUTING.md](CONTRIBUTING.md).
