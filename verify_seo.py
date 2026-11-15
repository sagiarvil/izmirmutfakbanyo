import html
import json
import os
import re
import sys
import xml.etree.ElementTree as ET
from pathlib import Path
from urllib.parse import urlparse

ROOT = Path("/Users/macair1/projects/mutfak")
DOMAIN = "https://izmirmutfakbanyo.com.tr"

INDEXABLE_FILES = [
    "index.html", "mutfak.html", "banyo.html", "cam-balkon.html",
    "ev-tadilati.html", "kahve-kosesi.html", "modeller.html",
    "projeler.html", "hakkimizda.html", "iletisim.html", "yayinlar.html"
]

UTILITY_FILES = ["404.html", "offline.html"]

SLUG_MAP = {
    "/": "index.html",
    "/mutfak": "mutfak.html",
    "/banyo": "banyo.html",
    "/cam-balkon": "cam-balkon.html",
    "/ev-tadilati": "ev-tadilati.html",
    "/kahve-kosesi": "kahve-kosesi.html",
    "/modeller": "modeller.html",
    "/projeler": "projeler.html",
    "/hakkimizda": "hakkimizda.html",
    "/iletisim": "iletisim.html",
    "/yayinlar": "yayinlar.html"
}

def normalize_text(text: str) -> str:
    text = html.unescape(text)
    return re.sub(r'\s+', ' ', text).strip()

def strip_tags(text: str) -> str:
    text = re.sub(r'<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>', '', text, flags=re.I)
    text = re.sub(r'<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>', '', text, flags=re.I)
    text = re.sub(r'<[^>]+>', ' ', text)
    return normalize_text(text)

results = []

def run_gate(gate_id: str, title: str):
    class GateContext:
        def __init__(self, gid, t):
            self.gid = gid
            self.title = t
            self.errors = []
            self.warnings = []
        def error(self, msg):
            self.errors.append(msg)
        def warn(self, msg):
            self.warnings.append(msg)
        def finalize(self):
            passed = len(self.errors) == 0
            results.append((self.gid, self.title, passed, self.errors, self.warnings))
            status = "PASS" if passed else "FAIL"
            print(f"[{status}] {self.gid}: {self.title}")
            for e in self.errors:
                print(f"   [HATA] {e}")
            for w in self.warnings:
                print(f"   [UYARI] {w}")
            return passed
    return GateContext(gate_id, title)

# ==============================================================================
# S1: BOM ve Bağlantı / Görsel Bütünlüğü
# ==============================================================================
g = run_gate("S1", "BOM ve Dosya/Bağlantı Bütünlüğü")
# Check BOM on all files in root
for p in ROOT.rglob("*"):
    if not p.is_file():
        continue
    if any(part in (".git", "node_modules", ".gemini", "scratch") for part in p.parts):
        continue
    if p.suffix in (".html", ".css", ".js", ".json", ".xml", ".txt", ".md", ".webmanifest"):
        data = p.read_bytes()
        if data.startswith(b"\xef\xbb\xbf"):
            g.error(f"{p.relative_to(ROOT)} dosyasında UTF-8 BOM bulundu!")

# Build target file DOM IDs
file_ids = {}
file_contents = {}
for fn in INDEXABLE_FILES + UTILITY_FILES:
    fp = ROOT / fn
    if fp.exists():
        txt = fp.read_text(encoding="utf-8")
        file_contents[fn] = txt
        file_ids[fn] = set(re.findall(r'\bid=["\']([^"\']+)["\']', txt))

