# RSS Pipeline

Questo documento descrive il perimetro operativo della pipeline RSS per il feed utente e i controlli minimi di affidabilita.

## Flusso dati

- Le fonti partono da `verified_sources` con gate su `is_active` e `trust_score`.
- Gli item vengono ingestiti tramite la funzione `public.ingest_verified_feed_item`.
- La deduplica usa `ingest_hash` e viene rinforzata da indice univoco su `(verified_source_id, ingest_hash)`.
- Il mapping finale alimenta `feed_items` consumabile dal feed applicativo.

## Safety e quality gates

- **Trust gate:** scarta ingestion quando `trust_score < p_min_trust_score`.
- **Source gate:** scarta ingestion su fonte inattiva (`is_active = false`).
- **Deduplica:** upsert concorrente-safe con `on conflict (verified_source_id, ingest_hash)`.
- **Tracciabilita:** aggiornamento `verified_sources.last_checked_at` ad ogni ingest valida.

## Launch readiness

Prerequisiti minimi prima del rilascio:

- Secret GitHub Actions presenti: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`.
- Workflow `rss-poller.yml` attivo con smoke gate e artifact JSON.
- Migrazioni applicate:
  - `20260401000005_rss_pipeline_v1.sql`
  - `20260401000006_rss_pipeline_hardening.sql`
- Comandi locali verdi:
  - `npm run worker:rss`
  - `npm run lint`
  - `npm run test -- --run`
  - `npm run build`

Output atteso smoke:

- File `artifacts/rss-smoke-result.json` presente e valido.
- `metrics.passRate` = `1` (6/6 controlli passati).

Output atteso runtime:

- File `artifacts/rss-runtime-metrics.json` presente e valido.
- Include almeno:
  - `metrics.sourcesCount`
  - `metrics.feedItemsCount`
  - `metrics.rejectionRate`

## Procedura evidenza RSS (NEW-58)

Per raccogliere evidenza runtime allineata alla policy:

1. Configurare env:
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - opzionale `RSS_MIN_TRUST_SCORE` (default `40`)
2. Eseguire `npm run worker:rss`.
3. Verificare artifact:
   - `artifacts/rss-smoke-result.json` (gate statici su migrazioni)
   - `artifacts/rss-runtime-metrics.json` (metriche runtime da Supabase)

Fallback operativo:

- Se il quality gate fallisce, bloccare deploy pipeline RSS e mantenere feed su dati gia ingestiti.
- Escalare a CTO/Board con evidenze artifact + errore specifico (secret mancanti, gate dedupe/trust non valido).
