# Branch protection su `main`

Obiettivo: **richiedere pull request** e **vietare push diretti** su `main`, come da criteri epic parent (Paperclip `NEW-1`).

## Opzione A — Interfaccia GitHub

1. Repository → **Settings** → **Branches** → **Add branch protection rule**.
2. Branch name pattern: `main`.
3. Abilitare:
   - **Require a pull request before merging**
   - (Opzionale) **Require approvals**: almeno 1 review.
4. (Opzionale) **Do not allow bypassing the above settings** per amministratori.
5. Salvare la regola.

## Opzione B — GitHub CLI

Con privilegi di amministratore sul repository:

```bash
OWNER="sandopro17-design"
REPO="trueflow"

gh api -X PUT "repos/${OWNER}/${REPO}/branches/main/protection" \
  -H "Accept: application/vnd.github+json" \
  -f required_pull_request_reviews='{"required_approving_review_count":1,"dismiss_stale_reviews":false}' \
  -f enforce_admins=false \
  -f required_status_checks='null' \
  -f restrictions='null' \
  -F allow_force_pushes=false \
  -F allow_deletions=false
```

Se l’API risponde con errore (piano GitHub o permessi), usare l’opzione A.

## Verifica

Tentare un push diretto su `main` da una macchina di test: GitHub deve rifiutare o richiedere PR a seconda della configurazione scelta.