for fn in INDEXABLE_FILES + UTILITY_FILES:
    txt = file_contents.get(fn, "")
    clean_dom = re.sub(r"<(script|style)\b[^>]*>.*?</\1>", "", txt, flags=re.S | re.I)
    # Check internal hrefs
    for m in re.finditer(r'\bhref=["\']([^"\']+)["\']', clean_dom):
        href = m.group(1).strip()
        if not href or href.startswith(("#", "tel:", "mailto:", "javascript:", "data:")):
            if href.startswith("#") and len(href) > 1:
                target_id = href[1:]
                if target_id not in file_ids.get(fn, set()):
                    g.error(f"{fn}: Sayfa içi '#{target_id}' hedef ID'si bulunamadı!")
            continue
        if href.startswith(("http://", "https://")):
            if not href.startswith(DOMAIN):
                continue
            path_part = href[len(DOMAIN):]
        else:
            path_part = href

        # Split path and fragment/query
        parsed = urlparse(path_part)
        clean_path = parsed.path
        frag = parsed.fragment

        # Resolve to file
        target_file = None
        if clean_path in SLUG_MAP:
            target_file = SLUG_MAP[clean_path]
        elif clean_path.startswith("/") and (ROOT / clean_path.lstrip("/")).is_file():
            target_file = clean_path.lstrip("/")
        elif not clean_path.startswith("/") and (ROOT / clean_path).is_file():
            target_file = clean_path
        elif clean_path == "" and frag:
            target_file = fn

        if not target_file or not (ROOT / target_file).exists():
            g.error(f"{fn}: Kırık iç bağlantı tespit edildi: '{href}' -> '{clean_path}' bulunamadı!")
        elif frag and target_file in file_ids:
            if frag not in file_ids[target_file]:
                g.error(f"{fn}: '{target_file}' sayfasında '#{frag}' ID hedefi bulunamadı (href='{href}')!")

    # Check images (src, data-lightbox-src, data-img)
    for attr in ("src", "data-lightbox-src", "data-img"):
        for m in re.finditer(rf'\b{attr}=["\']([^"\']+)["\']', clean_dom):
            val = m.group(1).strip()
            if not val or val.startswith(("data:", "http://", "https://")):
                continue
            val_clean = val.split("?")[0].lstrip("/")
            if not (ROOT / val_clean).exists():
                g.error(f"{fn}: '{attr}=\"{val}\"' dosyası diskte fiziksel olarak mevcut değil!")
g.finalize()

# ==============================================================================
# S2: Başlık (Title) ve Tekil H1 Hiyerarşisi
# ==============================================================================
g = run_gate("S2", "Başlık (Title) ve H1 Hiyerarşisi")
seen_titles = {}
for fn in INDEXABLE_FILES:
    txt = file_contents.get(fn, "")
    clean_dom = re.sub(r"<(script|style)\b[^>]*>.*?</\1>", "", txt, flags=re.S | re.I)
    tm = re.search(r'<title>(.*?)</title>', txt, re.S)
    if not tm:
        g.error(f"{fn}: <title> etiketi eksik!")
    else:
        title = normalize_text(tm.group(1))
        tlen = len(title)
        if tlen < 30 or tlen > 70:
            g.error(f"{fn}: <title> uzunluğu {tlen} karakter (30-70 aralığında olmalı): '{title}'")
        if re.match(r'^(MODEL-\d|MOD-|COUNTER)', title, re.I):
            g.error(f"{fn}: <title> dahili stok/model koduyla başlayamaz: '{title}'")
        if title in seen_titles:
            g.error(f"{fn}: Yinelenen <title>! '{seen_titles[title]}' ile aynı: '{title}'")
        seen_titles[title] = fn

    # Check H1
    h1s = re.findall(r'<h1\b[^>]*>(.*?)</h1>', txt, re.S)
    if len(h1s) != 1:
        g.error(f"{fn}: Tam olarak 1 adet <h1> olmalıdır, {len(h1s)} adet bulundu!")
    else:
        h1_txt = normalize_text(h1s[0])
        if re.match(r'^(MODEL-\d|MOD-|COUNTER)', h1_txt, re.I):
            g.error(f"{fn}: <h1> dahili stok/model koduyla başlayamaz: '{h1_txt}'")

    # Heading hierarchy check
    headings = []
    # Strip script and style first
    no_scripts = re.sub(r'<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>', '', txt, flags=re.I)
    no_scripts = re.sub(r'<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>', '', no_scripts, flags=re.I)
    for m in re.finditer(r'<h([1-6])\b', no_scripts, re.I):
        headings.append(int(m.group(1)))
    for i in range(len(headings) - 1):
        curr_lvl = headings[i]
        next_lvl = headings[i + 1]
        if next_lvl > curr_lvl + 1:
            g.error(f"{fn}: Başlık seviye atlaması! <h{curr_lvl}> sonrasında doğrudan <h{next_lvl}> geldi.")
