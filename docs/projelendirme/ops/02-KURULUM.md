# UYGULAMA/DEPLOY — MANUEL YETKİ KONTROLLÜ

## Önkoşullar (P0)
- Repo/kod ve hosting paneli yetkisi; mevcut URL'nin git branch'i ve yayın adımı.
- Alan adının Cloudflare hesabında olup olmadığı; **değilse Worker örneğini doğrudan canlı URL'ye dağıtamazsınız**. Worker yalnız Cloudflare zone + API route atanırsa çalışır. Alternatif mevcut sunucuda aynı API kontratını uygulayın.
- Google Search Console (domain doğrulama), GA4 erişimi, CMP/consent yapılandırması, Business Profile yetkisi.
- Hukuken geçerli KVKK aydınlatma URL'si, müşteri talebini işleyecek veri sorumlusu, veri işleme amacı ve saklama süresi.
- CRM satış sorumlusu ve görev/cevap SLA onayı.
- Turnstile site key/secret ve Cloudflare D1 hesabı.
- 18 proje örneğinin kontrolü, %99 iddiasının kanıtı ve hangi WhatsApp hattının aktif yanıt verdiği.

## Hızlı kurulum
```bash
# Çalışma ağacı (varsayım: makinede Node 20+ mevcut)
cd worker
npm install
npm test

# D1 veritabanını Cloudflare hesabında oluştur; gerçek UUID'yi toml dosyasına yaz
npx wrangler d1 create yesilay-leads
cp wrangler.toml.example wrangler.toml
# wrangler.toml içindeki REPLACE_WITH_REAL_D1_DATABASE_UUID değiştir.
# D1 migrasyonu (üretim D1 üzerinde veri yazıcı işlem!)
npx wrangler d1 execute yesilay-leads --remote --file=../migrations/0001_leads.sql

# Sırlar: dosyaya yazma / version control'e koyma
npx wrangler secret put TURNSTILE_SECRET
npx wrangler secret put IP_HMAC_SECRET
# CRM webhook kurulacaksa URL ve güçlü ortak imza anahtarı:
npx wrangler secret put CRM_WEBHOOK_URL
npx wrangler secret put CRM_WEBHOOK_SECRET

# Staging ve kanıt tamamlandıktan SONRA
npx wrangler deploy
```

`wrangler.toml` gerçek Cloudflare route/zone bilgisi ister. Hedef origin `https://yesilaymutfak.com` ise bu zone'da API `yesilaymutfak.com/api/lead-projelendirme` olarak yönlenir. DNS sağlayıcı/Cloudflare durumunu bilmeden kendiliğinden domain geçişi yapmayın. CRM webhook kurulu değilse D1 kayıtları saklanır, **otomatik telefon/CRM bildirimi yoktur**. n8n webhook alıcısının `X-Yesilay-Signature` HMAC-SHA256 doğrulaması ve idempotency-key kontrolü oluşturulmadan üretim CRM entegrasyonu tamamlanmış sayılmaz.

## Sayfa içine ekleme
1. Mevcut HTML'in kaynak yedeğini al. `seo/head.html` ile aynı fonksiyonlu meta alanlarını **replace** et; **append** etme.
2. `seo/structured-data.json` gövdesini tek JSON-LD script'e koy; mevcut sitewide Organization varsa ID'leri birleştir, çift varlık üretme.
3. Mevcut H1 metnini `content/01-SAYFA-METINLERI.md` ile değiştir; sayfanın diğer çalışan bölümlerini koru.
4. Sektörel alt bağlantılar ancak gerçek URL yayında olduğunda eklenir; 404'e link verme.
5. `site/lead-form.html` doğru yerleştir; `site/lead-form.js` site `/assets/lead-form.js` olarak yüklenmeli; `REPLACE_TURNSTILE_SITEKEY` değişmeli.
6. `/kvkk-aydinlatma-metni/` sayfasının gerçekten yayınlandığını doğrula; değilse ilgili mevcut doğru sayfa URL'si ile değiştir.
7. Mevcut form/WhatsApp kampanyaları varsa hangisinin temel dönüşüm olduğu kontrollü belirlenip çift sayım kaldırılır.
8. Site köküne `/llms/pages/projelendirme.md` ekle, `/llms.txt` içinde `llms/llms-root-ADD.md` bölümünü bir kez ekle. Özgül md dosyasının public URL'si HTTP 200 ve text/markdown veya text/plain olmalı.
9. Robots değişikliği isteğe bağlıdır. Google, Bing, OAI-SearchBot erişimlerini CDN/WAF, HTTP ve robots düzeyinde kontrol et; indeks stratejisini bozmadan yeniden yayımla.
10. Google Search Console URL denetimi, Bing URL denetimi ve canlı crawl kontrolü yap.

