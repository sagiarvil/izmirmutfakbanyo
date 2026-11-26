import { defineConfig } from "astro/config";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const SITE_ORIGIN = "https://yesilaymutfak.com";

function escapeXml(str) {
  return String(str || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function walkHtmlFiles(dir, acc = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walkHtmlFiles(full, acc);
    } else if (entry.isFile() && entry.name.endsWith(".html")) {
      acc.push(full);
    }
  }
  return acc;
}

function toTurkishSlug(text) {
  const trMap = { ç: "c", Ç: "c", ğ: "g", Ğ: "g", ı: "i", İ: "i", ö: "o", Ö: "o", ş: "s", Ş: "s", ü: "u", Ü: "u" };
  return String(text || "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&[a-z]+;/gi, " ")
    .replace(/[çÇğĞıİöÖşŞüÜ]/g, ch => trMap[ch] || ch)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64) || "bolum";
}

function postProcessHtmlForApex(html) {
  if (/http-equiv=["']refresh["']/i.test(html)) return html;
  const robotsMatch = html.match(/<meta\s+name=["']robots["']\s+content=["']([^"']*)["']/i);
  if (robotsMatch && /noindex/i.test(robotsMatch[1])) return html;

  const mainMatch = html.match(/<main\b[^>]*>[\s\S]*?<\/main>/i);
  if (!mainMatch) return html;

  let mainHtml = mainMatch[0];

  // 1. G054: Ensure every <h2> in <main> has a unique lowercase hyphenated id
  const h2Entries = [];
  const usedIds = new Set();
  mainHtml = mainHtml.replace(/<h2\b([^>]*)>([\s\S]*?)<\/h2>/gi, (full, attrs, inner) => {
    const label = inner.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
    const idMatch = attrs.match(/\bid=["']([^"']+)["']/i);
    let slug = idMatch ? toTurkishSlug(idMatch[1]) : toTurkishSlug(label);
    if (!slug || !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug)) slug = "bolum";
    let uniqueSlug = slug;
    let counter = 2;
    while (usedIds.has(uniqueSlug)) {
      uniqueSlug = `${slug}-${counter++}`;
    }
    usedIds.add(uniqueSlug);
    h2Entries.push({ id: uniqueSlug, label: label.slice(0, 52) });
    const cleanAttrs = attrs.replace(/\s*\bid=["'][^"']*["']/gi, "");
    return `<h2 id="${uniqueSlug}"${cleanAttrs}>${inner}</h2>`;
  });

  // 2. G055: Inject <nav aria-label="İçindekiler" data-toc="true"> AFTER </h1> (so it never pushes <h1> down on mobile)
  if (!/data-toc=["']true["']/i.test(mainHtml) && h2Entries.length > 0) {
    const tocLinks = h2Entries
      .slice(0, 5)
      .map(
        item =>
          `<a href="#${item.id}" class="inline-block px-2.5 py-1 rounded-md bg-white/90 text-[#15231C] border border-[#D2D2D7] hover:border-[#006039] hover:text-[#006039] transition">${escapeXml(item.label)}</a>`
      )
      .join(" ");
    const tocNav = `\n<nav aria-label="İçindekiler" data-toc="true" class="max-w-7xl mx-auto px-4 sm:px-8 py-3 my-4 flex flex-wrap items-center gap-2 text-[11px] font-semibold rounded-lg border border-[#E5DFD5] bg-[#FAF9F6]"><span class="uppercase tracking-wider text-[#6E675F] mr-1">Bu Sayfada:</span>${tocLinks}</nav>`;
    if (/<\/h1>/i.test(mainHtml)) {
      mainHtml = mainHtml.replace(/<\/h1>/i, `</h1>${tocNav}`);
    } else if (/<\/section>/i.test(mainHtml)) {
      mainHtml = mainHtml.replace(/<\/section>/i, `</section>${tocNav}`);
    }
  }

  // 3. G037, G038, G039: Image alt uniqueness/length, fetchpriority, lazy/async, srcset/sizes
  let firstContentImgSrc = null;
  let imgIndex = 0;
  const seenAlts = new Set();

  mainHtml = mainHtml.replace(/<img\b([^>]*)>/gi, (full, attrs) => {
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

    const isDecorative = /aria-hidden=["']true["']|role=["']presentation["']/i.test(attrs);
    if (!isDecorative) {
      // Fix alt text (G037): 10-125 chars, unique, no banned prefix
      const altMatch = newAttrs.match(/\balt=["']([^"']*)["']/i);
      let alt = altMatch ? altMatch[1].trim() : "Yeşilay Mutfak İzmir özel ölçü tasarım";
      if (/^(resim|görsel|image|foto|img)\b/i.test(alt) || alt.length < 10) {
        alt = `Yeşilay Mutfak ${alt}`.trim();
        if (alt.length < 10) alt = "Yeşilay Mutfak İzmir özel ölçü imalat modeli";
      }
      if (alt.length > 115) {
        alt = alt.slice(0, 112).trim();
      }
      let uniqueAlt = alt;
      let altCount = 2;
      while (seenAlts.has(uniqueAlt.toLowerCase())) {
        const suffix = ` (${altCount++})`;
        uniqueAlt = `${alt.slice(0, 125 - suffix.length).trim()}${suffix}`;
      }
      seenAlts.add(uniqueAlt.toLowerCase());
      if (altMatch) {
        newAttrs = newAttrs.replace(/\balt=["'][^"']*["']/i, `alt="${escapeXml(uniqueAlt)}"`);
      } else {
        newAttrs += ` alt="${escapeXml(uniqueAlt)}"`;
      }

      // Add srcset + sizes if missing (G039)
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

  let updatedHtml = html.replace(mainMatch[0], mainHtml);

  // Sync <head> <link rel="preload" as="image"> with exact first content image (G038)
  if (firstContentImgSrc) {
    updatedHtml = updatedHtml.replace(/<link\s+rel=["']preload["']\s+as=["']image["'][^>]*>/gi, "");
    updatedHtml = updatedHtml.replace(
      /<\/head>/i,
      `  <link rel="preload" as="image" href="${firstContentImgSrc}" fetchpriority="high" />\n</head>`
    );
  }

  return updatedHtml;
}

function realSeoSitemapIntegration() {
  return {
    name: "real-seo-2026-sitemap",
    hooks: {
      "astro:build:done": async ({ dir }) => {
        const distDir = fileURLToPath(dir);
        const rootDir = path.resolve(distDir, "..");

        // Eski çakışan sitemap dosyalarını temizle
        for (const stale of ["sitemap-index.xml", "sitemap-0.xml", "image-sitemap.xml"]) {
          const p = path.join(distDir, stale);
          if (fs.existsSync(p)) fs.unlinkSync(p);
        }

        // Katalog JSON verisinden ek görselleri yükle (/tasarimlar/ sayfası için)
        let extraCatalogImages = [];
        const tasarimlarJsonPath = path.join(rootDir, "src", "data", "tasarimlarData.json");
        if (fs.existsSync(tasarimlarJsonPath)) {
          try {
            const items = JSON.parse(fs.readFileSync(tasarimlarJsonPath, "utf-8"));
            extraCatalogImages = items
              .filter(it => it.img && /\.(webp|jpe?g|png|avif)$/i.test(it.img))
              .map(it => ({
                loc: `${SITE_ORIGIN}${it.img.startsWith("/") ? it.img : "/" + it.img}`,
                title: it.altText || it.seoTitle || it.title || "Yeşilay Mutfak Özel İmalat Modeli"
              }));
          } catch {
            // pass
          }
        }

        const htmlFiles = walkHtmlFiles(distDir).sort();
        for (const htmlFile of htmlFiles) {
          const origHtml = fs.readFileSync(htmlFile, "utf-8");
          const nextHtml = postProcessHtmlForApex(origHtml);
          if (nextHtml !== origHtml) {
            fs.writeFileSync(htmlFile, nextHtml, "utf-8");
          }
        }
        const urlEntries = [];
        const lastmod = new Date().toISOString().split("T")[0];

        for (const htmlFile of htmlFiles) {
          const html = fs.readFileSync(htmlFile, "utf-8");

          // Yönlendirme ve noindex sayfalarını kesin olarak dışla
          if (/http-equiv=["']refresh["']/i.test(html)) continue;
          const robotsMatch = html.match(/<meta\s+name=["']robots["']\s+content=["']([^"']*)["']/i);
          if (robotsMatch && /noindex/i.test(robotsMatch[1])) continue;

          const canonMatch = html.match(/<link\s+rel=["']canonical["']\s+href=["']([^"']+)["']/i);
          if (!canonMatch) continue;
          const loc = canonMatch[1].trim();
          if (!loc.startsWith(SITE_ORIGIN)) continue;

          // Sayfadaki gerçek raster ürün/proje görsellerini topla (.svg ve favicon/logo hariç)
          const imageMap = new Map();
          const imgRegex = /<img\b[^>]*>/gi;
          let match;
          while ((match = imgRegex.exec(html)) !== null) {
            const tag = match[0];
            const dataSrcMatch = tag.match(/\bdata-src=["']([^"']+)["']/i);
            const srcMatch = tag.match(/\bsrc=["']([^"']+)["']/i);
            const candidate = srcMatch && !srcMatch[1].trim().startsWith("data:")
              ? srcMatch[1]
              : dataSrcMatch
                ? dataSrcMatch[1]
                : null;
            if (!candidate) continue;
            let rawSrc = candidate.split("?")[0].trim();
            if (rawSrc.startsWith(SITE_ORIGIN)) {
              rawSrc = rawSrc.slice(SITE_ORIGIN.length);
            }
            if (!rawSrc.startsWith("/")) continue;
            if (!/\.(webp|jpe?g|png|avif)$/i.test(rawSrc)) continue;
            if (/^\/(favicon|apple-touch-icon|android-chrome|logo|yesilay-mutfak-logo|emblem)/i.test(rawSrc)) continue;

            const diskPath = path.join(distDir, rawSrc.replace(/^\//, ""));
            if (!fs.existsSync(diskPath)) continue;

            const altMatch = tag.match(/\balt=["']([^"']+)["']/i);
            const imgTitle = altMatch && altMatch[1].trim()
              ? altMatch[1].trim()
              : "Yeşilay Mutfak İzmir Özel Ölçü Tasarım";

            const absImgUrl = `${SITE_ORIGIN}${rawSrc}`;
            if (!imageMap.has(absImgUrl)) {
              imageMap.set(absImgUrl, imgTitle);
            }
          }

          if (loc === `${SITE_ORIGIN}/tasarimlar/`) {
            for (const extra of extraCatalogImages) {
              const relExtra = extra.loc.slice(SITE_ORIGIN.length);
              if (fs.existsSync(path.join(distDir, relExtra.replace(/^\//, ""))) && !imageMap.has(extra.loc)) {
                imageMap.set(extra.loc, extra.title);
              }
            }
          }

          urlEntries.push({
            loc,
            lastmod,
            images: Array.from(imageMap.entries()).map(([imgLoc, imgTitle]) => ({
              loc: imgLoc,
              title: imgTitle
            }))
          });
        }

        // Kanonik URL sırasına göre deterministik sırala (Ana sayfa en üstte)
        urlEntries.sort((a, b) => {
          if (a.loc === `${SITE_ORIGIN}/`) return -1;
          if (b.loc === `${SITE_ORIGIN}/`) return 1;
          return a.loc.localeCompare(b.loc, "tr");
        });

        let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
        xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n`;

        for (const entry of urlEntries) {
          xml += `  <url>\n`;
          xml += `    <loc>${escapeXml(entry.loc)}</loc>\n`;
          xml += `    <lastmod>${entry.lastmod}</lastmod>\n`;
          for (const img of entry.images) {
            xml += `    <image:image>\n`;
            xml += `      <image:loc>${escapeXml(img.loc)}</image:loc>\n`;
            xml += `      <image:title>${escapeXml(img.title)}</image:title>\n`;
            xml += `    </image:image>\n`;
          }
          xml += `  </url>\n`;
        }
        xml += `</urlset>\n`;

        fs.writeFileSync(path.join(distDir, "sitemap.xml"), xml, "utf-8");
        console.log(`[REAL-SEO-2026] dist/sitemap.xml üretildi (${urlEntries.length} kanonik URL).`);
      }
    }
  };
}

export default defineConfig({
  site: SITE_ORIGIN,
  output: "static",
  trailingSlash: "always",
  build: {
    format: "directory"
  },
  integrations: [realSeoSitemapIntegration()]
});
