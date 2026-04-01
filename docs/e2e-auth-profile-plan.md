# E2E Plan: Auth + Profile Submit (NEW-77)

## Obiettivo

Ridurre il rischio post-launch sui flussi critici:
- signup/login UI
- submit modifica profilo

Questo piano usa un approccio "equivalente E2E" con stack attuale (`vitest` + `@testing-library/react`) e prevede estensione a Playwright appena abilitata la pipeline browser.

## Scope funzionale

1. Auth: render pagina auth, toggle/login-signup, submit form con validazione minima.
2. Profile: edit campi profilo e submit persistente verso Supabase.
3. Guard rail: nessun errore console non gestito durante i flussi.

## Strategia test

## Fase A — Coverage immediata (equivalente E2E in repo)

- Creare test di integrazione UI che simulano journey utente:
  - apertura route auth
  - compilazione campi richiesti
  - click submit e verifica side effects (mock chiamate auth/profile)
- Creare test submit profilo:
  - modifica `display_name`/`bio`
  - submit
  - verifica chiamata update e feedback UI atteso

## Fase B — Hardening con Playwright (quando disponibile)

- Introdurre suite browser reale per:
  - signup end-to-end completo
  - login + redirect alla pagina protetta
  - profile edit + persistenza su reload
- Esecuzione in CI su branch PR con report test.

## Casi minimi richiesti

1. Signup valido: submit invoca servizio auth senza errori.
2. Login valido: redirect verso feed.
3. Login invalido: messaggio errore visibile.
4. Profile submit valido: update profilo chiamato con payload corretto.
5. Profile submit fallito: errore gestito e UI non bloccata.

## Evidenze richieste nel task

- Comando test eseguito localmente con risultato.
- Eventuali failure con riproduzione breve.
- Nota monitoraggio 24h post-launch (console/rete) e stato corrente.

## Monitoraggio 24h (checklist operativa)

- [ ] T+0h: verifica console error su auth/profile durante smoke manuale.
- [ ] T+6h: ricontrollo rapido rete (request auth/profile senza 5xx anomali).
- [ ] T+24h: update finale su issue con esito monitoraggio.

## Definizione done (NEW-77)

- Piano E2E presente nel repo e linkato su task.
- Almeno un giro di test locale eseguito e riportato.
- Primo update monitoraggio post-launch pubblicato nel task.
