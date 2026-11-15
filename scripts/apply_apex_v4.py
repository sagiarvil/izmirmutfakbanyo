#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
REAL-SEO-2026 APEX v4.0 Entegrasyon Scripti
- 28 kanonik sayfaya 20-90 kelimelik <p data-answer-capsule="true"> Cevap Kapsülü ekler.
- Tablosuz 9 sayfaya kurumsal mimari şartname tabloları ekler.
- data-seo-interactive="true" özniteliğini ekler.
"""

import os
import re

CAPSULES = {
  '/': '''Yeşilay Mutfak, 1998'den bu yana İzmir Buca'daki kendi imalat atölyesinde aracı olmadan özel ölçü lüks mutfak dolapları, anahtar teslim ev tadilatı ve mimari iç mekan tasarımları üretir. E1 sertifikalı MDF-Lam gövde, Blum mekanizmalar ve 10 yıl atölye garantisi sunar.''',

  '/2026-mutfak-dolabi-fiyatlari/': '''2026 yılı İzmir mutfak dolabı metretül fiyatları kapak malzemesine göre 13.500 TL ile 26.500 TL arasında değişmektedir. Yeşilay Mutfak, Buca atölyesinde doğrudan üretici fiyat avantajı, ücretsiz 3D fotogerçekçi mimari projelendirme, şeffaf metraj cetveli ve 10 yıl mekanizma garantisi sağlar.''',

  '/camasir-odasi-modelleri/': '''İzmir'de çamaşır odası ve kiler dolabı imalatı; kurutma ve çamaşır makinelerini gizleyen neme dayanıklı E1 marin MDF gövde, boy kiler mekanizmaları ve ütü masası entegrasyonuyla kişiye özel tasarlanır. Yeşilay Mutfak Buca atölyesinde milimetrik ölçüyle üretilip montajı yapılır.''',

  '/cocuk-odasi-modelleri/': '''İzmir çocuk odası mobilyaları; toksik madde içermeyen su bazlı EN 71-3 sertifikalı lake boya, yuvarlatılmış köşe güvenliği ve Montessori ilkelerine uygun ergonomik modüllerle üretilir. Yeşilay Mutfak, Buca atölyesinde çocuğunuzun büyüme evrelerine uyum sağlayan fonksiyonel mekanlar teslim eder.''',

  '/genc-odasi-modelleri/': '''İzmir özel imalat genç odası modelleri; ergonomik çalışma masaları, entegre LED aydınlatmalı kitaplıklar ve sessiz frenli raylı gardıroplarla gençlerin odaklanma ve depolama ihtiyaçlarını karşılar. Yeşilay Mutfak, Buca atölyesinde E1 sınıfı dayanıklı malzemelerle 10 yıl garantili üretim yapar.''',

  '/hakkimizda/': '''Yeşilay Mutfak, 1998 yılında Cem ve Bakiye Yeşilay tarafından kurulan, İzmir Buca Gaziler Caddesi'ndeki mağazası ve Adatepe'deki kendi ahşap üretim atölyesiyle 28 yıldır fasoncu ve komisyonsuz doğrudan imalat yapan yerli mimari mobilya ve anahtar teslim tadilat kuruluşudur.''',

  '/hazir-mutfak-modelleri-izmir/': '''İzmir hazır ve modüler mutfak sistemleri; standart ölçülü fabrikasyon kalıplar yerine mekanınıza milimetrik adapte edilen modüler gövdeler, akrilik ve lake kapak seçenekleri ve hızlı montaj avantajıyla sunulur. Yeşilay Mutfak, 7 iş günü içinde atölyeden doğrudan teslimat sağlar.''',

  '/hizmet-bolgeleri/buca/': '''Buca mutfak tadilatı ve dolap imalatı hizmetimiz; Şirinyer, Forbes, Yaylacık, Gediz ve Adatepe dahil tüm mahallelerde ücretsiz yerinde lazer rölöve, 3D görselleştirme ve Gaziler Caddesi'ndeki kendi atölyemizden komisyonsuz doğrudan imalatçı fiyatlarıyla 10 yıl garantili olarak sunulmaktadır.''',

  '/hizmet-bolgeleri/cesme/': '''Çeşme, Alaçatı, Ilıca ve Dalyan villaları için mutfak yenileme ve tadilat; deniz tuzu, yüksek nem ve korozyona dayanıklı marin kontrplak gövdeler, paslanmaz menteşeler ve porselen tezgahlarla gerçekleştirilir. Yeşilay Mutfak, yaz sezonu öncesi gecikme cezalı sözleşmeyle gününde anahtar teslim eder.''',

  '/hizmet-bolgeleri/guzelbahce/': '''Güzelbahçe ve Yelki müstakil villa mutfak tadilatı; geniş ada tezgah üniteleri, gizli kiler odaları, doğal meşe kaplama ve fırın lake mutfak dolaplarıyla projelendirilir. Yeşilay Mutfak, mimari tasarım, tesisat altyapısı ve montajı tek elden yöneterek 10 yıl bütünleşik garanti verir.''',

  '/hizmet-bolgeleri/narlidere/': '''Narlıdere ve Sahilevleri lüks konutlarında mutfak dolabı ve tadilat; kulpsuz minimalist gola hatlar, geniş porselen ada tezgahlar, entegre akıllı kiler mekanizmaları ve birinci sınıf lake kapaklarla uygulanır. Yeşilay Mutfak, mühendislik disiplini ve sözleşmeli sabit fiyat garantisiyle hizmet sunar.''',

  '/hizmet-bolgeleri/urla/': '''Urla, Kekliktepe ve İskele bölgelerindeki taş ev ve bağ villaları için mutfak tadilatı; taş duvar dokusuyla uyumlu masif meşe, mat lake ve doğal taş tezgahlarla tasarlanır. Yeşilay Mutfak, Buca atölyesinde özel ölçüyle ürettiği mobilyaları taahhüt edilen sürede kusursuz teslim eder.''',

  '/iletisim/': '''Yeşilay Mutfak Buca Showroom ve İmalat Atölyesi; Gaziler Mahallesi 1084/2 Sokak No: 1/A Buca İzmir adresinde haftanın 6 günü hizmet vermektedir. Ücretsiz keşif, 3D mimari modelleme ve projelendirme randevusu için 0232 441 10 60 veya WhatsApp hattımızdan doğrudan ulaşabilirsiniz.''',

  '/izmir-anahtar-teslim-tadilat/': '''İzmir anahtar teslim daire ve villa tadilatı; kırım, moloz atımı, su-elektrik tesisatı, banyo-mutfak renovasyonu, zemin seramiği ve asma tavan işlerini tek elden kapsar. Yeşilay Mutfak, gecikme cezalı resmi sözleşme, sürpriz bütçe çıkarmayan sabit maliyet ve 10 yıl garanti sağlar.''',

  '/izmir-banyo-yenileme-seramik/': '''İzmir komple banyo yenileme hizmeti; çift katman elastik sürme su yalıtımı, 60x120 lazer kesim rektifiyeli porselen seramik döşeme, Geberit gömme rezervuar ve neme dayanıklı marin gövde banyo mobilyalarını kapsar. Yeşilay Mutfak, 10 gün içinde anahtar teslim banyo dönüşümü gerçekleştirir.''',

  '/izmir-cam-balkon-sistemleri/': '''İzmir ısıcamlı ve katlanır cam balkon sistemleri; çift cam arası argon gazı yalıtımı, paslanmaz rulman tekerlekler, elektrostatik boyalı dayanıklı alüminyum profiller ve su tahliye kanallarıyla balkonunuzu dört mevsim yaşanabilir odaya dönüştürür. Yeşilay Mutfak, milimetrik montaj ve 5 yıl sistem garantisi verir.''',

  '/izmir-komple-daire-tadilati/': '''İzmir komple daire tadilatı; eskiyen su ve elektrik hatlarının yenilenmesi, alçıpan ve aydınlatma, lüks lake kapılar, laminat parke döşeme ve mutfak-banyo imalatını birleştirir. Yeşilay Mutfak, tek sözleşmeyle tüm şantiye koordinasyonunu üstlenip taahhüt edilen tarihte eksiksiz teslimat sağlar.''',

  '/izmir-komple-mutfak-tadilati/': '''İzmir komple mutfak tadilatı; eski dolap ve seramiklerin tozsuz kırımı, elektrik ve sıhhi tesisat hatlarının yenilenmesi, porselen veya kuvars tezgah montajı ve özel lake dolap üretimini kapsar. Yeşilay Mutfak, Buca atölyesinden doğrudan imalatla 15 günde anahtar teslim mutfak yenilemesi tamamlar.''',

  '/izmir-mutfak-dolabi-imalati/': '''İzmir özel ölçü mutfak dolabı imalatı; E1 formaldehit normunda neme dayanıklı MDF-Lam gövde, Blum frenli menteşe ve tandembox çekmece mekanizmaları, akrilik, lake veya ahşap kapak çeşitleriyle doğrudan Yeşilay Mutfak Buca atölyesinde üretilir. Aracı komisyonu olmadan 10 yıl imalat garantilidir.''',

  '/kahve-kosesi-modelleri/': '''İzmir özel ölçü kahve köşesi ve barista ünitesi modelleri; espresso makineleri için entegre elektrik prizleri, kupa askılıkları, bardak içi LED aydınlatmalar ve şık şaraplık bölmeleriyle mutfak veya salonunuza özel üretilir. Yeşilay Mutfak, Buca atölyesinde kişiye özel mimari detaylarla üretir.''',

  '/klasik-country-mutfak-modelleri/': '''İzmir klasik ve country mutfak dolapları; zarif CNC çıta işlemeli ipek mat fırın lake kapaklar, masif meşe detaylar, porselen veya pirinç eskitme kulplar ve vitrinli cam bölmelerle geçmişin asaletini modern ergonomiyle buluşturur. Yeşilay Mutfak atölyesinde 10 yıl garantili üretilir.''',

  '/modern-mutfak-modelleri/': '''İzmir modern mutfak modelleri; minimalist kulpsuz gola alüminyum profiller, çizilmeye dirençli anti-fingerprint akrilik veya mat lake yüzeyler, entegre LED lineer aydınlatmalar ve akıllı köşe kiler çözümleriyle tasarlanır. Yeşilay Mutfak Buca atölyesinde milimetrik lazer rölöveyle üretilip montajı yapılır.''',

  '/projelendirme/': '''İzmir ticari mekan projelendirme ve fit-out mimarlık hizmetleri; mağaza, ofis, cafe, restoran, klinik ve showroom alanlarında 3D konsept tasarımdan CNC atölye mobilya üretimine ve anahtar teslim şantiye yönetimine kadar eksiksiz sunulur. Yeşilay Mutfak, zaman ve bütçe taahhüdüyle teslim eder.''',

  '/salon-modelleri/': '''İzmir özel ölçü salon ve TV ünitesi imalatı; akustik ahşap çıta paneller, gizli kablo geçiş kanalları, füme camlı LED aydınlatmalı vitrinler ve kitaplık kombinasyonlarıyla salonunuzun mimari dengesini kurar. Yeşilay Mutfak, Buca atölyesinde E1 sınıfı dayanıklı malzemelerle 10 yıl garantili üretir.''',

  '/tasarimlar/': '''Yeşilay Mutfak tasarım kataloğu; modern, klasik, country ve yaşam alanı mutfak dolapları, lüks banyo mobilyaları ve giyinme odalarından oluşan zengin mimari portföyü sergiler. İzmir Buca atölyemizde kişiye özel ebat, renk ve malzeme seçenekleriyle üretilen özgün koleksiyonlarımızı inceleyebilirsiniz.''',

  '/yapilan-isler/': '''İzmir genelinde Buca, Karşıyaka, Bornova, Çeşme ve Urla'da başarıyla tamamlanan 72'den fazla gerçek mutfak tadilatı, lüks banyo yenilemesi ve anahtar teslim villa projemizi inceleyin. Yeşilay Mutfak, taahhüt ettiği malzeme kalitesi ve sözleşmeli gün garantisiyle müşteri memnuniyetini kanıtlar.''',

  '/yasam-alanlari-mutfak-modelleri/': '''İzmir açık plan yaşam alanı ve ada mutfak tasarımları; salonla mutfağı kusursuz birleştiren bar tezgahları, entegre gizli yemek masaları, tavan tipi sessiz ada davlumbazları ve dekoratif raf üniteleriyle salon konforu sağlar. Yeşilay Mutfak, Buca atölyesinde 10 yıl garantili imalat yapar.''',

  '/yatak-odasi-modelleri/': '''İzmir özel ölçü yatak odası mobilyaları; tavana kadar sürgülü veya kapaklı akıllı gardırop üniteleri, entegre sensörlü LED aydınlatmalar, pantolonluk ve aksesuar çekmeceleriyle depolama alanını maksimize eder. Yeşilay Mutfak, Buca atölyesinde E1 sınıfı MDF gövdeyle 10 yıl garantili üretir.'''
}

def inject_capsule(filepath, route):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # remove existing data-answer-capsule if any
    content = re.sub(r'<p\b[^>]*data-answer-capsule=["\']true["\'][^>]*>.*?</p>', '', content, flags=re.DOTALL)

    cap_text = CAPSULES[route]
    capsule_html = f'''\n          <p data-answer-capsule="true" class="answer-capsule mt-4 text-stone-300 sm:text-stone-600 text-sm sm:text-base font-normal leading-relaxed max-w-2xl">{cap_text}</p>'''

    # Find </h1> and insert right after
    m = re.search(r'</h1>', content)
    if m:
        pos = m.end()
        new_content = content[:pos] + capsule_html + content[pos:]
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f'[CAPSULE] Injected to {filepath}')
    else:
        print(f'[ERROR] </h1> not found in {filepath}')

TABLES = {
  '/hakkimizda/': '''
  <!-- Kurumsal Şeffaflık ve İmalat Standartları Tablosu (G17 NavBoost) -->
  <section class="py-12 bg-white border-b border-stone-200" data-seo-interactive="true">
    <div class="max-w-5xl mx-auto px-4 sm:px-6">
      <h2 class="text-xl sm:text-2xl font-bold text-stone-900 mb-6 text-center font-editorial">Yeşilay Mutfak Kurumsal İmalat Standartları ve Güvence Matrisi</h2>
      <div class="overflow-x-auto rounded-xl border border-stone-200">
        <table class="w-full text-left border-collapse text-xs sm:text-sm">
          <thead>
            <tr class="bg-stone-100 text-stone-800 font-semibold border-b border-stone-200">
              <th class="p-3 sm:p-4">Kriter / Güvence</th>
              <th class="p-3 sm:p-4">Yeşilay Mutfak Standartı</th>
              <th class="p-3 sm:p-4">Piyasa / Fasoncu Uygulamaları</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-stone-200 text-stone-700">
            <tr>
              <td class="p-3 sm:p-4 font-semibold text-stone-900">Üretim Modeli</td>
              <td class="p-3 sm:p-4 text-emerald-800 font-medium">Buca Adatepe'de kendi marangoz atölyesinde doğrudan imalat</td>
              <td class="p-3 sm:p-4">Masa başı aracılık, fason atölyeye komisyonla devir</td>
            </tr>
            <tr class="bg-stone-50/50">
              <td class="p-3 sm:p-4 font-semibold text-stone-900">Gövde Malzemesi</td>
              <td class="p-3 sm:p-4 text-emerald-800 font-medium">%100 E1 belgeli, neme mukavim yoğun MDF-Lam gövde</td>
              <td class="p-3 sm:p-4">Standart yonga levha (sunta) veya düşük kalite MDF</td>
            </tr>
            <tr>
              <td class="p-3 sm:p-4 font-semibold text-stone-900">Menteşe ve Ray</td>
              <td class="p-3 sm:p-4 text-emerald-800 font-medium">Blum &amp; Häfele orijinal frenli mekanizmalar (10 yıl garantili)</td>
              <td class="p-3 sm:p-4">İsimsiz yan sanayi, kısa sürede düşen menteşeler</td>
            </tr>
            <tr class="bg-stone-50/50">
              <td class="p-3 sm:p-4 font-semibold text-stone-900">Sözleşme &amp; Teslimat</td>
              <td class="p-3 sm:p-4 text-emerald-800 font-medium">Gecikme cezalı resmi taahhüt, sabit maliyet garantisi</td>
              <td class="p-3 sm:p-4">Sözlü vaatler, iş ortasında çıkan sürpriz ek masraflar</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </section>
''',

  '/iletisim/': '''
  <!-- Showroom ve Atölye Çalışma Saatleri Tablosu (G17 NavBoost) -->
  <section class="py-12 bg-white border-b border-stone-200" data-seo-interactive="true">
    <div class="max-w-4xl mx-auto px-4 sm:px-6">
      <h2 class="text-xl sm:text-2xl font-bold text-stone-900 mb-6 text-center font-editorial">Buca Showroom &amp; İmalat Atölyesi Randevu ve Çalışma Saatleri</h2>
      <div class="overflow-x-auto rounded-xl border border-stone-200">
        <table class="w-full text-left border-collapse text-xs sm:text-sm">
          <thead>
            <tr class="bg-stone-100 text-stone-800 font-semibold border-b border-stone-200">
              <th class="p-3 sm:p-4">Günler</th>
              <th class="p-3 sm:p-4">Çalışma Saatleri</th>
              <th class="p-3 sm:p-4">Hizmet Kapsamı</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-stone-200 text-stone-700">
            <tr>
              <td class="p-3 sm:p-4 font-semibold text-stone-900">Pazartesi – Cuma</td>
              <td class="p-3 sm:p-4 font-mono text-emerald-800">09:00 – 19:30</td>
              <td class="p-3 sm:p-4">Showroom malzeme seçimi, 3D rölöve ve atölye üretimi</td>
            </tr>
            <tr class="bg-stone-50/50">
              <td class="p-3 sm:p-4 font-semibold text-stone-900">Cumartesi</td>
              <td class="p-3 sm:p-4 font-mono text-emerald-800">09:30 – 18:30</td>
              <td class="p-3 sm:p-4">Mimari danışmanlık, numune inceleme ve sözleşme görüşmeleri</td>
            </tr>
            <tr>
              <td class="p-3 sm:p-4 font-semibold text-stone-900">Pazar</td>
              <td class="p-3 sm:p-4 text-stone-500">Randevulu Görüşme</td>
              <td class="p-3 sm:p-4">Önceden teyit edilen özel keşif ve villa saha incelemeleri</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </section>
''',

  '/izmir-anahtar-teslim-tadilat/': '''
  <!-- Anahtar Teslim Mimari Tadilat Aşamaları Tablosu (G17 NavBoost) -->
  <section class="py-12 bg-white border-b border-stone-200" data-seo-interactive="true">
    <div class="max-w-5xl mx-auto px-4 sm:px-6">
      <h2 class="text-xl sm:text-2xl font-bold text-stone-900 mb-6 text-center font-editorial">İzmir Anahtar Teslim Ev Tadilatı Süreç ve Teknik Kapsam Tablosu</h2>
      <div class="overflow-x-auto rounded-xl border border-stone-200">
        <table class="w-full text-left border-collapse text-xs sm:text-sm">
          <thead>
            <tr class="bg-stone-100 text-stone-800 font-semibold border-b border-stone-200">
              <th class="p-3 sm:p-4">Aşama No</th>
              <th class="p-3 sm:p-4">Tadilat Aşaması</th>
              <th class="p-3 sm:p-4">Teknik Malzeme &amp; Standart</th>
              <th class="p-3 sm:p-4">Tahmini Süre</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-stone-200 text-stone-700">
            <tr>
              <td class="p-3 sm:p-4 font-mono font-bold text-emerald-800">01</td>
              <td class="p-3 sm:p-4 font-semibold text-stone-900">Lazer Rölöve &amp; 3D Proje</td>
              <td class="p-3 sm:p-4">Birebir mimari çizim, malzeme kartelası onayı</td>
              <td class="p-3 sm:p-4">2 – 3 Gün</td>
            </tr>
            <tr class="bg-stone-50/50">
              <td class="p-3 sm:p-4 font-mono font-bold text-emerald-800">02</td>
              <td class="p-3 sm:p-4 font-semibold text-stone-900">Tozsuz Kırım &amp; Altyapı</td>
              <td class="p-3 sm:p-4">Moloz tahliyesi, PPRC su boruları, Halogen-Free kablolama</td>
              <td class="p-3 sm:p-4">3 – 5 Gün</td>
            </tr>
            <tr>
              <td class="p-3 sm:p-4 font-mono font-bold text-emerald-800">03</td>
              <td class="p-3 sm:p-4 font-semibold text-stone-900">İzolasyon &amp; Seramik</td>
              <td class="p-3 sm:p-4">Çift kat sürme membran, 60x120 lazer kesim porselen</td>
              <td class="p-3 sm:p-4">4 – 6 Gün</td>
            </tr>
            <tr class="bg-stone-50/50">
              <td class="p-3 sm:p-4 font-mono font-bold text-emerald-800">04</td>
              <td class="p-3 sm:p-4 font-semibold text-stone-900">Atölye Mobilya Montajı</td>
              <td class="p-3 sm:p-4">E1 MDF mutfak dolabı, banyo ünitesi, kapılar ve tezgah</td>
              <td class="p-3 sm:p-4">3 – 4 Gün</td>
            </tr>
            <tr>
              <td class="p-3 sm:p-4 font-mono font-bold text-emerald-800">05</td>
              <td class="p-3 sm:p-4 font-semibold text-stone-900">İnce Temizlik &amp; Teslimat</td>
              <td class="p-3 sm:p-4">Detaylı teslim kontrolü, 10 yıllık garanti belgesi takdimi</td>
              <td class="p-3 sm:p-4">1 Gün</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </section>
''',

  '/modern-mutfak-modelleri/': '''
  <!-- Modern Mutfak Donanım ve Profil Seçenekleri Tablosu (G17 NavBoost) -->
  <section class="py-12 bg-white border-b border-stone-200" data-seo-interactive="true">
    <div class="max-w-5xl mx-auto px-4 sm:px-6">
      <h2 class="text-xl sm:text-2xl font-bold text-stone-900 mb-6 text-center font-editorial">İzmir Modern Mutfak Modelleri Teknik Donanım ve Malzeme Karşılaştırması</h2>
      <div class="overflow-x-auto rounded-xl border border-stone-200">
        <table class="w-full text-left border-collapse text-xs sm:text-sm">
          <thead>
            <tr class="bg-stone-100 text-stone-800 font-semibold border-b border-stone-200">
              <th class="p-3 sm:p-4">Özellik</th>
              <th class="p-3 sm:p-4">Gola Kulpsuz Lake Seri</th>
              <th class="p-3 sm:p-4">Akrilik Parlak / Mat Seri</th>
              <th class="p-3 sm:p-4">Doğal Meşe &amp; Ahşap Seri</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-stone-200 text-stone-700">
            <tr>
              <td class="p-3 sm:p-4 font-semibold text-stone-900">Kapak Yapısı</td>
              <td class="p-3 sm:p-4">22mm İpek Mat Fırın Lake</td>
              <td class="p-3 sm:p-4">18mm Çizilmez Anti-Fingerprint Akrilik</td>
              <td class="p-3 sm:p-4">Doğal Kaplama / Masif Meşe Çıtalı</td>
            </tr>
            <tr class="bg-stone-50/50">
              <td class="p-3 sm:p-4 font-semibold text-stone-900">Kulp Çözümü</td>
              <td class="p-3 sm:p-4 text-emerald-800 font-medium">Gizli Alüminyum L ve C Gola Profil</td>
              <td class="p-3 sm:p-4">Entegre Bas-Aç Tip-On / J-Kulp</td>
              <td class="p-3 sm:p-4">Minimalist Siyah Mat Profil / Gizli Kulp</td>
            </tr>
            <tr>
              <td class="p-3 sm:p-4 font-semibold text-stone-900">Çekmece Rayı</td>
              <td class="p-3 sm:p-4">Blum Legrabox İnce Yanak</td>
              <td class="p-3 sm:p-4">Blum Tandembox Frenli</td>
              <td class="p-3 sm:p-4">Häfele Matrix Box Frenli</td>
            </tr>
            <tr class="bg-stone-50/50">
              <td class="p-3 sm:p-4 font-semibold text-stone-900">Su &amp; Buhar Dayanımı</td>
              <td class="p-3 sm:p-4 text-emerald-800 font-medium">Yüksek (Poliüretan Lake Yalıtımlı)</td>
              <td class="p-3 sm:p-4">Tam Dayanımlı (PUR Kenar Bantlı)</td>
              <td class="p-3 sm:p-4">Su İtici Mat Vernik Korumalı</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </section>
''',

  '/klasik-country-mutfak-modelleri/': '''
  <!-- Klasik & Country Mutfak Malzeme ve İşçilik Tablosu (G17 NavBoost) -->
  <section class="py-12 bg-white border-b border-stone-200" data-seo-interactive="true">
    <div class="max-w-5xl mx-auto px-4 sm:px-6">
      <h2 class="text-xl sm:text-2xl font-bold text-stone-900 mb-6 text-center font-editorial">Klasik ve Country Mutfak Dolapları İmalat Detayları</h2>
      <div class="overflow-x-auto rounded-xl border border-stone-200">
        <table class="w-full text-left border-collapse text-xs sm:text-sm">
          <thead>
            <tr class="bg-stone-100 text-stone-800 font-semibold border-b border-stone-200">
              <th class="p-3 sm:p-4">Bileşen</th>
              <th class="p-3 sm:p-4">Country Koleksiyonu</th>
              <th class="p-3 sm:p-4">Klasik Neoklasik Seri</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-stone-200 text-stone-700">
            <tr>
              <td class="p-3 sm:p-4 font-semibold text-stone-900">Kapak Detayı</td>
              <td class="p-3 sm:p-4">Derin CNC göbek oyması, fırın mat lake boya</td>
              <td class="p-3 sm:p-4">Kabartma çıta profilli, sedef veya fildişi lake</td>
            </tr>
            <tr class="bg-stone-50/50">
              <td class="p-3 sm:p-4 font-semibold text-stone-900">Vitrin Camları</td>
              <td class="p-3 sm:p-4">Buzlu veya karolajlı şeffaf temperli cam</td>
              <td class="p-3 sm:p-4">Füme / bronz bizoteli kristal cam paneller</td>
            </tr>
            <tr>
              <td class="p-3 sm:p-4 font-semibold text-stone-900">Kulp Tercihi</td>
              <td class="p-3 sm:p-4">Antik pirinç, porselen çiçek desenli düğmeler</td>
              <td class="p-3 sm:p-4">Mat altın veya fırçalanmış pirinç döküm kulp</td>
            </tr>
            <tr class="bg-stone-50/50">
              <td class="p-3 sm:p-4 font-semibold text-stone-900">Taç &amp; Işıklık</td>
              <td class="p-3 sm:p-4">Geniş masif taç pervazı ve alt ışıklık çıtası</td>
              <td class="p-3 sm:p-4">Oymalı gösterişli klasik taç ve sütun başlıkları</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </section>
''',

  '/yasam-alanlari-mutfak-modelleri/': '''
  <!-- Açık Plan & Ada Mutfak Yerleşim Ölçü Tablosu (G17 NavBoost) -->
  <section class="py-12 bg-white border-b border-stone-200" data-seo-interactive="true">
    <div class="max-w-5xl mx-auto px-4 sm:px-6">
      <h2 class="text-xl sm:text-2xl font-bold text-stone-900 mb-6 text-center font-editorial">Açık Plan Yaşam Alanı ve Ada Mutfak Ergonomi Standartları</h2>
      <div class="overflow-x-auto rounded-xl border border-stone-200">
        <table class="w-full text-left border-collapse text-xs sm:text-sm">
          <thead>
            <tr class="bg-stone-100 text-stone-800 font-semibold border-b border-stone-200">
              <th class="p-3 sm:p-4">Yerleşim Ölçütü</th>
              <th class="p-3 sm:p-4">İdeal Mimari Ölçü</th>
              <th class="p-3 sm:p-4">Sağladığı Konfor &amp; Fonksiyon</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-stone-200 text-stone-700">
            <tr>
              <td class="p-3 sm:p-4 font-semibold text-stone-900">Ada &amp; Tezgah Geçiş Mesafesi</td>
              <td class="p-3 sm:p-4 font-mono font-medium text-emerald-800">100 cm – 120 cm</td>
              <td class="p-3 sm:p-4">Çift kişinin rahat hareket edebilmesi ve kapakların tam açılması</td>
            </tr>
            <tr class="bg-stone-50/50">
              <td class="p-3 sm:p-4 font-semibold text-stone-900">Ada Bar Tezgahı Yüksekliği</td>
              <td class="p-3 sm:p-4 font-mono font-medium text-emerald-800">90 cm (standart) / 105 cm (bar)</td>
              <td class="p-3 sm:p-4">Bar taburesi ile otururken omurga ergonomisini koruma</td>
            </tr>
            <tr>
              <td class="p-3 sm:p-4 font-semibold text-stone-900">Davlumbaz Çekiş Mesafesi</td>
              <td class="p-3 sm:p-4 font-mono font-medium text-emerald-800">65 cm (indüksiyon) / 75 cm (gazlı)</td>
              <td class="p-3 sm:p-4">Açık salona koku yayılmasını engelleyen maksimum hava sirkülasyonu</td>
            </tr>
            <tr class="bg-stone-50/50">
              <td class="p-3 sm:p-4 font-semibold text-stone-900">Tezgah Üstü Sarkıt Aydınlatma</td>
              <td class="p-3 sm:p-4 font-mono font-medium text-emerald-800">Tezgahtan 75 – 85 cm yukarıda</td>
              <td class="p-3 sm:p-4">Gözü almayan, ada yüzeyine homojen odaklanan çalışma ışığı</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </section>
''',

  '/projelendirme/': '''
  <!-- Ticari Mekan Mimari Projelendirme Süreç Tablosu (G17 NavBoost) -->
  <section class="py-12 bg-white border-b border-stone-200" data-seo-interactive="true">
    <div class="max-w-5xl mx-auto px-4 sm:px-6">
      <h2 class="text-xl sm:text-2xl font-bold text-stone-900 mb-6 text-center font-editorial">İzmir Ticari Mekan ve Fit-Out Projelendirme Aşamaları</h2>
      <div class="overflow-x-auto rounded-xl border border-stone-200">
        <table class="w-full text-left border-collapse text-xs sm:text-sm">
          <thead>
            <tr class="bg-stone-100 text-stone-800 font-semibold border-b border-stone-200">
              <th class="p-3 sm:p-4">Süreç</th>
              <th class="p-3 sm:p-4">Açıklama &amp; Çıktı</th>
              <th class="p-3 sm:p-4">Mekanik / Elektrik Entegrasyonu</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-stone-200 text-stone-700">
            <tr>
              <td class="p-3 sm:p-4 font-semibold text-stone-900">1. Lazer Rölöve &amp; Konsept</td>
              <td class="p-3 sm:p-4">Saha incelemesi, sirkülasyon analizi ve 3D tasarım</td>
              <td class="p-3 sm:p-4">Mevcut klima, yangın sprinkler ve trafo gücü tespiti</td>
            </tr>
            <tr class="bg-stone-50/50">
              <td class="p-3 sm:p-4 font-semibold text-stone-900">2. Mimari İmalat Çizimleri</td>
              <td class="p-3 sm:p-4">Özel teşhir üniteleri, banko ve vitrin detay projeleri</td>
              <td class="p-3 sm:p-4">Gizli LED kanalları ve zemin buat bağlantıları</td>
            </tr>
            <tr>
              <td class="p-3 sm:p-4 font-semibold text-stone-900">3. Atölye CNC Üretimi</td>
              <td class="p-3 sm:p-4">İzmir atölyemizde yangına dayanıklı lake ve marin mobilya</td>
              <td class="p-3 sm:p-4">Häfele ticari sınıf ağır yük mekanizma montajı</td>
            </tr>
            <tr class="bg-stone-50/50">
              <td class="p-3 sm:p-4 font-semibold text-stone-900">4. Gece / Vardiyalı Montaj</td>
              <td class="p-3 sm:p-4">AVM veya cadde mağaza açılış takvimine tam uyum</td>
              <td class="p-3 sm:p-4">Aydınlatma otomasyonu ve ses sistemi devreye alma</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </section>
''',

  '/tasarimlar/': '''
  <!-- Yeşilay Mutfak Tasarım Serileri Karşılaştırma Tablosu (G17 NavBoost) -->
  <section class="py-12 bg-white border-b border-stone-200" data-seo-interactive="true">
    <div class="max-w-5xl mx-auto px-4 sm:px-6">
      <h2 class="text-xl sm:text-2xl font-bold text-stone-900 mb-6 text-center font-editorial">Özel İmalat Mutfak ve Dolap Tasarım Serileri Karşılaştırması</h2>
      <div class="overflow-x-auto rounded-xl border border-stone-200">
        <table class="w-full text-left border-collapse text-xs sm:text-sm">
          <thead>
            <tr class="bg-stone-100 text-stone-800 font-semibold border-b border-stone-200">
              <th class="p-3 sm:p-4">Tasarım Serisi</th>
              <th class="p-3 sm:p-4">Stil &amp; Çizgi</th>
              <th class="p-3 sm:p-4">Kapak &amp; Yüzey</th>
              <th class="p-3 sm:p-4">Uyumlu Mekan</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-stone-200 text-stone-700">
            <tr>
              <td class="p-3 sm:p-4 font-semibold text-stone-900">Modern Line Serisi</td>
              <td class="p-3 sm:p-4">Kulpsuz gola profil, monoblok sadelik</td>
              <td class="p-3 sm:p-4">İpek Mat Lake / Anti-Fingerprint Akrilik</td>
              <td class="p-3 sm:p-4">Şehir daireleri, rezidanslar ve çatı katları</td>
            </tr>
            <tr class="bg-stone-50/50">
              <td class="p-3 sm:p-4 font-semibold text-stone-900">Country Villa Serisi</td>
              <td class="p-3 sm:p-4">CNC çıta işlemeli, sıcak doğal dokular</td>
              <td class="p-3 sm:p-4">Fırın Lake &amp; Masif Ahşap Detaylar</td>
              <td class="p-3 sm:p-4">Çeşme, Urla ve Güzelbahçe müstakil villaları</td>
            </tr>
            <tr>
              <td class="p-3 sm:p-4 font-semibold text-stone-900">Klasik Prestige Serisi</td>
              <td class="p-3 sm:p-4">Görkemli taç pervazları ve cam vitrinler</td>
              <td class="p-3 sm:p-4">Oymalı Çıtalı Lake &amp; Pirinç Kulplar</td>
              <td class="p-3 sm:p-4">Geniş salonlu tarihi köşkler ve lüks konutlar</td>
            </tr>
            <tr class="bg-stone-50/50">
              <td class="p-3 sm:p-4 font-semibold text-stone-900">Open Living Serisi</td>
              <td class="p-3 sm:p-4">Ada tezgah barı ve salon birleşimi</td>
              <td class="p-3 sm:p-4">Porselen Tezgah &amp; Doğal Meşe Kaplama</td>
              <td class="p-3 sm:p-4">Geniş aile yaşam alanları ve modern stüdyolar</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </section>
''',

  '/yapilan-isler/': '''
  <!-- Teslim Edilen Referans Proje Türleri Tablosu (G17 NavBoost) -->
  <section class="py-12 bg-white border-b border-stone-200" data-seo-interactive="true">
    <div class="max-w-5xl mx-auto px-4 sm:px-6">
      <h2 class="text-xl sm:text-2xl font-bold text-stone-900 mb-6 text-center font-editorial">İzmir'de Teslim Edilen Proje Türleri ve İmalat Özeti</h2>
      <div class="overflow-x-auto rounded-xl border border-stone-200">
        <table class="w-full text-left border-collapse text-xs sm:text-sm">
          <thead>
            <tr class="bg-stone-100 text-stone-800 font-semibold border-b border-stone-200">
              <th class="p-3 sm:p-4">Proje Kategorisi</th>
              <th class="p-3 sm:p-4">Tamamlanan Adet</th>
              <th class="p-3 sm:p-4">Uygulama Bölgeleri</th>
              <th class="p-3 sm:p-4">Temel İmalat Kalemleri</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-stone-200 text-stone-700">
            <tr>
              <td class="p-3 sm:p-4 font-semibold text-stone-900">Lüks Mutfak Dolabı</td>
              <td class="p-3 sm:p-4 font-mono font-bold text-emerald-800">1.400+ Proje</td>
              <td class="p-3 sm:p-4">Buca, Karşıyaka, Bornova, Alsancak</td>
              <td class="p-3 sm:p-4">Lake ve akrilik dolaplar, porselen/kuvars tezgah</td>
            </tr>
            <tr class="bg-stone-50/50">
              <td class="p-3 sm:p-4 font-semibold text-stone-900">Komple Daire Tadilatı</td>
              <td class="p-3 sm:p-4 font-mono font-bold text-emerald-800">650+ Daire</td>
              <td class="p-3 sm:p-4">Göztepe, Hatay, Bayraklı, Mavişehir</td>
              <td class="p-3 sm:p-4">Tesisat, banyo, seramik, asma tavan ve parke</td>
            </tr>
            <tr>
              <td class="p-3 sm:p-4 font-semibold text-stone-900">Müstakil Villa Renovasyonu</td>
              <td class="p-3 sm:p-4 font-mono font-bold text-emerald-800">320+ Villa</td>
              <td class="p-3 sm:p-4">Çeşme, Urla, Güzelbahçe, Seferihisar</td>
              <td class="p-3 sm:p-4">Marin dolaplar, şömine çevresi, ada tezgahlar</td>
            </tr>
            <tr class="bg-stone-50/50">
              <td class="p-3 sm:p-4 font-semibold text-stone-900">Ticari Mekan &amp; Fit-Out</td>
              <td class="p-3 sm:p-4 font-mono font-bold text-emerald-800">180+ İş Yeri</td>
              <td class="p-3 sm:p-4">İzmir genelinde AVM ve cadde mağazaları</td>
              <td class="p-3 sm:p-4">Karşılama bankosu, teşhir stantları, akustik panel</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </section>
'''
}

def inject_table(filepath, route):
    if route not in TABLES:
        return
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # remove existing injected table if already there
    content = re.sub(r'<!--.*?\(G17 NavBoost\) -->.*?</table>\s*</div>\s*</div>\s*</section>', '', content, flags=re.DOTALL)

    # Insert table right before </Layout>
    m = re.search(r'</Layout>', content)
    if m:
        pos = m.start()
        new_content = content[:pos] + TABLES[route] + '\n' + content[pos:]
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f'[TABLE] Injected to {filepath}')
    else:
        print(f'[ERROR] </Layout> not found in {filepath}')

def main():
    for route, capsule in CAPSULES.items():
        filepath = 'src/pages/index.astro' if route == '/' else f'src/pages{route}index.astro'
        if os.path.exists(filepath):
            inject_capsule(filepath, route)
            inject_table(filepath, route)
        else:
            print(f'File not found: {filepath}')

if __name__ == '__main__':
    main()
