# YEŞİLAY MUTFAK — PROJELENDİRME SEO/GEO/AEO/LLM + SATIŞ MOTORU

**Tarih:** 31.10.2026  
**Hedef URL:** https://yesilaymutfak.com/projelendirme/  
**Durum:** Kod ve iş planı hazır; canlı siteye uygulanmadı. Canlı hesap, sunucu, CRM ve hukuki beyan doğrulaması gereken noktalar açık bırakıldı.  
**Gözlem kaynağı:** Hedef URL'nin, ana sayfanın, sitemap'in, robots.txt ve llms.txt dosyalarının canlı içerik çıkarımı; Google'ın resmi SEO ve OpenAI crawler belgeleri.

## Kurulum için doğru sıra

1. `audit/00-CANLI-DENETIM.md`: gerçek durum ve yanlış/riske açık beyanlar.
2. `ops/01-TEKNIK-SARTNAME.md`: sayfanın ticari iş modeli, SEO mimarisi, sektör kümeleri, RACI, veri ve kabul kapıları.
3. `content/01-SAYFA-METINLERI.md`: H1, başlık, sektör açıklamaları, süreç, SSS, kısa satış metni.
4. `seo/head.html`: **Mevcut head'e körlemesine yapıştırma!** Mevcut title/description/canonical/og/twitter alanlarını *değiştir*, aynı metalar ikinci kez eklenmesin.
5. `seo/structured-data.json`: JSON-LD grafiğini sayfaya **tek bir** `<script type="application/ld+json">` ile yerleştir. Varlık kimliği ve yerel işletme beyanlarını gerçek kayıtlarla eşitle.
6. `llms/pages/projelendirme.md`: site kökünde `/llms/pages/projelendirme.md` olarak yayımla, kökteki mevcut `/llms.txt` içerisine yalnızca `llms/llms-root-ADD.md` bağlantısını ekle. Genel llms.txt'yi silme.
7. `seo/robots-RECOMMENDED.txt`: mevcut robots.txt'yi arşivleyip doğrulayarak sadeleştir; `sitemap.xml` hâlen mevcut.
8. `site/lead-form.html` ve `site/lead-form.js`: teklif modülünü HTML içine ekle. Form kendi başına çalışmaz; `/api/lead-projelendirme` endpoint gerektirir.
9. `worker/`: Cloudflare Workers + D1 + Turnstile için **örnek gerçek backend**. `ops/02-KURULUM.md` içindeki bağlantılar/secrets tamamlanmadan canlıya alma.
10. `measurement/`: GA4, Search Console, CRM, nitelikli talep ve kârlılık ölçümü. Rıza ayarları kurulmadan analitik çerezi çalıştırma.
11. `tests/`: yerel test ve lansman kabul kapıları.

## Tasarım ilkeleri
- Ana hedef: **İzmir ticari mekân projelendirme ve anahtar teslim fit-out işi** için nitelikli karar verici talebi; tüketici mutfak dolabı arayanları bu sayfanın başlıca hedefi yapma.
- Birincil ticari çıktı: doğrulanmış, teklif verilebilir B2B keşif talebi; trafik, gösterim ve WhatsApp tıklaması ikincil sinyal.
- 18 proje ve “%99 uyum” gibi iddialar müşteri sözleşmesi, kaynak fotoğraf, kabul tutanağı, tarih ve yazılı yayın izniyle doğrulanmadan vaka/kanıt olarak kullanılmaz.
- İndekslenme, Google sıralaması veya LLM alıntısı garanti edilmez.
- Tek merkezli hizmet sayfası + gerçek kanıtla desteklenen dikey sektör sayfaları; seri üretilmiş birbirinin kopyası şehir/ilçe sayfaları yok.

## Dosya haritası
- `audit/00-CANLI-DENETIM.md` — kaynak temelli tespitler
- `ops/01-TEKNIK-SARTNAME.md` — ayrıntılı iş emirleri ve kabul ölçütleri
- `ops/02-KURULUM.md` — dağıtım ve geri alma
- `ops/03-KABUL-TESTLERI.md` — işlevsel ve ticari kapılar
- `content/01-SAYFA-METINLERI.md` — yayımlanabilir metin (tartışmalı iddialar temiz)
- `content/02-SEKTOR-ANAHTAR-KELIME-HARITASI.csv` — arama niyetine göre sayfa planı
- `content/03-KANIT-PORTFOY-SABLONU.md` — gerçek vaka belgesi
- `seo/head.html` ve `seo/structured-data.json` — sayfa SEO işaretlemesi
- `seo/robots-RECOMMENDED.txt` — öneri robots
- `llms/pages/projelendirme.md` — özgül LLM bilgi sayfası
- `llms/llms-root-ADD.md` — mevcut kök dosyaya eklenecek satır
- `site/lead-form.html`, `site/lead-form.js`, `site/lead-form.css` — veri toplama
- `worker/index.mjs`, `worker/validation.mjs` — CRM lead API
- `worker/wrangler.toml.example`, `migrations/0001_leads.sql` — altyapı örneği
- `tests/lead.test.mjs` — yürütülebilir veri kalitesi testleri
- `measurement/GA4-CRM-OLCUM.md` — olay/ROI takibi

## Kaynaklar
- https://developers.google.com/search/docs/fundamentals/seo-starter-guide
- https://developers.google.com/search/docs/fundamentals/ai-optimization-guide
- https://developers.google.com/search/docs/appearance/ai-features
- https://developers.google.com/search/docs/appearance/structured-data/organization
- https://developers.google.com/search/docs/appearance/core-web-vitals
- https://developers.google.com/search/updates
- https://developers.openai.com/api/docs/bots