## Üretim smoke test (yetkili operatör)
```bash
URL="https://yesilaymutfak.com/projelendirme/"
curl -sSI "$URL"
curl -sS "$URL" | grep -Ei 'canonical|<title>|name="description"|application/ld\+json' | head -20
curl -sSI https://yesilaymutfak.com/llms/pages/projelendirme.md
curl -sS https://yesilaymutfak.com/sitemap.xml | grep -F 'https://yesilaymutfak.com/projelendirme/'
curl -sS https://yesilaymutfak.com/robots.txt | head -30
```

## Güvenli geri dönüş [Geri döndürülebilir]
- Canlıdan önce aynı sayfanın head, markup, CSS, JS, form ve SEO yapılandırmasının sürümlü yedeği alınır.
- P0 bozulursa eski hash'i bilinen release yeniden dağıtılır; Cloudflare Worker route kapatılır veya önceki sürüme dönülür.
- Form/API kapatılacaksa kurumsal telefon/WhatsApp yolu daima görünür kalsın.
- D1 veri tabanını rollback ile **silme**; KVKK kapsamındaki işlem/silme ayrı onay ve tutanak gerektirir.
- GSC coverage ve CRM kayıt oranını 24-72 saat yakın izle; yanlış deploy'u indeks dışı kalıp görünmez olana kadar bekletme.

## Yük/Edge test
- Aynı idempotency_key ile iki tekrar → tek kayıt, 201/200.
- CAPTCHA yok/yanlış → 400/403, D1'de 0 kayıt.
- 16KB üstü veri → 413.
- Sahte cross-origin → 403.
- 11+ kayıt/24s aynı imzalı IP → 429 (Cloudflare IP varlığı koşuluyla; gerçek limit testinde farklı oturumlarda Turnstile gerekir).
- D1 geçici unavailable → 503; kullanıcıya telefon/WhatsApp fallback.
- Webhook 500 → kayıt kaybolmaz, cron tekrar dener; 8 deneme sonunda manuel müdahale gerekir.
- Üretimde web uygulamasından API'ye gönderilen tüm deneme verilerinde KVKK aydınlatma onayı ve gerçek müşteri verisi kullanılmayan kontrollü testler.

## Politika ve API ek notları
- CAPTCHA sitekey belirli projeye ait olmalı, token `hostname` ve `action=projelendirme_lead` değerleri backend'de doğrulanır. Turnstile'ı başka sayfanın anahtarıyla çalıştırma.
- Yönetmelik/işletme veri saklama politikası **onaylandıktan sonra** `RETENTION_DAYS` (30-3650 arası tam sayı) işaretlenir; Worker planlı cron ile daha eski lead'leri siler. Default otomatik silme **kapalı**; süresiz saklama izni anlamına gelmez. CRM kopyası da ayrıca saklama politikasına tabidir.
- Proje kapanınca API route değişikliği tek başına D1 kayıtlarını silmez; silme/dışa aktarım denetlenebilir hak/işletme politikası kapsamında ayrıca yürütülür.
- E-posta, SMS, pazarlama ileti izni için İYS/KVKK yükümlülükleri uzman tarafından teyit edilmeden kayıtlar toplu kampanyaya aktarılmaz.
