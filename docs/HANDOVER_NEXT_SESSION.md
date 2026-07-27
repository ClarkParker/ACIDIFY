# ACIDIFY — Übergabe an die nächste Session

## Projekt und Stand

- **Repos:** `ClarkParker/ACIDIFY` (Produkt), `ClarkParker/Amorph_DEV_KIt` (Host/Tooling, read-only benutzen)
- **Branch:** `claude/acidify-303-dsp-b765ij` — IMMER zuerst `git ls-remote`, der Clone enthält nicht alle Branches
- **Version:** 2.0.3, alle Versionsmetadaten synchron (`python3 tools/check_version.py` muss grün sein)
- **CI:** zwei Workflows (`CI`, `Version metadata`), laufen bei JEDEM Push. Bis 2.0.2 per API als grün verifiziert;
  2.0.3 (`ea1cd7d`) noch nicht nachgesehen → **erster Arbeitsschritt: CI-Status prüfen** (GitHub-MCP `actions_list`).

## Die drei Projektregeln (vom Eigentümer, nicht verhandelbar)

1. **Aus der Topologie herleiten, nie aus Verhalten rückwärts bauen.** Test: Wenn du ein Verhalten hinzufügen musst,
   das die Physik von selbst erzeugen würde, ist das Modell falsch.
2. **Jede Behauptung braucht einen Test, der sie widerlegen könnte.** Ein Test, der nur bestätigt, beweist nichts.
3. **Referenzpunkte festnageln, bevor verglichen wird.** Korollar: Nie zwei freie Parameter gegen eine Testschwelle tunen.

## Arbeitsregeln, die diese Session erzwungen hat (Verstöße waren teuer)

