# TrueFlow UX Overhaul MVP (M0 -> M1)

Documento operativo di handoff UX verso implementazione CTO per [NEW-15](/NEW/issues/NEW-15), in coerenza con epic [NEW-1](/NEW/issues/NEW-1).

## 1) Obiettivo prodotto

Portare l'esperienza da "placeholder tecnico" a "prodotto affidabile e leggibile" mantenendo il principio base TrueFlow:

- feed cronologico da fonti RSS verificate;
- controllo utente su tag/metatag;
- nessuna raccomandazione algoritmica opaca.

## 2) Audit rapido stato attuale (M0)

### Must (prima del prossimo milestone UX)

- **Home non orientata all'utente finale:** `src/pages/HomePage.tsx` e una demo componenti, non una porta di ingresso al valore prodotto.
- **Shell senza skip link:** `src/layouts/AppLayout.tsx` non offre salto rapido al contenuto principale.
- **Menu mobile incompleto per a11y:** bottone "Menu" ha `aria-expanded` ma non `aria-controls` verso un pannello identificabile.
- **Feed/Explore/Profile troppo vuote per decisioni utente:** `src/pages/FeedPage.tsx`, `src/pages/ExplorePage.tsx`, `src/pages/ProfilePage.tsx` non mostrano gerarchie e stati minimi (empty/loading/error).

### Should (fortemente raccomandato in M1)

- Definire pattern card articolo coerente (titolo, snippet, fonte verificata, timestamp, azioni secondarie).
- Introdurre set minimo di filtri feed (tag, fonte, data) e chip attivi visibili.
- Esplicitare su Explore la distinzione "fonti verificate", "tag popolari", "persone".
- Rendere `Settings` focalizzata su account/tema/notifiche, spostando gestione tag nel profilo.

### Later (polish e debt)

- Pattern skeleton unificati per caricamento liste.
- Microcopy uniforme tra pagine (tono "chiarezza professionale").
- Revisione densita tipografica per desktop ultrawide.

## 3) Blueprint IA e scopo pagina (M1)

- **`/` Home:** value proposition + CTA verso Feed/Explore + stato onboarding ("configura i primi tag").
- **`/feed`:** lettura cronologica con filtri, badge fonte verificata e stati lista.
- **`/profile`:** identita, rete, e area principale per tag/metatag (CRUD).
- **`/explore`:** scoperta trasparente di fonti/persone/tag senza ranking opaco.
- **`/settings`:** preferenze account e aspetto, separata dalla configurazione del feed.

## 3.1) Wireframe high-level (testuale)

### `/` Home

- **Header:** titolo prodotto + claim "fonti verificate, nessun ranking opaco".
- **Hero:** CTA primaria "Apri il feed", CTA secondaria "Esplora fonti".
- **Onboarding box:** stato configurazione tag/metatag ("0/3 completati").
- **Supporting block:** spiegazione breve di come funziona la verifica fonti.

### `/feed`

- **Toolbar filtri:** selettori Tag, Fonte, Intervallo data + chip filtri attivi.
- **Meta barra:** conteggio risultati + ordinamento cronologico (recenti -> meno recenti).
- **Lista item:** card articolo con titolo, snippet, fonte verificata, timestamp, azioni.
- **Stati:** skeleton loading, empty con CTA "Configura i tuoi tag", error con retry.

### `/profile`

- **Header profilo:** avatar, nome, bio, azione "Modifica profilo" (quando disponibile).
- **Rete:** follower/following in card compatte.
- **Tag e metatag:** sezione principale con lista/edit/aggiunta.
- **Attivita:** timeline placeholder orientata ai milestone social successivi.

### `/explore`

- **Ricerca:** input unico per fonti/tag/persone.
- **Sezioni separate:** Fonti verificate, Tag popolari, Persone.
- **Card fonte:** nome, categoria, badge trust, CTA "Segui fonte" o "Apri feed correlato".
- **Stati:** nessun risultato con suggerimenti di query alternativa.

### `/settings`

- **Aspetto:** tema chiaro/scuro/sistema.
- **Account:** preferenze profilo e sicurezza.
- **Notifiche:** canali e frequenza (placeholder M0).
- **Link operativo:** rimando esplicito a `/profile` per gestione tag/metatag.

## 4) Design system: vincoli implementativi

- Usare token semantici esistenti in `src/index.css` (`--tf-*`) senza introdurre colori hard-coded nei componenti pagina.
- Stati interattivi minimi per CTA e controlli: default, hover, focus-visible, disabled, loading.
- Coerenza light/dark con stessa semantica (non invertire significato dei colori tra temi).
- Font: `Outfit` per titoli, `Source Sans 3` per corpo, evitare mix non previsto.

## 4.1) Component map (Tailwind/UI)

- **Shell globale (`src/layouts/AppLayout.tsx`):**
  - `header`: logo + navigazione primaria + trigger menu mobile
  - `main#main-content`: contenuto route
  - `aside`: shortcut contestuali (M1+)
- **Componenti base riuso (`src/components/ui/`):**
  - `Button`: CTA primarie/secondarie, stato loading e disabled
  - `Input`: ricerca explore, filtri feed, impostazioni account
  - `Badge`: trust fonte, tag/metatag, stato verificato
  - `Card`: item feed, blocchi profilo, sezioni explore
  - `Avatar`: identita utente con fallback testuale accessibile
- **Pattern compositi da introdurre in pagina:**
  - `FeedFilterBar`: Input + Select/Chip + reset filtri
  - `FeedItemCard`: titolo, snippet, metadata fonte, azioni
  - `SectionHeader`: titolo + descrizione + azione contestuale
  - `EmptyStatePanel`: icona, messaggio, CTA
  - `ErrorStatePanel`: errore sintetico + pulsante retry

## 5) Checklist accessibilita (acceptance UI)

- Contrasto testo/sfondo AA in light e dark (inclusi sfondi trasparenti tipo `bg-surface/30`).
- Focus visibile su link, bottoni, input e controlli custom.
- Label associate per input oppure `aria-label`/`aria-labelledby`.
- Landmark completi: `header`, `nav`, `main`, `aside` con label utili.
- Menu mobile con `aria-controls` e stato aperto/chiuso sincronizzato.
- Skip link all'inizio shell verso `#main-content`.
- Avatar/immagini con testo alternativo o fallback semantico.

## 6) Backlog UX per implementazione CTO

### Must

1. Aggiungere skip link e id target in `src/layouts/AppLayout.tsx`.
2. Completare a11y menu mobile (`aria-controls` + contenitore nav collassabile).
3. Sostituire contenuto Home con hero prodotto + CTA reali.
4. Portare Feed a "MVP leggibile": toolbar filtri + lista item + empty/error/loading.

### Should

1. Profile con sezioni base: header utente, tag/metatag, attivita placeholder.
2. Explore con tab o sezioni distinte (fonti / tag / persone) e badge trust.
3. Settings riallineata a preferenze account/tema, con link a gestione tag in Profile.

### Later

1. Library di skeleton condivisi.
2. Glossario microcopy UI in coordinamento CMO.
3. Audit contrasti automatizzato in CI.

## 7) Criteri di accettazione (Definition of Done UX M1)

- Ogni route M0 ha uno scopo utente chiaro e un'azione primaria visibile.
- Feed comunica sempre provenienza e stato di verifica fonte.
- Nessuna sezione usa linguaggio o pattern "for you" algoritmico.
- Navigazione e interazioni principali sono usabili solo da tastiera.
- Light e dark restano coerenti con brand "affidabilita + chiarezza".
