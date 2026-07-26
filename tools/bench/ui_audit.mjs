import { createRequire } from "node:module";
import { pathToFileURL } from "node:url";
const require = createRequire(import.meta.url);
const { chromium } = require("playwright");

const browser = await chromium.launch({ headless: true, args: ["--allow-file-access-from-files"] });
const page = await browser.newPage({ viewport: { width: 1180, height: 580 } });
await page.goto(pathToFileURL("/home/user/ACIDIFY/mockup/preview.html").href);
await page.waitForSelector("acidify-patch-view .chassis", { state: "visible" });

const audit = await page.evaluate(() => {
  const srgb = c => { c /= 255; return c <= 0.03928 ? c/12.92 : Math.pow((c+0.055)/1.055, 2.4); };
  const lum = ([r,g,b]) => 0.2126*srgb(r)+0.7152*srgb(g)+0.0722*srgb(b);
  const parse = s => (s.match(/[\d.]+/g) || []).slice(0,3).map(Number);
  const ratio = (a,b) => { const [x,y]=[lum(a),lum(b)].sort((p,q)=>q-p); return (x+0.05)/(y+0.05); };

  // effektive Hintergrundfarbe durch die Elternkette suchen
  const bgOf = el => {
    let n = el;
    while (n && n !== document.documentElement) {
      const c = getComputedStyle(n).backgroundColor;
      if (c && !/rgba\(0, 0, 0, 0\)|transparent/.test(c)) return parse(c);
      n = n.parentElement;
    }
    return [10,10,12];
  };

  const textIssues = [], targetIssues = [];
  const seen = new Set();

  document.querySelectorAll("acidify-patch-view *").forEach(el => {
    const st = getComputedStyle(el);
    const r = el.getBoundingClientRect();
    if (!r.width || !r.height) return;

    // eigener Textknoten?
    const own = [...el.childNodes].some(n => n.nodeType === 3 && n.textContent.trim());
    if (own) {
      const fs = parseFloat(st.fontSize);
      const bold = parseInt(st.fontWeight) >= 700;
      const large = fs >= 24 || (fs >= 18.66 && bold);
      const cr = ratio(parse(st.color), bgOf(el));
      const need = large ? 3 : 4.5;
      const label = (el.textContent.trim().slice(0,28) || el.className);
      const key = label + "|" + Math.round(fs) + "|" + cr.toFixed(1);
      if (cr < need && !seen.has(key)) {
        seen.add(key);
        textIssues.push({ text: label, cls: String(el.className).slice(0,34),
                          px: +fs.toFixed(1), contrast: +cr.toFixed(2), need });
      }
    }

    // interaktive Elemente: Klickflaeche
    const interactive = el.matches("button, [role=button], [tabindex], .control, .sequence-step, .studio-cell, .pitch-key, [data-studio-action], [data-param]");
    if (interactive && r.width * r.height > 0) {
      if (r.width < 24 || r.height < 24) {
        targetIssues.push({ cls: String(el.className).slice(0,40),
                            w: Math.round(r.width), h: Math.round(r.height) });
      }
    }
  });

  const fontSizes = {};
  document.querySelectorAll("acidify-patch-view *").forEach(el => {
    const own = [...el.childNodes].some(n => n.nodeType === 3 && n.textContent.trim());
    if (!own) return;
    const fs = Math.round(parseFloat(getComputedStyle(el).fontSize)*10)/10;
    fontSizes[fs] = (fontSizes[fs]||0)+1;
  });

  return { textIssues, targetIssues, fontSizes,
           totalText: Object.values(fontSizes).reduce((a,b)=>a+b,0) };
});

console.log("### Schriftgrößen (px -> Anzahl Textknoten) ###");
console.log(Object.entries(audit.fontSizes).sort((a,b)=>a[0]-b[0])
  .map(([k,v]) => `${k}px: ${v}`).join("   "));
console.log(`\n### Kontrast unter WCAG-AA: ${audit.textIssues.length} Stellen ###`);
audit.textIssues.sort((a,b)=>a.contrast-b.contrast).slice(0,18)
  .forEach(i => console.log(`  ${String(i.contrast).padStart(5)}:1 (nötig ${i.need})  ${String(i.px).padStart(5)}px  "${i.text}"`));
const tgt = [...new Map(audit.targetIssues.map(t=>[t.cls+t.w+t.h,t])).values()];
console.log(`\n### Klickflächen unter 24x24 px: ${audit.targetIssues.length} Elemente (${tgt.length} Typen) ###`);
tgt.slice(0,12).forEach(t => console.log(`  ${t.w}x${t.h}  .${t.cls}`));

await browser.close();
