# PROJELENDİRME 60 NOKTALI UYGULAMA KABUL MATRİSİ

Karar etiketi: **P0 = yayın engeli**, P1 = 2. hafta düzeltilir, P2 = içerik büyümesi. Her madde için ekran görüntüsü / test log / belge ID saklanır. 'Kontrol edildi' = 'geçti' değildir.

## A. Gerçeklik ve hukuki güven
1. P0 Ticari unvan ve marka gösterimi resmi kayıtlarla eşleşir.
2. P0 Telefonlardan hangisinin aktif olduğu doğrulanır.
3. P0 İşletme gerçek adresi ve Google Business Profile NAP eşleşir.
4. P0 18 isimli portföy kaydının her biri gerçek iş / konsept olarak sınıflandırılır.
5. P0 Gerçek müşteri referansları için yazılı foto/logo yayın izni vardır.
6. P0 %99 uyum iddiası çıkarılmış ya da ölçülmüş kabul/teknik yöntemle belgelenmiştir.
7. P0 Sağlık/banka gibi sektörlerde kapsam dışı mevzuat uyumu taahhüt edilmez.
8. P0 Fiyat/teslim/keşif politikası mevcut sözleşme ve kapasite ile uyumludur.
9. P0 KVKK aydınlatması yayımlı ve şirket verileriyle doğru.
10. P0 Sahte yorum/rekabet karşılaştırması/uydurma yıldız puanı yok.

## B. SEO ve teknik keşif
11. P0 Ana URL 200 döner.
12. P0 URL doğru HTTPS hostuna ve terminal /'e tutarlı bağlanır.
13. P0 Tek ve doğru canonical vardır.
14. P0 Meta robots index/follow, X-Robots-Tag noindex yoktur.
15. P0 robots.txt Googlebot ve OAI-SearchBot taramasını engellemez.
16. P0 CDN/WAF gerekli arama robotlarını yanıltıcı 403/challenge ile engellemez.
17. P0 sitemap geçerlidir ve ana URL'yi içerir.
18. P0 Title/description benzersiz ve görünür sayfa ile tutarlıdır.
19. P0 H1 tektir; hizmet niyeti ofis/mağaza/ticari fit-out'tur.
20. P0 Alt hizmet linkleri 200 ve doğru canonical döner veya henüz linklenmez.
21. P0 JSON-LD JSON olarak parse edilir.
22. P0 JSON-LD `Organization`, `WebPage`, `Service`, `BreadcrumbList` açık ve gerçek iddialıdır.
23. P0 Mevcut schema ile çelişen başka firma/adres/telefon/yanlış rating yok.
24. P0 Rich Results Test ve Schema.org validator çıktıları arşivlenir; Service rich-result garantisi olmadığı anlaşılır.
25. P1 Google GSC URL Inspection canlı görüntü ve indeks sonucu kayda alınır.
26. P1 Bing URL inspection görüntüsü kayda alınır.
27. P1 llms/pages/projelendirme.md HTTP 200, içerik hedef sayfayla eşdeğer.
28. P1 Genel llms.txt'de yanlış RFC, ileri tarihli ve ölçülmemiş otorite iddiaları denetlenmiştir.
29. P1 hreflang yalnız gerçek eşdeğer dil sayfaları için kullanılır.
30. P1 OG paylaşım görüntüsü satış sayfasına özel doğrulanmış görseldir.

## C. UX / CWV / erişilebilirlik
31. P0 360px mobilde yatay taşma yok.
32. P0 Form etiketleri ve hata mesajı ekran okuyucu uyumlu.
33. P0 CTA klavye ile çalışır.
34. P0 JS yoksa telefon/WhatsApp fallback var.
35. P0 Görseller görünür bölüm ve URL ile uyuşur (gerçek vs render etiketi).
36. P1 LCP p75 saha hedefi <=2.5s veya mevcut veri yetersizse 'ölçüm bekliyor'.
37. P1 INP p75 saha hedefi <=200ms veya veri yetersiz.
38. P1 CLS p75 saha hedefi <=0.1 veya veri yetersiz.
39. P1 İlk ekranda bütün slider görselleri eager yüklenmez.
40. P1 200% zoom'da CTA ve bilgi kaybı yok.

## D. Lead veri kalitesi
41. P0 D1 yazımı tamamlanmadan teşekkür gösterilmez.
42. P0 Aynı idempotency ile tek lead yazılır.
43. P0 Turnstile token eksik/hatalı iken API kayıt oluşturmaz.
44. P0 Yanlış origin 403 alır.
45. P0 JSON/body limitleri kontrol edilir.
46. P0 SQL injection parametreli D1 sorguda düz metindir.
47. P0 Backend kayıtlarında IP açık metin, raw token, secret saklanmaz.
48. P0 GA4/Pixel'e kişisel bilgiler gönderilmez.
49. P0 KVKK pazarlama rızası varsayılan kapalıdır.
50. P0 Başarısız API'de tekrar/alternatif kanal görünür.
51. P0 3 kontrollü test lead CRM sahibine gider; DB'de tekilleştirme görülür.
52. P0 Talep görev sahibinin ilk teması kayıt altına alınır.
53. P1 Webhook kesildiğinde veri D1'de kalır, retry/manuel kontrol vardır.
54. P1 24 saatte IP-hash rate-limit kanıtı alınır.

## E. Ticari karar performansı
55. P0 İlk 28 gün için CQL tanımı ve satış sorumlusu onaylıdır.
56. P0 Satış kapama ile tahsil edilmiş katkı ayrı sayılır.
57. P1 10 arama sorgusunun sıralama/görünme paneli gerçek tarihli olarak çalışır.
58. P1 28/56/84 gün raporlarında 0 payda N/A olarak gösterilir.
59. P1 Kabul edilmeyen/kapasite dışı projeler için neden kodu tutulur.
60. P2 Yeni sektör sayfası yalnız gerçek proje kanıtı + özgün fayda ile yayımlanır.

**Pass kriteri:** 1-24 ve 31-35, 41-52, 55-56 P0 maddelerinin tamamı PASS; başarısız herhangi P0 varsa GO-LIVE = NO. Diğer madde/yükümlülükler tarihlenmiş risk kaydına alınır. Henüz veri yokken '100/100 geçti' denemez.
