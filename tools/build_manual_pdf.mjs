// Baut docs/manual/ACIDIFY_Manual.pdf aus docs/manual/manual.html.
//
// Quelle des Wortlauts bleibt docs/manual/MANUAL.md; manual.html ist das
// gesetzte A4-Layout dazu (14 vorpaginierte <section class="page">-Seiten,
// Screenshots aus docs/manual/img/). Keine externen Fonts oder CDNs —
// Impact, Helvetica/Arial und Courier New werden lokal aufgelöst.
//
//   node tools/build_manual_pdf.mjs
//   ACIDIFY_CHROMIUM_PATH=/pfad/zu/chrome node tools/build_manual_pdf.mjs
//
// Launch-Flags identisch zu tools/ui_smoke_test.mjs: manual.html lädt die
// Screenshots über file://, Chromium blockiert das sonst als cross-origin.

import { createRequire } from "node:module";
import { fileURLToPath, pathToFileURL } from "node:url";
import path from "node:path";
import fs from "node:fs";

const require = createRequire(import.meta.url);
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const source = path.join(root, "docs", "manual", "manual.html");
const target = path.join(root, "docs", "manual", "ACIDIFY_Manual.pdf");
const executablePath = process.env.ACIDIFY_CHROMIUM_PATH;
const { chromium } = require("playwright");

if (!fs.existsSync(source)) {
  throw new Error(`Fehlt: ${path.relative(root, source)}`);
}

// Vorpaginiertes Dokument: die Seitenzahl im Markup ist der Sollwert.
const expectedPages = (fs.readFileSync(source, "utf8")
  .match(/<section class="page"/g) || []).length;
if (expectedPages === 0) throw new Error("manual.html enthält keine .page-Sektionen");

const launchArgs = ["--allow-file-access-from-files"];
if (executablePath)
  launchArgs.push("--no-sandbox", "--disable-setuid-sandbox", "--single-process");

const browser = await chromium.launch({
  headless: true,
  executablePath: executablePath || undefined,
  args: launchArgs,
});

try {
  const page = await browser.newPage();
  const pageErrors = [];
  page.on("pageerror", error => pageErrors.push(error.message));

  await page.goto(pathToFileURL(source).href, { waitUntil: "load" });

  // Bilder erst dekodieren lassen — sonst druckt Chromium leere Rahmen.
  const images = await page.evaluate(async () => {
    const all = [...document.images];
    await Promise.all(all.map(img => img.decode().catch(() => null)));
    return {
      total: all.length,
      broken: all.filter(img => !img.naturalWidth).map(img => img.getAttribute("src")),
      pages: document.querySelectorAll("section.page").length,
    };
  });
  if (images.broken.length) {
    throw new Error(`Screenshots fehlen: ${images.broken.join(", ")}`);
  }
  if (images.pages !== expectedPages) {
    throw new Error(`Seitenzahl weicht ab: DOM ${images.pages}, Markup ${expectedPages}`);
  }
  if (pageErrors.length) {
    throw new Error(`Rendering-Fehler: ${pageErrors.join(" | ")}`);
  }

  // preferCSSPageSize übernimmt @page { size: 210mm 297mm; margin: 0 } aus
  // manual.html; die Seitenränder liegen im Layout, nicht im Druckrahmen.
  await page.emulateMedia({ media: "print" });
  await page.pdf({
    path: target,
    printBackground: true,
    preferCSSPageSize: true,
    displayHeaderFooter: false,
  });

  const bytes = fs.statSync(target).size;
  if (bytes < 100000) throw new Error(`PDF wirkt leer (${bytes} Bytes)`);
  console.log(`ACIDIFY_Manual.pdf geschrieben: ${expectedPages} Seiten, ${(bytes / 1024 / 1024).toFixed(2)} MB`);
} finally {
  await browser.close();
}
