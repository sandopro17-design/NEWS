# Board Agentico NEWS (v2)

Questo documento definisce il modello operativo board-first per la company `NEWS` in Paperclip.

## Principi operativi

- Board umano: imposta obiettivi e metriche, non micro-task.
- CEO (`Leone`): traduce obiettivi in execution plan e hiring/deleghe.
- Manager (`CTO`, `CMO`, `Head of Design`): convertono il piano in task verificabili.
- IC (`Frontend Dev`, `RSS Engineer`): esecuzione tecnica con update frequenti.
- Ogni decisione importante deve essere tracciabile in issue/commento collegato.

## Organigramma target

- CEO: `Leone`
  - CTO
    - Frontend Dev
    - RSS Engineer
  - CMO
  - Head of Design

## Cadenza heartbeat raccomandata

- `Leone` (CEO): 30 min (`1800s`)
- `CTO`: 10 min (`600s`)
- `Frontend Dev`: 15 min (`900s`)
- `RSS Engineer`: 15 min (`900s`)
- `CMO`: 30 min (`1800s`)
- `Head of Design`: 30 min (`1800s`)

Regola: mantenere `wakeOnDemand=true` per issue assegnate, mention e approvazioni.

## Budget operativo raccomandato (mensile, per agente)

Valori iniziali prudenti per evitare run-away cost e mantenere autonomia:

- CEO: 4000 cents
- CTO: 6000 cents
- Frontend Dev: 4500 cents
- RSS Engineer: 4500 cents
- CMO: 2500 cents
- Head of Design: 2500 cents

Policy:

- 80%: solo attività critiche e chiusura blocker.
- 100%: pausa automatica + escalation al board.

## Routines operative

1. Daily board pulse (CEO, mattina)
- Stato roadmap M1-M3.
- Top 3 rischi aperti.
- Escalation richieste al board.

2. Technical heartbeat review (CTO, ogni 24h)
- Salute pipeline RSS, test/build, regressioni.
- Debito tecnico che impatta milestone.

3. UX/content sync (CMO + Head of Design, ogni 48h)
- Coerenza promessa prodotto vs copy in-app.
- Gaps di onboarding, empty states, error states.

4. Safety routine fonti (RSS Engineer, ogni 24h)
- Fonti attive/non affidabili.
- Qualita dedupe e scoring.

## KPI minimi board

- Delivery: lead time issue `todo -> done`.
- Qualita: percentuale run con test/build verdi.
- Focus: quota issue chiuse legate a milestone attiva.
- Governance: issue bloccate >24h con owner/ETA mancanti.
- Messaging fit: allineamento copy README / UI onboarding / docs.

## Convenzioni file agente (obbligatorie)

Ogni agente custom in repo deve avere:

- `SOUL.md`: identita, confini decisionali, principi.
- `HEARTBEAT.md`: checklist operativa run-by-run.
- `TOOLS.md`: strumenti consentiti, scope e limiti.
- `AGENTS.md`: entrypoint breve che richiama i 3 file sopra.

## Note implementative

- Questo board document vive nel repo per versioning e review via PR.
- Le impostazioni runtime reali (heartbeat, budget, pause) restano in Paperclip API/UI.
