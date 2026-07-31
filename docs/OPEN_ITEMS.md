# Offene Punkte — vollständige Liste

> Stand 2.15.0. Diese Datei ist die EINE Stelle für alles, was offen
> ist. Jede Änderung an Umfang oder Status wird hier nachgezogen
> (Pflicht seit 2.15.0 — kein tröpfchenweises Berichten mehr).
> Vereinbarung: Es wird NICHT am Referenzgerät des Projektinhabers
> gemessen. Anker sind Schaltplan (Rang 1), publizierte Fremdmessungen
> und nachrechenbare Ingenieursliteratur (Rang 3).

## A — Klangcharakter / DSP

| # | Punkt | Status | Weg zur Schließung |
|---|---|---|---|
| A1 | Accent-Amp-Release 50 ms | Messwert-Anker (publizierte Fremdmessung); Schaltungsintervall hergeleitet (1,55 ms … ≥ 200 ms) | Optional enger herleitbar über die OTA-Ausgangsstufen-Potenziale (Netzverfolgung, mittlerer Aufwand). Kein Blocker. |
| A2 | Rechteck-Duty 46,88 % | ABGESCHLOSSEN prinzipbedingt: TM5 „WIDTH" ist Werksabgleich, im Plan steht kein Sollwert | Keine Arbeit offen; Wert bleibt Messwert-Anker des hergeleiteten Formers. |
| A3 | kMax-Faktor-2-Lesart (Stinchcombe-Übertragungsfunktion) | offen, Rang-3-Literaturfrage | Prüfstein definiert: Grenzzyklus-Vergleich beider Lesarten gegen die dokumentierte Selbstoszillations-Grenze. |
| A4 | VCO-Former-Schwellen-DC (D30/D31/R107) | am Raster nicht auflösbar | Unkritisch: Duty/Pegel/Dachanstieg sind als Messanker gesetzt. Nur mit besserem Scan lösbar. |
| A5 | Rechteck-Dachanstieg ±0,05-Toleranz | Foto-Vermessung (drei saubere Pulse) | Nur mit besserem Scope-Material enger zu fassen. |
| A6 | Blocking-Pumpen (PHONO) τ = 50 ms | Modellannahme, dokumentiert | Isolierter Messbeleg steht aus; Klirrsignatur belegt bislang nur die Asymmetrie. |
| A7 | K3 Posistor R100 (VCO-Temperaturkompensation) | bewusst nicht modelliert | Sollverhalten = kompensiert; kein Klangfaktor bei Solltemperatur. Bleibt zu. |
| A8 | K5 Saw-Hub-Doppelangabe (5,5–12 V Zeichnung vs. 5,33–10,5 V x0x-vcfmods) | otaDrive nutzt 5,17 Vss | Doku-Punkt: Messpunkt benennen; klanglich zweitrangig (±1 dB Drive). |
| A9 | PHONO-Weiterentwicklung | Topologie steht (recherchierte NFB-Kette, s. THIRD_PARTY_NOTICES) | Nur noch befundgetrieben — kein Umbau auf Verdacht. |
| A10 | R6 Referenzaufnahmen eines belegten Geräts | optional, Rang 2 | Zur Endabnahme („AAA Clone"-Label), ausdrücklich KEINE Voraussetzung und NICHT vom Projektinhaber zu messen. |

## B — Produkt / Release

| # | Punkt | Status | Nächster Schritt |
|---|---|---|---|
| B1 | main-Branch steht auf 2.11.6 (366067d) | Feature-Branch ist bei 2.15.0 | Promotion auf Anweisung des Projektinhabers. |
| B2 | Produkt-Endabnahme in Amorph + Ziel-DAW | ausstehend (README-Status) | Hör-/Bedientest des aktuellen Builds durch den Projektinhaber — das ist die A/B-Abnahme, keine Messpflicht. |
| B3 | Presets | klingen seit 2.12–2.14 absichtlich anders (Hardware-Herleitungen) | Entscheidung offen, ob Preset-Werte nachgezogen werden sollen. |
| B4 | Amorph-Parameterlimit (66 > 50 dokumentiert) | toleriert, Lint-Warnung bekannt | Kein Handlungsbedarf; Feld-erprobt laut Devkit. |
| B5 | „AAA Clone"-Label | bleibt Ziel, kein Messergebnis (README-Disclaimer) | Hängt an B2 + A10 (Blindtests/kalibrierte Captures). |

## C — UI

Keine offenen Punkte. Alle gemeldeten UX-Befunde (2.11.x-Serie) sind
umgesetzt und durch ui_smoke abgedeckt.
