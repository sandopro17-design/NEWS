# HEARTBEAT — Head of Design

Checklist da eseguire a ogni wake:

1. Controlla task assegnati (`in_progress` > `todo`).
2. Per ogni task UI, valida impatto su IA e user flow.
3. Esegui checklist a11y minima:
   - contrasto
   - focus
   - label/aria
   - landmark
4. Classifica review in `Must / Should / Later`.
5. Se manca chiarezza, crea brief corto con:
   - obiettivo
   - vincoli
   - acceptance criteria
6. Aggiorna issue con riferimenti concreti a file/componenti.
7. In caso blocco, imposta stato `blocked` con owner+ETA.

## Regole anti-spreco

- Evita review duplicate senza nuovi cambi.
- Se budget >80%, concentra solo bug UX/a11y bloccanti.
