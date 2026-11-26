---
description: REAL-SEO-2026 APEX v6.0 ABSOLUTE — 100/100 Otonom Uygulama, AI Paketi Üretimi ve Öz-Onarım İş Akışı
---

# `/seo-100-uygula` — Otonom 100/100 SEO, GEO ve Gelir Mimarisi İş Akışı

1. Kök dizinde `seo.config.json` yoksa `python3 seo_enforcer.py --init --domain https://hedefdomain.com` çalıştır; proje dosyalarındaki doğrulanmış şirket/iletişim verilerini işle, eksik gerçek verileri uydurmadan kullanıcıya sor.
2. `.agents/skills/real-seo-omega/SKILL.md` ve `AGENTS.md` şablonlarını referans alarak merkezi layout, `<head>`, `@graph` JSON-LD (`Dataset` + `ImageObject`), BOFU para sayfaları, `#id` İçindekiler, Query Fan-Out pasajları, WebMCP interaktif hesaplayıcı ve `data-backlink-magnet="true"` bileşenlerini kodla.
3. Projeyi derle (statik HTML ise `.`, Astro ise `npm run build` -> `./dist`, Next.js ise `./out`).
4. `python3 seo_enforcer.py --build-ai-pack <build_dizini>` komutunu çalıştırarak `.md` ikizlerini, `/llms.txt`, `/llms-full.txt`, `/feed.xml`, `/sitemap.xml`, `/robots.txt`, `/404.html` ve `/.well-known/security.txt` dosyalarını üret.
5. `python3 seo_enforcer.py --audit <build_dizini> <https://hedefdomain.com>` komutunu çalıştır.
6. Skor `100/100` (`100/100` kapı) olana kadar her başarısız kapının altındaki `[ÇÖZÜM]` talimatını kaynak kodda uygula ve 4–5. adımları tekrarla.
