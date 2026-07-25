# Versionierung und Releases

## Verbindliche Quelle

Die aktuelle Produktversion steht im Feld `version` von
`ACIDIFY.cmajorpatch`. Diese Nummer ist die verbindliche Quelle für alle
weiteren Versionsangaben.

ACIDIFY verwendet Semantic Versioning:

- `PATCH` für kompatible Fehlerkorrekturen und kleine UI-Korrekturen,
- `MINOR` für neue kompatible Funktionen oder Bedienmodi,
- `MAJOR` für inkompatible Änderungen am Parameter-, Preset- oder
  Projektvertrag.

## Definition of Done

Ein ACIDIFY-Stand darf erst als abgeschlossen gemeldet werden, wenn:

1. `ACIDIFY.cmajorpatch` die beabsichtigte Version enthält,
2. `CHANGELOG.md` die Änderungen dieser Version dauerhaft dokumentiert,
3. Versionsangaben in `README.md` und `docs/VALIDATION.md` übereinstimmen,
4. `python3 tools/check_version.py` erfolgreich läuft,
5. derselbe Stand ausschließlich über GitHub App-Connect veröffentlicht und
   anschließend von `main` zurückgelesen wurde.

Ein GitHub-Commit ohne Changelog-Eintrag ist kein vollständiger Release-Stand.
Ein lokales Archiv ersetzt weder den Repository-Commit noch die
Versionsdokumentation.

## Release-Ablauf

1. Funktionsumfang und unveränderte Verträge festhalten.
2. Versionsnummer gemäß Semantic Versioning wählen.
3. Manifest, Changelog, README und Validierungsdokument gemeinsam aktualisieren.
4. Versionsprüfung ausführen.
5. Änderungen als zusammenhängenden GitHub-App-Commit veröffentlichen.
6. Remote-Version, Changelog und Commit-SHA über die GitHub-App verifizieren.

GitHub-Veröffentlichungen erfolgen für dieses Projekt niemals per CLI-Push.
