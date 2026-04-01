# TrueFlow M0 — Information architecture (route)

Documento di allineamento UX/IA tra **Head of Design** e implementazione (issue Paperclip [NEW-4](/NEW/issues/NEW-4)). Milestone M0: shell + route placeholder; le sezioni sotto definiscono **scopo utente**, **gerarchia informativa** e **elementi strutturali** attesi quando le pagine si riempiono di dati reali.

---

## `/` — Home

- **Scopo utente:** orientamento rapido al valore del prodotto (feed da fonti verificate, niente raccomandazioni opache) e accesso alle aree principali.
- **Gerarchia:** 1) value proposition / stato onboarding; 2) azioni primarie (vai al feed, esplora fonti); 3) contenuto secondario (annunci, suggerimenti editoriali leggeri — mai “for you” algoritmico).
- **M0 attuale:** showcase design system è accettabile come **dev surface**; in vista M1 sostituire o spostare la demo componenti in pagina interna o tab “Sviluppo” così la home resta orientata all’utente finale.

## `/feed` — Feed

- **Scopo utente:** **lettura** — consumare articoli dalla rete e dai tag/metatag configurati, con chiarezza su **fonte** e **verifica**.
- **Gerarchia:** 1) titolo pagina + filtri rapidi (tag, fonte, intervallo data); 2) lista cronologica (più recente in alto); 3) ogni item: titolo, snippet, fonte con badge trust/verificato, timestamp, azioni secondarie (apri, salva — quando esistono).
- **Pattern:** nessuna interruzione promozionale tra gli item; empty state che spiega come aggiungere tag/fonti.

## `/profile` — Profilo

- **Scopo utente:** **identità** e **configurazione verticale** (tag, metatag, chi seguo) in un unico luogo riconoscibile.
- **Gerarchia:** 1) intestazione profilo (avatar, nome, bio); 2) riepilogo rete (follower/following — quando dati disponibili); 3) sezione tag & metatag (CRUD in M1); 4) attività o post utente (layer social — M4+).
- **M0 attuale:** placeholder con titolo + copy che anticipano le sezioni sopra.

## `/explore` — Esplora

- **Scopo utente:** **scoperta** di fonti verificate, tag popolari o persone — sempre con trasparenza su cosa è curato vs. community.
- **Gerarchia:** 1) ricerca o filtri per categoria; 2) griglia/lista fonti con indicatore trust; 3) eventuale “proponi fonte” come flusso secondario (M5).
- **M0 attuale:** placeholder; quando si aggiungono dati, privilegiare etichette chiare (“Fonte verificata”, categoria).

## `/settings` — Impostazioni

- **Scopo utente:** **controllo account** (tema, lingua, notifiche, privacy, logout) senza mescolare la configurazione del feed (quella resta su profilo/tag).
- **Gerarchia:** 1) raggruppare per sezioni (Aspetto, Account, Notifiche); 2) tema chiaro/scuro/sistema con anteprima coerente con i token `--tf-*`.
- **M0 attuale:** toggle tema già previsto nello store; espandere con lista sezioni anche se le voci sono placeholder.

---

## Shell condivisa (Navbar / Sidebar)

- **Navbar:** navigazione primaria tra le cinque route; stato attivo visibile (già presente).
- **Sidebar:** in M0 placeholder; in evoluzione ospita shortcut contestuali (es. “Le mie fonti”, “Tag attivi”) senza duplicare la navbar.

---

## Riferimenti

- Visione prodotto e stack: issue epic [NEW-1](/NEW/issues/NEW-1) (commento board con architettura e milestone).
- Token colore e componenti: `src/index.css`, `src/components/ui/*`.
- Handoff UX MVP verso implementazione: `docs/ux-overhaul-mvp-brief.md` (issue [NEW-15](/NEW/issues/NEW-15)).
