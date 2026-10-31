# GELİŞTİRİCİ / CODING AGENT İÇİN TEK PARÇA UYGULAMA TALİMATI

**ROL:** SEO teknik lideri + senior frontend/backend + güvenlik + büyüme analisti. **SCOPE:** Yalnız https://yesilaymutfak.com/projelendirme/ ve bu sayfa için yeni servis dosyaları. Diğer canlı sayfalara izin verilmemiş büyük yeniden tasarım, alan adı taşıma veya mevcut dönüşüm kanallarını bozma yok.

## Sonuç
Google organik, yerel arama, gerçek AI kaynak gösterimi ve doğrudan girişlerden nitelikli B2B ticari fit-out keşif talepleri elde eden, ölçülebilir, kullanıcının görünen içeriğiyle tutarlı, sahte iddia içermeyen sistem. Amaç '100/100 sıralama' değil, teknik kabul kriterlerinde sıfır P0 hata ve kanıtlı nitelikli müşteri çıktısı.

## Girdiler
Bu paketteki bütün dosyaları oku; mevcut repository'de gerçek site teknolojisini keşfet: framework/CMS, statik üretim, canonical/robots/sitemap kaynağı, mevcut title/OG/schema, analytics/cookie consent, WhatsApp eventleri, form backend, güvenlik/CDN. Önce **mevcut somut kod satırlarını tespit et**; sonra tekil diff üret. Site reposu yoksa 'yerleştirme kılavuzu' ver, deploy edildiğini iddia etme.

## Minimum doğrulanmış gerçekler
- URL mevcut ve canonical kendisini gösterir.
- Mevcut sayfa B2B ticari mekân fit-out ve mimari projelendirme temalıdır.
- Mevcut 10 sektör kapsamı, '18 seçkin proje', '%99 görsel ve boyutsal sadakat', sabit fiyat, çok sayıda WhatsApp CTA vardır.
- Mevcut iki WA numarası: 905324261788 ve 905446348344, mevcut işleyiş/atama teyidi gerekli.
- Mevcut `/llms.txt` ve `/llms-full.txt` var; `/llms/pages/projelendirme.md` 404, site `/sitemap.xml` içinde URL mevcut.
- Güncel Google rehberi `llms.txt` dosyasını Google sıralaması için kullanmıyor; Google FAQ rich-result özelliği Mayıs 2026'da kaldırıldı.

## Kesin iş akışı
1. **KOD DENETİMİ:** Kopya meta/title, kanonik, robot, JSON-LD, sitemap, HTML heading, resim yükü, form ve başlık hiyerarşisi için dosya/line referanslı rapor.
2. **KAPASİTE/İDDİA DENETİMİ:** 18 portföy ile yüzde/uyum/garanti iddialarının gerçek belge kontrolü olmadan yayınlanacak güven metnini sadeleştir, gerçek/konsept ayrımı uygula. Kaynak yoksa bu iddiaları çıkar; geçici durumu açık anlat.
3. **SEO DEĞİŞİKLİĞİ:** `seo/head.html` içeriğini mevcut tag'leri replace ederek entegre et; içerikten H1/H2 ve açılış CTA'larını `content/01-SAYFA-METINLERI.md` ile tutarlı düzelt. Sayfanın çalışan stil ve erişilebilirlik sınıfları korunur.
4. **SCHEMA:** `seo/structured-data.json` içindeki WebPage, Service, BreadcrumbList ve tek Organization entity `@id` ilişkileriyle yerleştir; mevcut sitewide graph ile birleştir. Gerçekte olmayan rating, prices, reviews, physician accreditation yok.
5. **AI/GEO:** `llms/pages/projelendirme.md` yayımla, root llms dosyasına sadece verilen iki linki ekle; mevcut övünme, RFC ve 2027 ibarelerini temizlemek için ayrıca iş emri çıkar. llms dosyasını Google özel ranking faktörü diye pazarlama.
6. **MOBİL CRO:** Sektör odaklı iki CTA, kanıtlı vaka, 4 adımlı çalışma, şeffaf kapsam, gerçek SSS, kolay teklif formu. 10 görselin LCP'ye etkisini test et; görsel kaldırma orijinal tasarımı bozmaz şekilde uygulanır.
7. **LEAD BACKEND:** Cloudflare zone doğrulanırsa `worker/` dağıtılır; değilse eşdeğer güvenlikte mevcut hosting API'sine adapte edilir. Form rızası/açıklama linki, Turnstile, origin, idempotency, D1, rate limit, webhook imzası ve retry tam olmalı. Sahte test olarak gerçek müşteri ad/telefonu gönderilmez.
8. **ANALYTICS:** GA4 yalnız rızayla PII'siz events, CRM/finans satış aşamaları. GSC/GA4/CRM kaynak ve tarihli baz değerler.
9. **TEST:** `node --test tests/*.test.mjs`, JSON parse, staging Lighthouse ve GSC Inspector; 60 noktalı kabul matrisi. Diff sonrası bütün etkilenmiş sayfalarda smoke test.
10. **DAĞITIM:** Staging ekran görüntüsü + kullanıcı onayı + önceki release hash + kanıtlı production deploy + rollback planı + 72 saat izleme.

## Kritik kalite kapıları
- P0 reddedilirse deploy etme. Çalışan müşteri numarası, KVKK metni, CRM sorumlusu ve portföy yetkisi hazır değilse yalnız teknik staging sürümü üret.
- Gerçek veri yetersizliğinde tahmini fiyat, % başarı, organik trafik, müşteri kazanımı, 1. sıra veya garantili lead raporu üretme.
- Var olan formun yerini yenisi alıyorsa kesintisiz geri alma ve data reconciliation yolu göster.
- Her çalışma sonunda yalnız değişen dosyalar, diff, test komutları, test geçişleri, canlı URL ve P0 riskleri raporla.

## Çıktı kontratı
```
changed_files[]
unverified_claims[]
blocking_dependencies[]
tests_executed[{command,result}]
acceptance_gate[{id,result,evidence}]
rollback_release_id
production_deployed: true/false
real_lead_verified: true/false
```

**Karar:** Çalışma, P0 teknik ve gerçeklik kontrolleri PASS olmadan müşteriye başarı sertifikası veya gerçek dünyaya deploy edilmiş ürün diye sunulmaz.
