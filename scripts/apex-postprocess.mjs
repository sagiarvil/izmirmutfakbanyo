/**
 * REAL-SEO-2026 APEX v6.0 ABSOLUTE — Clean Astro Build-Time Postprocessor
 * Zero external dependencies. Preserves minimalist #FAF9F6 / #006039 aesthetic,
 * enforces container-wrapped unclipped TOC, capsule tagging, atomic H2 prose,
 * structured tables + Dataset schema, WebMCP forms, and CRO CTAs.
 */

const TR_MAP = {
  "ç": "c", "ğ": "g", "ı": "i", "ö": "o", "ş": "s", "ü": "u",
  "Ç": "c", "Ğ": "g", "İ": "i", "Ö": "o", "Ş": "s", "Ü": "u",
};

const SITE_ORIGIN = "https://yesilaymutfak.com";

function toTurkishSlug(text) {
  return String(text || "")
    .replace(/[çğıöşüÇĞİÖŞÜ]/g, (ch) => TR_MAP[ch] || ch)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-")
    .slice(0, 60)
    .replace(/-+$/, "");
}

function stripTags(html) {
  return String(html || "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function escapeHtml(text) {
  return String(text || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function wordCount(text) {
  return stripTags(text).split(/\s+/).filter(Boolean).length;
}

function ensureH2IdsAndCollect(mainHtml) {
  const entries = [];
  const used = new Set();
  const updatedMain = mainHtml.replace(/<h2\b([^>]*)>([\s\S]*?)<\/h2>/gi, (full, attrs, inner) => {
    const label = stripTags(inner);
    const idMatch = attrs.match(/\bid=["']([^"']+)["']/i);
    let slug = idMatch ? toTurkishSlug(idMatch[1]) : toTurkishSlug(label);
    if (!slug || !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug)) slug = "bolum";
    let unique = slug;
    let c = 2;
    while (used.has(unique)) {
      unique = `${slug}-${c++}`;
    }
    used.add(unique);
    const cleanAttrs = attrs.replace(/\s*\bid=["'][^"']*["']/gi, "");
    if (!/\bx-text=/i.test(attrs) && label && label !== "Lumina") {
      entries.push({ id: unique, label });
    }
    return `<h2 id="${unique}"${cleanAttrs}>${inner}</h2>`;
  });
  return { mainHtml: updatedMain, h2Entries: entries };
}

function normalizeImages(mainHtml) {
  let firstContentImgSrc = null;
  let imgIndex = 0;
  const seenAlts = new Set();

  const updatedMain = mainHtml.replace(/<img\b([^>]*)>/gi, (full, attrs) => {
    let newAttrs = attrs;
    const srcMatch = newAttrs.match(/\bsrc=["']([^"']+)["']/i);
    let src = srcMatch ? srcMatch[1].trim() : "";
    if (!src) return full;
    if (src.startsWith("data:")) {
      const dataSrcMatch = newAttrs.match(/\bdata-src=["']([^"']+)["']/i);
      if (dataSrcMatch && dataSrcMatch[1].trim()) {
        src = dataSrcMatch[1].trim();
        newAttrs = newAttrs.replace(/\bsrc=["'][^"']*["']/i, `src="${src}"`);
      } else {
        return full;
      }
    }

    const isLogo = /^\/(favicon|apple-touch-icon|logo|yesilay-mutfak-logo|emblem)/i.test(src) || /logo|emblem/i.test(attrs);
    const isDecorative = /aria-hidden=["']true["']|role=["']presentation["']/i.test(attrs);

    if (!isLogo && !isDecorative && src && !src.startsWith("data:") && !src.endsWith(".svg")) {
      const altMatch = newAttrs.match(/\balt=["']([^"']*)["']/i);
      let alt = altMatch ? altMatch[1].trim() : "Yeşilay Mutfak İzmir özel ölçü tasarım";
      if (/^(resim|görsel|image|foto|img)\b/i.test(alt) || alt.length < 10) {
        alt = `Yeşilay Mutfak ${alt}`.trim();
        if (alt.length < 10) alt = "Yeşilay Mutfak İzmir özel ölçü imalat modeli";
      }
      if (alt.length > 114) {
        alt = alt.slice(0, 112).replace(/\s+\S*$/, "").trim();
      }
      let uniqueAlt = alt;
      let altCounter = 2;
      while (seenAlts.has(uniqueAlt.toLowerCase())) {
        const suffix = ` (${altCounter++})`;
        uniqueAlt = `${alt.slice(0, 120 - suffix.length).trim()}${suffix}`;
      }
      seenAlts.add(uniqueAlt.toLowerCase());
      if (altMatch) {
        newAttrs = newAttrs.replace(/\balt=["'][^"']*["']/i, `alt="${escapeHtml(uniqueAlt)}"`);
      } else {
        newAttrs += ` alt="${escapeHtml(uniqueAlt)}"`;
      }

      if (!/\bsrcset=/i.test(newAttrs)) {
        newAttrs += ` srcset="${src} 1200w"`;
      }
      if (!/\bsizes=/i.test(newAttrs)) {
        newAttrs += ` sizes="(max-width: 768px) 100vw, 1080px"`;
      }

      if (imgIndex === 0) {
        firstContentImgSrc = src;
        newAttrs = newAttrs.replace(/\s*\bloading=["'][^"']*["']/gi, "");
        newAttrs = newAttrs.replace(/\s*\bfetchpriority=["'][^"']*["']/gi, "");
        newAttrs += ` fetchpriority="high"`;
        if (!/\bdecoding=/i.test(newAttrs)) newAttrs += ` decoding="sync"`;
      } else {
        newAttrs = newAttrs.replace(/\s*\bloading=["'][^"']*["']/gi, "");
        newAttrs = newAttrs.replace(/\s*\bdecoding=["'][^"']*["']/gi, "");
        newAttrs += ` loading="lazy" decoding="async"`;
      }
      imgIndex++;
    }

    return `<img${newAttrs}>`;
  });

  return { mainHtml: updatedMain, firstContentImgSrc };
}

function ensureAnswerCapsule(mainHtml, h1Title) {
  if (/data-answer-capsule=["']true["']/i.test(mainHtml)) return mainHtml;
  const h1EndIdx = mainHtml.search(/<\/h1>/i);
  if (h1EndIdx === -1) return mainHtml;

  const afterH1 = mainHtml.slice(h1EndIdx);
  const pRegex = /<p\b([^>]*)>([\s\S]*?)<\/p>/i;
  const pMatch = pRegex.exec(afterH1);
  if (pMatch) {
    const attrs = pMatch[1];
    let inner = pMatch[2];
    const cleanInner = stripTags(inner);
    const words = wordCount(cleanInner);
    if (!/^(bu|firmamız|şirketimiz|hizmetimiz|sitemiz|platformumuz|biz)\b/i.test(cleanInner)) {
      if (words < 25) {
        inner = `${inner.trim()} — ${h1Title} kapsamında İzmir Buca Adatepe atölyesinden 18 mm MDF-Lam, 10 yıl garanti ve ücretsiz 3D keşif ile sunulur.`;
      }
      const wc = wordCount(inner);
      if (wc >= 25 && wc <= 80) {
        const replaced = `<p data-answer-capsule="true"${attrs}>${inner}</p>`;
        return mainHtml.slice(0, h1EndIdx) + afterH1.replace(pMatch[0], replaced);
      }
    }
  }

  // Fallback: insert concise capsule right after </h1>
  const h1ClosePos = h1EndIdx + 5;
  const fallbackCapsule = `<p data-answer-capsule="true" style="margin-top:12px;font-size:14.5px;line-height:1.6;max-width:44rem;">${escapeHtml(h1Title)} projeleri İzmir Buca Adatepe atölyesinde 18 mm E1 MDF-Lam gövde, Blum frenli mekanizmalar ve 10 yıl gövde garantisiyle ücretsiz 3D rölöve sonrasında 20 iş gününde teslim edilir.</p>`;
  return mainHtml.slice(0, h1ClosePos) + fallbackCapsule + mainHtml.slice(h1ClosePos);
}

function ensureTechnicalTableIfMissing(mainHtml, h1Title) {
  const hasStructuredTable = /<table\b[\s\S]*?<thead\b[\s\S]*?<th\b[\s\S]*?<\/table>/i.test(mainHtml);
  if (hasStructuredTable) return mainHtml;

  const block = `
  <section class="py-12 bg-[#FAF9F6] border-t border-[#E5DFD5]">
    <div style="max-width:75rem;margin:0 auto;padding:0 16px;">
      <h2 id="teknik-uretim-ve-malzeme-standartlari" style="font-size:22px;font-weight:700;color:#15231C;margin:0 0 8px 0;">${escapeHtml(h1Title)} Teknik Üretim ve Teslim Standartları</h2>
      <p style="font-size:13.5px;color:#6E675F;margin:0 0 18px 0;line-height:1.6;">Buca Adatepe imalat atölyemizde her projede uygulanan standart gövde kalınlığı, donanım, garanti ve teslim süresi verileri aşağıda özetlenmiştir.</p>
      <div style="overflow-x:auto;background:#ffffff;border:1px solid #E5DFD5;">
        <table style="width:100%;border-collapse:collapse;text-align:left;font-size:13.5px;">
          <thead>
            <tr style="background:#15231C;color:#ffffff;">
              <th scope="col" style="padding:12px 14px;font-weight:600;">Teknik Kriter</th>
              <th scope="col" style="padding:12px 14px;font-weight:600;">Atölye Standardı</th>
              <th scope="col" style="padding:12px 14px;font-weight:600;">Süre ve Güvence</th>
            </tr>
          </thead>
          <tbody>
            <tr style="border-bottom:1px solid #E5DFD5;">
              <th scope="row" style="padding:12px 14px;font-weight:600;color:#15231C;">Gövde Malzemesi</th>
              <td style="padding:12px 14px;color:#4A443D;">18 mm çift yüz E1 neme dayanımlı MDF-Lam</td>
              <td style="padding:12px 14px;color:#006039;font-weight:600;">10 yıl yazılı gövde garantisi</td>
            </tr>
            <tr style="border-bottom:1px solid #E5DFD5;">
              <th scope="row" style="padding:12px 14px;font-weight:600;color:#15231C;">Donanım ve Mekanizma</th>
              <td style="padding:12px 14px;color:#4A443D;">Blum ve Hettich frenli sessiz ray sistemleri</td>
              <td style="padding:12px 14px;color:#006039;font-weight:600;">18 iş günü ortalama imalat</td>
            </tr>
            <tr>
              <th scope="row" style="padding:12px 14px;font-weight:600;color:#15231C;">Ölçü ve Rölöve</th>
              <td style="padding:12px 14px;color:#4A443D;">İzmir Buca Adatepe kadrolu mimar 3D lazer ölçüm</td>
              <td style="padding:12px 14px;color:#006039;font-weight:600;">28 yıl doğrudan üretici tecrübesi</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </section>`;

  const mainEndIdx = mainHtml.lastIndexOf("</main>");
  if (mainEndIdx === -1) return mainHtml;
  return mainHtml.slice(0, mainEndIdx) + block + "\n" + mainHtml.slice(mainEndIdx);
}

function ensureWebMcpAndInteractive(mainHtml, h1Title) {
  if (/data-seo-interactive=["']true["']/i.test(mainHtml) && /\btoolname=/i.test(mainHtml)) {
    return mainHtml;
  }
  const hasForm = /<form\b/i.test(mainHtml);
  if (hasForm) {
    let tagged = false;
    return mainHtml.replace(/<form\b([^>]*)>/i, (m, attrs) => {
      tagged = true;
      let next = attrs;
      if (!/data-seo-interactive=/i.test(next)) next += ` data-seo-interactive="true"`;
      if (!/\btoolname=/i.test(next)) next += ` toolname="yesilay-mutfak-kesif-talebi"`;
      if (!/\btooldescription=/i.test(next)) {
        next += ` tooldescription="${escapeHtml(h1Title)} için ücretsiz 3D rölöve ve ölçü talebi iletir."`;
      }
      return `<form${next}>`;
    });
  }

  const widget = `
  <section class="py-8 bg-[#FAF9F6] border-t border-[#E5DFD5]">
    <div style="max-width:75rem;margin:0 auto;padding:0 16px;">
      <form data-seo-interactive="true" toolname="yesilay-sure-hesaplayici" tooldescription="${escapeHtml(h1Title)} proje tipi ve metre uzunluğuna göre ortalama üretim süresini hesaplar." onsubmit="event.preventDefault();var m=parseFloat(this.querySelector('input[type=number]').value)||4;var s=this.querySelector('select').value;var days=s==='komple'?22:Math.max(12,Math.round(10+m*1.5));this.querySelector('[data-ym-out]').textContent='Tahmini teslim süresi: '+days+' iş günü · 18 mm MDF-Lam · 10 yıl garanti';" style="background:#ffffff;border:1px solid #E5DFD5;padding:16px 20px;display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:12px;">
        <div style="display:flex;flex-wrap:wrap;align-items:center;gap:10px;">
          <label style="font-size:12.5px;font-weight:700;color:#15231C;display:flex;align-items:center;gap:6px;">Proje Kapsamı:
            <select style="padding:6px 10px;border:1px solid #D0CAC0;background:#FAF9F6;color:#15231C;font-size:12.5px;">
              <option value="dolap">Özel Ölçü Dolap İmalatı</option>
              <option value="komple">Komple Tadilat ve Montaj</option>
            </select>
          </label>
          <label style="font-size:12.5px;font-weight:700;color:#15231C;display:flex;align-items:center;gap:6px;">Ölçü (Metre):
            <input type="number" min="2" max="20" value="4" style="width:68px;padding:6px 8px;border:1px solid #D0CAC0;background:#FAF9F6;color:#15231C;font-size:12.5px;" />
          </label>
        </div>
        <span data-ym-out="true" style="font-size:12.5px;font-weight:600;color:#006039;">Ortalama imalat süresi: 16 iş günü · 10 yıl garanti</span>
        <button type="submit" style="padding:8px 16px;background:#006039;color:#ffffff;border:none;font-size:12px;font-weight:700;cursor:pointer;text-transform:uppercase;letter-spacing:0.06em;">Süreyi Hesapla</button>
      </form>
    </div>
  </section>`;

  const mainEndIdx = mainHtml.lastIndexOf("</main>");
  if (mainEndIdx === -1) return mainHtml;
  return mainHtml.slice(0, mainEndIdx) + widget + "\n" + mainHtml.slice(mainEndIdx);
}

function ensureContainerToc(mainHtml, h2Entries) {
  let cleanMain = mainHtml.replace(/<nav\b[^>]*data-toc=["']true["'][^>]*>[\s\S]*?<\/nav>/gi, "");
  if (!h2Entries.length) return cleanMain;

  const pills = h2Entries
    .slice(0, 5)
    .map(
      (e) =>
        `<a href="#${e.id}" style="display:inline-block;padding:4px 12px;border-radius:999px;background:#ffffff;border:1px solid #E5DFD5;color:#15231C;font-weight:600;text-decoration:none;line-height:1.4;">${escapeHtml(e.label)}</a>`
    )
    .join("");

  const tocHtml = `<nav aria-label="İçindekiler" data-toc="true" style="border-bottom:1px solid #E5DFD5;background:#FAF9F6;padding:10px 0;"><div style="max-width:75rem;margin:0 auto;padding:0 16px;display:flex;flex-wrap:wrap;align-items:center;gap:8px;font-size:12.5px;"><span style="font-weight:700;color:#15231C;margin-right:4px;">Bu Sayfada:</span>${pills}</div></nav>`;

  // Place AFTER the <section> containing <h1> (never before hero/headline on mobile!)
  const h1Idx = cleanMain.search(/<h1\b/i);
  if (h1Idx !== -1) {
    const afterH1SectionClose = cleanMain.indexOf("</section>", h1Idx);
    if (afterH1SectionClose !== -1) {
      const pos = afterH1SectionClose + 10;
      return cleanMain.slice(0, pos) + "\n" + tocHtml + "\n" + cleanMain.slice(pos);
    }
  }
  const gridIdx = cleanMain.search(/<div\s+class=["']grid\b/i);
  if (gridIdx !== -1) {
    return cleanMain.slice(0, gridIdx) + tocHtml.replace(/padding:10px 0;/, "padding:10px 0;margin:8px 0;") + cleanMain.slice(gridIdx);
  }
  const h2Idx = cleanMain.search(/<h2\b/i);
  if (h2Idx !== -1) {
    return cleanMain.slice(0, h2Idx) + tocHtml + cleanMain.slice(h2Idx);
  }
  return cleanMain;
}

function ensureAtomicH2Paragraphs(mainHtml) {
  const h2Matches = Array.from(mainHtml.matchAll(/<h2\b([^>]*)>([\s\S]*?)<\/h2>/gi));
  if (!h2Matches.length) return mainHtml;

  let out = "";
  let cursor = 0;
  for (let i = 0; i < h2Matches.length; i++) {
    const m = h2Matches[i];
    const h2End = m.index + m[0].length;
    const nextStart = i + 1 < h2Matches.length ? h2Matches[i + 1].index : mainHtml.lastIndexOf("</main>");
    const segment = mainHtml.slice(h2End, nextStart);
    out += mainHtml.slice(cursor, h2End);

    if (!/\bx-text=/i.test(m[1])) {
      const pMatches = Array.from(segment.matchAll(/<p\b[^>]*>([\s\S]*?)<\/p>/gi));
      const hasAtomic = pMatches.some((pm) => wordCount(pm[1]) >= 12);
      if (!hasAtomic) {
        const label = stripTags(m[2]);
        const pHtml = `<p style="font-size:13.5px;color:#6E675F;margin:8px 0 14px 0;line-height:1.6;">${escapeHtml(label)} kapsamında Buca Adatepe tesisimizde 18 mm neme dayanımlı MDF gövde ve 10 yıl garanti standardı uygulanır.</p>`;
        out += pHtml;
      }
    }
    out += segment;
    cursor = nextStart;
  }
  out += mainHtml.slice(cursor);
  return out;
}

function ensureQuantUnitsAndCroCta(mainHtml, h1Title) {
  let updated = mainHtml;
  const fallbackMsg = encodeURIComponent(`Merhaba, ${h1Title} için ücretsiz 3D keşif ve teklif almak istiyorum.`);
  if (!/data-cro-cta=["']true["']/i.test(updated)) {
    // Prefer an existing wa.me link that already has ?text= query, otherwise enrich the first wa.me link with ?text=
    if (/<a\b[^>]*href=["'][^"']*wa\.me[^"']*\?[^"']*text=[^"']*["'][^>]*>/i.test(updated)) {
      updated = updated.replace(/<a\b([^>]*href=["'][^"']*wa\.me[^"']*\?[^"']*text=[^"']*["'][^>]*)>/i, '<a data-cro-cta="true"$1>');
    } else if (/<a\b[^>]*href=["']([^"']*wa\.me[^"']*)["']([^>]*)>/i.test(updated)) {
      updated = updated.replace(/<a\b([^>]*)href=["']([^"']*wa\.me[^"']*)["']([^>]*)>/i, (m, pre, href, post) => {
        const enriched = href.includes("?") ? `${href}&text=${fallbackMsg}` : `${href}?text=${fallbackMsg}`;
        return `<a data-cro-cta="true"${pre}href="${enriched}"${post}>`;
      });
    }
  }
  if (!/data-cro-cta=["']true["']/i.test(updated)) {
    const ctaHtml = `<div style="max-width:75rem;margin:0 auto;padding:0 16px 16px 16px;"><a data-cro-cta="true" href="https://wa.me/905324261788?text=${fallbackMsg}" target="_blank" rel="noopener noreferrer" style="display:inline-flex;align-items:center;gap:8px;padding:11px 22px;background:#006039;color:#ffffff;font-size:12.5px;font-weight:700;text-decoration:none;letter-spacing:0.04em;">${escapeHtml(h1Title)} İçin Ücretsiz 3D Keşif &amp; Teklif Al →</a></div>`;
    const mainEndIdx = updated.lastIndexOf("</main>");
    if (mainEndIdx !== -1) {
      updated = updated.slice(0, mainEndIdx) + ctaHtml + updated.slice(mainEndIdx);
    }
  }

  const quantRegex = /\b\d+(?:[.,]\d+)?\s*(?:ms|sn|dk|dakika|saat|gün|ay|yıl|tl|usd|eur|adet|mb|gb|kw|mm|cm|kg|ton|kişi|sayfa)\b/gi;
  const plain = stripTags(updated);
  const count = (plain.match(quantRegex) || []).length;
  if (count < 3) {
    const note = `<div style="max-width:75rem;margin:0 auto;padding:8px 16px 16px 16px;font-size:12.5px;color:#6E675F;">Ölçü ve standartlar: 18 mm E1 MDF-Lam gövde · 10 yıl garanti · 20 gün ortalama teslim · 28 yıl atölye tecrübesi (${escapeHtml(h1Title)}).</div>`;
    const mainEndIdx = updated.lastIndexOf("</main>");
    if (mainEndIdx !== -1) {
      updated = updated.slice(0, mainEndIdx) + note + updated.slice(mainEndIdx);
    }
  }
  return updated;
}

function ensureDatasetInJsonLd(html, h1Title, canonicalUrl) {
  if (!/<table\b/i.test(html)) return html;
  return html.replace(/<script\s+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi, (m, jsonText) => {
    try {
      const data = JSON.parse(jsonText);
      const graph = data["@graph"];
      if (Array.isArray(graph) && !graph.some((n) => n && n["@type"] === "Dataset")) {
        graph.push({
          "@type": "Dataset",
          "@id": `${canonicalUrl}#dataset`,
          "name": `${h1Title} Teknik Ölçü ve Üretim Standartları Veri Kümesi`,
          "description": `${h1Title} için İzmir Buca Adatepe atölyesi 18 mm MDF-Lam gövde, Blum mekanizma, 10 yıl garanti ve teslim süresi verilerini içeren standart tablosu.`,
          "creator": { "@id": `${SITE_ORIGIN}/#organization` },
          "license": "https://creativecommons.org/licenses/by/4.0/",
        });
        return `<script type="application/ld+json">${JSON.stringify(data)}</script>`;
      }
    } catch {
      // ignore non-standard script
    }
    return m;
  });
}

export function postProcessHtmlForApex(html) {
  if (/http-equiv=["']refresh["']/i.test(html)) return html;
  const robotsMatch = html.match(/<meta\s+name=["']robots["']\s+content=["']([^"']*)["']/i);
  if (robotsMatch && /noindex/i.test(robotsMatch[1])) return html;

  const mainMatch = html.match(/<main\b[^>]*>[\s\S]*?<\/main>/i);
  if (!mainMatch) return html;

  const h1Match = mainMatch[0].match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/i);
  const h1Title = h1Match ? stripTags(h1Match[1]) : "Yeşilay Mutfak İzmir";
  const canonMatch = html.match(/<link\s+rel=["']canonical["']\s+href=["']([^"']+)["']/i);
  const canonicalUrl = canonMatch ? canonMatch[1].trim() : `${SITE_ORIGIN}/`;

  let mainHtml = mainMatch[0];
  mainHtml = ensureTechnicalTableIfMissing(mainHtml, h1Title);
  mainHtml = ensureWebMcpAndInteractive(mainHtml, h1Title);
  mainHtml = ensureAnswerCapsule(mainHtml, h1Title);

  const h2Res = ensureH2IdsAndCollect(mainHtml);
  mainHtml = h2Res.mainHtml;
  mainHtml = ensureAtomicH2Paragraphs(mainHtml);
  mainHtml = ensureContainerToc(mainHtml, h2Res.h2Entries);
  mainHtml = ensureQuantUnitsAndCroCta(mainHtml, h1Title);

  const imgRes = normalizeImages(mainHtml);
  mainHtml = imgRes.mainHtml;

  let updatedHtml = html.replace(mainMatch[0], mainHtml);
  updatedHtml = ensureDatasetInJsonLd(updatedHtml, h1Title, canonicalUrl);

  if (imgRes.firstContentImgSrc) {
    updatedHtml = updatedHtml.replace(/<link\s+rel=["']preload["']\s+as=["']image["'][^>]*>/gi, "");
    updatedHtml = updatedHtml.replace(
      /<\/head>/i,
      `  <link rel="preload" as="image" href="${imgRes.firstContentImgSrc}" fetchpriority="high" />\n</head>`
    );
  }

  return updatedHtml;
}
