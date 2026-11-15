import type { SeoPageRecord } from './registry.types';

export const DOMAIN = 'yesilaymutfak.com';
export const SITE_URL = 'https://yesilaymutfak.com';

const PUBLISHED_AT = '2024-01-15T09:00:00+03:00';
const MODIFIED_AT = '2026-11-14T12:00:00+03:00';

export const SEO_REGISTRY: Record<string, SeoPageRecord> = {
  '/': {
    route: '/',
    role: 'home',
    title: 'İzmir Özel Ölçü Mutfak Dolabı & Tadilat | Yeşilay Mutfak',
    metaDescription: 'İzmir Buca Adatepe atölyemizde 18 mm E1 MDF ve Blum donanımla özel ölçü mutfak dolabı, banyo ve anahtar teslim tadilat. Ücretsiz 3D keşif randevusu alın.',
    image: '/media/hero/hero-slide-1.webp',
    publishedAt: PUBLISHED_AT,
    modifiedAt: MODIFIED_AT,
    breadcrumbs: []
  },
  '/hakkimizda/': {
    route: '/hakkimizda/',
    role: 'article',
    title: 'Hakkımızda – 28 Yıllık Buca Atölye Mirası | Yeşilay Mutfak',
    metaDescription: '1998 yılından bu yana İzmir Buca Adatepe atölyemizde aracı komisyonu olmadan özel ölçü mutfak dolabı ve mimari mobilya üretiyoruz. Atölyemizi tanıyın.',
    image: '/media/real/yesilay-buca-showroom-dis-bina.webp',
    publishedAt: PUBLISHED_AT,
    modifiedAt: MODIFIED_AT,
    breadcrumbs: [
      { name: 'Ana Sayfa', item: '/' },
      { name: 'Hakkımızda', item: '/hakkimizda/' }
    ]
  },
  '/iletisim/': {
    route: '/iletisim/',
    role: 'contact',
    title: 'İletişim & Buca Showroom Yol Tarifi | Yeşilay Mutfak',
    metaDescription: 'İzmir Buca Gaziler showroomumuza ve Adatepe imalat atölyemize yol tarifi alın. Ücretsiz lazer rölöve ve 3D keşif için 0232 441 10 60 hattımızı arayın.',
    image: '/media/real/yesilay-showroom-gece-cephe.webp',
    publishedAt: PUBLISHED_AT,
    modifiedAt: MODIFIED_AT,
    breadcrumbs: [
      { name: 'Ana Sayfa', item: '/' },
      { name: 'İletişim', item: '/iletisim/' }
    ]
  },
  '/izmir-mutfak-dolabi-imalati/': {
    route: '/izmir-mutfak-dolabi-imalati/',
    role: 'collection',
    title: 'İzmir Özel Ölçü Mutfak Dolabı Modelleri | Yeşilay Mutfak',
    metaDescription: 'Buca Adatepe atölyemizde üretilen ipek mat lake, çizilmez akrilik ve masif meşe özel ölçü mutfak dolabı modelleri. Ücretsiz 3D mimari çizim teklifi alın.',
    image: '/images/models/mutfak/sakura.jpg',
    publishedAt: PUBLISHED_AT,
    modifiedAt: MODIFIED_AT,
    breadcrumbs: [
      { name: 'Ana Sayfa', item: '/' },
      { name: 'Mutfak Dolabı Modelleri', item: '/izmir-mutfak-dolabi-imalati/' }
    ],
    catalogItems: [
      { name: 'Lumina İpek Mat Lake Ada Mutfak', url: '/izmir-mutfak-dolabi-imalati/#bilgi-al', image: '/images/models/mutfak/sakura.jpg' },
      { name: 'Statuario Porselen Tezgahlı Mutfak', url: '/izmir-mutfak-dolabi-imalati/#bilgi-al', image: '/images/models/mutfak/iconica.jpg' },
      { name: 'Solyma Akrilik ve Doğal Ahşap Mutfak', url: '/izmir-mutfak-dolabi-imalati/#bilgi-al', image: '/images/models/mutfak/convivio.jpg' },
      { name: 'Linea Minimalist Mutfak Koleksiyonu', url: '/izmir-mutfak-dolabi-imalati/#bilgi-al', image: '/images/models/mutfak/start-time.jpg' },
      { name: 'Portofino Poliüretan Mat Lake Mutfak', url: '/izmir-mutfak-dolabi-imalati/#bilgi-al', image: '/images/models/mutfak/milano.jpg' },
      { name: 'Belvedere Açık Plan Ada Mutfak', url: '/izmir-mutfak-dolabi-imalati/#bilgi-al', image: '/images/models/mutfak/lounge.jpg' },
      { name: 'Serena Neo-Klasik Çıtalı Mutfak', url: '/izmir-mutfak-dolabi-imalati/#bilgi-al', image: '/images/models/mutfak/armonia.jpg' },
      { name: 'Vetro Reflekte Cam Vitrinli Mutfak', url: '/izmir-mutfak-dolabi-imalati/#bilgi-al', image: '/images/models/mutfak/ri-flex.jpg' },
      { name: 'Plana Entegre J-Kulp Mutfak', url: '/izmir-mutfak-dolabi-imalati/#bilgi-al', image: '/images/models/mutfak/tablet.jpg' },
      { name: 'Natura Masif Meşe ve Akrilik Mutfak', url: '/izmir-mutfak-dolabi-imalati/#bilgi-al', image: '/images/models/mutfak/like.jpg' },
      { name: 'Nostalgia Country Çerçeveli Mutfak', url: '/izmir-mutfak-dolabi-imalati/#bilgi-al', image: '/images/models/mutfak/memory.jpg' },
      { name: 'Onyx Antrasit İpek Mat Ada Mutfak', url: '/izmir-mutfak-dolabi-imalati/#bilgi-al', image: '/images/models/mutfak/oyster.jpg' },
      { name: 'Toscana İtalyan Çıtalı Lake Mutfak', url: '/izmir-mutfak-dolabi-imalati/#bilgi-al', image: '/images/models/mutfak/pavese.jpg' },
      { name: 'Spazio Tavan Boyu Kilerli Mutfak', url: '/izmir-mutfak-dolabi-imalati/#bilgi-al', image: '/images/models/mutfak/ethica.jpg' },
      { name: 'Canaletto Yivli Fluted Ahşap Mutfak', url: '/izmir-mutfak-dolabi-imalati/#bilgi-al', image: '/images/models/mutfak/extra.jpg' }
    ]
  },
  '/tasarimlar/': {
    route: '/tasarimlar/',
    role: 'collection',
    title: 'Mutfak, Banyo ve Dolap Modelleri Kataloğu | Yeşilay Mutfak',
    metaDescription: 'Özel ölçü üretilen 137+ modern, ada ve country mutfak dolabı, banyo mobilyası, lake iç kapı ve gömme dolap modelini inceleyin. 3D keşif talebi oluşturun.',
    image: '/media/tasarimlar/model-1-3.webp',
    publishedAt: PUBLISHED_AT,
    modifiedAt: MODIFIED_AT,
    breadcrumbs: [
      { name: 'Ana Sayfa', item: '/' },
      { name: 'Tasarımlar Kataloğu', item: '/tasarimlar/' }
    ],
    catalogItems: [
      { name: 'Özel Ölçü Mutfak Dolabı Modelleri', url: '/izmir-mutfak-dolabi-imalati/', image: '/media/tasarimlar/model-1-3.webp' },
      { name: 'Modern Kulpsuz Mutfak Modelleri', url: '/modern-mutfak-modelleri/', image: '/media/cinematic/modern_mutfak.webp' },
      { name: 'Klasik ve Country Lake Mutfak Modelleri', url: '/klasik-country-mutfak-modelleri/', image: '/media/cinematic/klasik_mutfak.webp' },
      { name: 'Lüks Banyo Dolabı ve Yenileme', url: '/izmir-banyo-yenileme-seramik/', image: '/media/real/yesilay-hilton-banyo-dolabi-luxury.webp' },
      { name: 'Yatak Odası ve Gardırop Modelleri', url: '/yatak-odasi-modelleri/', image: '/images/models/koleksiyonlar/yatak-golf.webp' },
      { name: 'Kahve Köşesi ve Barista Üniteleri', url: '/kahve-kosesi-modelleri/', image: '/media/real/yesilay-aluminyum-fluted-cam-kapak.webp' }
    ]
  },
  '/modern-mutfak-modelleri/': {
    route: '/modern-mutfak-modelleri/',
    role: 'collection',
    title: 'İzmir Modern & Kulpsuz Mutfak Modelleri | Yeşilay Mutfak',
    metaDescription: 'Kulpsuz Gola profil, parmak izi bırakmayan ipek mat lake ve UV akrilik modern mutfak dolabı imalatı. İzmir geneli ücretsiz lazer ölçü ve 3D çizim alın.',
    image: '/media/cinematic/modern_mutfak.webp',
    publishedAt: PUBLISHED_AT,
    modifiedAt: MODIFIED_AT,
    breadcrumbs: [
      { name: 'Ana Sayfa', item: '/' },
      { name: 'Mutfak Modelleri', item: '/izmir-mutfak-dolabi-imalati/' },
      { name: 'Modern Mutfak Modelleri', item: '/modern-mutfak-modelleri/' }
    ],
    catalogItems: [
      { name: 'Kulpsuz Gola Profil İpek Mat Lake Mutfak', url: '/modern-mutfak-modelleri/', image: '/media/cinematic/modern_mutfak.webp' },
      { name: 'Alüminyum Fluted Cam Vitrinli Modern Mutfak', url: '/modern-mutfak-modelleri/', image: '/media/real/yesilay-aluminyum-fluted-cam-kapak.webp' },
      { name: 'Porselen Ada Tezgahlı Antrasit Mutfak', url: '/izmir-mutfak-dolabi-imalati/', image: '/images/models/mutfak/oyster.jpg' }
    ]
  },
  '/klasik-country-mutfak-modelleri/': {
    route: '/klasik-country-mutfak-modelleri/',
    role: 'collection',
    title: 'İzmir Klasik & Country Mutfak Modelleri | Yeşilay Mutfak',
    metaDescription: 'CNC çıtalı kapaklar, sararmayan poliüretan fırın lake ve masif ahşap detaylarla klasik country mutfak imalatı. Buca atölyemizden ücretsiz 3D keşif alın.',
    image: '/media/cinematic/klasik_mutfak.webp',
    publishedAt: PUBLISHED_AT,
    modifiedAt: MODIFIED_AT,
    breadcrumbs: [
      { name: 'Ana Sayfa', item: '/' },
      { name: 'Mutfak Modelleri', item: '/izmir-mutfak-dolabi-imalati/' },
      { name: 'Klasik & Country Mutfak Modelleri', item: '/klasik-country-mutfak-modelleri/' }
    ],
    catalogItems: [
      { name: 'Çıtalı İpek Mat Fırın Lake Country Mutfak', url: '/klasik-country-mutfak-modelleri/', image: '/media/cinematic/klasik_mutfak.webp' },
      { name: 'Serena Neo-Klasik Çerçeveli Mutfak', url: '/izmir-mutfak-dolabi-imalati/', image: '/images/models/mutfak/armonia.jpg' },
      { name: 'Toscana İtalyan Çıtalı Lake Mutfak', url: '/izmir-mutfak-dolabi-imalati/', image: '/images/models/mutfak/pavese.jpg' }
    ]
  },
  '/yasam-alanlari-mutfak-modelleri/': {
    route: '/yasam-alanlari-mutfak-modelleri/',
    role: 'collection',
    title: 'Açık Mutfak & Ada Bar Yaşam Modelleri | Yeşilay Mutfak',
    metaDescription: 'Salonla bütünleşik açık plan ada mutfaklar, kahvaltı barları ve entegre mermer TV üniteleri. Mekanınıza özel 3D mimari rölöve ve imalat teklifi alın.',
    image: '/media/real/yesilay-tv-unitesi-somine-luxury-wide.webp',
    publishedAt: PUBLISHED_AT,
    modifiedAt: MODIFIED_AT,
    breadcrumbs: [
      { name: 'Ana Sayfa', item: '/' },
      { name: 'Mutfak Modelleri', item: '/izmir-mutfak-dolabi-imalati/' },
      { name: 'Açık Mutfak & Yaşam Alanları', item: '/yasam-alanlari-mutfak-modelleri/' }
    ],
    catalogItems: [
      { name: 'Salonla Bütünleşik Ada Bar Mutfak Tasarımı', url: '/yasam-alanlari-mutfak-modelleri/', image: '/media/cinematic/life_alanlar.webp' },
      { name: 'Şömineli Mermer TV Ünitesi ve Açık Mutfak', url: '/yasam-alanlari-mutfak-modelleri/', image: '/media/real/yesilay-tv-unitesi-somine-luxury-wide.webp' },
      { name: 'Moderna Salon ve Yaşam Alanı Koleksiyonu', url: '/salon-modelleri/', image: '/images/models/koleksiyonlar/salon-golf.webp' }
    ]
  },
  '/hazir-mutfak-modelleri-izmir/': {
    route: '/hazir-mutfak-modelleri-izmir/',
    role: 'collection',
    title: 'Hazır & Modüler Mutfak Modelleri İzmir | Yeşilay Mutfak',
    metaDescription: '18 mm E1 MDF gövdeli, Blum frenli menteşeli hazır ve modüler mutfak dolabı modelleri. Buca atölyemizden hızlı teslimat ve doğrudan üretici teklifi alın.',
    image: '/media/tasarimlar/model-5.webp',
    publishedAt: PUBLISHED_AT,
    modifiedAt: MODIFIED_AT,
    breadcrumbs: [
      { name: 'Ana Sayfa', item: '/' },
      { name: 'Mutfak Modelleri', item: '/izmir-mutfak-dolabi-imalati/' },
      { name: 'Hazır & Modüler Mutfak Modelleri', item: '/hazir-mutfak-modelleri-izmir/' }
    ],
    catalogItems: [
      { name: '180–240 cm Düz Cephe Modüler Mutfak Sistemi', url: '/hazir-mutfak-modelleri-izmir/', image: '/media/tasarimlar/model-5.webp' },
      { name: 'L Tipi Köşe Modüler Mutfak Paketi', url: '/hazir-mutfak-modelleri-izmir/', image: '/media/tasarimlar/model-8.webp' },
      { name: 'Ada Eklentili Modüler Akrilik Mutfak', url: '/hazir-mutfak-modelleri-izmir/', image: '/media/tasarimlar/model-12.webp' }
    ]
  },
  '/kahve-kosesi-modelleri/': {
    route: '/kahve-kosesi-modelleri/',
    role: 'collection',
    title: 'İzmir Özel Ölçü Kahve Köşesi Modelleri | Yeşilay Mutfak',
    metaDescription: 'Buca atölyemizde niş ölçünüze özel üretilen LED aydınlatmalı, gizli prizli ve Blum çekmeceli kahve köşesi dolapları. Ücretsiz 3D tasarım teklifi alın.',
    image: '/media/real/yesilay-showroom-ic-mekan.webp',
    publishedAt: PUBLISHED_AT,
    modifiedAt: MODIFIED_AT,
    breadcrumbs: [
      { name: 'Ana Sayfa', item: '/' },
      { name: 'Tasarımlar', item: '/tasarimlar/' },
      { name: 'Kahve Köşesi Modelleri', item: '/kahve-kosesi-modelleri/' }
    ],
    catalogItems: [
      { name: 'Fluted Cam Kapaklı LED Aydınlatmalı Barista Dolabı', url: '/kahve-kosesi-modelleri/#modeller', image: '/media/real/yesilay-aluminyum-fluted-cam-kapak-square.webp' },
      { name: 'Modern Minimalist Ahşap Kulplu Kahve Köşesi', url: '/kahve-kosesi-modelleri/#modeller', image: '/media/tasarimlar/model-14.webp' },
      { name: 'Kiler Bölmeli ve Çekmeceli Kahve İstasyonu', url: '/kahve-kosesi-modelleri/#modeller', image: '/media/tasarimlar/model-18.webp' }
    ]
  },
  '/salon-modelleri/': {
    route: '/salon-modelleri/',
    role: 'collection',
    title: 'Özel Ölçü Salon & TV Ünitesi Modelleri | Yeşilay Mutfak',
    metaDescription: 'Moderna, Aura ve Elegance serisi özel ölçü TV üniteleri, duvar kütüphaneleri ve asma konsollar. İzmir Buca atölyemizden ücretsiz 3D keşif randevusu alın.',
    image: '/images/models/koleksiyonlar/salon-golf.webp',
    publishedAt: PUBLISHED_AT,
    modifiedAt: MODIFIED_AT,
    breadcrumbs: [
      { name: 'Ana Sayfa', item: '/' },
      { name: 'Tasarımlar', item: '/tasarimlar/' },
      { name: 'Salon & TV Ünitesi Modelleri', item: '/salon-modelleri/' }
    ],
    catalogItems: [
      { name: 'Moderna Modüler Salon ve TV Ünitesi Koleksiyonu', url: '/salon-modelleri/#bilgi-al', image: '/images/models/salon/golf/01.webp' },
      { name: 'Aura Asma Konsol ve Duvar Sistemi Koleksiyonu', url: '/salon-modelleri/#bilgi-al', image: '/images/models/salon/volo/01.webp' },
      { name: 'Elegance Kütüphaneli Yaşam Ünitesi Koleksiyonu', url: '/salon-modelleri/#bilgi-al', image: '/images/models/salon/arcadia/01.webp' }
    ]
  },
  '/yatak-odasi-modelleri/': {
    route: '/yatak-odasi-modelleri/',
    role: 'collection',
    title: 'Yatak Odası, Gardırop & Giyinme Odası | Yeşilay Mutfak',
    metaDescription: 'Tavan boyu sürgülü ve menteşeli lake gardıroplar, LED aydınlatmalı giyinme odaları ve ada şifonyerler. İzmir içi ücretsiz rölöve ve 3D proje teklifi alın.',
    image: '/images/models/koleksiyonlar/yatak-golf.webp',
    publishedAt: PUBLISHED_AT,
    modifiedAt: MODIFIED_AT,
    breadcrumbs: [
      { name: 'Ana Sayfa', item: '/' },
      { name: 'Tasarımlar', item: '/tasarimlar/' },
      { name: 'Yatak Odası & Gardırop Modelleri', item: '/yatak-odasi-modelleri/' }
    ],
    catalogItems: [
      { name: 'Zenith Özel Ölçü Gardırop ve Yatak Odası Serisi', url: '/yatak-odasi-modelleri/#bilgi-al', image: '/images/models/yatak-odasi/golf/01.webp' },
      { name: 'Sera Giyinme Odası ve Raylı Dolap Serisi', url: '/yatak-odasi-modelleri/#bilgi-al', image: '/images/models/yatak-odasi/volo/01.webp' },
      { name: 'Palazzo Klasik ve Lake Gardırop Serisi', url: '/yatak-odasi-modelleri/#bilgi-al', image: '/images/models/yatak-odasi/arcadia/01.webp' }
    ]
  },
  '/genc-odasi-modelleri/': {
    route: '/genc-odasi-modelleri/',
    role: 'collection',
    title: 'Ergonomik Genç Odası & Dolap Modelleri | Yeşilay Mutfak',
    metaDescription: 'Çalışma masası, kitaplık ve geniş depolama dolaplarıyla özel ölçü genç odası tasarımları. E1 sertifikalı sağlıklı MDF gövde ile ücretsiz 3D keşif alın.',
    image: '/images/models/koleksiyonlar/genc-golf.webp',
    publishedAt: PUBLISHED_AT,
    modifiedAt: MODIFIED_AT,
    breadcrumbs: [
      { name: 'Ana Sayfa', item: '/' },
      { name: 'Tasarımlar', item: '/tasarimlar/' },
      { name: 'Genç Odası Modelleri', item: '/genc-odasi-modelleri/' }
    ],
    catalogItems: [
      { name: 'Dinamik Ergonomik Çalışma Üniteli Genç Odası', url: '/genc-odasi-modelleri/#bilgi-al', image: '/images/models/genc-odasi/golf/01.webp' },
      { name: 'Nova Modüler Kitaplıklı Genç Odası', url: '/genc-odasi-modelleri/#bilgi-al', image: '/images/models/genc-odasi/volo/01.webp' },
      { name: 'KlasikZamansız Lake Genç Odası Serisi', url: '/genc-odasi-modelleri/#bilgi-al', image: '/images/models/genc-odasi/arcadia/01.webp' }
    ]
  },
  '/cocuk-odasi-modelleri/': {
    route: '/cocuk-odasi-modelleri/',
    role: 'collection',
    title: 'Montessori & Lake Çocuk Odası Modelleri | Yeşilay Mutfak',
    metaDescription: 'EN 71-3 su bazlı anti-alerjik lake boyalı, yuvarlatılmış güvenli köşeli ve Montessori uyumlu özel ölçü çocuk odası mobilyaları. Ücretsiz 3D keşif alın.',
    image: '/images/models/koleksiyonlar/cocuk-golf.webp',
    publishedAt: PUBLISHED_AT,
    modifiedAt: MODIFIED_AT,
    breadcrumbs: [
      { name: 'Ana Sayfa', item: '/' },
      { name: 'Tasarımlar', item: '/tasarimlar/' },
      { name: 'Çocuk Odası Modelleri', item: '/cocuk-odasi-modelleri/' }
    ],
    catalogItems: [
      { name: 'Neşe Montessori Uyumlu Çocuk Odası Koleksiyonu', url: '/cocuk-odasi-modelleri/#bilgi-al', image: '/images/models/cocuk-odasi/golf/01.webp' },
      { name: 'Masal Anti-Alerjik Su Bazlı Lake Çocuk Odası', url: '/cocuk-odasi-modelleri/#bilgi-al', image: '/images/models/cocuk-odasi/volo/01.webp' }
    ]
  },
  '/camasir-odasi-modelleri/': {
    route: '/camasir-odasi-modelleri/',
    role: 'collection',
    title: 'Çamaşır Odası & Kiler Dolabı Modelleri | Yeşilay Mutfak',
    metaDescription: 'Çamaşır ve kurutma makinesi kule kabinleri, gizli kirli sepeti ve neme dayanıklı boy kiler dolapları. İzmir geneli ücretsiz ölçü ve imalat teklifi alın.',
    image: '/images/models/koleksiyonlar/camasir-ana.webp',
    publishedAt: PUBLISHED_AT,
    modifiedAt: MODIFIED_AT,
    breadcrumbs: [
      { name: 'Ana Sayfa', item: '/' },
      { name: 'Tasarımlar', item: '/tasarimlar/' },
      { name: 'Çamaşır Odası & Kiler Modelleri', item: '/camasir-odasi-modelleri/' }
    ],
    catalogItems: [
      { name: 'Pratik Çamaşır ve Kurutma Makinesi Kule Dolap Sistemi', url: '/camasir-odasi-modelleri/#bilgi-al', image: '/images/models/camasir/ana/01.webp' },
      { name: 'Gizli Deterjanlıklı ve Ütü Masalı Yardımcı Alan Dolabı', url: '/camasir-odasi-modelleri/#bilgi-al', image: '/images/models/camasir/ana/02.webp' }
    ]
  },
  '/yapilan-isler/': {
    route: '/yapilan-isler/',
    role: 'collection',
    title: 'İzmir Tamamlanan Mutfak & Tadilat İşleri | Yeşilay Mutfak',
    metaDescription: '1998 yılından bugüne İzmir, Çeşme ve Urla genelinde teslim ettiğimiz 72+ gerçek mutfak, banyo ve villa tadilatı referans projesini fotoğraflarıyla inceleyin.',
    image: '/media/projeler/proje-01.webp',
    publishedAt: PUBLISHED_AT,
    modifiedAt: MODIFIED_AT,
    breadcrumbs: [
      { name: 'Ana Sayfa', item: '/' },
      { name: 'Yapılan İşler & Referanslar', item: '/yapilan-isler/' }
    ],
    catalogItems: [
      { name: 'Karşıyaka Mavişehir Porselen Ada Mutfak Dönüşümü', url: '/yapilan-isler/', image: '/media/projeler/proje-01.webp' },
      { name: 'Çeşme Alaçatı Taş Villa Komple Mutfak ve Banyo Uygulaması', url: '/yapilan-isler/', image: '/media/projeler/proje-02.webp' },
      { name: 'Urla Kekliktepe Doğal Meşe ve İpek Mat Lake Mutfak', url: '/yapilan-isler/', image: '/media/projeler/proje-03.webp' },
      { name: 'Buca Şirinyer Komple 3+1 Daire ve Mutfak Tadilatı', url: '/yapilan-isler/', image: '/media/projeler/proje-04.webp' }
    ]
  },
  '/izmir-komple-mutfak-tadilati/': {
    route: '/izmir-komple-mutfak-tadilati/',
    role: 'service',
    serviceType: 'Anahtar Teslim Komple Mutfak Tadilatı ve Dolap İmalatı',
    title: 'İzmir Komple Mutfak Tadilatı & Yenileme | Yeşilay Mutfak',
    metaDescription: 'Kırım, sıhhi ve elektrik tesisatı, porselen tezgah, seramik ve özel ölçü dolap montajıyla anahtar teslim mutfak tadilatı. Sözleşmeli keşif teklifi alın.',
    image: '/media/real/yesilay-showroom-ic-mekan.webp',
    publishedAt: PUBLISHED_AT,
    modifiedAt: MODIFIED_AT,
    breadcrumbs: [
      { name: 'Ana Sayfa', item: '/' },
      { name: 'Komple Mutfak Tadilatı', item: '/izmir-komple-mutfak-tadilati/' }
    ]
  },
  '/izmir-banyo-yenileme-seramik/': {
    route: '/izmir-banyo-yenileme-seramik/',
    role: 'service',
    serviceType: 'Su Yalıtımlı Banyo Tadilatı, Seramik ve Banyo Dolabı İmalatı',
    title: 'İzmir Banyo Tadilatı & Seramik Yenileme | Yeşilay Mutfak',
    metaDescription: 'Çift kat elastik su yalıtımı, 60x120 rektifiyeli porselen seramik, gömme rezervuar ve marin banyo dolabı imalatı. İzmir içi ücretsiz keşif randevusu alın.',
    image: '/media/real/yesilay-hilton-banyo-dolabi-luxury.webp',
    publishedAt: PUBLISHED_AT,
    modifiedAt: MODIFIED_AT,
    breadcrumbs: [
      { name: 'Ana Sayfa', item: '/' },
      { name: 'Banyo Tadilatı & Seramik', item: '/izmir-banyo-yenileme-seramik/' }
    ]
  },
  '/izmir-komple-daire-tadilati/': {
    route: '/izmir-komple-daire-tadilati/',
    role: 'service',
    serviceType: 'Anahtar Teslim Komple Daire ve Ev Tadilatı',
    title: 'İzmir Komple Daire & Ev Tadilatı Hizmeti | Yeşilay Mutfak',
    metaDescription: 'Elektrik-su tesisatı, şap, parke, alçı-boya, lake iç kapı, mutfak ve banyo dahil sözleşmeli komple daire tadilatı. Mimarımızdan ücretsiz 3D keşif alın.',
    image: '/media/real/yesilay-mimari-danismanlik-toplanti-wide.webp',
    publishedAt: PUBLISHED_AT,
    modifiedAt: MODIFIED_AT,
    breadcrumbs: [
      { name: 'Ana Sayfa', item: '/' },
      { name: 'Komple Daire Tadilatı', item: '/izmir-komple-daire-tadilati/' }
    ]
  },
  '/izmir-anahtar-teslim-tadilat/': {
    route: '/izmir-anahtar-teslim-tadilat/',
    role: 'service',
    serviceType: 'Sözleşmeli Anahtar Teslim Villa ve Konut Tadilatı',
    title: 'Anahtar Teslim Tadilat İzmir – Sözleşmeli | Yeşilay Mutfak',
    metaDescription: 'İzmir, Çeşme ve Urla genelinde sabit bütçe ve gecikme tazminatı garantili anahtar teslim daire ve villa tadilatı. Ücretsiz mimari rölöve randevusu alın.',
    image: '/media/real/yesilay-tv-unitesi-somine-luxury-wide.webp',
    publishedAt: PUBLISHED_AT,
    modifiedAt: MODIFIED_AT,
    breadcrumbs: [
      { name: 'Ana Sayfa', item: '/' },
      { name: 'Anahtar Teslim Tadilat', item: '/izmir-anahtar-teslim-tadilat/' }
    ]
  },
  '/izmir-cam-balkon-sistemleri/': {
    route: '/izmir-cam-balkon-sistemleri/',
    role: 'service',
    serviceType: 'Isıcamlı Katlanır, Sürme ve Giyotin Cam Balkon İmalatı',
    title: 'İzmir Isıcamlı & Katlanır Cam Balkon | Yeşilay Mutfak',
    metaDescription: 'Şişecam Konfor ısıcamlı katlanır, eşiksiz sürme ve motorlu giyotin cam balkon sistemleri. Buca atölye güvencesiyle ücretsiz lazer ölçü randevusu alın.',
    image: '/media/cam-balkon/izmir-cambalkon.webp',
    publishedAt: PUBLISHED_AT,
    modifiedAt: MODIFIED_AT,
    breadcrumbs: [
      { name: 'Ana Sayfa', item: '/' },
      { name: 'Cam Balkon Sistemleri', item: '/izmir-cam-balkon-sistemleri/' }
    ]
  },
  '/projelendirme/': {
    route: '/projelendirme/',
    role: 'service',
    serviceType: 'Ticari Mekân Mimari Projelendirme ve Anahtar Teslim Fit-Out',
    title: 'İzmir Ticari Mekân Projelendirme Fit-Out | Yeşilay Mutfak',
    metaDescription: 'Ofis, klinik, mağaza ve kafe-restoranlar için 3D mimari tasarım, özel ahşap imalat ve anahtar teslim fit-out taahhüt. Kurumsal keşif görüşmesi talep edin.',
    image: '/images/projelendirme/hero/hero_01.webp',
    publishedAt: PUBLISHED_AT,
    modifiedAt: MODIFIED_AT,
    breadcrumbs: [
      { name: 'Ana Sayfa', item: '/' },
      { name: 'Ticari Mekân Projelendirme', item: '/projelendirme/' }
    ]
  },
  '/2026-mutfak-dolabi-fiyatlari/': {
    route: '/2026-mutfak-dolabi-fiyatlari/',
    role: 'article',
    title: '2026 İzmir Mutfak Dolabı Fiyatları Rehberi | Yeşilay Mutfak',
    metaDescription: '2026 İzmir mutfak dolabı metretül hesaplama cetveli; akrilik, ipek mat lake ve porselen tezgah karşılaştırması. Atölyeden şeffaf keşif ve 3D teklif alın.',
    image: '/media/real/yesilay-mimari-danismanlik-toplanti-wide.webp',
    publishedAt: PUBLISHED_AT,
    modifiedAt: MODIFIED_AT,
    breadcrumbs: [
      { name: 'Ana Sayfa', item: '/' },
      { name: '2026 Mutfak Dolabı Fiyatları Rehberi', item: '/2026-mutfak-dolabi-fiyatlari/' }
    ]
  },
  '/hizmet-bolgeleri/buca/': {
    route: '/hizmet-bolgeleri/buca/',
    role: 'service',
    serviceType: 'Buca Özel Ölçü Mutfak Dolabı İmalatı ve Komple Tadilat',
    areaServed: 'Buca, İzmir',
    title: 'Buca Mutfak Tadilatı & Dolap İmalatı | Yeşilay Mutfak',
    metaDescription: 'Buca Adatepe imalat atölyemizden Şirinyer, Buca Koop ve tüm mahallelere aracısız fabrika fiyatıyla özel ölçü mutfak dolabı ve tadilat. Ücretsiz keşif alın.',
    image: '/media/real/yesilay-showroom-gece-cephe.webp',
    publishedAt: PUBLISHED_AT,
    modifiedAt: MODIFIED_AT,
    breadcrumbs: [
      { name: 'Ana Sayfa', item: '/' },
      { name: 'Buca Mutfak Tadilatı', item: '/hizmet-bolgeleri/buca/' }
    ]
  },
  '/hizmet-bolgeleri/cesme/': {
    route: '/hizmet-bolgeleri/cesme/',
    role: 'service',
    serviceType: 'Çeşme ve Alaçatı Villa Mutfak İmalatı ve Yazlık Tadilatı',
    areaServed: 'Çeşme, İzmir',
    title: 'Çeşme & Alaçatı Villa Mutfak Tadilatı | Yeşilay Mutfak',
    metaDescription: 'Çeşme ve Alaçatı taş villalarına özel neme dayanıklı marin MDF mutfak dolabı, porselen tezgah ve yaz yasağı öncesi teslim garantili tadilat keşfi alın.',
    image: '/media/hero/hero-slide-2.webp',
    publishedAt: PUBLISHED_AT,
    modifiedAt: MODIFIED_AT,
    breadcrumbs: [
      { name: 'Ana Sayfa', item: '/' },
      { name: 'Çeşme & Alaçatı Mutfak Tadilatı', item: '/hizmet-bolgeleri/cesme/' }
    ]
  },
  '/hizmet-bolgeleri/guzelbahce/': {
    route: '/hizmet-bolgeleri/guzelbahce/',
    role: 'service',
    serviceType: 'Güzelbahçe ve Yelki Villa Ada Mutfak ve Komple Tadilat',
    areaServed: 'Güzelbahçe, İzmir',
    title: 'Güzelbahçe & Yelki Villa Mutfak Tadilatı | Yeşilay Mutfak',
    metaDescription: 'Güzelbahçe, Yelki ve Kahramandere müstakil villalarına özel geniş ada mutfak, porselen tezgah ve anahtar teslim tadilat. Ücretsiz 3D keşif randevusu alın.',
    image: '/media/hero/hero-slide-3.webp',
    publishedAt: PUBLISHED_AT,
    modifiedAt: MODIFIED_AT,
    breadcrumbs: [
      { name: 'Ana Sayfa', item: '/' },
      { name: 'Güzelbahçe Villa Mutfak Tadilatı', item: '/hizmet-bolgeleri/guzelbahce/' }
    ]
  },
  '/hizmet-bolgeleri/narlidere/': {
    route: '/hizmet-bolgeleri/narlidere/',
    role: 'service',
    serviceType: 'Narlıdere ve Sahilevleri Lüks Mutfak Dolabı ve Renovasyon',
    areaServed: 'Narlıdere, İzmir',
    title: 'Narlıdere & Sahilevleri Mutfak Tadilatı | Yeşilay Mutfak',
    metaDescription: 'Narlıdere ve Sahilevleri rezidans ile yalı dairelerine özel ipek mat fırın lake ada mutfak, Blum mekanizma ve sessiz şantiye yönetimli tadilat keşfi alın.',
    image: '/media/hero/hero-slide-4.webp',
    publishedAt: PUBLISHED_AT,
    modifiedAt: MODIFIED_AT,
    breadcrumbs: [
      { name: 'Ana Sayfa', item: '/' },
      { name: 'Narlıdere Mutfak Tadilatı', item: '/hizmet-bolgeleri/narlidere/' }
    ]
  },
  '/hizmet-bolgeleri/urla/': {
    route: '/hizmet-bolgeleri/urla/',
    role: 'service',
    serviceType: 'Urla ve Kekliktepe Taş Ev Mutfak Dolabı ve Villa Tadilatı',
    areaServed: 'Urla, İzmir',
    title: 'Urla Taş Ev & Villa Mutfak Tadilatı | Yeşilay Mutfak',
    metaDescription: 'Urla, Kekliktepe ve İskele bağ villaları ile taş evlere özel doğal meşe kaplama, country lake mutfak dolabı ve anahtar teslim tadilat için keşif alın.',
    image: '/media/cinematic/klasik_mutfak.webp',
    publishedAt: PUBLISHED_AT,
    modifiedAt: MODIFIED_AT,
    breadcrumbs: [
      { name: 'Ana Sayfa', item: '/' },
      { name: 'Urla Mutfak Tadilatı', item: '/hizmet-bolgeleri/urla/' }
    ]
  }
};
