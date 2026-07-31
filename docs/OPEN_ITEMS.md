# Offene Punkte — vollständige Liste

> Stand 2.16.0. Diese Datei ist die EINE Stelle für alles, was offen
> ist; docs/SCHEMATIC_COVERAGE.md ist der Vollständigkeitsbeweis gegen
> den Schaltplan (keine Zeile „offen"). Vereinbarung: Es wird NICHT am
> Referenzgerät des Projektinhabers gemessen.

## A — Klangcharakter / DSP

**Keine offenen Arbeitspunkte.** Alle früheren A-Punkte sind
geschlossen (2.16.0):

- A1 Accent-Release: Steuerkette vollständig verfolgt (R119 →
  BA662-Steuerpin), 50 ms bleibt publizierter Messanker im
  hergeleiteten Intervall. GESCHLOSSEN (Anker).
- A2 Duty 46,88 %: Messwert-Anker; KORREKTUR 2.17.1: schaltungsbestimmt (TM5 ist der Oktavbreiten-Trim, kein Duty-Trim) — Herleitung blockiert allein an A4.
  GESCHLOSSEN.
- A3 kMax: per Selbstoszillations-Messung entschieden — Serienlesart
  bestätigt, Faktor 2 = Devil-Fish-Mod. GESCHLOSSEN (gemessen).
- A4 Former-Schwellen-DC: Kette identifiziert (TP4 − 2 Diodenstrecken),
  DC am Raster nicht eindeutig; Messanker tragen. GESCHLOSSEN (Anker,
  Analyse dokumentiert).
- A5 Dachanstieg ±0,05: Scope-Anker. GESCHLOSSEN (Anker).
- A6 Blocking: isoliert gemessen (Kontrollvariante Bias eingefroren):
  Zustand erholt sich in ~70 ms, Ausgangs-DC-Anteil klein (Rumble-
  Filter), Klirrsignatur trägt die Asymmetrie. GESCHLOSSEN (gemessen).
- A7 Posistor: bewusst ausgeschlossen. GESCHLOSSEN.
- A8 K5 Saw-Hub: Messpunkt benannt (R105/Q28-Abgriff, x0x-vcfmods;
  Zeichnungswert 5,5–12 V gilt am TP4-Puffer). GESCHLOSSEN (Doku).
- Korrektur 2.16.0: Das 2.14.0-Gewicht „6,0 hergeleitet" hielt der
  besseren Netzverfolgung nicht stand → zurück auf den geräte-
  kalibrierten Fit 4,0; Mehrdeutigkeit dokumentiert.

## B — Produkt / Release (Entscheidungen des Projektinhabers)

| # | Punkt | Status |
|---|---|---|
| B1 | main-Branch steht auf 2.11.6 | Promotion auf Anweisung |
| B2 | A/B-Abnahme des aktuellen Builds in Amorph/DAW | Build entspricht jetzt nachweislich dem Schaltplan (SCHEMATIC_COVERAGE.md); Test ist Abnahme, keine Lückensuche |
| B3 | Presets an den neuen Klang anpassen? | Entscheidung offen |
| B4 | Param-Limit 66 > 50 | toleriert, dokumentiert — kein Handlungsbedarf |
| B5 | „AAA Clone"-Label | hängt an B2 + optionalen Rang-2-Captures (A10-alt: ausdrücklich optional, nicht vom Projektinhaber) |

## C — UI

Keine offenen Punkte.
