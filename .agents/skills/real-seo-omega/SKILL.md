---
name: real-seo-omega
description: REAL-SEO-2026 APEX v6.0 ABSOLUTE (100/100) referans HTML5, JSON-LD (@graph + Dataset + ImageObject), Query Fan-Out TOC, WebMCP hesaplayıcı, pasif backlink mıknatısı ve dönüşüm izleme kod şablonları. Projeye SEO ve AI görünürlüğü uygularken bu şablonları doğrudan referans al.
---

# REAL-SEO-2026 (APEX v6.0 ABSOLUTE) — GRAVITY UYGULAMA VE KOD ŞABLON KILAVUZU

Bu beceri dosyası, `AGENTS.md` içindeki **100 Atomik Kapının (`G001`–`G100`)** tek seferde ve sıfır hatayla geçilmesi için gereken **üretim kalitesindeki referans kod bloklarını** içerir.

## 1. Altın Standart `<head>` Şablonu (`G006`–`G008`, `G021`–`G030`, `G038`, `G068`, `G086`, `G093`)

* `<title>`: `30–65` krk, `<= 580px`, anahtar kelime ilk 3 kelimede.
* `preload`: `<main>` içindeki ilk içerik görseliyle (`LCP Hero`) birebir aynı `href` adresine işaret etmelidir.
* Harici CSS font kullanılıyorsa URL içinde `display=swap` bulunmalı veya sistem font yığını kullanılmalıdır.

```html
<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>[Ana Ticari Anahtar Kelime] ve [Fark Yaratan Değer] | [Marka]</title>
  <meta name="description" content="[90-158 karakter: Somut sayısal/teknik kanıt, teslim/garanti standardı ve net eylem çağrısı içeren kesintisiz tam cümle.]" />
  <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />

  <link rel="canonical" href="https://domain.com/ornek-hizmet/" />
  <link rel="alternate" type="text/markdown" href="https://domain.com/ornek-hizmet/index.md" />
  <link rel="alternate" type="application/atom+xml" title="[Marka] Güncellemeler" href="https://domain.com/feed.xml" />
  <link rel="preload" as="image" href="/assets/img/ornek-hizmet-ana-gorsel.webp" fetchpriority="high" />

  <meta property="og:locale" content="tr_TR" />
  <meta property="og:type" content="website" />
  <meta property="og:title" content="[Ana Ticari Anahtar Kelime] ve [Fark Yaratan Değer] | [Marka]" />
  <meta property="og:description" content="[90-158 karakterlik kesintisiz meta açıklama ile uyumlu sosyal özet.]" />
  <meta property="og:url" content="https://domain.com/ornek-hizmet/" />
  <meta property="og:image" content="https://domain.com/assets/img/ornek-hizmet-sosyal-kart.webp" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:image" content="https://domain.com/assets/img/ornek-hizmet-sosyal-kart.webp" />
</head>
```

## 2. Birleşik `@graph` JSON-LD Şablonu (`G041`–`G050`: Knowledge Graph + `ImageObject` + `Dataset` + `FAQPage`)

