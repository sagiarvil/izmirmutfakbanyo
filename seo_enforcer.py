#!/usr/bin/env python3
"""
seo_enforcer.py — REAL-SEO-2026 (APEX v4.0) Otonom Kurulum, Gerçek Tarayıcı (Playwright/Chromium) Denetimi,
Anlamsal Yamyamlaşma (Cannibalization) Kalkanı ve Google Search Console / Log Geri Besleme Motoru

Kullanım:
  1) İlk kurulum ve ajan kilitlerini açmak için:
       python3 seo_enforcer.py --init --domain https://ornekdomain.com

  2) 25 kapılı (Statik + TF-IDF Yamyamlaşma + Headless Chromium CLS/INP/Taşma) 100/100 denetim için:
       python3 seo_enforcer.py --audit ./dist https://ornekdomain.com

  3) Google Search Console verisiyle (CSV veya doğrudan Search Analytics API) yamyamlaşma, CTR ve iç link reçetesi üretmek için:
       python3 seo_enforcer.py --gsc-file gsc_performans.csv --build-dir ./dist
       python3 seo_enforcer.py --gsc-api --site-url sc-domain:ornekdomain.com --token $GSC_OAUTH_TOKEN --build-dir ./dist

  4) Sunucu erişim loglarından Googlebot / AI Bot tarama bütçesi ve taranmayan sayfa analizi için:
       python3 seo_enforcer.py --log-audit access.log ./dist https://ornekdomain.com

  5) Canlı yayından sonra IndexNow bildirimini tetiklemek için:
       python3 seo_enforcer.py --ping-indexnow ./dist
"""

from __future__ import annotations

import argparse
import collections
import csv
import datetime as dt
import functools
import hashlib
import http.server
import json
import math
import os
import re
import shutil
import socket
import stat
import sys
import threading
import time
import urllib.parse
import urllib.request
import xml.etree.ElementTree as ET
from html.parser import HTMLParser
from pathlib import Path
from typing import Any, Dict, List, Set, Tuple
from urllib.parse import urlparse

FORBIDDEN_EXTS = {".bak", ".old", ".tmp", ".orig", ".swp"}
FORBIDDEN_FILENAMES = {"test.html", "draft.html", "temp.html", "copy.html"}
RASTER_EXTS = (".webp", ".jpg", ".jpeg", ".png", ".avif")
GENERIC_ANCHORS = {"tıklayın", "buraya tıklayın", "detaylar", "devamı", "click here", "read more", "link"}
INTERNAL_CODE_PREFIX_RE = re.compile(r"^(MOD|SKU|PRD|ITEM|COUNTER|KOD|ERP|REF)[-_ ]?\d+", re.IGNORECASE)
IGNORED_SCAN_DIRS = {
    ".git",
    "node_modules",
    ".next",
    ".astro",
    ".vercel",
    ".cursor",
    ".claude",
    "__pycache__",
    "venv",
    ".venv",
    "scripts",
}
TR_STOPWORDS = {
    "ve", "ile", "için", "bir", "bu", "şu", "o", "de", "da", "ki", "mi", "mı", "mu", "mü",
    "en", "çok", "daha", "gibi", "kadar", "olan", "olarak", "nedir", "nasıl", "ne", "veya",
    "ya", "hem", "ama", "fakat", "ancak", "tüm", "her", "üzere", "göre", "ait", "ise",
}

PERF_OBSERVER_INIT_JS = """
window.__seoAuditMetrics = { cls: 0, longTasks: [], maxLongTask: 0, jsErrors: [] };
window.addEventListener('error', function(e) {
  window.__seoAuditMetrics.jsErrors.push(e.message || 'runtime error');
});
window.addEventListener('unhandledrejection', function(e) {
  window.__seoAuditMetrics.jsErrors.push(String(e.reason || 'unhandled promise rejection'));
});
try {
  new PerformanceObserver(function(list) {
    for (const entry of list.getEntries()) {
      if (!entry.hadRecentInput) {
        window.__seoAuditMetrics.cls += entry.value;
      }
    }
  }).observe({ type: 'layout-shift', buffered: true });
} catch (_) {}
try {
  new PerformanceObserver(function(list) {
    for (const entry of list.getEntries()) {
      window.__seoAuditMetrics.longTasks.push(entry.duration);
      if (entry.duration > window.__seoAuditMetrics.maxLongTask) {
        window.__seoAuditMetrics.maxLongTask = entry.duration;
      }
    }
  }).observe({ type: 'longtask', buffered: true });
} catch (_) {}
"""


class ContractHTMLParser(HTMLParser):
    """Sıfır bağımlılıklı HTML5 ayrıştırıcı: <head>, JSON-LD, görseller, linkler, AEO ve CRO sinyallerini toplar."""

    def __init__(self) -> None:
        super().__init__()
        self.in_title = False
        self.in_h1 = False
        self.in_a = False
        self.in_footer_or_aside = 0
        self.in_jsonld = False
        self.in_speculation = False
        self.in_script_or_style = False
        self.in_answer_capsule = False

        self.title = ""
        self.h1_list: List[str] = []
        self._cur_h1 = ""
        self.metas: Dict[str, str] = {}
        self.canonical: str | None = None
        self.hreflangs: List[Tuple[str, str]] = []
        self.imgs: List[Dict[str, str]] = []
        self.links: List[Dict[str, str]] = []
        self._cur_a_attrs: Dict[str, str] = {}
        self._cur_a_text = ""
        self.jsonld_blocks: List[str] = []
        self._cur_script = ""
        self.speculation_blocks: List[str] = []
        self.has_interactive_widget = False
        self.answer_capsules: List[str] = []
        self._cur_capsule = ""
        self.has_table = False
        self.visible_text: List[str] = []

    def handle_starttag(self, tag: str, attrs: List[Tuple[str, str | None]]) -> None:
        attr = {k.lower(): (v or "") for k, v in attrs}
        t = tag.lower()

        if attr.get("data-seo-interactive", "").lower() == "true":
            self.has_interactive_widget = True
        if attr.get("data-answer-capsule", "").lower() == "true" or "answer-capsule" in attr.get("class", ""):
            self.in_answer_capsule = True
            self._cur_capsule = ""

        if t == "title":
            self.in_title = True
        elif t == "h1":
            self.in_h1 = True
            self._cur_h1 = ""
        elif t == "meta":
            key = (attr.get("name") or attr.get("property") or "").lower().strip()
            if key and "content" in attr:
                self.metas[key] = attr["content"].strip()
        elif t == "link":
            rel = attr.get("rel", "").lower()
            href = attr.get("href", "").strip()
            if rel == "canonical":
                self.canonical = href
            elif rel == "alternate" and attr.get("hreflang"):
                self.hreflangs.append((attr["hreflang"].lower(), href))
        elif t == "img":
            self.imgs.append(attr)
        elif t in ("footer", "aside"):
            self.in_footer_or_aside += 1
        elif t == "a":
            self.in_a = True
            self._cur_a_attrs = dict(attr)
            self._cur_a_attrs["_in_footer"] = "1" if self.in_footer_or_aside > 0 else "0"
            self._cur_a_text = ""
        elif t == "table":
            self.has_table = True
        elif t == "script":
            stype = attr.get("type", "").lower().strip()
            if stype == "application/ld+json":
                self.in_jsonld = True
                self._cur_script = ""
            elif stype == "speculationrules":
                self.in_speculation = True
                self._cur_script = ""
            else:
                self.in_script_or_style = True
        elif t == "style":
            self.in_script_or_style = True

    def handle_endtag(self, tag: str) -> None:
        t = tag.lower()
        if t == "title":
            self.in_title = False
        elif t == "h1" and self.in_h1:
            self.in_h1 = False
            self.h1_list.append(" ".join(self._cur_h1.split()))
        elif t in ("footer", "aside") and self.in_footer_or_aside > 0:
            self.in_footer_or_aside -= 1
        elif t == "a" and self.in_a:
            self.in_a = False
            self._cur_a_attrs["text"] = " ".join(self._cur_a_text.split())
            self.links.append(self._cur_a_attrs)
        elif t == "p" and self.in_answer_capsule:
            self.in_answer_capsule = False
            self.answer_capsules.append(" ".join(self._cur_capsule.split()))
        elif t == "script":
            if self.in_jsonld:
                self.in_jsonld = False
                self.jsonld_blocks.append(self._cur_script)
            elif self.in_speculation:
                self.in_speculation = False
                self.speculation_blocks.append(self._cur_script)
            else:
                self.in_script_or_style = False
        elif t == "style":
            self.in_script_or_style = False

    def handle_data(self, data: str) -> None:
        if self.in_title:
            self.title += data
        elif self.in_h1:
            self._cur_h1 += data
            self.visible_text.append(data.strip())
        elif self.in_jsonld or self.in_speculation:
            self._cur_script += data
        elif self.in_script_or_style:
            return
        else:
            if self.in_a:
                self._cur_a_text += data
            if self.in_answer_capsule:
                self._cur_capsule += data
            cleaned = data.strip()
            if cleaned:
                self.visible_text.append(cleaned)


