# Contribuire a TrueFlow

## Flusso Git

1. **Non eseguire push diretti su `main`** — la branch è protetta; usare pull request.
2. Creare un branch da `main`: `feat/…`, `fix/…`, `chore/…`.
3. Aprire una PR verso `main` e attendere review (se richiesta dalle regole del repo).

## Convenzioni

- Allineamento allo stack definito in [README.md](README.md) (React, Vite, Tailwind, Supabase, GitHub Pages).
- Seguire ESLint/Prettier quando presenti nel progetto (subtask frontend).

## Setup ambiente

Dopo il merge dello scaffold applicativo: `npm install`, copiare `.env.example` in `.env.local` e compilare le chiavi Supabase.