`seo.config.json` içindeki doğrulanmış verileri kullanarak her sayfada **tek bir** `<script type="application/ld+json">` üretin:

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "ProfessionalService",
      "@id": "https://domain.com/#organization",
      "name": "[Gerçek Marka Adı]",
      "legalName": "[Gerçek Resmi Ticaret Ünvanı]",
      "url": "https://domain.com/",
      "telephone": "+902320000000",
      "email": "iletisim@domain.com",
      "image": "https://domain.com/assets/img/ornek-hizmet-ana-gorsel.webp",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "[Gerçek Açık Adres]",
        "addressLocality": "İzmir",
        "addressRegion": "İzmir",
        "postalCode": "35000",
        "addressCountry": "TR"
      },
      "geo": {
        "@type": "GeoCoordinates",
        "latitude": "38.4237",
        "longitude": "27.1428"
      },
      "sameAs": ["https://www.linkedin.com/company/gercek-profil"]
    },
    {
      "@type": "WebSite",
      "@id": "https://domain.com/#website",
      "url": "https://domain.com/",
      "name": "[Gerçek Marka Adı]",
      "publisher": { "@id": "https://domain.com/#organization" }
    },
    {
      "@type": "ImageObject",
      "@id": "https://domain.com/ornek-hizmet/#primaryimage",
      "contentUrl": "https://domain.com/assets/img/ornek-hizmet-ana-gorsel.webp",
      "width": 1200,
      "height": 630,
      "creator": { "@id": "https://domain.com/#organization" },
      "creditText": "[Gerçek Marka Adı]",
      "copyrightNotice": "© 2026 [Gerçek Resmi Ticaret Ünvanı]",
      "acquireLicensePage": "https://domain.com/iletisim/"
    },
    {
      "@type": "Person",
      "@id": "https://domain.com/#author",
      "name": "[Gerçek Uzman / Kurucu Adı]",
      "jobTitle": "[Gerçek Ünvanı]",
      "knowsAbout": ["[Uzmanlık Alanı 1]", "[Uzmanlık Alanı 2]"],
      "url": "https://domain.com/hakkimizda/"
    },
    {
      "@type": "WebPage",
      "@id": "https://domain.com/ornek-hizmet/#webpage",
      "url": "https://domain.com/ornek-hizmet/",
      "name": "[Sayfa Başlığı]",
      "datePublished": "2026-11-01",
      "dateModified": "2026-11-25",
      "isPartOf": { "@id": "https://domain.com/#website" },
      "primaryImageOfPage": { "@id": "https://domain.com/ornek-hizmet/#primaryimage" },
      "author": { "@id": "https://domain.com/#author" },
      "about": { "@type": "Thing", "name": "[Ana Konu Varlığı]" },
      "mentions": [
        { "@type": "Thing", "name": "[İlgili Standart / Teknik Kavram 1]" },
        { "@type": "Thing", "name": "[İlgili Standart / Teknik Kavram 2]" }
      ]
    },
    {
      "@type": "Dataset",
      "@id": "https://domain.com/ornek-hizmet/#dataset",
      "name": "[Sayfa Konusu] Teknik Spesifikasyon ve Karşılaştırma Veri Kümesi",
      "description": "[En az 50 karakterlik veri kümesi özeti: Bu tablo ilgili hizmetin teknik toleranslarını, kapasite aralıklarını ve birim parametrelerini içerir.]",
      "creator": { "@id": "https://domain.com/#organization" },
      "license": "https://creativecommons.org/licenses/by/4.0/"
    },
    {
      "@type": "BreadcrumbList",
      "@id": "https://domain.com/ornek-hizmet/#breadcrumb",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "[Marka Ana Merkez]", "item": "https://domain.com/" },
        { "@type": "ListItem", "position": 2, "name": "[Sayfa H1 Başlığı]", "item": "https://domain.com/ornek-hizmet/" }
      ]
    },
    {
      "@type": "FAQPage",
      "@id": "https://domain.com/ornek-hizmet/#faq",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "[Sayfada Birebir Görünen Soru?]",
          "acceptedAnswer": { "@type": "Answer", "text": "[Sayfada Birebir Görünen Net Cevap.]" }
        }
      ]
    }
  ]
}
</script>
```

## 3. İlk Ekran (`<600px`), Semantik Üçlü Kapsül, İçindekiler (`#id`), Duyarlı Görsel ve Pasif Backlink Mıknatısı (`G031`–`G040`, `G051`–`G080`, `G087`–`G090`)