g.finalize()

# ==============================================================================
# S3: Meta Description Kalitesi
# ==============================================================================
g = run_gate("S3", "Meta Description Kalitesi")
seen_desc = {}
for fn in INDEXABLE_FILES:
    txt = file_contents.get(fn, "")
    clean_dom = re.sub(r"<(script|style)\b[^>]*>.*?</\1>", "", txt, flags=re.S | re.I)
    dm = re.search(r'<meta\s+name=["\']description["\']\s+content=["\']([^"\']+)["\']', txt, re.I)
    if not dm:
        dm = re.search(r'<meta\s+content=["\']([^"\']+)["\']\s+name=["\']description["\']', txt, re.I)
    if not dm:
        g.error(f"{fn}: <meta name=\"description\"> eksik!")
    else:
        desc = normalize_text(dm.group(1))
        dlen = len(desc)
        if dlen < 80 or dlen > 165:
            g.error(f"{fn}: Meta description uzunluğu {dlen} karakter (80-165 aralığında olmalı): '{desc}'")
        if desc.endswith(("...", "…")):
            g.error(f"{fn}: Meta description yarım kalamaz ('...' ile bitemez): '{desc}'")
        if desc in seen_desc:
            g.error(f"{fn}: Yinelenen meta description! '{seen_desc[desc]}' ile aynı.")
        seen_desc[desc] = fn
g.finalize()

# ==============================================================================
# S4: Kanonik, Sosyal Etiketler ve Yardımcı Sayfa Noindex
# ==============================================================================
g = run_gate("S4", "Kanonik ve Sosyal Etiketler")
for fn in INDEXABLE_FILES:
    txt = file_contents.get(fn, "")
    clean_dom = re.sub(r"<(script|style)\b[^>]*>.*?</\1>", "", txt, flags=re.S | re.I)
    # Canonical
    cm = re.search(r'<link\s+rel=["\']canonical["\']\s+href=["\']([^"\']+)["\']', txt, re.I)
    if not cm:
        cm = re.search(r'<link\s+href=["\']([^"\']+)["\']\s+rel=["\']canonical["\']', txt, re.I)
    if not cm:
        g.error(f"{fn}: Canonical etiketi eksik!")
    else:
        canon_href = cm.group(1)
        expected_slug = "/" if fn == "index.html" else f"/{fn.replace('.html', '')}"
        expected_url = f"{DOMAIN}{expected_slug}"
        if canon_href != expected_url:
            g.error(f"{fn}: Canonical URL '{canon_href}' beklenen '{expected_url}' ile eşleşmiyor!")

    # OG Image & Twitter Image
    og_m = re.search(r'<meta\s+property=["\']og:image["\']\s+content=["\']([^"\']+)["\']', txt, re.I)
    tw_m = re.search(r'<meta\s+name=["\']twitter:image["\']\s+content=["\']([^"\']+)["\']', txt, re.I)
    if not og_m:
        g.error(f"{fn}: og:image etiketi eksik!")
    else:
        og_u = og_m.group(1)
        if og_u.lower().endswith(".svg"):
            g.error(f"{fn}: og:image SVG olamaz! Raster format olmalıdır: {og_u}")
        rel_og = og_u.replace(DOMAIN, "").lstrip("/")
        if not (ROOT / rel_og).exists():
            g.error(f"{fn}: og:image dosyası '{rel_og}' diskte bulunamadı!")

    if not tw_m:
        g.error(f"{fn}: twitter:image etiketi eksik!")
    else:
        tw_u = tw_m.group(1)
        if tw_u.lower().endswith(".svg"):
            g.error(f"{fn}: twitter:image SVG olamaz!")

