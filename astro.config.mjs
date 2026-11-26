import { postProcessHtmlForApex } from "./scripts/apex-postprocess.mjs";

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
