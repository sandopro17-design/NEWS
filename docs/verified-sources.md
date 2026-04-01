# TrueFlow — Fonti verificate (whitelist)

Linee guida per **curatela**, **governance** e **implementazione** della whitelist RSS. Allineate alla visione board sull’epic **NEW-1** (TrueFlow) e allo schema attuale `public.verified_sources` / `public.feed_items` in Supabase.

---

## Principio

Solo contenuti provenienti da fonti **esplicitamente ammesse** entrano nel grafo informativo del prodotto. L’utente configura tag e metatag; il sistema non sostituisce questa scelta con raccomandazioni opache su fonti non verificate.

---

## Criteri di ammissione (policy board)

Una candidata entra in whitelist solo se soddisfa **almeno 3** dei seguenti criteri:

1. **Testata registrata** — registrata presso un’autorità di stampa o ente equivalente nel proprio paese.
2. **Dominio verificabile** — HTTPS, WHOIS coerente, storicità del dominio (indicativamente ≥ 2 anni di attività editoriale).
3. **Autori identificabili** — byline e responsabilità editoriale ricostruibili (no solo “staff” anonimo su notizie sensibili).
4. **Feed RSS/Atom attivo** — endpoint stabile, aggiornato, preferibilmente documentato dalla testata.
5. **Assenza di segnalazioni gravi di disinformazione** — non presente su blacklist note; dove esiste rating esterno (es. NewsGuard, MBFC), orientarsi a **B+ o superiore** come riferimento operativo, non come garanzia legale.
6. **Peer endorsement** — citata o syndicata da **almeno 3** fonti già in whitelist (utile per nuove testate verticali).

**Nota legale/compliance:** questi criteri sono **linee guida prodotto**; la valutazione finale resta responsabilità del team editoriale / trust & safety prima del merge in produzione.

---

## Categorie e esempi (seed M2+)

Esempi citati dalla board come **orientamento** per una prima espansione (50+ fonti è un obiettivo di milestone, non uno stato attuale del DB):

| Area | Esempi indicativi |
| --- | --- |
| Tech | Ars Technica, The Verge, Wired, MIT Technology Review, TechCrunch |
| Scienza | Nature, Science, Scientific American, feed PubMed / open access |
| Finanza | Financial Times, Bloomberg, Il Sole 24 Ore, Reuters |
| Cybersecurity | Krebs on Security, Schneier on Security, The Hacker News |
| AI / ML | arXiv (cs.AI e affini), blog Google AI, OpenAI, Anthropic |
| Italia | ANSA, AGI, Il Post, Internazionale |

Ogni riga va comunque validata contro i **criteri di ammissione** e l’**URL del feed** reale prima dell’inserimento.

---

## Mapping schema database (M0)

Tabella `public.verified_sources` (migrazione iniziale):

| Colonna | Uso M0 | Evoluzione suggerita (M2–M5) |
| --- | --- | --- |
| `id` | UUID | — |
| `name` | Nome display | — |
| `feed_url` | URL feed RSS/Atom (unique) | — |
| `website_url` | Sito canonical | — |
| `verified_at` | Timestamp ammissione | Obbligatorio per fonti in produzione |
| `created_at` / `updated_at` | Audit | — |

Campi discussi in visione prodotto ma **non ancora in schema:** `trust_score`, `category`, `verified_by`, dominio esplicito — da aggiungere con migrazione dedicata quando si implementano dashboard trust e filtri per categoria.

`public.feed_items` collega gli articoli alla fonte (`verified_source_id`); deduplicazione tramite `(verified_source_id, external_id)`.

---

## Processo operativo (proposta)

1. **Proposta** — issue interna o modulo “proponi fonte” (M5) con URL feed + motivazione + categoria.
2. **Review** — checklist sui 6 criteri (minimo 3); screenshot o log del feed OK.
3. **Inserimento** — solo ruolo **service** o admin DB (mai solo client anon); in M2 il **poller RSS** userà chiavi server-side.
4. **Monitoraggio** — feed morti o redirect ripetuti → ticket di depubblicazione o aggiornamento URL.

---

## Riferimenti

- Architettura sistema e stack: `docs/architecture.md`
- IA pagina Esplora / feed: `docs/information-architecture-m0.md`
- Visione e milestone prodotto: epic **NEW-1** (Paperclip)