for ufn in UTILITY_FILES:
    txt = file_contents.get(ufn, "")
    rm = re.search(r'<meta\s+name=["\']robots["\']\s+content=["\']([^"\']+)["\']', txt, re.I)
    if not rm or "noindex" not in rm.group(1).lower():
        g.error(f"{ufn}: Yardımcı sayfada <meta name=\"robots\" content=\"noindex,follow\"> bulunmalıdır!")
g.finalize()

# ==============================================================================
# S5: BreadcrumbList Bütünlüğü
# ==============================================================================
g = run_gate("S5", "BreadcrumbList Bütünlüğü")
for fn in INDEXABLE_FILES:
    txt = file_contents.get(fn, "")
    clean_dom = re.sub(r"<(script|style)\b[^>]*>.*?</\1>", "", txt, flags=re.S | re.I)
    script_blocks = re.findall(r'<script\s+type=["\']application/ld\+json["\']>(.*?)</script>', txt, re.S)
    found_bc = False
    for sb in script_blocks:
        try:
            data = json.loads(sb)
        except Exception:
            continue
        items = data.get("@graph", [data]) if isinstance(data, dict) else []
        for it in items:
            if isinstance(it, dict) and it.get("@type") == "BreadcrumbList":
                found_bc = True
                elems = it.get("itemListElement", [])
                if not elems:
                    g.error(f"{fn}: BreadcrumbList boş!")
                for el in elems:
                    item_u = el.get("item")
                    if not item_u or not isinstance(item_u, str) or not item_u.startswith("https://"):
                        g.error(f"{fn}: BreadcrumbListItem geçerli bir HTTPS 'item' URL'si içermiyor: {el}")
    if not found_bc:
        g.error(f"{fn}: BreadcrumbList JSON-LD bulunamadı!")
g.finalize()

# ==============================================================================
# S6: Yapısal Veri (JSON-LD) Doğrulaması
# ==============================================================================
g = run_gate("S6", "JSON-LD Yapısal Veri Doğrulaması")
for fn in INDEXABLE_FILES:
    txt = file_contents.get(fn, "")
    clean_dom = re.sub(r"<(script|style)\b[^>]*>.*?</\1>", "", txt, flags=re.S | re.I)
    script_blocks = re.findall(r'<script\s+type=["\']application/ld\+json["\']>(.*?)</script>', txt, re.S)
    if not script_blocks:
        g.error(f"{fn}: JSON-LD script bloğu bulunamadı!")
    for sb in script_blocks:
        try:
            data = json.loads(sb)
        except Exception as e:
            g.error(f"{fn}: JSON-LD parse hatası: {e}")
            continue

        raw_str = json.dumps(data)
        if "wikidata.org" in raw_str:
            g.error(f"{fn}: Yasaklı sahte wikidata.org referansı bulundu!")
        if "kg:/" in raw_str:
            g.error(f"{fn}: Yasaklı sahte Google KG MID referansı bulundu!")
        if "aggregateRating" in raw_str or "aggregateRating" in data:
            g.error(f"{fn}: Yasaklı sahte aggregateRating tespit edildi!")
        if '"Review"' in raw_str:
            g.error(f"{fn}: Yasaklı sahte Review tespit edildi!")

        # Check Product without offers.price
        items = data.get("@graph", [data]) if isinstance(data, dict) else []
        for it in items:
            if isinstance(it, dict):
                t = it.get("@type")
                if t == "Product":
                    offers = it.get("offers", {})
                    if not offers or "price" not in offers:
                        g.error(f"{fn}: Fiyatsız çıplak Product şeması yasaktır (ItemPage + Service kullanılmalı)!")

                # Check logo / image is not SVG
                logo = it.get("logo")
                if isinstance(logo, str) and logo.lower().endswith(".svg"):
                    g.error(f"{fn}: JSON-LD logo SVG olamaz: {logo}")
                elif isinstance(logo, dict) and str(logo.get("url", "")).lower().endswith(".svg"):
                    g.error(f"{fn}: JSON-LD logo SVG olamaz: {logo.get('url')}")