```html
<main>
  <h1>[Title ile Aynı Niyeti Paylaşan Ama Karakteri Karakterine Kopyası Olmayan Benzersiz H1]</h1>
  <p><small>Son doğrulama: <time datetime="2026-11-25">25 Kasım 2026</time></small></p>

  <!-- G051-G052: Zamirsiz Özne-Yüklem-Nesne Cevap Kapsülü (25-80 kelime) -->
  <p data-answer-capsule="true">
    [Marka Adı] [Hizmet Adı], [hedef sektör/müşteri grubu] için [ISO/TSE/teknik standart] kapsamında [somut sayısal kapasite/tolerans/süre] değerleriyle doğrulanabilir çözüm üretir...
  </p>

  <!-- G075-G077 & G088: İlk ekranda bağlamsal CTA + E.164 Tıkla-Ara + Dönüşüm Olayı -->
  <div class="cta-bar">
    <a data-cro-cta="true" data-conversion-event="whatsapp_lead"
       href="https://wa.me/902320000000?text=Merhaba%2C%20/ornek-hizmet/%20sayfasindan%20teklif%20istiyorum">
      Hızlı Teknik Teklif Alın
    </a>
    <a data-conversion-event="phone_call" href="tel:+902320000000">+90 (232) 000 00 00</a>
  </div>

  <!-- G031-G039: Tireli ASCII dosya adı, .webp/.avif, width/height, srcset/sizes ve fetchpriority="high" -->
  <img src="/assets/img/ornek-hizmet-ana-gorsel.webp"
       srcset="/assets/img/ornek-hizmet-ana-gorsel.webp 1200w"
       sizes="(max-width: 768px) 100vw, 1080px"
       width="1200" height="630"
       fetchpriority="high" decoding="sync"
       alt="[Görselin neyi gösterdiğini anlatan 10-125 karakterlik doğal açıklama]" />

  <!-- G046: Alt Sayfa Breadcrumb — Her zaman sayfanın .container / max-width sarıcısı içinde konumlandırılır -->
  <div class="container">
    <nav aria-label="Breadcrumb" class="breadcrumb-nav">
      <a href="/">Ana Sayfa</a> › <span>[Sayfa Başlığı]</span>
    </nav>
  </div>

  <!-- G054-G055: SERP Sitelinks ve AI Derin Pasaj Çapaları için İçindekiler
       KURALLAR: Kaba #f8fafc beyaz kutu veya [:42] kelime ortası kırpma YASAKTIR!
       Sayfa tasarımına uyumlu ince hap/pill veya yatay bağlantı şeridi olarak .container içinde yer alır. -->
  <div class="container">
    <nav aria-label="İçindekiler" data-toc="true" class="inline-pill-toc">
      <strong>Bu Sayfada:</strong>
      <a href="#teknik-kapasite">Teknik Kapasite</a> ·
      <a href="#maliyet-karsilastirmasi">Maliyet ve Standart Karşılaştırması</a> ·
      <a href="#uygulama-sureci">Uygulama ve Teslim Süreci</a>
    </nav>
  </div>

  <!-- G053-G059: En az 3 adet id'li H2 + Atomik Pasaj + Sayısal Kanıt + Tablo + Otorite Referansı -->
  <section>
    <h2 id="teknik-kapasite">Teknik Kapasite ve Ölçüm Standartları</h2>
    <p>[Alt soruyu doğrudan yanıtlayan, sayısal birim ve standart (örn. ISO 9001) içeren <180 kelimelik net paragraf.]</p>
  </section>

  <section>
    <h2 id="maliyet-karsilastirmasi">Maliyet ve Performans Karşılaştırma Matrisi</h2>
    <p>[Karşılaştırma tablosunun bağlamını özetleyen atomik paragraf.]</p>
    <table>
      <thead><tr><th>Kriter</th><th>Standart Çözüm</th><th>Gelişmiş Çözüm</th></tr></thead>
      <tbody><tr><td>Tolerans</td><td>+/- 0.10 mm</td><td>+/- 0.03 mm</td></tr></tbody>
    </table>
  </section>

  <section>
    <h2 id="uygulama-sureci">Uygulama Süreci ve Canlı Hesaplama Aracı</h2>
    <p>[Teslim ve uygulama adımlarını açıklayan atomik paragraf.]</p>

    <!-- G069 & G073: NavBoost Etkileşim Aracı + Chrome WebMCP Bildirimsel Form -->
    <div data-seo-interactive="true">
      <form toolname="calculateServiceEstimate" tooldescription="Girilen teknik parametreye göre tahmini süre veya maliyet aralığını hesaplar" data-conversion-event="calculator_use">
        <!-- Sıfır bağımlılıklı hesaplama alanları -->
      </form>
    </div>

    <!-- G074: Pasif Doğal Backlink & Kaynak Gösterme Mıknatısı (PageRank_NS) -->
    <aside data-backlink-magnet="true">
      <small>Bu veri ve hesaplama aracını kaynak göstererek paylaşın:</small>
      <code>Kaynak: &lt;a href="https://domain.com/ornek-hizmet/"&gt;[Marka Adı] — [Sayfa Konusu] Veri Rehberi&lt;/a&gt;</code>
    </aside>
  </section>
</main>
```

## 4. Dönüşüm İzleme ve Speculation Rules Kapanışı (`G077`, `G081`)

Sayfa sonuna `speculationrules` ve hafif (0 ms bloklamalı) dönüşüm olayı dinleyicisini ekleyin:

```html
<script>
document.addEventListener('click', function(e) {
  var t = e.target && e.target.closest ? e.target.closest('[data-conversion-event]') : null;
  if (!t) return;
  var evName = t.getAttribute('data-conversion-event');
  if (window.dataLayer) { window.dataLayer.push({ event: evName, page: location.pathname }); }
}, { passive: true });
</script>
<script type="speculationrules">
{
  "prerender": [{ "where": { "href_matches": "/*" }, "eagerness": "moderate" }]
}
</script>
```
