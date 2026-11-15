# AGENTS.md — REAL-SEO-2026 (APEX v4.0) BAĞLAYICI OTONOM KURULUM, GERÇEK TARAYICI DENETİMİ, YAMYAMLAŞMA ÖNLEME VE GSC GERİ BESLEME SÖZLEŞMESİ

* **Belge Statüsü:** Bağlayıcı Teknik Şartname ve Otonom Yürütme Sözleşmesi (`Binding Engineering Contract — v4.0`)
* **Hedef Konum:** Proje Kök Dizini (`/AGENTS.md` — [Cursor Kural Sistemi](https://cursor.com/docs/rules), [Claude Code Bellek Mimarisi](https://docs.anthropic.com/en/docs/claude-code/memory), GitHub Copilot, Codex ve lokal LLM ajanları tarafından oturum başlangıcında otomatik yüklenir)
* **Eşlik Eden Denetim Motoru:** `/seo_enforcer.py` (25 kapılı 100/100 deterministik puanlama, Headless Chromium gerçek CLS/INP/taşma ölçümü, TF-IDF yamyamlaşma analizi, [Google Search Console API](https://developers.google.com/webmaster-tools/v1/searchanalytics/query) optimizasyon reçetesi ve Googlebot sunucu log denetçisi)
* **Zorunlu Kabul Eşiği (SLA):** **`SKOR = 100 / 100` (`25 / 25 Kapı Geçişi — 0 İhlal`)**

## MADDE 1 — SÖZLEŞMENİN KONUSU VE KESİN BAĞLAYICILIK (HARD-STOP KURALI)

1. Bu dosya proje kök dizininde bulunduğu andan itibaren projede çalışan tüm yapay zeka kodlama ajanları ve geliştiriciler için **tavsiye değil, uyulması zorunlu mühendislik sözleşmesidir**.
2. Yeni sayfa üretimi, mevcut arayüz/kod yenilemesi (refactoring), bileşen eklenmesi veya yayına hazırlık işlemlerinin tamamında bu şartnamedeki hükümler doğrudan kaynak kodlara entegre edilir.
3. **Teslim Yasağı:** `python3 seo_enforcer.py --audit` komutu gerçek tarayıcı (Headless Chromium) denetimi dahil olmak üzere **`SKOR: 100/100 — SÖZLEŞME KABUL EDİLDİ`** çıktısı üretmeden ve çıkış kodu `0` dönmeden hiçbir görev "tamamlandı" olarak raporlanamaz. Skor 100'ün altındaysa ajan, kullanıcıdan ek komut beklemeden hataları kaynak kodda düzeltip denetimi tekrar çalıştırmakla yükümlüdür.

## MADDE 2 — SIFIR HALÜSİNASYON VE TEK GERÇEK VERİ KAYNAĞI (`seo.config.json`)

1. [Google Web Araması Spam Politikaları](https://developers.google.com/search/docs/essentials/spam-policies) ve [İnceleme Snippet'i Kuralları](https://developers.google.com/search/docs/appearance/structured-data/review-snippet) uyarınca kodlama ajanı; resmi ticaret unvanı, MERSİS/vergi numarası, fiziksel adres, `+90` E.164 telefon numarası, coğrafi koordinat, ürün fiyatı, stok durumu, kurucu özgeçmişi, müşteri yorumu (`Review`), yıldız puanı (`aggregateRating`) veya Wikidata QID verisini **kesinlikle uyduramaz**.
2. Proje kökünde `seo.config.json` bulunmuyorsa ajan ilk işlem olarak `python3 seo_enforcer.py --init` komutunu çalıştırır ve mevcut kod tabanında doğrulanmış şirket/iletişim verilerini `seo.config.json` içine işler.
3. Kod tabanında karşılığı bulunmayan ve `REQUIRED_REAL_VALUE` olarak kalan zorunlu ticari alanlar varsa ajan tahminde bulunmaz; eksik alanları tek bir net listede kullanıcıdan talep eder.

## MADDE 3 — MİMARİ OTOMATİK KEŞİF VE MERKEZİ KOD ENTEGRASYON HARİTASI

Ajan, proje kök dizinini tarayarak aşağıdaki üç mimariden hangisinin kullanıldığını otomatik tespit eder ve kuralları sayfalara yama yapmak yerine **merkezi şablon mimarisine** kurar:

| Tespit Edilen Mimari | Dosya İmzası | Zorunlu Kod Entegrasyon Noktaları |
| :--- | :--- | :--- |
| **Statik HTML5 / CSS3 / Vanilla JS** | Kök dizinde `index.html`, alt dizinlerde `*/index.html` | Tüm indekslenebilir `.html` dosyalarının `<head>`, `@graph` JSON-LD, ilk ekran (hero), Cevap Kapsülü, mikro-araç, bağlamsal CTA ve `speculationrules` blokları doğrudan güncellenir; kök dizinde `/robots.txt`, `/sitemap.xml`, `/llms.txt` ve `/_headers` oluşturulur. |
| **Astro SSG** | `astro.config.mjs` veya `astro.config.ts` | `src/components/SeoHead.astro` ve `src/utils/schemaGraph.ts` oluşturulur; `BaseLayout.astro` tüm sayfalardan tip güvenli `title`, `description`, `canonicalPath`, `ogImage`, `pageType`, `schemaEntity` ve `faqItems` prop'larını zorunlu alır. Build çıktısı (`./dist`) üzerinden denetlenir. |
| **Next.js (App Router)** | `next.config.js` / `next.config.mjs` + `app/` veya `src/app/` | `src/lib/seoContract.ts` üzerinden merkezi `buildMetadata()` (`max-image-preview: large`, `max-snippet: -1`, self-canonical, raster OG), `SchemaGraph.tsx` JSON-LD bileşeni, `app/robots.ts`, `app/sitemap.ts`, `public/llms.txt` ve güvenlik/önbellek başlıkları kurulur. |

## MADDE 4 — KESİN YASAKLAR (CEZA VE FİLTRE KALKANI)

1. **Çapraz Domain Footer Link Ağı (PBN Yasağı):** Farklı sektörlerdeki kardeş sitelere `<footer>`, `<aside>` veya site geneli şablonlardan dofollow bağlantı verilemez (`G20`). Zorunlu holding/iş ortaklığı bağlantıları yalnızca ilgili tekil sayfada `rel="noopener"` veya ticari sponsorluksa `rel="sponsored noopener"` taşır.
2. **Fiyatsız `@type: "Product"` Yasağı:** Sayfada gerçek sayısal satış fiyatı (`offers.price` veya `offers.lowPrice` + `priceCurrency`) görünür değilse `@type: "Product"` basılamaz (`G12`, [Google Ürün Yapısal Verisi](https://developers.google.com/search/docs/appearance/structured-data/product)). Teklif usulü B2B ve özel üretim sayfalarda `ItemPage` + `mainEntity: Service` kullanılır.
3. **Kendine Hizmet Eden Yıldız Puanı ve Gizli SSS Yasağı:** `Organization` veya `LocalBusiness` düğümlerine kendi sitenizde derlenmiş `aggregateRating` eklenemez (`G12`). Sayfa gövdesinde kullanıcının gözle göremediği hiçbir soru-cevap `FAQPage` şemasına yazılamaz (`G13`).
4. **SVG Sosyal/Şema Görseli Yasağı:** `og:image`, `twitter:image`, `sitemap.xml` görsel düğümleri ve JSON-LD `image`/`logo` alanlarında `.svg` uzantılı dosya kullanılamaz (`G09`, `G18`); tamamı gerçek raster (`.webp`, `.jpg`, `.png`, `.avif`) olmak zorundadır.
5. **Sığ Kopya Sayfa ve Anlamsal Yamyamlaşma Yasağı:** İki farklı alt sayfa aynı arama niyetini hedefleyerek birbirinin sırasını baltalayamaz (`G21` — başlık, H1, URL ve Cevap Kapsülü ağırlıklı TF-IDF kosinüs benzerliği `0.78` altında kalmalıdır).

## MADDE 5 — `<head>`, ARAMA NİYETİ VE SERP ÖNİZLEME SÖZLEŞMESİ

İndekslenen (`index, follow`) her sayfa aşağıdaki kuralları %100 sağlar:

1. **`<title>` Mühendisliği (`G04`, 30–70 Karakter):** Asla iç stok/model koduyla (`MOD-04`, `SKU-12`) başlamaz; müşterinin aradığı ana ticari terimle başlar ve tüm sitede benzersizdir.
2. **Tekil `<h1>` Zorunluluğu (`G05`):** Her sayfada arama niyetini doğrudan yanıtlayan **tam 1 adet** dolu ve benzersiz `<h1>` etiketi bulunur.
3. **Tıklama Odaklı `meta description` (`G06`, 85–160 Karakter):** Cümlesi üç noktayla (`...` veya `…`) kesilmeyen, somut teknik/ticari fark ve eylem çağrısı içeren benzersiz açıklama yazılır.
4. **Tam Genişlikli SERP ve AI Önizleme Direktifi (`G07`):** [Google Robots Meta Etiketi Spesifikasyonu](https://developers.google.com/search/docs/crawling-indexing/robots-meta-tag) gereği her indekslenen sayfada şu etiket zorunludur:
   ```html
   <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
   ```
5. **Kanonik URL ve Raster Open Graph (`G08`, `G09`):** Her sayfa kendi nihai HTTPS adresine (`https://domain.com/slug/`) tam eşleşen `<link rel="canonical">` ve `1200x630` raster `og:image` + `twitter:image` tanımlar. Çok dilli ihracat sitelerinde çift yönlü `hreflang` + `x-default` zorunludur.

## MADDE 6 — BAĞLANTILI VARLIK GRAFI (`@graph` + `@id` JSON-LD SÖZLEŞMESİ)

Sayfadaki tüm yapısal veriler tek bir `<script type="application/ld+json">` içinde `@graph` dizisi olarak kurgulanır (`G10`) ve kalıcı `@id` URI'leriyle birbirine bağlanır:

1. **Zorunlu Çekirdek Düğümler:** `#organization` (sektörel `LocalBusiness` alt tipi), `#website`, `#webpage` ve alt sayfalarda her `ListItem` öğesinde mutlak `https://` `"item"` URL'si dolu `#breadcrumb` (`G11`).
2. **Sayfa Tipine Göre Zorunlu Ana Varlık:** Fiyatlı e-ticarette [Merchant Listing](https://developers.google.com/search/docs/appearance/structured-data/merchant-listing) + [ProductGroup](https://developers.google.com/search/docs/appearance/structured-data/product-variants) + [MerchantReturnPolicy](https://developers.google.com/search/docs/appearance/structured-data/return-policy) + [ShippingService](https://developers.google.com/search/docs/appearance/structured-data/shipping-policy); teklif usulü B2B'de `ItemPage` + `Service`; hesaplama araçlarında `WebApplication` / `SoftwareApplication`; uzmanlık içeriklerinde [E-E-A-T](https://developers.google.com/search/blog/2022/12/google-raters-guidelines-e-e-a-t) uyumlu `Article` + `ProfilePage` bağlantılı `Person` + editoryal incelemelerde görünür metinle eşleşen [positiveNotes / negativeNotes](https://developers.google.com/search/docs/appearance/structured-data/product-snippet).

## MADDE 7 — NAVBOOST ETKİLEŞİM MÜHENDİSLİĞİ (`lastLongestClicks`) VE CRO KÖPRÜSÜ

[Google Content Warehouse API sızıntısıyla](https://www.hobo-web.co.uk/the-google-content-warehouse-leak-2024/) doğrulanan 13 aylık [goodClicks ve lastLongestClicks](https://blckalpaca.at/en/knowledge-base/seo-geo/on-page-seo/user-engagement-signals-navboost-as-confirmed-ranking-factor) sıralama sinyallerini maksimize etmek için:

1. **İlk Ekran Niyet Kilidi ve İnteraktif Mikro-Araç (`G17`):** Ticari kategori, hizmet ve hesaplama sayfalarında kullanıcının sayfada kalıp etkileşime girmesini sağlayan sıfır bağımlılıklı bir hesaplayıcı, ölçü/maliyet seçici veya karşılaştırma tablosu (`data-seo-interactive="true"`) bulunur.
2. **Bağlamsal Dönüşüm (CRO) Linkleri:** WhatsApp ve teklif butonları incelenen sayfanın başlığını, URL yolunu ve seçilen teknik parametreyi dinamik olarak mesaja işler.

## MADDE 8 — GERÇEK TARAYICI RENDER DENETİMİ: LCP, INP, CLS, TAŞMA VE SPECULATION RULES

[Core Web Vitals](https://web.dev/articles/top-cwv) ve [web.dev INP standartları](https://web.dev/articles/inp) yalnızca kaynak kod metniyle değil, Headless Chromium içinde gerçek DOM render edilerek ölçülür:

1. **Statik Görsel ve LCP Kuralları (`G14`, `G15`):** İndekslenen her sayfanın ilk ekran (hero) `<img>` etiketinde `fetchpriority="high"` bulunur (`loading="lazy"` yasaktır). Tüm `<img>` etiketlerinde sayısal `width`, `height` ve anlamlı Türkçe `alt` metni zorunludur.
2. **0 ms Sayfa Geçişi ve bfcache (`G16`):** Her sayfada [Speculation Rules API](https://web.dev/case-studies/rayban-speculation-rules) (`<script type="speculationrules">`) bulunur; `Cache-Control: no-store` ve `unload` dinleyicileri yasaktır.
3. **Headless Chromium Gerçek Ekran ve Performans Kapıları (`G22`, `G23`, `G24`):**
   * **Sıfır Yatay Taşma (`G22`):** Mobil (`390×844`) ve masaüstü (`1440×900`) çözünürlüklerde `document.documentElement.scrollWidth <= window.innerWidth` şartı sağlanır (`overflow-x = 0`).
   * **Gerçek CLS Denetimi (`G23`):** `PerformanceObserver('layout-shift')` ile ölçülen gerçek kümülatif düzen kayması `0.10` altında (hedef `0.00`) kalır.
   * **Main-Thread Long Task / INP ve Konsol Hijyeni (`G24`):** Sayfa açılışında ve `[data-seo-interactive="true"]` etkileşiminde `200 ms` üstü tekil ana iş parçacığı bloklaması, yakalanmamış JS hatası (`pageerror`) ve `404` ağ isteği bulunamaz.

## MADDE 9 — AEO CEVAP KAPSÜLÜ, YAMYAMLAŞMA ÖNLEME, GSC API VE SUNUCU LOG DÖNGÜSÜ

1. **AEO / RAG Cevap Kapsülü (`G17`):** [Google AI Arama](https://developers.google.com/search/blog/2025/05/succeeding-in-ai-search) ve [Yararlı İçerik Sistemi](https://developers.google.com/search/docs/fundamentals/creating-helpful-content) gereği her sayfada `<h1>` sonrasında konuyu dolgusuz özetleyen 25–80 kelimelik `<p data-answer-capsule="true">` paragrafı ve [görsel telif meta verileri](https://developers.google.com/search/docs/appearance/structured-data/image-license-metadata) bulunur; yetim sayfa sayısı `0` olmalıdır.
2. **Keşif Dosyaları (`G18`, `G19`):** Kök dizinde `/robots.txt`, görsel destekli `/sitemap.xml`, [llms.txt v2](https://llmstxt.org/) ve [IndexNow](https://www.indexnow.org/documentation) doğrulama dosyası eksiksiz yer alır.
3. **Anlamsal Yamyamlaşma Kalkanı (`G21`):** `seo_enforcer.py`, tüm indekslenebilir sayfaların başlık, `<h1>`, URL ve Cevap Kapsülü vektörlerini karşılaştırır. Kosinüs benzerliği `>= 0.78` olan rakip iç sayfalar tespit edilirse ajan sayfaları birleştirmek veya arama niyetlerini ayrıştırmak zorundadır.
4. **Canlı Google Search Console ve Log Geri Beslemesi (`G25`, `--gsc-sync`, `--log-audit`):**
   * Canlı sitelerde [Search Console Search Analytics API](https://developers.google.com/webmaster-tools/v1/searchanalytics/query) veya dışa aktarılan performans CSV dosyası `python3 seo_enforcer.py --gsc-file gsc.csv` (veya `--gsc-api`) ile işlenerek `seo_actions.json` ve `GSC_OPTIMIZATION_PLAN.md` üretilir.
   * Üretilen rapordaki **1)** Gerçek Sorgu Yamyamlaşması (aynı kelimede bölünen URL'ler), **2)** Düşük CTR'li İlk Sayfa Başlıkları ve **3)** Vuruş Mesafesi (`Pozisyon 8–20`) İç Link Takviyesi görevleri kodda kapatılmadan `G25` kapısı geçilmez.
   * Sunucu erişim logları mevcutsa `python3 seo_enforcer.py --log-audit access.log ./dist` komutuyla Googlebot'un taramadığı yetim/sığ sayfalar tespit edilip ana kategori (Hub) sayfalarından doğrudan iç link verilir.

## MADDE 10 — OTONOM 7 AŞAMALI YÜRÜTME DÖNGÜSÜ (AJAN ALGORİTMASI)

1. **Kurulum (`--init`):** `python3 seo_enforcer.py --init --domain https://domain.com` çalıştırarak `.cursor/rules/00-real-seo-contract.mdc`, `CLAUDE.md`, `.git/hooks/pre-commit`, `seo.config.json` ve `_headers` kilitlerini kur.
2. **Veri Doğrulaması:** `seo.config.json` içindeki `REQUIRED_REAL_VALUE` alanlarını gerçek proje kayıtlarıyla doldur; eksik ticari bilgi varsa uydurmadan kullanıcıya sor.
3. **GSC / Log Analizi (Canlı Sitede Güncelleme Yapılıyorsa):** Mevcut GSC verisi veya erişim logu varsa `--gsc-file` / `--gsc-api` ve `--log-audit` çalıştırarak `seo_actions.json` aksiyon planını oluştur.
4. **Merkezi Kod Enjeksiyonu:** Şablonlara `<head>`, `@graph` JSON-LD, Cevap Kapsülü, mikro-araç, bağlamsal CTA, görsel boyut/`fetchpriority` ve `speculationrules` bileşenlerini entegre et; `seo_actions.json` içindeki başlık ve iç link görevlerini uygula.
5. **Keşif Üretimi:** `/sitemap.xml`, `/robots.txt`, `/llms.txt` ve `{indexNowKey}.txt` dosyalarını üret.
6. **25 Kapılı Tam Denetim (`--audit`):** Projeyi derle ve `python3 seo_enforcer.py --audit <build_dizini> <https://domain.com>` komutunu çalıştır (statik + TF-IDF yamyamlaşma + Headless Chromium render denetimi).
7. **100/100 Öz-Onarım Döngüsü:** Skor `100/100` olana kadar her `[G01]–[G25]` ihlalini onarıp yeniden denetle; yalnızca `SKOR: 100/100` çıktısı alındığında görevi teslim et.
