# TrueFlow — Scheletro piano canali (M0–M1)

Obiettivo: **chiarezza e coerenza** prima della beta; niente campagne massicce finché il prodotto non è usabile end-to-end in ambiente controllato.

## M0 — Foundation (allineato a milestone tecniche)

| Canale | Ruolo | Attività (leggero) | Owner suggerito |
|--------|--------|---------------------|-----------------|
| **Repo / `docs/`** | Fonte di verità messaging + architettura | Aggiornare positioning e tone quando cambia il prodotto | CMO + review CTO |
| **CHANGELOG / release notes** (in repo o GitHub Releases) | Tracciamento trasparente per early adopters | Voce sintetica a merge significativi | CTO / IC |
| **Issue board (Paperclip)** | Coordinamento e decisioni | Commenti con link a doc; menzioni @Head of Design per copy UI | Tutti |

**Non in M0:** spesa ads, influencer, community pubblica ampia.

### Deliverable M0 immediati (CMO)

- Pacchetto microcopy per `Auth`, `Onboarding` e `Settings` mantenuto in `marketing-tone-of-voice-m0.md`.
- Script onboarding in 3 step allineato a UX flow e promesse prodotto.
- Policy editoriale "proposta fonti RSS" con criteri trust + disclosure in `marketing-positioning-m0.md`.
- Commento di allineamento su issue Paperclip con link ai doc aggiornati e richiesta review a CTO + Head of Design.

## M1 — Auth & profilo (pre-beta ristretta)

| Canale | Ruolo | Attività | Note |
|--------|--------|----------|------|
| **Blog tecnico leggero** (es. sezione su GitHub Pages o Medium/Dev.to mirato) | Devrel: “perché RSS + fonti verificate” | 1–2 post max: visione + stack; link a doc | Dopo prima demo interna |
| **Community ristretta** (Discord/Slack invito o lista email founder) | Feedback su onboarding e wording | Messaggi brevi, tone of voice allineato a `marketing-tone-of-voice-m0.md` | Solo se c’è capacità di risposta |
| **Social “placeholder”** (profilo riservato) | Prevenzione squatting / coerenza handle | Bio minimale + link repo; nessun calendario editoriale | Opzionale |

## Metriche di successo (soft, pre-launch)

- Stessa **promessa** in README, primi screen e primi post (nessuna contraddizione con “no raccomandazioni opache”).
- **Head of Design** e CMO allineati su stringhe critiche (login, vuoti stati, errori).

## Prossimo passo

Allineamento con **CTO** su dove versionare i testi pubblici (solo repo vs sito marketing separato in M2+).

## Cadence operativa suggerita (fino a beta ristretta)

- Aggiornamento docs marketing a ogni milestone prodotto che tocca promessa, onboarding o trust model.
- Review copy UI settimanale CMO + Head of Design sulle stringhe critiche (auth, empty state, errori).
- Check mensile con CTO su coerenza tra wording pubblico e stato reale di stack/release.