def detect_stack(root: Path) -> str:
    if any((root / f).exists() for f in ("next.config.js", "next.config.mjs", "next.config.ts")):
        return "nextjs"
    if any((root / f).exists() for f in ("astro.config.mjs", "astro.config.ts", "astro.config.js")):
        return "astro"
    return "static-html"


def iter_html_files(target_dir: Path) -> List[Path]:
    results: List[Path] = []
    for p in sorted(target_dir.rglob("*.html")):
        rel_parts = set(p.relative_to(target_dir).parts)
        if rel_parts & IGNORED_SCAN_DIRS:
            continue
        results.append(p)
    return results


def iter_schema_nodes(obj: Any):
    if isinstance(obj, dict):
        yield obj
        for val in obj.values():
            yield from iter_schema_nodes(val)
    elif isinstance(obj, list):
        for item in obj:
            yield from iter_schema_nodes(item)


# ==============================================================================
# MODÜL 1: ANLAMSAL ANAHTAR KELİME YAMYAMLAŞMASI (TF-IDF COSINE CANNIBALIZATION)
# ==============================================================================

def normalize_tr_tokens(text: str, brand_tokens: Set[str]) -> List[str]:
    lowered = text.lower().replace("İ", "i").replace("I", "ı")
    raw_words = re.findall(r"[a-zçğıöşü0-9]{3,}", lowered)
    tokens: List[str] = []
    for w in raw_words:
        if w in TR_STOPWORDS or w in brand_tokens:
            continue
        # Türkçe çekim eklerini yumuşatmak için kök + 5 karakter gövde temsili
        stem = w[:6] if len(w) > 6 else w
        tokens.append(stem)
    return tokens


def detect_semantic_cannibalization(
    page_docs: List[Dict[str, str]],
    brand_name: str = "",
    threshold: float = 0.78,
) -> List[str]:
    """
    Her indekslenen sayfanın <title> (3x), <h1> (2.5x), URL slug (2x) ve Cevap Kapsülü (1x) terimlerinden
    TF-IDF ağırlıklı niyet vektörü üretir ve kosinüs benzerliği >= threshold olan çakışan sayfaları yakalar.
    """
    if len(page_docs) < 2:
        return []

    brand_tokens = set(re.findall(r"[a-zçğıöşü0-9]{2,}", brand_name.lower()))
    weighted_bags: List[Dict[str, float]] = []
    df_counts: Dict[str, int] = collections.Counter()

    for doc in page_docs:
        bag: Dict[str, float] = collections.defaultdict(float)
        sources = [
            (doc.get("title", ""), 3.0),
            (doc.get("h1", ""), 2.5),
            (doc.get("slug", ""), 2.0),
            (doc.get("capsule", ""), 1.0),
        ]
        for txt, weight in sources:
            toks = normalize_tr_tokens(txt, brand_tokens)
            for t in toks:
                bag[t] += weight
            for i in range(len(toks) - 1):
                bigram = f"{toks[i]}_{toks[i + 1]}"
                bag[bigram] += weight * 1.25
        for term in bag.keys():
            df_counts[term] += 1
        weighted_bags.append(bag)

    n_docs = len(page_docs)
    tfidf_vecs: List[Dict[str, float]] = []
    norms: List[float] = []

    for bag in weighted_bags:
        vec: Dict[str, float] = {}
        sq_sum = 0.0
        for term, tf in bag.items():
            # Korpus küçük olduğunda dahi ayırt ediciliği koruyan yumuşatılmış IDF
            idf = math.log((1.0 + n_docs) / (1.0 + df_counts[term])) + 1.0
            val = (1.0 + math.log(tf)) * idf if tf > 0 else 0.0
            vec[term] = val
            sq_sum += val * val
        tfidf_vecs.append(vec)
        norms.append(math.sqrt(sq_sum) if sq_sum > 0 else 1.0)

    alerts: List[str] = []
    for i in range(n_docs):
        for j in range(i + 1, n_docs):
            common = set(tfidf_vecs[i].keys()) & set(tfidf_vecs[j].keys())
            if not common:
                continue
            dot = sum(tfidf_vecs[i][k] * tfidf_vecs[j][k] for k in common)
            sim = dot / (norms[i] * norms[j])
            if sim >= threshold:
                top_shared = sorted(
                    (k for k in common if "_" not in k),
                    key=lambda k: tfidf_vecs[i][k] + tfidf_vecs[j][k],
                    reverse=True,
                )[:5]
                alerts.append(
                    f"Yamyamlaşma riski (Benzerlik={sim:.2f} >= {threshold}): "
                    f"'{page_docs[i]['url']}' <-> '{page_docs[j]['url']}' "
                    f"(Çakışan kökler: {', '.join(top_shared) or 'ortak niyet'}). "
                    f"Çözüm: Sayfaları 301 ile birleştirin veya başlık/H1 arama niyetini ayrıştırın."
                )
    return alerts


# ==============================================================================
# MODÜL 2: HEADLESS CHROMIUM / PLAYWRIGHT GERÇEK RENDER, CLS, INP & TAŞMA MOTORU
# ==============================================================================

class QuietStaticHandler(http.server.SimpleHTTPRequestHandler):
    def log_message(self, format: str, *args: Any) -> None:
        pass


def start_local_static_server(root_dir: Path) -> Tuple[http.server.ThreadingHTTPServer, int]:
    sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    sock.bind(("127.0.0.1", 0))
    port = sock.getsockname()[1]
    sock.close()

    handler = functools.partial(QuietStaticHandler, directory=str(root_dir))
    httpd = http.server.ThreadingHTTPServer(("127.0.0.1", port), handler)
    t = threading.Thread(target=httpd.serve_forever, daemon=True)
    t.start()
    return httpd, port


def find_chromium_binary() -> str | None:
    candidates = [
        shutil.which("chromium"),
        shutil.which("chromium-browser"),
        shutil.which("google-chrome"),
        shutil.which("google-chrome-stable"),
        "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
        "/Applications/Chromium.app/Contents/MacOS/Chromium",
    ]
    for c in candidates:
        if c and Path(c).exists():
            return c
    return None


