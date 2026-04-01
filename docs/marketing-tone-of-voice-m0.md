# TrueFlow — Tone of voice e linee guida messaggio (M0)

## Principi (2–3 paragrafi)

Parliamo con **chiarezza e rispetto dell’intelligenza** dell’utente: niente iperboli da startup, niente paura dell’algoritmo come unico leva emotiva. Il tono è **sobrio, diretto, leggermente tecnico** quando serve — come spiegheresti il prodotto a un collega che usa già RSS o LinkedIn. Evitiamo il linguaggio da “rivoluzione” e preferiamo verbi concreti: *scegli*, *verifica*, *segui*, *filtra*.

Per il pubblico **devrel e builder**, enfatizziamo **trasparenza architetturale** (fonti in whitelist, RSS, assenza di raccomandazioni opache) e **estensibilità** futura (worker, integrazioni), sempre senza promettere roadmap non ancora in release. Per gli **utenti finali**, enfatizziamo **controllo** e **qualità delle fonti**, non feature social generiche.

## Linee guida — utenti finali

- Usare frasi brevi; evitare gergo interno (es. “metatag” va spiegato al primo contatto o sostituito con “sotto-temi” dove l’UI lo permette).
- Preferire **benefici verificabili** (“solo fonti che rispettano criteri X”) a slogan vuoti.
- Tono: confidente ma non arrogante; **no** derisione verso altre piattaforme — focus su cosa TrueFlow fa in più.

## Linee guida — devrel / community tecnica

- Essere precisi su stack e confini (es. Supabase, Pages, worker RSS) come nel materiale architetturale; rimandare a `docs/` tecnici dove appropriato.
- In blog e changelog: **cosa è cambiato**, **perché**, **impatto** per chi integra o self-hosta in futuro.
- Invitare feedback su **criteri fonti** e **tag model** — sono leve di fiducia del prodotto.

## Parole da privilegiare / evitare (bullet)

- **Privilegiare:** fonti verificate, feed RSS, tag, controllo, trasparenza, cronologia, whitelist, verticalità.
- **Usare con cautela:** “senza algoritmo” (specificare: niente raccomandazioni tipo “per te”).
- **Evitare:** “disruptive”, “revolutionary”, promesse su scale o numeri di fonti non ancora reali in prodotto.

## Microcopy operativo (M0, pronto integrazione UI)

### Auth

- **Titolo login:** Accedi al tuo flusso verificato
- **Titolo registrazione:** Crea il tuo spazio informativo
- **Descrizione unica:** Email e password per iniziare. Nessun feed "per te": scegli tu cosa seguire.
- **Label password:** Password (minimo 8 caratteri)
- **Placeholder nome visualizzato:** es. Mario Rossi
- **CTA login:** Accedi
- **CTA signup:** Crea account
- **Feedback signup:** Registrazione inviata. Controlla la tua email per confermare l'account.
- **Errore generico auth:** Accesso non riuscito. Verifica email e password, poi riprova.

### Onboarding

- **Titolo:** Completa il tuo profilo
- **Descrizione:** Bastano nome e headline per iniziare a seguire persone e costruire i tuoi feed.
- **Label headline:** Headline professionale (opzionale)
- **CTA primaria:** Continua
- **Errore nome mancante:** Inserisci un nome visualizzato per procedere.
- **Conferma salvataggio (eventuale toast):** Profilo salvato. Ora imposta i tuoi tag.

### Settings (tag, metatag, mapping)

- **Sottotitolo pagina:** Definisci i temi che contano per te e collega solo fonti verificate.
- **Tag helper:** Un tag rappresenta un tema principale (es. sicurezza, AI, fintech).
- **Metatag helper:** Un metatag raggruppa piu tag in un sotto-dominio.
- **Mapping helper:** Collega ogni tag a una o piu fonti verificate per alimentare il feed RSS.
- **Empty state tag:** Nessun tag ancora. Aggiungi il primo tema che vuoi monitorare.
- **Empty state mapping:** Nessun collegamento tag/fonte ancora. Crea un mapping per popolare il feed.
- **Errore mapping:** Collegamento non riuscito. Riprova tra pochi secondi.

## Script onboarding (3 step)

1. **Identita:** "Crea il tuo profilo in meno di un minuto."
2. **Scelta temi:** "Aggiungi i tag che vuoi seguire: TrueFlow usa le tue scelte, non raccomandazioni opache."
3. **Qualita fonti:** "Collega i tag a fonti verificate e costruisci un feed verticale e tracciabile."

Nota: in UI utente usare "sotto-temi" come alias di "metatag" al primo contatto.
