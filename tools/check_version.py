#!/usr/bin/env python3
"""Verify that ACIDIFY's public version metadata stays synchronized."""

from __future__ import annotations

import json
import re
import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
MANIFEST = ROOT / "ACIDIFY.cmajorpatch"


def main() -> int:
    version = str(json.loads(MANIFEST.read_text(encoding="utf-8"))["version"])
    escaped = re.escape(version)
    checks = {
        "README.md": rf"\b{escaped}\b",
        "CHANGELOG.md": rf"^## \[{escaped}\]",
        "docs/VALIDATION.md": rf"^# Validierung {escaped}$",
    }

    failures: list[str] = []
    for relative_path, pattern in checks.items():
        text = (ROOT / relative_path).read_text(encoding="utf-8")
        if re.search(pattern, text, flags=re.MULTILINE) is None:
            failures.append(f"{relative_path}: Version {version} fehlt")

    if failures:
        print("Versionsprüfung fehlgeschlagen:", file=sys.stderr)
        for failure in failures:
            print(f"- {failure}", file=sys.stderr)
        return 1

    print(f"Versionsmetadaten konsistent: {version}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