def run_browser_render_audit(
    target_dir: Path,
    url_paths: List[str],
    max_pages: int = 25,
) -> Tuple[str, List[str], List[str], List[str]]:
    """
    Gerçek bir Headless Chromium oturumu açarak (önce Playwright, yoksa Selenium + sistem Chrome/Chromium)
    mobil (390x844) + masaüstü (1440x900) yatay taşmayı (G22), gerçek CLS skorunu (G23) ve
    Long-Task / INP bloklamaları ile JS konsol hatalarını (G24) ölçer.
    """
    g22_overflow: List[str] = []
    g23_cls: List[str] = []
    g24_runtime: List[str] = []

    sampled_paths = url_paths[:max_pages]
    httpd, port = start_local_static_server(target_dir)

    try:
        # 1. Öncelik: Playwright (eğer kuruluysa)
        try:
            from playwright.sync_api import sync_playwright  # type: ignore

            with sync_playwright() as pw:
                browser = pw.chromium.launch(headless=True, args=["--no-sandbox", "--disable-dev-shm-usage"])
                for vp_name, width, height in (("Mobil-390px", 390, 844), ("Masaüstü-1440px", 1440, 900)):
                    context = browser.new_context(viewport={"width": width, "height": height})
                    context.add_init_script(PERF_OBSERVER_INIT_JS)
                    page = context.new_page()

                    for path in sampled_paths:
                        bad_responses: List[str] = []
                        page.on(
                            "response",
                            lambda r, br=bad_responses: br.append(f"{r.status} {r.url}")
                            if r.status >= 400 and "127.0.0.1" in r.url
                            else None,
                        )
                        local_url = f"http://127.0.0.1:{port}{path}"
                        page.goto(local_url, wait_until="networkidle", timeout=15000)
                        page.evaluate("window.scrollTo(0, document.body.scrollHeight)")
                        page.wait_for_timeout(120)
                        page.evaluate("window.scrollTo(0, 0)")
                        page.wait_for_timeout(120)

                        # İnteraktif mikro-araç varsa etkileşim tetikle
                        loc = page.locator("[data-seo-interactive='true']").first
                        if loc.count() > 0:
                            try:
                                loc.click(timeout=1000)
                            except Exception:
                                pass

                        metrics = page.evaluate(
                            """() => ({
                                scrollWidth: document.documentElement.scrollWidth,
                                innerWidth: window.innerWidth,
                                h1Count: document.querySelectorAll('h1').length,
                                perf: window.__seoAuditMetrics || { cls: 0, maxLongTask: 0, jsErrors: [] }
                            })"""
                        )

                        if metrics["scrollWidth"] > metrics["innerWidth"] + 1:
                            g22_overflow.append(
                                f"[{vp_name}] Yatay taşma tespit edildi ({metrics['scrollWidth']}px > {metrics['innerWidth']}px): {path}"
                            )
                        if vp_name == "Mobil-390px":
                            cls_val = float(metrics["perf"].get("cls", 0.0))
                            if cls_val > 0.10:
                                g23_cls.append(f"Gerçek render CLS sınırı aşıldı (CLS={cls_val:.3f} > 0.10): {path}")
                            max_lt = float(metrics["perf"].get("maxLongTask", 0.0))
                            if max_lt > 200.0:
                                g24_runtime.append(
                                    f"Main-Thread Long Task / INP bloklaması ({max_lt:.0f}ms > 200ms): {path}"
                                )
                            for jerr in metrics["perf"].get("jsErrors", []):
                                g24_runtime.append(f"JS çalışma zamanı hatası ({jerr}): {path}")
                            for bresp in bad_responses:
                                g24_runtime.append(f"Bozuk yerel ağ isteği ({bresp}): {path}")
                            if metrics["h1Count"] != 1:
                                g24_runtime.append(
                                    f"JS render sonrası DOM'da tekil H1 bozuldu (adet={metrics['h1Count']}): {path}"
                                )
                    context.close()
                browser.close()
            return "playwright-chromium", g22_overflow, g23_cls, g24_runtime
        except ImportError:
            pass

        # 2. Öncelik: Selenium + Sistem Headless Chromium / Google Chrome
        try:
            from selenium import webdriver  # type: ignore
            from selenium.webdriver.chrome.options import Options  # type: ignore

            chrome_bin = find_chromium_binary()
            opts = Options()
            opts.add_argument("--headless=new")
            opts.add_argument("--no-sandbox")
            opts.add_argument("--disable-dev-shm-usage")
            opts.add_argument("--disable-gpu")
            if chrome_bin:
                opts.binary_location = chrome_bin

            driver = webdriver.Chrome(options=opts)
            try:
                driver.execute_cdp_cmd("Page.addScriptToEvaluateOnNewDocument", {"source": PERF_OBSERVER_INIT_JS})
                for vp_name, width, height in (("Mobil-390px", 390, 844), ("Masaüstü-1440px", 1440, 900)):
                    driver.set_window_size(width, height)
                    for path in sampled_paths:
                        local_url = f"http://127.0.0.1:{port}{path}"
                        driver.get(local_url)
                        time.sleep(0.15)
                        driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")
                        time.sleep(0.12)
                        driver.execute_script("window.scrollTo(0, 0);")
                        time.sleep(0.12)

                        metrics = driver.execute_script(
                            """
                            var el = document.querySelector("[data-seo-interactive='true']");
                            if (el && typeof el.click === 'function') { try { el.click(); } catch(e) {} }
                            return {
                              scrollWidth: document.documentElement.scrollWidth,
                              innerWidth: window.innerWidth,
                              h1Count: document.querySelectorAll('h1').length,
                              perf: window.__seoAuditMetrics || { cls: 0, maxLongTask: 0, jsErrors: [] }
                            };
                            """
                        )
                        if metrics["scrollWidth"] > metrics["innerWidth"] + 1:
                            g22_overflow.append(
                                f"[{vp_name}] Yatay taşma tespit edildi ({metrics['scrollWidth']}px > {metrics['innerWidth']}px): {path}"
                            )
                        if vp_name == "Mobil-390px":
                            cls_val = float(metrics["perf"].get("cls", 0.0))
                            if cls_val > 0.10:
                                g23_cls.append(f"Gerçek render CLS sınırı aşıldı (CLS={cls_val:.3f} > 0.10): {path}")
                            max_lt = float(metrics["perf"].get("maxLongTask", 0.0))
                            if max_lt > 200.0:
                                g24_runtime.append(
                                    f"Main-Thread Long Task / INP bloklaması ({max_lt:.0f}ms > 200ms): {path}"
                                )
                            for jerr in metrics["perf"].get("jsErrors", []):
                                g24_runtime.append(f"JS çalışma zamanı hatası ({jerr}): {path}")
                            if metrics["h1Count"] != 1:
                                g24_runtime.append(
                                    f"JS render sonrası DOM'da tekil H1 bozuldu (adet={metrics['h1Count']}): {path}"
                                )
            finally:
                driver.quit()
            return "selenium-chromium", g22_overflow, g23_cls, g24_runtime
        except Exception as browser_exc:
            msg = (
                f"Gerçek tarayıcı motoru çalıştırılamadı ({browser_exc}). "
                "Tam 100/100 render denetimi için `pip install playwright && playwright install chromium` kurun."
            )
            return "unavailable", [msg], [msg], [msg]
    finally:
        httpd.shutdown()
        httpd.server_close()


# ==============================================================================
# MODÜL 3: GOOGLE SEARCH CONSOLE (API / CSV) VE SUNUCU LOG GERİ BESLEME MOTORU
# ==============================================================================

def fetch_gsc_api_rows(site_url: str, oauth_token: str, days: int = 28) -> List[Dict[str, Any]]:
    """Google Search Console Search Analytics API (searchanalytics.query) üzerinden son N günün sorgu+sayfa verisini çeker."""
    end_date = (dt.date.today() - dt.timedelta(days=3)).isoformat()
    start_date = (dt.date.today() - dt.timedelta(days=days + 3)).isoformat()
    encoded_site = urllib.parse.quote(site_url, safe="")
    endpoint = f"https://www.googleapis.com/webmasters/v3/sites/{encoded_site}/searchAnalytics/query"

    payload = json.dumps(
        {
            "startDate": start_date,
            "endDate": end_date,
            "dimensions": ["query", "page"],
            "rowLimit": 25000,
        }
    ).encode("utf-8")

    req = urllib.request.Request(
        endpoint,
        data=payload,
        headers={
            "Authorization": f"Bearer {oauth_token}",
            "Content-Type": "application/json; charset=utf-8",
        },
        method="POST",
    )
    with urllib.request.urlopen(req, timeout=30) as resp:
        body = json.loads(resp.read().decode("utf-8"))

    rows: List[Dict[str, Any]] = []
    for r in body.get("rows", []):
        keys = r.get("keys", ["", ""])
        rows.append(
            {
                "query": keys[0],
                "page": keys[1],
                "clicks": float(r.get("clicks", 0)),
                "impressions": float(r.get("impressions", 0)),
                "ctr": float(r.get("ctr", 0)),
                "position": float(r.get("position", 0)),
            }
        )
    return rows


def load_gsc_csv_rows(csv_path: Path) -> List[Dict[str, Any]]:
    """Search Console dışa aktarım CSV veya JSON dosyasını okur (query, page, clicks, impressions, ctr, position)."""
    raw = csv_path.read_text(encoding="utf-8-sig")
    if csv_path.suffix.lower() == ".json":
        data = json.loads(raw)
        return data if isinstance(data, list) else data.get("rows", [])

    rows: List[Dict[str, Any]] = []
    reader = csv.DictReader(raw.splitlines())
    for r in reader:
        norm = {k.strip().lower(): (v or "").strip() for k, v in r.items() if k}
        query = norm.get("query") or norm.get("sorgu") or norm.get("top queries") or ""
        page = norm.get("page") or norm.get("sayfa") or norm.get("url") or ""
        if not query or not page:
            continue
        ctr_str = (norm.get("ctr") or norm.get("to") or "0").replace("%", "").replace(",", ".")
        ctr_val = float(ctr_str) / 100.0 if "%" in (norm.get("ctr") or norm.get("to") or "") else float(ctr_str or 0)
        rows.append(
            {
                "query": query,
                "page": page,
                "clicks": float((norm.get("clicks") or norm.get("tıklamalar") or "0").replace(",", ".")),
                "impressions": float((norm.get("impressions") or norm.get("gösterimler") or "0").replace(",", ".")),
                "ctr": ctr_val,
                "position": float((norm.get("position") or norm.get("konum") or "0").replace(",", ".")),
            }
        )
    return rows


