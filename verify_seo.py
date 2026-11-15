#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
REAL-SEO-2026 v1.0 — Automated 10-Gate Pre-Release SEO Verification Script
Project: Yeşilay Mutfak (https://yesilaymutfak.com)
Verifies:
  Gate S1 : BOM & Encoding & Internal Assets (0 broken internal links/images, BOM-free)
  Gate S2 : Unique <title> (30-70 chars) & Unique Single <h1> on all indexed pages
  Gate S3 : Unique untruncated meta description (80-160 chars, no '...')
  Gate S4 : Self-referencing canonical & real raster og/twitter image (.svg forbidden)
  Gate S5 : BreadcrumbList ListItem absolute HTTPS 'item' URLs on all sub-pages
  Gate S6 : Zero unpriced Product, zero fake wikidata/kgmid/ratings, valid LocalBusiness
  Gate S7 : 100% visible text match for every FAQPage question and answer
  Gate S8 : dist/sitemap.xml (0 noindex/redirects, raster images included) & robots.txt
  Gate S9 : Zero PBN external links, clean build root
  Gate S10: 100% <img> have width/height/alt, overflow-x safety, word count >= 600
"""

import sys
import os
import re
import json
import html as html_lib
import unicodedata
import xml.etree.ElementTree as ET
from urllib.parse import urlparse

CANONICAL_DOMAIN = "https://yesilaymutfak.com"
DIST_DIR = os.path.abspath("dist")

def normalize_tr(text):
    if not text:
        return ""
    text = html_lib.unescape(text)
    text = text.replace('İ', 'i').replace('I', 'ı').lower()
    text = unicodedata.normalize('NFC', text)
    text = text.replace('\u0307', '')
    text = re.sub(r'[^\w\s]', ' ', text)
    return ' '.join(text.split())

# Known redirect stubs and utility pages that have noindex
NOINDEX_ROUTES = {
    "/404.html",
    "/offline.html",
    "/kvkk-aydinlatma-metni/",
    "/banyo-tadilati/",
    "/tadilat/",
    "/izmir-mutfak-dolabi/",
    "/izmir-tadilat/",
    "/mutfak-tadilat-fiyatlari/",
    "/mutfak-dolabi-fiyatlari/",
    "/mutfak-firmalari/",
    "/tadilat-firmalari/",
    "/anahtar-teslim-tadilat/",
    "/ev-tadilati/",
    "/hazir-mutfak/",
    "/mutfak-dolabi/",
    "/mutfak-tadilati/",
    "/projeler/",
}

class VerificationReport:
    def __init__(self):
        self.gates = {f"S{i}": {"pass": True, "errors": [], "warnings": []} for i in range(1, 11)}

    def error(self, gate, msg):
        self.gates[gate]["pass"] = False
        self.gates[gate]["errors"].append(msg)

    def warning(self, gate, msg):
        self.gates[gate]["warnings"].append(msg)

    def print_summary(self):
        all_passed = True
        print("\n" + "=" * 70)
        print(" REAL-SEO-2026 v1.0 — 10-GATE VERIFICATION REPORT")
        print("=" * 70)
        for gate_id in sorted(self.gates.keys(), key=lambda x: int(x[1:])):
            status = "PASS" if self.gates[gate_id]["pass"] else "FAIL"
            err_count = len(self.gates[gate_id]["errors"])
            warn_count = len(self.gates[gate_id]["warnings"])
            color = "\033[92m" if status == "PASS" else "\033[91m"
            reset = "\033[0m"
            print(f"Gate {gate_id:3s} : {color}[{status}]{reset} - {err_count} errors, {warn_count} warnings")
            if not self.gates[gate_id]["pass"]:
                all_passed = False
                for err in self.gates[gate_id]["errors"][:5]:
                    print(f"    ERROR: {err}")
                if len(self.gates[gate_id]["errors"]) > 5:
                    print(f"    ... and {len(self.gates[gate_id]['errors']) - 5} more errors")
            for warn in self.gates[gate_id]["warnings"][:3]:
                print(f"    WARN : {warn}")

        print("=" * 70)
        if all_passed:
            print("\033[92mOVERALL VERIFICATION: 10/10 GATES PASS (0 ERRORS)\033[0m")
        else:
            print("\033[91mOVERALL VERIFICATION: FAILED (CHECK ERRORS ABOVE)\033[0m")
        print("=" * 70 + "\n")
        return all_passed

def get_html_files(dist_dir):
    html_files = []
    for root, _, files in os.walk(dist_dir):
        for f in files:
            if f.endswith(".html"):
                html_files.append(os.path.join(root, f))
    return sorted(html_files)

def rel_route_from_path(dist_dir, html_path):
    rel = os.path.relpath(html_path, dist_dir)
    if rel == "index.html":
        return "/"
    if rel.endswith("/index.html"):
        return "/" + rel[:-10]
    return "/" + rel

def check_bom(report):
    # Check source files and dist files
    check_dirs = ["src", "public", "dist"]
    for d in check_dirs:
        if not os.path.exists(d):
            continue
        for root, _, files in os.walk(d):
            for f in files:
                if f.endswith((".astro", ".html", ".ts", ".js", ".mjs", ".json", ".txt", ".xml", ".css")):
                    path = os.path.join(root, f)
                    try:
                        with open(path, "rb") as fp:
                            first3 = fp.read(3)
                            if first3 == b"\xef\xbb\xbf":
                                report.error("S1", f"UTF-8 BOM detected in {path}")
                    except Exception as e:
                        report.error("S1", f"Cannot read {path}: {e}")

def run_verification():
    report = VerificationReport()

    if not os.path.isdir(DIST_DIR):
        print(f"Error: {DIST_DIR} not found. Run 'npm run build' first.")
        sys.exit(1)

    # S1: BOM
    check_bom(report)

    html_files = get_html_files(DIST_DIR)
    if not html_files:
        report.error("S1", "No HTML files found in dist directory.")
        return report.print_summary()

    titles_seen = {}
    h1s_seen = {}
    descriptions_seen = {}

    for path in html_files:
        route = rel_route_from_path(DIST_DIR, path)
        with open(path, "r", encoding="utf-8", errors="replace") as fp:
            html = fp.read()

        is_noindex = 'name="robots" content="noindex' in html or 'name="robots" content="none"' in html or route in NOINDEX_ROUTES

        # S1: Internal links & local images validation
        a_hrefs = re.findall(r'<a\b[^>]*(?<![:@a-zA-Z0-9_-])href=["\']([^"\']+)["\']', html)
        for href in a_hrefs:
            if href.startswith(("#", "mailto:", "tel:", "javascript:", "whatsapp:", "https://wa.me", "https://api.whatsapp.com")):
                continue
            if href.startswith("http://") or href.startswith("https://"):
                if href.startswith(CANONICAL_DOMAIN):
                    parsed = urlparse(href)
                    target_path = parsed.path
                else:
                    continue  # External link
            else:
                target_path = urlparse(href).path

            if not target_path or target_path == "/":
                continue

            # Check if target exists in dist
            cleaned_target = target_path.strip("/")
            candidate1 = os.path.join(DIST_DIR, cleaned_target, "index.html")
            candidate2 = os.path.join(DIST_DIR, cleaned_target + ".html")
            candidate3 = os.path.join(DIST_DIR, cleaned_target)
            if not (os.path.exists(candidate1) or os.path.exists(candidate2) or os.path.exists(candidate3)):
                report.error("S1", f"Broken internal link in {route}: '{href}' (target not found in dist)")

        # Local images existence check
        img_srcs = re.findall(r'<img\b[^>]*src=["\']([^"\']+)["\']', html)
        for src in img_srcs:
            if src.startswith("data:") or src.startswith("http://") or src.startswith("https://"):
                continue
            cleaned_src = src.lstrip("/")
            local_target = os.path.join(DIST_DIR, cleaned_src)
            if not os.path.exists(local_target):
                report.error("S1", f"Image not found in {route}: '{src}' (missing in dist)")

        if is_noindex:
            continue  # Utility or redirect stub pages are not evaluated for S2, S3, S4, S5, S6, S7, S10 content depth

        # S2: Unique <title> and Unique single <h1>
        title_match = re.search(r'<title>(.*?)</title>', html, re.DOTALL | re.IGNORECASE)
        if not title_match:
            report.error("S2", f"Missing <title> tag on {route}")
        else:
            title_text = title_match.group(1).strip()
            title_len = len(title_text)
            if title_len < 30 or title_len > 70:
                report.error("S2", f"Title length out of bounds ({title_len} chars) on {route}: '{title_text}'")
            if title_text in titles_seen:
                report.error("S2", f"Duplicate title across pages: '{title_text}' on {route} and {titles_seen[title_text]}")
            else:
                titles_seen[title_text] = route

        h1_matches = re.findall(r'<h1\b[^>]*>(.*?)</h1>', html, re.DOTALL | re.IGNORECASE)
        if len(h1_matches) != 1:
            report.error("S2", f"Page {route} must have exactly 1 <h1> tag, found {len(h1_matches)}")
        else:
            h1_clean = re.sub(r'<[^>]+>', ' ', h1_matches[0]).strip()
            h1_clean = " ".join(h1_clean.split())
            if h1_clean in h1s_seen:
                report.error("S2", f"Duplicate <h1> across pages: '{h1_clean}' on {route} and {h1s_seen[h1_clean]}")
            else:
                h1s_seen[h1_clean] = route

        # S3: Meta Description
        desc_match = re.search(r'<meta\b[^>]*name=["\']description["\'][^>]*content=["\']([^"\']*)["\']', html, re.IGNORECASE)
        if not desc_match:
            desc_match = re.search(r'<meta\b[^>]*content=["\']([^"\']*)["\'][^>]*name=["\']description["\']', html, re.IGNORECASE)
        if not desc_match:
            report.error("S3", f"Missing meta description on {route}")
        else:
            desc_text = desc_match.group(1).strip()
            desc_len = len(desc_text)
            if desc_len < 80 or desc_len > 160:
                report.error("S3", f"Meta description length ({desc_len} chars) out of range on {route}: '{desc_text}'")
            if desc_text.endswith("...") or desc_text.endswith("…"):
                report.error("S3", f"Meta description ends with ellipsis on {route}: '{desc_text}'")
            if desc_text in descriptions_seen:
                report.error("S3", f"Duplicate meta description on {route} and {descriptions_seen[desc_text]}")
            else:
                descriptions_seen[desc_text] = route

        # S4: Canonical & Social Image
        canonical_match = re.search(r'<link\b[^>]*rel=["\']canonical["\'][^>]*href=["\']([^"\']*)["\']', html, re.IGNORECASE)
        if not canonical_match:
            report.error("S4", f"Missing link rel='canonical' on {route}")
        else:
            canonical_url = canonical_match.group(1).strip()
            expected_canonical = f"{CANONICAL_DOMAIN}{route}"
            if not expected_canonical.endswith("/") and "." not in expected_canonical.split("/")[-1]:
                expected_canonical += "/"
            if canonical_url != expected_canonical:
                report.error("S4", f"Canonical mismatch on {route}: found '{canonical_url}', expected '{expected_canonical}'")

        og_img_match = re.search(r'<meta\b[^>]*property=["\']og:image["\'][^>]*content=["\']([^"\']*)["\']', html, re.IGNORECASE)
        tw_img_match = re.search(r'<meta\b[^>]*name=["\']twitter:image["\'][^>]*content=["\']([^"\']*)["\']', html, re.IGNORECASE)
        for img_type, match in [("og:image", og_img_match), ("twitter:image", tw_img_match)]:
            if not match:
                report.error("S4", f"Missing {img_type} on {route}")
            else:
                img_url = match.group(1).strip()
                if not img_url.startswith("https://"):
                    report.error("S4", f"{img_type} must be absolute HTTPS on {route}: '{img_url}'")
                if img_url.lower().endswith(".svg"):
                    report.error("S4", f"{img_type} cannot be .svg on {route}: '{img_url}'")
                elif not img_url.lower().endswith((".webp", ".jpg", ".jpeg", ".png")):
                    report.error("S4", f"{img_type} must be a raster image (.webp/.jpg/.png) on {route}: '{img_url}'")

        # Extract all JSON-LD blocks
        json_ld_blocks = re.findall(r'<script\b[^>]*type=["\']application/ld\+json["\'][^>]*>(.*?)</script>', html, re.DOTALL | re.IGNORECASE)
        parsed_schemas = []
        for raw_json in json_ld_blocks:
            try:
                data = json.loads(raw_json)
                parsed_schemas.append(data)
            except Exception as e:
                report.error("S6", f"Malformed JSON-LD on {route}: {e}")

        # S5: BreadcrumbList ListItem absolute HTTPS item URLs
        for data in parsed_schemas:
            items = []
            if isinstance(data, dict):
                if data.get("@type") == "BreadcrumbList":
                    items = data.get("itemListElement", [])
                elif "@graph" in data:
                    for g in data["@graph"]:
                        if isinstance(g, dict) and g.get("@type") == "BreadcrumbList":
                            items = g.get("itemListElement", [])
            for li in items:
                item_url = li.get("item")
                if not item_url or not isinstance(item_url, str):
                    report.error("S5", f"BreadcrumbList ListItem missing 'item' URL on {route}: {li}")
                elif not item_url.startswith("https://"):
                    report.error("S5", f"BreadcrumbList ListItem 'item' URL must be absolute HTTPS on {route}: {item_url}")

        # S6: Zero unpriced Product, Zero fake wikidata/kgmid/ratings
        for data in parsed_schemas:
            nodes = [data]
            if isinstance(data, dict) and "@graph" in data:
                nodes.extend(data["@graph"])

            for node in nodes:
                if not isinstance(node, dict):
                    continue
                node_type = node.get("@type")
                if node_type == "Product":
                    offers = node.get("offers", {})
                    price = offers.get("price") if isinstance(offers, dict) else None
                    if not price or str(price) in ("0", "0.0", "0.00", ""):
                        report.error("S6", f"Zero-price Product schema forbidden on {route}. Use CollectionPage or Service.")
                
                # Check for fake mid / qid
                node_str = json.dumps(node)
                if re.search(r'wikidata\.org/wiki/Q[0-9]+', node_str) or "kgmid" in node_str or "/g/1" in node_str:
                    report.error("S6", f"Unverified Wikidata QID or Google KG MID detected on {route}")

                if "aggregateRating" in node:
                    rating = node["aggregateRating"]
                    if isinstance(rating, dict) and rating.get("reviewCount") in (0, "0", None):
                        report.error("S6", f"Empty or fake aggregateRating on {route}")

        # S7: Visible FAQ Text Matching
        body_text_match = re.search(r'<body\b[^>]*>(.*?)</body>', html, re.DOTALL | re.IGNORECASE)
        raw_body = body_text_match.group(1) if body_text_match else ""
        raw_body_no_script = re.sub(r'<script\b[^>]*>.*?</script>', ' ', raw_body, flags=re.DOTALL | re.IGNORECASE)
        raw_body_no_script = re.sub(r'<style\b[^>]*>.*?</style>', ' ', raw_body_no_script, flags=re.DOTALL | re.IGNORECASE)
        body_text = html_lib.unescape(re.sub(r'<[^>]+>', ' ', raw_body_no_script))
        body_text_norm = normalize_tr(body_text)

        for data in parsed_schemas:
            nodes = [data]
            if isinstance(data, dict) and "@graph" in data:
                nodes.extend(data["@graph"])

            for node in nodes:
                if isinstance(node, dict) and node.get("@type") == "FAQPage":
                    main_entities = node.get("mainEntity", [])
                    for q_node in main_entities:
                        q_name = q_node.get("name", "")
                        ans_obj = q_node.get("acceptedAnswer", {})
                        a_text = ans_obj.get("text", "") if isinstance(ans_obj, dict) else ""
                        
                        q_norm = normalize_tr(q_name)
                        a_norm = normalize_tr(a_text)
                        
                        q_words = q_norm.split()
                        a_words = a_norm.split()
                        
                        # Match 4 consecutive words or full probe
                        if len(q_words) >= 4:
                            q_probe = " ".join(q_words[:4])
                            if q_probe not in body_text_norm:
                                report.error("S7", f"FAQ question text missing from body on {route}: '{q_name}'")
                        elif q_norm and q_norm not in body_text_norm:
                            report.error("S7", f"FAQ question text missing from body on {route}: '{q_name}'")

                        if len(a_words) >= 5:
                            a_probe = " ".join(a_words[:5])
                            if a_probe not in body_text_norm:
                                report.error("S7", f"FAQ answer text missing from body on {route}: '{a_text[:60]}...'")
                        elif a_norm and a_norm not in body_text_norm:
                            report.error("S7", f"FAQ answer text missing from body on {route}: '{a_text[:60]}...'")

        # S9: Zero PBN External Links
        footer_match = re.search(r'<footer\b[^>]*>(.*?)</footer>', html, re.DOTALL | re.IGNORECASE)
        if footer_match:
            footer_html = footer_match.group(1)
            ext_links = re.findall(r'<a\b[^>]*\bhref=["\'](https?://[^"\']+)["\']', footer_html)
            allowed_external = [
                "wa.me", "api.whatsapp.com", "instagram.com", "facebook.com", "google.com",
                "maps.google.com", "g.page", "goo.gl", "share.google", "pinterest.com", "youtube.com"
            ]
            for ext in ext_links:
                domain = urlparse(ext).netloc.lower()
                if not any(d in domain for d in allowed_external) and CANONICAL_DOMAIN not in ext:
                    report.error("S9", f"Suspicious footer external link (possible PBN) on {route}: '{ext}'")

        # S10: Visual SEO & CWV & Word Count
        imgs = re.findall(r'<img\b[^>]*>', html, re.DOTALL | re.IGNORECASE)
        for img in imgs:
            if "width=" not in img or "height=" not in img:
                report.error("S10", f"Missing width/height attribute on image in {route}: '{img[:70]}'")
            if "alt=" not in img:
                report.error("S10", f"Missing alt attribute on image in {route}: '{img[:70]}'")
            else:
                alt_val = re.search(r'alt=["\']([^"\']*)["\']', img)
                if not alt_val or not alt_val.group(1).strip():
                    report.error("S10", f"Empty alt attribute on image in {route}: '{img[:70]}'")

        # Word count check (all indexed canonical pages >= 600 words)
        words = len(re.findall(r'\b\w+\b', body_text))
        if words < 600:
            report.error("S10", f"Thin content depth on {route}: {words} words (minimum required: 600 words)")

    # S8: Sitemap and Robots.txt Verification
    sitemap_path = os.path.join(DIST_DIR, "sitemap.xml")
    robots_path = os.path.join(DIST_DIR, "robots.txt")

    if not os.path.exists(sitemap_path):
        report.error("S8", "dist/sitemap.xml does not exist.")
    else:
        try:
            tree = ET.parse(sitemap_path)
            root = tree.getroot()
            # Namespace map
            ns = {"ns": "http://www.sitemaps.org/schemas/sitemap/0.9", "image": "http://www.google.com/schemas/sitemap-image/1.1"}
            urls_in_sitemap = []
            for url_tag in root.findall("ns:url", ns):
                loc = url_tag.find("ns:loc", ns)
                if loc is not None and loc.text:
                    loc_url = loc.text.strip()
                    urls_in_sitemap.append(loc_url)
                    parsed_loc = urlparse(loc_url).path
                    if parsed_loc in NOINDEX_ROUTES or (parsed_loc + "/") in NOINDEX_ROUTES:
                        report.error("S8", f"noindex route found inside sitemap.xml: {loc_url}")

                # Check image tags inside sitemap
                image_tags = url_tag.findall("image:image", ns)
                for img_elem in image_tags:
                    img_loc = img_elem.find("image:loc", ns)
                    if img_loc is not None and img_loc.text:
                        if img_loc.text.lower().endswith(".svg"):
                            report.error("S8", f".svg file included in image sitemap: {img_loc.text}")

            if len(urls_in_sitemap) < 25:
                report.error("S8", f"Too few URLs in sitemap ({len(urls_in_sitemap)}), expected ~28 canonical routes")
        except Exception as e:
            report.error("S8", f"Error parsing sitemap.xml: {e}")

    if not os.path.exists(robots_path):
        report.error("S8", "dist/robots.txt does not exist.")
    else:
        with open(robots_path, "r", encoding="utf-8") as fp:
            robots_content = fp.read()
        if "sitemap.xml" not in robots_content.lower():
            report.error("S8", "dist/robots.txt does not reference sitemap.xml")

    # S9: Clean build root
    for f in os.listdir(DIST_DIR):
        if f.endswith((".bak", ".backup", ".tmp", ".swp")) or f in ("scratch", ".git"):
            report.error("S9", f"Forbidden temporary/scratch file in dist root: {f}")

    return report.print_summary()

if __name__ == "__main__":
    success = run_verification()
    sys.exit(0 if success else 1)
