# TrueFlow

**Repository:** [github.com/sandopro17-design/trueflow](https://github.com/sandopro17-design/trueflow)

Social network in cui le persone seguono persone (modello LinkedIn), con tag e metatag configurabili che alimentano feed RSS collegati a **fonti certificate e verificate**. Nessun algoritmo “potrebbe piacerti”: solo informazioni verticali scelte dall’utente.

## Stack tecnico

| Area        | Tecnologia                          |
|------------|--------------------------------------|
| Frontend   | React 18, Vite                       |
| Styling    | Tailwind CSS                         |
| Backend    | Supabase (Auth, Postgres, RLS)       |
| Hosting    | GitHub Pages                         |
| CI/CD      | GitHub Actions                       |

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

`https://<username>.github.io/trueflow/`

(configurazione `base` in Vite e workflow `deploy.yml` — subtask DevOps).

## Branch protection

Su `main` è richiesta **protezione con pull request** (nessun push diretto). Istruzioni operative: [docs/branch-protection.md](docs/branch-protection.md).

## Contribuire

Vedi [CONTRIBUTING.md](CONTRIBUTING.md).