- **Keine Prosa.** Nur DSP/Code und die nötigste Doku. Kommentare kurz.
- **Nichts als „fertig" oder „geprüft" melden ohne Artefakt** (Screenshot-Vergleich, Diff, Testausgabe, CI-Link).
- **UI-Referenz ist das dc-Template** in `design/ACIDIFY GUI.dc.html` (zweimal identisch übergeben).
  Der alte Session-Screenshot in Übergabe 1 enthält einen ÄLTEREN Stand („PERFORMANCE BASSLINE") — nicht als Soll verwenden.
- **Vor jedem UI-„fertig": mechanischer Abgleich.** Referenz und Render auf 1180×580 normalisieren, Zonen croppen,
  übereinanderlegen (Skripte/Ergebnisse: Scratchpad `z_*.png`, `cmp_*.png` — Muster im Verlauf, neu erzeugbar).
- **Nach jedem Push CI-Status prüfen.** 33 Fehler-Mails gingen an den Eigentümer, weil das unterblieb.
- **Bauteilwerte aus der EAGLE-Textquelle** (`tools/bench/partcheck.py` + `mainboard.sch`), NIE Pixel-Tracing,
  solange eine maschinenlesbare Quelle existiert.
- Erst recherchieren (Web, Quellen im Scratchpad), dann „nicht möglich" behaupten.

## DSP (fertig bis auf Hardware-Messung)

- ZDF-Diodenleiter mit Stinchcombes vollständiger Übertragungsfunktion; Koppelnetz C(s) exakt (0,0001 dB),
  IN der Resonanzschleife. Diodensättigung an allen vier Paaren an der KNOTENSPANNUNG (nicht am Eingangsstrom —
  das faltete mit +44 dB und wurde behoben), `drive = 1089,8 / f_c`, herleitungsbedingt ohne freien Parameter.
- VCA: BA662-Kennlinie, `otaDrive = 0,4971` (hergeleitet), VCA-Release nach Whittles Messung (8 ms Halten + 8 ms linear),
  Accent-Release 50 ms (Open303).
- Bewusst behaltene Konstanten (Herkunft belegt, NICHT „offen"): Accent-Höhe `4.0` und VCO-Rechteckschwelle —
  beide aus Open303 (an echter Hardware kalibriert); Schaltungsherleitung des Accent-Pfads ist öffentlich unmöglich
  (kein Netz verfügbar, Q36-Stromquellen-Hypothese am Schaltbild widerlegt).
- **Einziger offener DSP-Punkt: Abgleich gegen ein echtes Gerät.** Braucht Referenzaufnahmen vom Eigentümer.

## MODs (eingebaut, param51–59)

Fünf Mods mit Enable+Amount, Defaults = Serienstand (Smoke-Peak bit-identisch 0,34552 bei Mods aus),
Wirkungsnachweise in `docs/MODS.md`. Nicht eingebaut (Produktentscheidung): Gerätestreuung, Muffler, VCF-In.

## UI (Silver-Port, funktional komplett, Optik-Feinabgleich offen)

Portiert und getestet: alle drei Decks, Filter-Response-Visualizer, Step-Wippen mit Pills, Editor/Keyboard/Matrix,
Mod-Overlay, Spiegel-Slider (data-mirrors), Studio-Modus (2.0.3 repariert: LEDs, Lanes, Höhen).

**Offene Feinabgleich-Liste (Eigenjagd Runde 2, vom Eigentümer beauftragt):**
1. Zonen 2–16 des Feinrasters einzeln gegen das Template (Knopf für Knopf) — nur Zone 1 ist abgearbeitet.
2. Beide Overlays (Mods, Distortion) gegen das Template-Layout (Mods: Zellenraster mit Titel/Beschreibung/Rocker/Dial).
3. CLASSIC/STUDIO-Schalter in der kleinen Segment-Optik des Entwurfs (58×15).
4. Kleinteile: Readout-Schriftgröße (Template 24px), VU-Ruhezustand, Schwarztasten-Proportion, `beyond-length`-Dimmen der Steps.

## Toolchain (ohne das läuft nichts)

- Scratchpad der Vorsession: `/tmp/claude-0/-home-user/cf1234b6-c6a5-547b-9c3c-5b2a157b53e2/scratchpad`
  (cmaj-Binary, Stub-Libs, mainboard.sch, node_modules mit Playwright, Referenzbilder). Falls weg: cmaj 1.0.3175 laden,
  Stubs bauen (siehe `.github/workflows/ci.yml`, dort steht das komplette Rezept), `npm i playwright`, Chromium unter
  `/opt/pw-browsers/chromium-*/chrome-linux/chrome` via `ACIDIFY_CHROMIUM_PATH`.
- DSP-Tests: `CMAJ=<pfad> LD_LIBRARY_PATH=<stublibs> node tools/{smoke,dsp_matrix,dsp_articulation,dsp_transport}_test.mjs`
- Messstand: `ACIDIFY_BENCH_DIR=<scratchpad> LD_LIBRARY_PATH=<stublibs> python3 tools/bench/hardware_checks.py` (11/11)
- UI-Test: `ACIDIFY_CHROMIUM_PATH=<chrome> node tools/ui_smoke_test.mjs` (Playwright via node_modules-Symlink, Symlink vor Commits entfernen)
- Statik: `python3 <devkit>/tools/{cmajor_lint,ui_lint,check_sync,manifest_check}.py` — Aufrufe exakt wie in `ci.yml`
- Param-Zahl 59 > 50 ist eine dokumentierte EMPFEHLUNG (Warnung), kein Limit. Nicht wieder zum Thema machen.

## Abnahmekriterium für „fertig"

UI: mechanischer Soll/Ist-Abgleich ohne sichtbare Abweichung + `ui_smoke_test` dreifach grün + CI grün.
DSP: 11/11 Prüfsteine + 4 DSP-Tests + `partcheck` 28/28 + CI grün. Alles andere ist „nicht fertig" und wird so genannt.

## Ehrlichkeitsklausel

Statusmeldungen nennen ZUERST, was offen oder ungeprüft ist. „Rest-Deltas" und „Feinoptik" als Fußnote für bekannte
Abweichungen sind in diesem Projekt verbrannt — der Eigentümer prüft nach und hat jedes Schönfärben bisher gefunden.