g.finalize()

# ==============================================================================
# S7: FAQPage Birebir (Verbatim) Görünürlük Denetimi
# ==============================================================================
g = run_gate("S7", "FAQPage Birebir Görünürlük")
for fn in INDEXABLE_FILES:
    txt = file_contents.get(fn, "")
    clean_dom = re.sub(r"<(script|style)\b[^>]*>.*?</\1>", "", txt, flags=re.S | re.I)
    body_txt = strip_tags(txt)
    script_blocks = re.findall(r'<script\s+type=["\']application/ld\+json["\']>(.*?)</script>', txt, re.S)
    for sb in script_blocks:
        try:
            data = json.loads(sb)
        except Exception:
            continue
        items = data.get("@graph", [data]) if isinstance(data, dict) else []
        for it in items:
            if isinstance(it, dict) and it.get("@type") == "FAQPage":
                for q_obj in it.get("mainEntity", []):
                    q_name = normalize_text(q_obj.get("name", ""))
                    a_text = normalize_text(q_obj.get("acceptedAnswer", {}).get("text", ""))
                    if q_name not in body_txt:
                        g.error(f"{fn}: FAQ Sorusu sayfada görünür metinde bulunamadı: '{q_name}'")
                    if a_text not in body_txt:
                        g.error(f"{fn}: FAQ Cevabı sayfada görünür metinde bulunamadı: '{a_text}'")
g.finalize()

# ==============================================================================
# S8: XML Sitemap ve Image Sitemap Bütünlüğü
# ==============================================================================
g = run_gate("S8", "XML Sitemap ve Image Sitemap Bütünlüğü")
sitemap_path = ROOT / "sitemap.xml"
if not sitemap_path.exists():
    g.error("sitemap.xml dosyası mevcut değil!")
else:
    try:
        tree = ET.parse(str(sitemap_path))
        root_el = tree.getroot()
        ns = {"sm": "http://www.sitemaps.org/schemas/sitemap/0.9", "img": "http://www.google.com/schemas/sitemap-image/1.1"}
        url_els = root_el.findall("sm:url", ns)
        if len(url_els) != len(INDEXABLE_FILES):
            g.error(f"sitemap.xml içinde {len(url_els)} URL var, {len(INDEXABLE_FILES)} olmalıydı!")

        sitemap_locs = []
        for u in url_els:
            loc = u.find("sm:loc", ns)
            if loc is None or not loc.text:
                g.error("sitemap.xml: <loc> etiketi boş!")
                continue
            loc_url = loc.text.strip()
            sitemap_locs.append(loc_url)
            # Check image entries
            for i_el in u.findall("img:image", ns):
                iloc = i_el.find("img:loc", ns)
                if iloc is None or not iloc.text:
                    g.error(f"{loc_url}: <image:loc> boş!")
                    continue
                img_u = iloc.text.strip()
                if img_u.lower().endswith(".svg"):
                    g.error(f"{loc_url}: Image sitemap'te SVG yasaktır: {img_u}")
                rel_img = img_u.replace(DOMAIN, "").lstrip("/")
                if not (ROOT / rel_img).exists():
                    g.error(f"{loc_url}: Image sitemap'teki görsel diskte yok: {rel_img}")

        # Check no utility files
        for bad_slug in ("/404", "/offline", "/404.html", "/offline.html"):
            if f"{DOMAIN}{bad_slug}" in sitemap_locs:
                g.error(f"sitemap.xml içinde noindex yardımcı sayfa bulundu: {bad_slug}")

    except Exception as e:
        g.error(f"sitemap.xml XML parse hatası: {e}")