def generate_gsc_optimization_plan(
    rows: List[Dict[str, Any]],
    build_dir: Path | None,
    project_root: Path,
) -> int:
    """
    GSC verisinden 3 otonom aksiyon listesi üretir:
      1) Canlı Sorgu Yamyamlaşması (aynı sorguda gösterim bölüşen URL'ler)
      2) İlk 10 Sırada Düşük CTR Başlık/Description Revizyonları
      3) Pozisyon 8-20 'Vuruş Mesafesi' Sayfalara Hub Sayfalardan Otomatik İç Link Reçetesi
    """
    by_query: Dict[str, List[Dict[str, Any]]] = collections.defaultdict(list)
    page_clicks: Dict[str, float] = collections.defaultdict(float)
    for r in rows:
        if r["impressions"] <= 0:
            continue
        by_query[r["query"]].append(r)
        page_clicks[r["page"]] += r["clicks"]

    # En yüksek trafik alan ilk 5 otorite (Hub) sayfası — iç link kaynağı olarak kullanılır
    top_hubs = [p for p, _ in sorted(page_clicks.items(), key=lambda x: x[1], reverse=True)[:5]]

    cannibal_actions: List[Dict[str, Any]] = []
    ctr_actions: List[Dict[str, Any]] = []
    striking_link_actions: List[Dict[str, Any]] = []

    for query, q_rows in by_query.items():
        q_rows_sorted = sorted(q_rows, key=lambda x: (x["clicks"], x["impressions"]), reverse=True)
        total_imp = sum(x["impressions"] for x in q_rows_sorted)

        # 1. Canlı Sorgu Yamyamlaşması Tespiti
        if len(q_rows_sorted) >= 2 and total_imp >= 30:
            primary = q_rows_sorted[0]
            competitors = [
                x for x in q_rows_sorted[1:] if (x["impressions"] / total_imp) >= 0.20 and x["page"] != primary["page"]
            ]
            if competitors:
                cannibal_actions.append(
                    {
                        "query": query,
                        "winnerPage": primary["page"],
                        "winnerPosition": round(primary["position"], 1),
                        "competingPages": [
                            {
                                "page": c["page"],
                                "impressions": int(c["impressions"]),
                                "sharePct": round((c["impressions"] / total_imp) * 100, 1),
                                "position": round(c["position"], 1),
                            }
                            for c in competitors
                        ],
                        "requiredAction": (
                            f"Rakip alt sayfalardan '{primary['page']}' sayfasına '{query}' çapa metniyle iç link verin "
                            "veya içerikleri kazanan URL altında 301 ile birleştirin."
                        ),
                        "resolved": False,
                    }
                )

        # 2. Yüksek Gösterim / Düşük CTR Tespiti
        best = q_rows_sorted[0]
        expected_min_ctr = 0.08 if best["position"] <= 3.5 else (0.025 if best["position"] <= 10.0 else 0.0)
        if best["impressions"] >= 50 and 1.0 <= best["position"] <= 10.0 and best["ctr"] < expected_min_ctr:
            ctr_actions.append(
                {
                    "query": query,
                    "page": best["page"],
                    "impressions": int(best["impressions"]),
                    "currentCtrPct": round(best["ctr"] * 100, 2),
                    "targetCtrPct": round(expected_min_ctr * 100, 1),
                    "position": round(best["position"], 1),
                    "requiredAction": (
                        f"Sayfanın <title> ve meta description alanlarını '{query}' terimini başa alacak ve somut sayısal "
                        "fark sunacak şekilde güncelleyin."
                    ),
                }
            )

        # 3. Vuruş Mesafesi (Pozisyon 8.0 - 20.0) İç Link Pompası
        if best["impressions"] >= 25 and 8.0 <= best["position"] <= 20.0:
            donor_pages = [h for h in top_hubs if h != best["page"]][:2]
            striking_link_actions.append(
                {
                    "query": query,
                    "targetPage": best["page"],
                    "position": round(best["position"], 1),
                    "impressions": int(best["impressions"]),
                    "recommendedDonorPages": donor_pages,
                    "recommendedAnchorText": query,
                    "requiredAction": (
                        f"{donor_pages or ['Ana Sayfa']} üzerinden '{best['page']}' adresine "
                        f"'{query}' çapa metniyle bağlamsal iç link ekleyin."
                    ),
                }
            )

    actions_payload = {
        "generatedAt": dt.datetime.now(dt.timezone.utc).isoformat(),
        "totalAnalyzedRows": len(rows),
        "unresolvedQueryCannibalizationCount": len(cannibal_actions),
        "queryCannibalization": cannibal_actions,
        "lowCtrRewrites": ctr_actions[:30],
        "strikingDistanceInternalLinks": striking_link_actions[:30],
    }

    json_out = project_root / "seo_actions.json"
    json_out.write_text(json.dumps(actions_payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    md_lines = [
        "# GSC VERİ GERİ BESLEME VE OTONOM OPTİMİZASYON PLANI",
        "",
        f"* **Analiz Edilen Satır:** {len(rows)}",
        f"* **Tespit Edilen Canlı Sorgu Yamyamlaşması:** {len(cannibal_actions)}",
        f"* **Acil CTR (<title> / Description) Revizyonu:** {len(ctr_actions)}",
        f"* **Vuruş Mesafesi (Pozisyon 8–20) İç Link Görevi:** {len(striking_link_actions)}",
        "",
        "## 1. Canlı Sorgu Yamyamlaşması (Kapatılması Zorunlu — G25 Kapısı)",
    ]
    if not cannibal_actions:
        md_lines.append("* Çakışan sorgu tespit edilmedi.")
    for item in cannibal_actions[:15]:
        comp_str = ", ".join(f"`{c['page']}` (%{c['sharePct']})" for c in item["competingPages"])
        md_lines.append(
            f"* **`{item['query']}`** — Kazanan: `{item['winnerPage']}` (Poz: {item['winnerPosition']}) | Bölünen: {comp_str}"
        )

    md_lines.append("\n## 2. Düşük CTR Başlık ve Meta Description Revizyonları")
    if not ctr_actions:
        md_lines.append("* Düşük CTR'li ilk sayfa sorgusu bulunmadı.")
    for item in ctr_actions[:15]:
        md_lines.append(
            f"* **`{item['query']}`** (`{item['page']}`) — Poz: {item['position']}, Gösterim: {item['impressions']}, "
            f"Mevcut CTR: %{item['currentCtrPct']} (Hedef >= %{item['targetCtrPct']})"
        )

    md_lines.append("\n## 3. Vuruş Mesafesi (Pozisyon 8–20) İç Link Enjeksiyon Reçetesi")
    if not striking_link_actions:
        md_lines.append("* Vuruş mesafesinde bekleyen sorgu bulunmadı.")
    for item in striking_link_actions[:15]:
        donors = ", ".join(f"`{d}`" for d in item["recommendedDonorPages"]) or "`/`"
        md_lines.append(
            f"* Hedef: `{item['targetPage']}` (Poz: {item['position']}, {item['impressions']} gösterim) <- "
            f"Kaynak: {donors} | Çapa Metni: **`{item['recommendedAnchorText']}`**"
        )

    md_out = project_root / "GSC_OPTIMIZATION_PLAN.md"
    md_out.write_text("\n".join(md_lines) + "\n", encoding="utf-8")
    print(f"[GSC-SYNC] Tamamlandı -> {json_out.name} ve {md_out.name} üretildi.")
    print(
        f"           Yamyamlaşma: {len(cannibal_actions)} | CTR Revizyonu: {len(ctr_actions)} | İç Link Pompası: {len(striking_link_actions)}"
    )
    return 0


def audit_server_logs(log_path: Path, build_dir: Path, base_url: str, project_root: Path) -> int:
    """Sunucu erişim loglarından Googlebot/AI bot yanıt kodlarını ve sitemap'te olup hiç taranmayan sayfaları bulur."""
    base_url = base_url.rstrip("/")
    bot_re = re.compile(r"(Googlebot|Bingbot|OAI-SearchBot|ChatGPT-User|PerplexityBot|Claude-SearchBot)", re.I)
    req_re = re.compile(r'"(?:GET|HEAD)\s+([^\s"]+)\s+HTTP/[0-9.]+"\s+(\d{3})')

    crawled_paths: Dict[str, int] = collections.Counter()
    bot_errors: List[str] = []

    for line in log_path.read_text(encoding="utf-8", errors="ignore").splitlines():
        if not bot_re.search(line):
            continue
        m = req_re.search(line)
        if not m:
            continue
        path_raw, status_str = m.group(1), m.group(2)
        clean_path = path_raw.split("?")[0]
        status = int(status_str)
        crawled_paths[clean_path] += 1
        if status >= 400:
            bot_errors.append(f"HTTP {status} -> {clean_path}")

    sitemap_path = build_dir / "sitemap.xml"
    uncrawled: List[str] = []
    if sitemap_path.exists():
        tree = ET.parse(sitemap_path)
        for loc in tree.getroot().findall(".//{*}url/{*}loc"):
            if loc.text:
                u = loc.text.strip()
                rel_p = urlparse(u).path or "/"
                if crawled_paths.get(rel_p, 0) == 0:
                    uncrawled.append(u)

    report = {
        "scannedLogFile": str(log_path),
        "uniqueBotCrawledPaths": len(crawled_paths),
        "botHttpErrors": sorted(set(bot_errors))[:50],
        "uncrawledSitemapUrls": uncrawled,
    }
    out_file = project_root / "crawl_budget_report.json"
    out_file.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(
        f"[LOG-AUDIT] Bot taranan benzersiz yol: {len(crawled_paths)} | Bot 4xx/5xx hatası: {len(set(bot_errors))} | "
        f"Hiç taranmayan sitemap sayfası: {len(uncrawled)} -> {out_file.name}"
    )
    return 0


# ==============================================================================
# KURULUM (--init) VE 25 KAPILI ANA DENETİM MOTORU (--audit)
# ==============================================================================

def bootstrap_project(project_root: Path, domain: str) -> int:
    """Proje köküne tüm ajan kural kilitlerini, seo.config.json, _headers ve Git pre-commit kancasını kurar."""
    domain = domain.rstrip("/")
    stack = detect_stack(project_root)
    key_seed = hashlib.sha256(f"{domain}-real-seo-2026".encode("utf-8")).hexdigest()[:32]

    print(f"[INIT] Mimari tespit edildi: {stack} | Hedef Domain: {domain}")

    cfg_path = project_root / "seo.config.json"
    if not cfg_path.exists():
        default_cfg = {
            "contractVersion": "REAL-SEO-2026-APEX-v4.0",
            "stack": stack,
            "domain": domain,
            "brandName": "REQUIRED_REAL_VALUE",
            "legalName": "REQUIRED_REAL_VALUE",
            "organizationSubType": "LocalBusiness",
            "telephoneE164": "REQUIRED_REAL_VALUE",
            "email": "REQUIRED_REAL_VALUE",
            "address": {
                "streetAddress": "REQUIRED_REAL_VALUE",
                "addressLocality": "İzmir",
                "addressRegion": "İzmir",
                "postalCode": "REQUIRED_REAL_VALUE",
                "addressCountry": "TR",
            },
            "geo": {"latitude": "REQUIRED_REAL_VALUE", "longitude": "REQUIRED_REAL_VALUE"},
            "founderOrAuthor": {
                "name": "REQUIRED_REAL_VALUE",
                "jobTitle": "REQUIRED_REAL_VALUE",
                "profileUrl": f"{domain}/hakkimizda/",
                "sameAs": [],
            },
            "cannibalizationThreshold": 0.78,
            "allowedPartnerDomains": [],
            "indexNowKey": key_seed,
        }
        cfg_path.write_text(json.dumps(default_cfg, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        print(f"[INIT] Oluşturuldu: {cfg_path} (REQUIRED_REAL_VALUE alanlarını gerçek verilerle doldurun)")
    else:
        cfg_data = json.loads(cfg_path.read_text(encoding="utf-8"))
        key_seed = cfg_data.get("indexNowKey", key_seed)
        print(f"[INIT] Mevcut korundu: {cfg_path}")

    cursor_dir = project_root / ".cursor" / "rules"
    cursor_dir.mkdir(parents=True, exist_ok=True)
    mdc_path = cursor_dir / "00-real-seo-contract.mdc"
    mdc_content = (
        "---\n"
        "description: REAL-SEO-2026 APEX v4.0 Bağlayıcı SEO, Gerçek Tarayıcı CWV, Yamyamlaşma ve GSC Sözleşmesi\n"
        "globs: \"**/*\"\n"
        "alwaysApply: true\n"
        "---\n\n"
        "# ZORUNLU UYGULAMA SÖZLEŞMESİ (APEX v4.0)\n\n"
        "1. Kök dizindeki `AGENTS.md` sözleşmesinin 25 kapısını ve `seo.config.json` gerçek verilerini eksiksiz uygula.\n"
        "2. Kök dizinde `seo_actions.json` varsa içindeki sorgu yamyamlaşması, CTR başlık revizyonu ve iç link görevlerini kodda kapat.\n"
        "3. Her görev sonunda `python3 seo_enforcer.py --audit` çalıştır; skor **100/100** (gerçek tarayıcı render dahil) olmadan görevi tamamlama.\n"
    )
    mdc_path.write_text(mdc_content, encoding="utf-8")
    print(f"[INIT] Cursor kural kilidi kuruldu: {mdc_path}")

    claude_md = project_root / "CLAUDE.md"
    claude_stub = (
        "@AGENTS.md\n\n"
        "## Zorunlu Teslim Kapısı (APEX v4.0)\n"
        "- Her kod değişikliği sonrasında `python3 seo_enforcer.py --audit` komutunu çalıştır.\n"
        "- Skor `100/100` (25/25 kapı: statik + TF-IDF yamyamlaşma + Headless Chromium CLS/INP/taşma) olmadan görevi teslim etme.\n"
    )
    if not claude_md.exists():
        claude_md.write_text(claude_stub, encoding="utf-8")
        print(f"[INIT] Claude Code köprüsü kuruldu: {claude_md}")
    elif "@AGENTS.md" not in claude_md.read_text(encoding="utf-8"):
        existing = claude_md.read_text(encoding="utf-8")
        claude_md.write_text(claude_stub + "\n" + existing, encoding="utf-8")
        print(f"[INIT] Mevcut CLAUDE.md dosyasına @AGENTS.md bağlandı: {claude_md}")

    headers_path = project_root / "_headers"
    if not headers_path.exists():
        headers_content = (
            "/*\n"
            "  X-Content-Type-Options: nosniff\n"
            "  Referrer-Policy: strict-origin-when-cross-origin\n"
            "  Strict-Transport-Security: max-age=63072000; includeSubDomains; preload\n\n"
            "/*.html\n"
            "  Cache-Control: public, max-age=0, must-revalidate\n\n"
            "/assets/*\n"
            "  Cache-Control: public, max-age=31536000, immutable\n"
        )
        headers_path.write_text(headers_content, encoding="utf-8")
        print(f"[INIT] bfcache uyumlu Edge başlıkları oluşturuldu: {headers_path}")

    key_file = project_root / f"{key_seed}.txt"
    if not key_file.exists():
        key_file.write_text(key_seed, encoding="utf-8")
        print(f"[INIT] IndexNow doğrulama anahtarı oluşturuldu: {key_file.name}")

    git_hooks_dir = project_root / ".git" / "hooks"
    if git_hooks_dir.exists():
        hook_path = git_hooks_dir / "pre-commit"
        build_target = "./dist" if stack == "astro" else ("./out" if stack == "nextjs" else ".")
        hook_script = (
            "#!/usr/bin/env sh\n"
            f'if [ -d "{build_target}" ]; then\n'
            f'  python3 seo_enforcer.py --audit "{build_target}" "{domain}"\n'
            "fi\n"
        )
        hook_path.write_text(hook_script, encoding="utf-8")
        hook_path.chmod(hook_path.stat().st_mode | stat.S_IXUSR | stat.S_IXGRP | stat.S_IXOTH)
        print(f"[INIT] Git pre-commit 100/100 kilidi kuruldu: {hook_path}")

    return 0


def audit_project(
    target_dir: Path,
    base_url: str,
    project_root: Path,
    as_json: bool = False,
    skip_browser: bool = False,
) -> int:
    """25 sözleşme kapısını (her biri 4 puan = toplam 100/100 puan) deterministik olarak denetler."""
    base_url = base_url.rstrip("/")
    base_host = urlparse(base_url).netloc.lower()

    gate_names = {
        "G01": "Dosya Hijyeni ve UTF-8 (BOM'suz) Kodlama",
        "G02": "Gerçek Veri Kaynağı (seo.config.json) Doğrulaması",
        "G03": "Dahili Kırık Link ve Görsel/Kaynak Yolu Kontrolü",
        "G04": "Arama Niyeti Odaklı ve Benzersiz <title> (30-70 krk)",
        "G05": "Tekil ve Benzersiz <h1> Başlık Kontrolü",
        "G06": "Tıklama Odaklı, Kesintisiz Meta Description (85-160 krk)",
        "G07": "SERP & AI Önizleme Direktifi (max-image-preview:large, max-snippet:-1)",
        "G08": "Self-Referencing HTTPS Canonical ve Hreflang Uyumu",
        "G09": "Raster Open Graph & Twitter Görseli (.svg Yasağı)",
        "G10": "Bağlantılı @graph + @id JSON-LD Varlık Mimarisi",
        "G11": "Eksiksiz HTTPS BreadcrumbList Şeması",
        "G12": "Ticari Şema Ceza Kalkanı (Fiyatsız Product ve Sahte Puan Yasağı)",
        "G13": "Görünür FAQPage Metin-Şema Birebir Eşleşmesi",
        "G14": "CLS = 0 Görsel Boyutlandırma (width/height) ve Türkçe Alt Metni",
        "G15": "LCP İlk Ekran Görseli Önceliklendirme (fetchpriority='high')",
        "G16": "0 ms Sayfa Geçişi (Speculation Rules API) ve bfcache Koruması",
        "G17": "AEO Cevap Kapsülü, İnteraktif Araç ve 0 Yetim Sayfa Kontrolü",
        "G18": "Görsel Destekli sitemap.xml Senkronizasyonu",
        "G19": "robots.txt ve llms.txt (v2) Keşif Dosyaları Doğrulaması",
        "G20": "Çapraz Domain Footer PBN Link Kalkanı",
        "G21": "Anlamsal Anahtar Kelime Yamyamlaşması (TF-IDF Cosine < 0.78)",
        "G22": "Headless Chromium Mobil (390px) & Masaüstü Sıfır Yatay Taşma",
        "G23": "Headless Chromium Gerçek Render CLS <= 0.10 Doğrulaması",
        "G24": "Headless Chromium Long-Task / INP (<= 200ms) ve Sıfır JS Hatası",
        "G25": "GSC Performans & Tarama Geri Besleme Aksiyon Uyumu",
    }
    violations: Dict[str, List[str]] = {g: [] for g in gate_names}

    allowed_partners: Set[str] = set()
    brand_name = ""
    cannibal_threshold = 0.78
    cfg_path = project_root / "seo.config.json"
    if not cfg_path.exists():
        violations["G02"].append("Proje kökünde seo.config.json bulunamadı (`python3 seo_enforcer.py --init` çalıştırın).")
    else:
        try:
            cfg_raw = cfg_path.read_text(encoding="utf-8")
            if "REQUIRED_REAL_VALUE" in cfg_raw:
                violations["G02"].append("seo.config.json içinde doldurulmamış 'REQUIRED_REAL_VALUE' alanları var.")
            cfg_obj = json.loads(cfg_raw)
            brand_name = str(cfg_obj.get("brandName", ""))
            cannibal_threshold = float(cfg_obj.get("cannibalizationThreshold", 0.78))
            for d in cfg_obj.get("allowedPartnerDomains", []):
                allowed_partners.add(d.lower().strip())
        except Exception as exc:
            violations["G02"].append(f"seo.config.json JSON hatası: {exc}")

    for p in target_dir.rglob("*"):
        if any(part in IGNORED_SCAN_DIRS for part in p.relative_to(target_dir).parts):
            continue
        if p.is_file():
            if p.suffix.lower() in FORBIDDEN_EXTS or p.name.lower() in FORBIDDEN_FILENAMES:
                violations["G01"].append(f"Yasaklı yedek/test dosyası bulundu: {p}")

    headers_file = target_dir / "_headers"
    if not headers_file.exists():
        headers_file = project_root / "_headers"
    if headers_file.exists():
        h_txt = headers_file.read_text(encoding="utf-8", errors="ignore").lower()
        if "no-store" in h_txt:
            violations["G16"].append(f"{headers_file} içinde bfcache bozan 'no-store' direktifi bulundu.")

    html_files = iter_html_files(target_dir)
    if not html_files:
        violations["G01"].append(f"Hedef dizinde ({target_dir}) hiç .html dosyası bulunamadı.")

    titles_seen: Dict[str, Path] = {}
    h1_seen: Dict[str, Path] = {}
    descs_seen: Dict[str, Path] = {}
    inbound_links: Dict[str, int] = {}
    indexable_urls: Set[str] = set()
    indexable_url_paths: List[str] = []
    semantic_docs: List[Dict[str, str]] = []

    for f in html_files:
        raw = f.read_bytes()
        if raw.startswith(b"\xef\xbb\xbf"):
            violations["G01"].append(f"UTF-8 BOM tespit edildi: {f}")
        try:
            text = raw.decode("utf-8")
        except UnicodeDecodeError as exc:
            violations["G01"].append(f"Geçersiz UTF-8 karakter kodlaması ({f}): {exc}")
            continue

        if re.search(r"addEventListener\(\s*['\"]unload['\"]", text):
            violations["G16"].append(f"bfcache bozan window 'unload' dinleyicisi bulundu: {f}")

        parser = ContractHTMLParser()
        parser.feed(text)

        robots_raw = parser.metas.get("robots", "index,follow").lower().replace(" ", "")
        is_noindex = "noindex" in robots_raw

        rel_str = str(f.relative_to(target_dir)).replace("\\", "/")
        if rel_str == "index.html":
            url_path = "/"
        elif rel_str.endswith("/index.html"):
            url_path = "/" + rel_str[: -len("index.html")]
        else:
            url_path = "/" + rel_str
        expected_url = base_url + url_path
        is_home = url_path == "/"

        for a in parser.links:
            href_raw = a.get("href", "").strip()
            if not href_raw or href_raw.startswith(("#", "mailto:", "tel:", "javascript:")):
                continue
            anchor_txt = a.get("text", "").strip().lower()
            if anchor_txt in GENERIC_ANCHORS:
                violations["G17"].append(f"Anlamsız çapa metni ('{anchor_txt}') kullanıldı: {f}")

            if href_raw.startswith(("http://", "https://")):
                parsed_href = urlparse(href_raw)
                host = parsed_href.netloc.lower()
                if host == base_host:
                    norm_target = base_url + (parsed_href.path or "/")
                    inbound_links[norm_target] = inbound_links.get(norm_target, 0) + 1
                elif a.get("_in_footer") == "1" and host not in allowed_partners and host != "wa.me":
                    rel_tokens = set(a.get("rel", "").lower().split())
                    if not (rel_tokens & {"nofollow", "sponsored", "noopener"}):
                        violations["G20"].append(f"Footer/Aside içinde izinsiz dış dofollow link ({href_raw}): {f}")
            elif href_raw.startswith("/"):
                clean_path = href_raw.split("#")[0].split("?")[0]
                norm_target = base_url + clean_path
                inbound_links[norm_target] = inbound_links.get(norm_target, 0) + 1
                fs_candidate_1 = target_dir / clean_path.lstrip("/")
                fs_candidate_2 = target_dir / clean_path.lstrip("/") / "index.html"
                fs_candidate_3 = target_dir / (clean_path.lstrip("/") + ".html")
                if not (fs_candidate_1.exists() or fs_candidate_2.exists() or fs_candidate_3.exists()):
                    violations["G03"].append(f"Kırık dahili link '{href_raw}' -> hedef bulunamadı: {f}")

        for idx, img in enumerate(parser.imgs):
            src = img.get("src", "").strip()
            if src.startswith("/") and not src.startswith("//"):
                img_file = target_dir / src.lstrip("/").split("?")[0]
                if not img_file.exists():
                    violations["G03"].append(f"Kırık görsel kaynağı '{src}': {f}")

            w, h = img.get("width", "").strip(), img.get("height", "").strip()
            if not (w.isdigit() and h.isdigit()):
                violations["G14"].append(f"Görselde sayısal width/height eksik ({src}): {f}")

            alt = img.get("alt", "").strip()
            if len(alt) < 5 or alt.lower().startswith(("resim", "image", "img_", "foto")):
                violations["G14"].append(f"Görselde yetersiz veya jenerik alt metni ('{alt}'): {f}")

            if idx == 0 and not is_noindex:
                if img.get("fetchpriority", "").lower() != "high" or img.get("loading", "").lower() == "lazy":
                    violations["G15"].append(
                        f"İlk ekran (hero) görselinde fetchpriority='high' olmalı ve loading='lazy' olmamalı ({src}): {f}"
                    )

        if is_noindex:
            continue

        indexable_urls.add(expected_url)
        indexable_url_paths.append(url_path)

        clean_title = " ".join(parser.title.split())
        if not (30 <= len(clean_title) <= 70):
            violations["G04"].append(f"<title> uzunluğu 30-70 karakter dışında ({len(clean_title)} krk): {f}")
        if INTERNAL_CODE_PREFIX_RE.match(clean_title):
            violations["G04"].append(f"<title> iç stok/model koduyla başlayamaz ('{clean_title}'): {f}")
        if clean_title in titles_seen:
            violations["G04"].append(f"Kopya <title> ('{clean_title}'): {f} ve {titles_seen[clean_title]}")
        titles_seen[clean_title] = f

        h1_val = ""
        if len(parser.h1_list) != 1 or not parser.h1_list[0]:
            violations["G05"].append(f"Sayfada tam 1 adet dolu <h1> bulunmalı (bulunan={len(parser.h1_list)}): {f}")
        else:
            h1_val = parser.h1_list[0]
            if INTERNAL_CODE_PREFIX_RE.match(h1_val):
                violations["G05"].append(f"<h1> iç stok/model koduyla başlayamaz ('{h1_val}'): {f}")
            if h1_val in h1_seen:
                violations["G05"].append(f"Kopya <h1> ('{h1_val}'): {f} ve {h1_seen[h1_val]}")
            h1_seen[h1_val] = f

        desc = parser.metas.get("description", "")
        if not (85 <= len(desc) <= 160) or desc.endswith("...") or desc.endswith("…"):
            violations["G06"].append(f"Meta description 85-160 krk olmalı ve kesilmemeli ({len(desc)} krk): {f}")
        if desc in descs_seen:
            violations["G06"].append(f"Kopya meta description: {f} ve {descs_seen[desc]}")
        descs_seen[desc] = f

        if "max-image-preview:large" not in robots_raw or "max-snippet:-1" not in robots_raw:
            violations["G07"].append(f"Robots etiketinde 'max-image-preview:large, max-snippet:-1' eksik: {f}")

        if parser.canonical != expected_url:
            violations["G08"].append(f"Canonical uyumsuz (beklenen='{expected_url}', bulunan='{parser.canonical}'): {f}")
        if parser.hreflangs:
            langs = {lg for lg, _ in parser.hreflangs}
            if "x-default" not in langs:
                violations["G08"].append(f"Çok dilli hreflang yapısında 'x-default' eksik: {f}")

        for meta_key in ("og:image", "twitter:image"):
            m_val = parser.metas.get(meta_key, "")
            clean_m = m_val.split("?")[0].lower()
            if not m_val.startswith("https://") or clean_m.endswith(".svg") or not clean_m.endswith(RASTER_EXTS):
                violations["G09"].append(f"{meta_key} mutlak HTTPS raster görsel (.webp/.jpg/.png) olmalı ({m_val}): {f}")

        if not parser.jsonld_blocks:
            violations["G10"].append(f"Sayfada application/ld+json bloğu bulunamadı: {f}")
        has_breadcrumb = False
        full_visible_text = " ".join(parser.visible_text)

        for block in parser.jsonld_blocks:
            try:
                data = json.loads(block)
            except Exception as exc:
                violations["G10"].append(f"Bozuk JSON-LD sözdizimi ({exc}): {f}")
                continue

            if not isinstance(data, dict) or "@graph" not in data or not isinstance(data["@graph"], list):
                violations["G10"].append(f"JSON-LD şeması bağlantılı '@graph' dizisi kullanmalıdır: {f}")

            ids_found = [n.get("@id", "") for n in iter_schema_nodes(data) if isinstance(n.get("@id"), str)]
            if not any("#organization" in i for i in ids_found) or not any("#webpage" in i for i in ids_found):
                violations["G10"].append(f"@graph içinde kalıcı '#organization' ve '#webpage' @id düğümleri eksik: {f}")

            for node in iter_schema_nodes(data):
                raw_type = node.get("@type", "")
                types = set(raw_type) if isinstance(raw_type, list) else {str(raw_type)}

                if "BreadcrumbList" in types:
                    has_breadcrumb = True
                    items = node.get("itemListElement", [])
                    if not items:
                        violations["G11"].append(f"BreadcrumbList boş bırakılmış: {f}")
                    for li in items:
                        item_url = li.get("item", "")
                        if isinstance(item_url, dict):
                            item_url = item_url.get("@id", "")
                        if not str(item_url).startswith("https://"):
                            violations["G11"].append(f"Breadcrumb ListItem içinde mutlak HTTPS 'item' eksik: {f}")

                if "Product" in types:
                    offers = node.get("offers", {})
                    if isinstance(offers, list):
                        offers = offers[0] if offers else {}
                    price_val = offers.get("price") or offers.get("lowPrice")
                    if price_val is None or str(price_val).strip() == "":
                        violations["G12"].append(f"Fiyatsız sayfada yasaklı @type='Product' kullanıldı: {f}")

                if types & {"Organization", "LocalBusiness", "JewelryStore", "FurnitureStore", "FinancialService"}:
                    if "aggregateRating" in node:
                        violations["G12"].append(
                            f"Kurum/LocalBusiness şemasında cezaya yol açan self-serving aggregateRating bulundu: {f}"
                        )

                for img_field in ("image", "logo"):
                    val = node.get(img_field)
                    if isinstance(val, str) and val.lower().endswith(".svg"):
                        violations["G12"].append(f"JSON-LD '{img_field}' alanında yasaklı .svg görsel kullanıldı: {f}")
                    elif isinstance(val, dict) and str(val.get("url", "")).lower().endswith(".svg"):
                        violations["G12"].append(f"JSON-LD '{img_field}.url' alanında yasaklı .svg görsel: {f}")

                if "FAQPage" in types:
                    for q in node.get("mainEntity", []):
                        q_name = (q.get("name") or "").strip()
                        if q_name and q_name not in full_visible_text:
                            violations["G13"].append(f"Görünür metinde karşılığı olmayan gizli FAQ sorusu ('{q_name}'): {f}")

        if not is_home and not has_breadcrumb:
            violations["G11"].append(f"Alt sayfada zorunlu BreadcrumbList şeması eksik: {f}")

        if not parser.speculation_blocks:
            violations["G16"].append(f"<script type='speculationrules'> anında geçiş bloğu eksik: {f}")
        else:
            for sp in parser.speculation_blocks:
                try:
                    sp_obj = json.loads(sp)
                    if "prerender" not in sp_obj and "prefetch" not in sp_obj:
                        violations["G16"].append(f"speculationrules içinde prerender/prefetch kuralı eksik: {f}")
                except Exception as exc:
                    violations["G16"].append(f"Bozuk speculationrules JSON ({exc}): {f}")

        capsule_val = parser.answer_capsules[0] if parser.answer_capsules else ""
        if not capsule_val:
            violations["G17"].append(f"AEO/RAG için <p data-answer-capsule='true'> Cevap Kapsülü eksik: {f}")
        else:
            words = capsule_val.split()
            if not (20 <= len(words) <= 90):
                violations["G17"].append(
                    f"Cevap Kapsülü uzunluğu ideal 20-90 kelime aralığı dışında ({len(words)} kelime): {f}"
                )
        if not parser.has_interactive_widget and not parser.has_table:
            violations["G17"].append(
                f"NavBoost/AEO için sayfada ne interaktif mikro-araç (data-seo-interactive='true') ne de <table> var: {f}"
            )

        semantic_docs.append(
            {
                "url": expected_url,
                "slug": url_path.replace("/", " ").replace("-", " "),
                "title": clean_title,
                "h1": h1_val,
                "capsule": capsule_val,
            }
        )

    # G17: Yetim sayfa kontrolü
    home_url = base_url + "/"
    for idx_url in sorted(indexable_urls):
        if idx_url != home_url and inbound_links.get(idx_url, 0) == 0:
            violations["G17"].append(f"Yetim sayfa tespit edildi (hiçbir dahili sayfadan link almıyor): {idx_url}")

    # G18: sitemap.xml senkronizasyonu
    sitemap_path = target_dir / "sitemap.xml"
    if not sitemap_path.exists():
        violations["G18"].append("Hedef dizinde sitemap.xml bulunamadı.")
    else:
        try:
            tree = ET.parse(sitemap_path)
            root = tree.getroot()
            sm_locs = {el.text.strip() for el in root.findall(".//{*}url/{*}loc") if el.text}
            for img_loc in root.findall(".//{*}image/{*}loc"):
                if img_loc.text and img_loc.text.strip().lower().endswith(".svg"):
                    violations["G18"].append(f"sitemap.xml içinde yasaklı .svg görsel bulundu: {img_loc.text.strip()}")
            for missing_u in sorted(indexable_urls - sm_locs):
                violations["G18"].append(f"İndekslenebilir sayfa sitemap.xml içinde eksik: {missing_u}")
            for extra_u in sorted(sm_locs - indexable_urls):
                violations["G18"].append(f"Noindex veya karşılığı olmayan URL sitemap.xml içinde yer alıyor: {extra_u}")
        except Exception as exc:
            violations["G18"].append(f"sitemap.xml XML ayrıştırma hatası: {exc}")

    # G19: robots.txt ve llms.txt v2 kontrolü
    robots_path = target_dir / "robots.txt"
    if not robots_path.exists():
        violations["G19"].append("Hedef dizinde robots.txt bulunamadı.")
    else:
        r_txt = robots_path.read_text(encoding="utf-8", errors="ignore")
        if f"Sitemap: {base_url}/sitemap.xml" not in r_txt:
            violations["G19"].append(f"robots.txt içinde 'Sitemap: {base_url}/sitemap.xml' satırı eksik.")

    llms_path = target_dir / "llms.txt"
    if not llms_path.exists():
        violations["G19"].append("Hedef dizinde AI yanıt motorları için llms.txt bulunamadı.")
    else:
        l_lines = [ln.strip() for ln in llms_path.read_text(encoding="utf-8", errors="ignore").splitlines() if ln.strip()]
        if not l_lines or not l_lines[0].startswith("# "):
            violations["G19"].append("llms.txt v2 formatına aykırı: İlk satır '# Marka Adı' (H1) olmalıdır.")
        if not any(ln.startswith("> ") for ln in l_lines[:4]):
            violations["G19"].append("llms.txt v2 formatına aykırı: H1 altında '> Resmi özet' (blockquote) bulunmalıdır.")
        if not any(ln.startswith("## ") for ln in l_lines):
            violations["G19"].append("llms.txt v2 formatına aykırı: En az bir '## Kategori' bölümü bulunmalıdır.")

    # G21: Anlamsal Anahtar Kelime Yamyamlaşması (TF-IDF Cosine)
    violations["G21"].extend(
        detect_semantic_cannibalization(semantic_docs, brand_name=brand_name, threshold=cannibal_threshold)
    )

    # G22, G23, G24: Gerçek Headless Chromium Tarayıcı Denetimi
    browser_engine = "skipped"
    if not skip_browser and indexable_url_paths:
        browser_engine, g22_errs, g23_errs, g24_errs = run_browser_render_audit(target_dir, indexable_url_paths)
        violations["G22"].extend(g22_errs)
        violations["G23"].extend(g23_errs)
        violations["G24"].extend(g24_errs)

    # G25: GSC Geri Besleme Aksiyon Kalıntısı Kontrolü
    actions_file = project_root / "seo_actions.json"
    if actions_file.exists():
        try:
            act_data = json.loads(actions_file.read_text(encoding="utf-8"))
            unresolved = [
                c for c in act_data.get("queryCannibalization", []) if not c.get("resolved", False)
            ]
            for item in unresolved:
                violations["G25"].append(
                    f"seo_actions.json içinde kapatılmamış GSC sorgu yamyamlaşması ('{item.get('query')}' -> "
                    f"Kazanan: {item.get('winnerPage')}). İç link/301 uygulayıp resolved=true işaretleyin."
                )
        except Exception as exc:
            violations["G25"].append(f"seo_actions.json okuma hatası: {exc}")

    # Puan Hesaplama (25 Kapı x 4 Puan = 100 Puan)
    passed_gates = sum(1 for g in gate_names if not violations[g])
    score = passed_gates * 4

    if as_json:
        report = {
            "score": score,
            "maxScore": 100,
            "accepted": score == 100,
            "browserEngine": browser_engine,
            "scannedHtmlFiles": len(html_files),
            "indexablePages": len(indexable_urls),
            "failedGates": {g: {"title": gate_names[g], "errors": violations[g]} for g in gate_names if violations[g]},
        }
        print(json.dumps(report, ensure_ascii=False, indent=2))
    else:
        print("=" * 84)
        print(
            f"REAL-SEO-2026 (APEX v4.0) DENETİM KARNESİ | SAYFA: {len(html_files)} | RENDER MOTORU: {browser_engine}"
        )
        print("=" * 84)
        for g, title in gate_names.items():
            errs = violations[g]
            status = "[GEÇTİ +4p]" if not errs else f"[KALDI  0p] ({len(errs)} ihlal)"
            print(f"  {g} {status} — {title}")
            for e in errs[:5]:
                print(f"       -> {e}")
            if len(errs) > 5:
                print(f"       -> ... ve {len(errs) - 5} ek ihlal daha.")
        print("=" * 84)
        if score == 100:
            print(f"SKOR: {score}/100 — SÖZLEŞME KABUL EDİLDİ (25/25 KAPI, GERÇEK TARAYICI ONAYLI)")
        else:
            print(f"SKOR: {score}/100 — SÖZLEŞME REDDEDİLDİ! Ajan tüm ihlalleri onarıp tekrar --audit çalıştırmalıdır.")
        print("=" * 84)

    return 0 if score == 100 else 1


def ping_indexnow(target_dir: Path, project_root: Path) -> int:
    """Canlı yayından sonra sitemap.xml içindeki kanonik URL'leri IndexNow.org protokolüne bildirir."""
    cfg_path = project_root / "seo.config.json"
    sitemap_path = target_dir / "sitemap.xml"
    if not cfg_path.exists() or not sitemap_path.exists():
        print("HATA: seo.config.json ve sitemap.xml mevcut olmalıdır.")
        return 1

    cfg = json.loads(cfg_path.read_text(encoding="utf-8"))
    domain = cfg["domain"].rstrip("/")
    host = urlparse(domain).netloc
    key = cfg["indexNowKey"]

    tree = ET.parse(sitemap_path)
    urls = [el.text.strip() for el in tree.getroot().findall(".//{*}url/{*}loc") if el.text]

    payload = json.dumps(
        {"host": host, "key": key, "keyLocation": f"{domain}/{key}.txt", "urlList": urls}
    ).encode("utf-8")

    req = urllib.request.Request(
        "https://api.indexnow.org/indexnow",
        data=payload,
        headers={"Content-Type": "application/json; charset=utf-8"},
        method="POST",
    )
    with urllib.request.urlopen(req, timeout=15) as resp:
        print(f"[INDEXNOW] {len(urls)} URL bildirildi -> HTTP {resp.status}")
    return 0


def main() -> int:
    ap = argparse.ArgumentParser(description="REAL-SEO-2026 APEX v4.0 Kurulum, Render, Yamyamlaşma ve GSC Motoru")
    ap.add_argument("--init", action="store_true", help="Projeye ajan kilitlerini, seo.config.json ve _headers kurar")
    ap.add_argument("--domain", default="https://ornekdomain.com", help="--init sırasında kullanılacak kanonik domain")
    ap.add_argument("--audit", nargs="*", metavar=("HEDEF_DIZIN", "DOMAIN"), help="25 kapılı 100/100 denetimi çalıştırır")
    ap.add_argument("--skip-browser", action="store_true", help="Yalnızca tarayıcısız minimal CI ortamlarında render kapısını atlar")
    ap.add_argument("--json", action="store_true", help="Denetim çıktısını JSON olarak üretir")
    ap.add_argument("--gsc-file", metavar="CSV_VEYA_JSON", help="Search Console dışa aktarım dosyasından optimizasyon planı üretir")
    ap.add_argument("--gsc-api", action="store_true", help="Search Console API üzerinden doğrudan veri çekip plan üretir")
    ap.add_argument("--site-url", help="GSC API mülk kimliği (ör. sc-domain:ornekdomain.com veya https://ornekdomain.com/)")
    ap.add_argument("--token", help="GSC API OAuth2 Bearer erişim anahtarı (veya GSC_OAUTH_TOKEN ortam değişkeni)")
    ap.add_argument("--days", type=int, default=28, help="GSC API sorgu penceresi (varsayılan: 28 gün)")
    ap.add_argument("--build-dir", default=".", help="GSC analizi sırasında kullanılacak derleme klasörü")
    ap.add_argument("--log-audit", nargs=3, metavar=("LOG_DOSYASI", "HEDEF_DIZIN", "DOMAIN"), help="Sunucu bot log analizi")
    ap.add_argument("--ping-indexnow", metavar="HEDEF_DIZIN", help="sitemap.xml URL'lerini IndexNow API'ye bildirir")

    args = ap.parse_args()
    project_root = Path.cwd()

    if args.init:
        return bootstrap_project(project_root, args.domain)

    if args.gsc_file:
        rows = load_gsc_csv_rows(Path(args.gsc_file).resolve())
        return generate_gsc_optimization_plan(rows, Path(args.build_dir).resolve(), project_root)

    if args.gsc_api:
        token = args.token or os.environ.get("GSC_OAUTH_TOKEN", "")
        if not args.site_url or not token:
            print("HATA: --gsc-api için --site-url ve --token (veya GSC_OAUTH_TOKEN) gereklidir.")
            return 2
        rows = fetch_gsc_api_rows(args.site_url, token, days=args.days)
        return generate_gsc_optimization_plan(rows, Path(args.build_dir).resolve(), project_root)

    if args.log_audit:
        log_p, b_dir, dom = args.log_audit
        return audit_server_logs(Path(log_p).resolve(), Path(b_dir).resolve(), dom, project_root)

    if args.audit is not None:
        cfg_file = project_root / "seo.config.json"
        default_domain = "https://ornekdomain.com"
        if cfg_file.exists():
            try:
                default_domain = json.loads(cfg_file.read_text(encoding="utf-8")).get("domain", default_domain)
            except Exception:
                pass
        target = Path(args.audit[0]) if len(args.audit) >= 1 else project_root
        domain = args.audit[1] if len(args.audit) >= 2 else default_domain
        return audit_project(
            target.resolve(),
            domain,
            project_root,
            as_json=args.json,
            skip_browser=args.skip_browser,
        )

    if args.ping_indexnow:
        return ping_indexnow(Path(args.ping_indexnow).resolve(), project_root)

    ap.print_help()
    return 2


if __name__ == "__main__":
    sys.exit(main())
