# Ölçüm: Trafikten Tahsil Edilmiş Brüt Katkıya

## 1) Tek gerçek kaynak modeli
- **GSC:** Google organik arama gösterim/tıklama/sorgu ve URL raporu (site izin doğrulaması gerektirir).
- **GA4 / Consent Mode:** Oturum/etkileşim ve rıza kapsamındaki CTA olayları; burada isim, telefon, eposta, arama mesajı, açık adres ve teklif notu bulunmaz.
- **Cloudflare D1 / CRM:** Lead ID, kaynak, nitelik, müşteri ve satış aşamaları. Bu veriler reklam analitiğine gönderilmez.
- **İç finans:** Tahsil edilmiş gelir, doğrudan maliyet, proje katkısı ve reklam/satış gideri. Ciro = nakit değildir.

## 2) Olay sözleşmesi
| Event | Tetikleyici | Başarı sayılır mı? | Nerede |
|---|---|---|---|
| view_projelendirme | Sayfa yüklendi (mevcut page_view çifte çalıştırılmamalı) | Hayır | GA4 |
| select_sector | Sektör sekmesi tıklandı | Hayır | GA4 |
| generate_lead_form_start | İlk form odak | Hayır | GA4, rıza varsa |
| click_whatsapp_fitout | Wa.me açma eylemi | Hayır, yalnız CTA | GA4, rıza varsa |
| generate_lead | API veri tabanında kaydetti / accepted=true | **Lead**, satış değil | GA4, rıza varsa |
| crm_lead_verified | Telefon/e-posta gerçek, sektör ve karar sahibi | Nitelikli aday başlangıcı | CRM |
| crm_survey_completed | Keşif tamamlandı | Satış fırsatı | CRM |
| crm_proposal_sent | Yazılı teklif gönderildi | Satış fırsatı | CRM |
| crm_contract_won | İmzalı sözleşme ve kaynak/kapasite kontrolü | İş alındı | CRM |
| crm_collected | Tahsil edilmiş nakit | Tahsilat | CRM/finans |

`generate_lead` standart GA4 event; resmi GA4 event kurallarıyla ve çerez/Consent Mode kurulumuyla uzlaştır. GA4'te kullanıcı ve dönüşüm kişisel verisi toplama.

## 3) Ölçüm tanımları
```
Organik_CTR              = GSC organik tıklamalar / organik gösterimler
Landing_Lead_Rate        = D1 tekil lead / (izinli analizde) landing sessions
Qualified_Lead_Rate      = uygun lead / tekil lead
Survey_Rate              = gerçekleşen keşif / uygun lead
Proposal_Rate            = gönderilen teklif / keşif
Win_Rate                 = kazanılan sözleşme / gönderilen teklif
Collected_Gross_Profit   = tahsilata karşılık kazanılan işin gerçekleşmiş maliyetlerle uyumlu brüt katkısı
CAC_per_Won              = kaynak bazlı satış+pazarlama maliyeti / kazanılmış sözleşme
CAC_per_Qualified        = kaynak bazlı satış+pazarlama maliyeti / uygun lead
Contribution_after_CAC  = sözleşme katkısı - pazarlama+satış edinim maliyeti
```

Tanımsız payda (0) ⇒ `N/A`, %0 veya %100 değil. Farklı veri toplama metotlarını bilinçsizce aynı oranın pay ve paydasında kullanma. Kaynak bazlı atıf yalnız bilinen UTM/CRM kayıtlarına göre, attribution boşsa ORGANIC sayma: `unknown` ayrı tutulur.

## 4) Veri şeması (CRM sözleşme)
```
lead_id UUID
created_at timestamp +03
source_page /projelendirme/
utm_source/medium/campaign nullable
sector enum
location district
estimated_m2 nullable
expected_start enum
qualification_status unknown/yes/no
qualification_reason (code)
owner_user_id
first_contact_at, first_response_minutes
survey_scheduled_at, survey_completed_at
proposal_sent_at, proposal_value_ex_vat
contract_signed_at, contract_value_ex_vat
project_cost_forecast, max_prefinancing_need, confirmed_capacity
collected_cash, collected_at
lost_reason
```

KVKK erişim yetkisi, kişi silme ve saklama süresi ayrı politikayla belirlenir. `worker/` yalnız lead toplar; **CRM aşama modülü yazılmadan** ileri aşama metrikleri otomatik çalıştığı iddia edilmez.

## 5) 12 haftalık gözlem ve karar kuralı
- T0: GSC/GA4/CRM veri kaynaklarına erişim + bugünkü indeks statüsü + kaynak ekran görüntüsü.
- T+7: doğrulanmış canlı sayfa ve iletilen ilk 3 test lead, yanlış kişiye giden talep yok.
- T+28: organik sorgu listesi + kalifiye lead sayısı + teslim edilebilir talep; düşük veriyle nedensellik iddiası yok.
- T+56: organik görünümler, CQL, teklif ve rakip sorgularının nicel analizi.
- T+84: imzalı iş, proje beklenen katkı, tahsilat ve satış maliyeti; pilot büyüme/durdurma kararı.

## 6) Yönetim için performans tablosu
| KPI | İlk veri | 28g | 56g | 84g | Sorumlu |
|---|---|---|---|---|---|
| Hedef URL indeks durum | [Eksik] | | | | SEO |
| GSC organik tıklama | [Eksik] | | | | SEO |
| Nitelikli lead sayısı | [Eksik] | | | | Satış |
| Medyan ilk dönüş süresi | [Eksik] | | | | Satış |
| Keşif → teklif sayısı | [Eksik] | | | | Mimari ekip |
| İmzalı sözleşme | [Eksik] | | | | Ticari yönetim |
| En yüksek ön finansman açığı | [Eksik] | | | | Finans |
| Tahsil edilen katkı | [Eksik] | | | | Finans |

## 7) 10 sorguluk AI görünürlük gözlem paneli
Standart tarihlerde farklı platformlarda (Google AI Mode, ChatGPT Search, Bing/Copilot, Perplexity) aşağıdaki hipotez sorguları denenir: `İzmir ticari mekân projelendirme`, `İzmir mağaza tasarım firması`, `mağaza açılışı iç mimar İzmir`, `İzmir ofis fit-out`, `Buca kurumsal ofis tadilatı`, `İzmir cafe restoran proje uygulama`, `İzmir kuyumcu mağazası tasarımı`, `mağaza projelendirme maliyeti İzmir`, `kurumsal iç mimarlık ve uygulama İzmir`, `fit out firma tavsiye İzmir`.

Kayda alınan alanlar: sorgu, zaman, cihaz/konum (izinli), AI platformu, link verildi mi, hangi URL, kaynak olarak alıntılandı mı, markaya olumlu/olumsuz yanlış bilgi var mı. Yanıtlar kişiye/model çalışmasına göre değişebilir; görünmemek tek başına teknik sorun kanıtı değildir.