g.finalize()

# ==============================================================================
# S9: Web Root Hijyeni ve Dış Bağlantı Denetimi
# ==============================================================================
g = run_gate("S9", "Web Kök Dizini Hijyeni ve Dış Bağlantılar")
# Check junk files in root
for p in ROOT.iterdir():
    if p.name.startswith((".DS_Store", "Thumbs.db")):
        try:
            p.unlink()
            print(f"Silindi: {p.name}")
        except Exception:
            g.error(f"Kaldırılamayan çöp dosya: {p.name}")
    if p.is_file() and p.suffix in (".bak", ".tmp", ".swp", ".old"):
        g.error(f"Web kök dizininde geçici/yedek dosya bulundu: {p.name}")

# External links audit across all HTML
allowed_domains = {
    "wa.me", "api.whatsapp.com", "web.whatsapp.com", "linkedin.com", "www.linkedin.com",
    "google.com", "www.google.com", "maps.google.com", "cdnjs.cloudflare.com",
    "cdn.jsdelivr.net", "code.jquery.com", "fonts.googleapis.com", "fonts.gstatic.com"
}
for fn in INDEXABLE_FILES:
    txt = file_contents.get(fn, "")
    clean_dom = re.sub(r"<(script|style)\b[^>]*>.*?</\1>", "", txt, flags=re.S | re.I)
    for m in re.finditer(r'\bhref=["\'](https?://[^"\']+)["\']', clean_dom):
        u = m.group(1).strip()
        netloc = urlparse(u).netloc.lower()
        if netloc and not netloc.endswith("izmirmutfakbanyo.com.tr"):
            if not any(netloc == ad or netloc.endswith("." + ad) for ad in allowed_domains):
                g.error(f"{fn}: Yetkisiz/şüpheli dış bağlantı tespit edildi: {u}")
g.finalize()

# ==============================================================================
# S10: Görsel Boyutları (CLS = 0) ve LCP
# ==============================================================================
g = run_gate("S10", "Görsel Boyutları (CLS) ve LCP Önceliği")
for fn in INDEXABLE_FILES:
    txt = file_contents.get(fn, "")
    clean_dom = re.sub(r"<(script|style)\b[^>]*>.*?</\1>", "", txt, flags=re.S | re.I)
    # Check CSS overflow
    # Check all <img> tags
    imgs = list(re.finditer(r'<img\b[^>]*>', clean_dom))
    found_eager_lcp = False
    for im in imgs:
        tag = im.group(0)
        if "${" in tag:
            continue
        # width & height
        wm = re.search(r'\bwidth=["\'](\d+)["\']', tag)
        hm = re.search(r'\bheight=["\'](\d+)["\']', tag)
        if not wm or not hm:
            g.error(f"{fn}: <img> etiketinde sayısal width veya height eksik: {tag[:80]}")
        # alt
        alt_m = re.search(r'\balt=["\']([^"\']+)["\']', tag)
        if not alt_m or not alt_m.group(1).strip():
            g.error(f"{fn}: <img> etiketinde alt metni boş veya eksik: {tag[:80]}")

        if 'loading="eager"' in tag and 'fetchpriority="high"' in tag:
            found_eager_lcp = True

    if not found_eager_lcp:
        g.warn(f"{fn}: İlk ekran hero görselinde 'loading=\"eager\" fetchpriority=\"high\"' bulunamadı!")
g.finalize()

# Summary
print("\n" + "=" * 60)
total_pass = sum(1 for r in results if r[2])
print(f"SONUÇ: {total_pass}/{len(results)} Kapı Başarılı.")
if total_pass == len(results):
    print("TEBRİKLER! REAL-SEO-2026 10/10 KAPISI EKSİKSİZ GEÇTİ.")
    sys.exit(0)
else:
    print("LÜTFEN HATALARI GİDERİN.")
    sys.exit(1)
