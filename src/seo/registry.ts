import type { SeoPageRecord } from './registry.types';

export const DOMAIN = 'yesilaymutfak.com';
export const SITE_URL = 'https://yesilaymutfak.com';

const defaultMobile = {
  viewport: 'width=device-width, initial-scale=1, viewport-fit=cover, minimum-scale=1, maximum-scale=5',
  primaryAction: 'call' as const,
  bottomNavEnabled: true,
  thumbZonePosition: 'bottom-center' as const,
  touchTargetsValidated: true,
  horizontalScrollFree: true,
  thumbSafeHeroAnswer: true,
  voiceQueryPatterns: [
    'İzmir Buca özel imalat mutfak dolabı nerede yaptırılır?',
    'Yeşilay Mutfak mutfak dolabı modelleri ve keşif randevusu',
    'İzmir lüks banyo yenileme ve seramik işçiliği fiyatları'
  ],
  speakableSelectors: ['#hero-answer-engine', 'h1', '.speakable-content'],
  pwaInstallable: true
};

const defaultCwv = {
  lcpMs: 1600,
  inpMs: 80,
  cls: 0.02,
  ttfbMs: 140,
  htmlKb: 45
};

export const SEO_REGISTRY: Record<string, SeoPageRecord> = {
  '/': {
    route: '/',
    locale: 'tr-TR',
    role: 'home',
    indexDirective: 'index, follow',
    canonicalRoute: '/',
    title: 'Yeşilay Mutfak | İzmir Özel İmalat Mutfak & Banyo',
    metaDescription: 'İzmir genelinde Adatepe atölyemizde üretilen özel ölçü lüks mutfak dolapları, anahtar teslim banyo ve daire tadilatı. Ücretsiz 3D mimari keşif alın.',
    h1: 'Hayalinizdeki Mutfağı, Kişiye Özel Çizgilerle Gerçeğe Dönüştürüyoruz.',
    primaryIntent: 'izmir mutfak dolabı imalatı ve lüks tadilat',
    primaryEntity: {
      id: 'https://yesilaymutfak.com/#organization',
      name: 'Yeşilay Mutfak & Mimarlık Lüks İmalat Atölyesi',
      type: 'HomeAndConstructionBusiness',
      sameAs: [
        'https://www.instagram.com/yesilaymutfak',
        'https://wa.me/905324261788'
      ],
      wikidataQid: 'Q11589432'
    },
    semanticTriples: [
      { subject: 'Yeşilay Mutfak', predicate: 'providesService', object: 'Özel Ölçü Lüks Mutfak Dolabı İmalatı' },
      { subject: 'Yeşilay Mutfak', predicate: 'locatedIn', object: 'Adatepe, Buca, İzmir' },
      { subject: 'Yeşilay Mutfak', predicate: 'hasExperience', object: '28 Yıl Atölye Zanaatı' },
      { subject: 'Yeşilay Mutfak', predicate: 'usesHardware', object: 'Blum ve Häfele Frenli Gizli Sistemler' }
    ],
    heroAnswerEngine: 'Yeşilay Mutfak & Mimarlık, 1998 yılından bu yana İzmir Buca Adatepe atölyesinde 28 yıllık zanaat birikimiyle kişiye özel lüks mutfak dolabı imalatı ve anahtar teslim tadilat yapmaktadır. 137 tescilli model arşivi, E1 sertifikalı nem mukavemetli MDF gövde, Blum frenli mekanizmalar ve 10 yıl bütünleşik atölye garantisi sunar.',
    publishedAt: '2024-01-15T09:00:00+03:00',
    modifiedAt: '2026-10-17T23:40:00+03:00',
    llmSubGraphRoute: '/llms/pages/home.md',
    mobileSubGraphRoute: '/llms/mobile/home.md',
    breadcrumbs: [],
    mobile: defaultMobile,
    mobileCwvBudget: defaultCwv
  },

  '/hakkimizda/': {
    route: '/hakkimizda/',
    locale: 'tr-TR',
    role: 'article',
    indexDirective: 'index, follow',
    canonicalRoute: '/hakkimizda/',
    title: 'Hakkımızda | 28 Yıllık Zanaat & Lüks Atölye Mirası | Yeşilay Mutfak',
    metaDescription: '1998 yılından bu yana İzmir Adatepe atölyemizde kişiye özel lüks mutfak dolabı ve mimari mobilya üretiyoruz. 2.850+ tamamlanan proje ve 10 yıl garanti.',
    h1: '28 Yıllık Usta Zanaatı, Çağdaş İç Mimari Mühendislikle Buluşuyor.',
    primaryIntent: 'yeşilay mutfak kimdir atölye imalat tecrübesi',
    primaryEntity: {
      id: 'https://yesilaymutfak.com/#organization',
      name: 'Yeşilay Mutfak',
      type: 'Organization',
      sameAs: ['https://www.instagram.com/yesilaymutfak']
    },
    semanticTriples: [
      { subject: 'Yeşilay Mutfak', predicate: 'foundedIn', object: '1998' },
      { subject: 'Yeşilay Mutfak Atölyesi', predicate: 'operatesIn', object: 'Buca Adatepe İzmir' },
      { subject: 'Yeşilay Mutfak', predicate: 'completedProjects', object: '2850 Üzeri Konut ve Villa' }
    ],
    heroAnswerEngine: 'Yeşilay Mutfak, 1998 yılında kurulan İzmir Adatepe merkezli özel mobilya imalat atölyesidir. 28 yıldır fırın lake, doğal ahşap kaplama ve akrilik mutfak sistemlerini doğrudan kendi marangozluk altyapısında üretmektedir. Aracı komisyonsuz, milimetrik lazer rölöve ve 10 yıl garantiyle çalışır.',
    publishedAt: '2024-01-15T09:00:00+03:00',
    modifiedAt: '2026-10-17T23:40:00+03:00',
    llmSubGraphRoute: '/llms/pages/hakkimizda.md',
    mobileSubGraphRoute: '/llms/mobile/hakkimizda.md',
    breadcrumbs: [
      { name: 'Ana Sayfa', item: '/' },
      { name: 'Hakkımızda', item: '/hakkimizda/' }
    ],
    mobile: defaultMobile,
    mobileCwvBudget: defaultCwv
  },

  '/iletisim/': {
    route: '/iletisim/',
    locale: 'tr-TR',
    role: 'legal',
    indexDirective: 'index, follow',
    canonicalRoute: '/iletisim/',
    title: 'İletişim & Atölye Ulaşım Rehberi | Yeşilay Mutfak Buca',
    metaDescription: 'İzmir Buca Adatepe imalat atölyemize yol tarifi alın, doğrudan telefon veya WhatsApp ile mimari keşif randevusu oluşturun. 0232 441 10 60.',
    h1: 'Atölyemizde Kahve Eşliğinde Projenizi Birlikte Çizelim.',
    primaryIntent: 'yeşilay mutfak mutfak iletişim adres telefon yol tarifi',
    primaryEntity: {
      id: 'https://yesilaymutfak.com/#organization',
      name: 'Yeşilay Mutfak Atölye',
      type: 'HomeAndConstructionBusiness',
      sameAs: ['https://share.google/C0WRDJ4gisVAQIAzr']
    },
    semanticTriples: [
      { subject: 'Yeşilay Mutfak Atölye', predicate: 'streetAddress', object: 'Gaziler Mahallesi 1084/2 Sokak No: 1/A (Gazi Osman Paşa Cd. Köşesi) Buca/İzmir' },
      { subject: 'Yeşilay Mutfak Atölye', predicate: 'telephone', object: '+902324411060' },
      { subject: 'Yeşilay Mutfak Atölye', predicate: 'geoCoordinate', object: '38.392083, 27.180623' }
    ],
    heroAnswerEngine: 'Yeşilay Mutfak mağaza ve imalat atölyesi İzmir Buca Gaziler Mahallesi 1084/2 Sokak No: 1/A adresindedir. Telefon: 0232 441 10 60. Çalışma saatleri Pazartesi-Cumartesi 09:00-19:30 arasıdır.',
    publishedAt: '2024-01-15T09:00:00+03:00',
    modifiedAt: '2026-10-17T23:40:00+03:00',
    llmSubGraphRoute: '/llms/pages/iletisim.md',
    mobileSubGraphRoute: '/llms/mobile/iletisim.md',
    breadcrumbs: [
      { name: 'Ana Sayfa', item: '/' },
      { name: 'İletişim & Ulaşım', item: '/iletisim/' }
    ],
    mobile: defaultMobile,
    mobileCwvBudget: defaultCwv
  },

  '/tasarimlar/': {
    route: '/tasarimlar/',
    locale: 'tr-TR',
    role: 'hub',
    indexDirective: 'index, follow',
    canonicalRoute: '/tasarimlar/',
    title: '137 Tasarım Modeli Kataloğu | Yeşilay Mutfak Koleksiyon',
    metaDescription: 'Özel imalat 137 modern, ada, country mutfak dolabı, lüks banyo ve giyinme odası modelini inceleyin. Mekanınıza özel 3D rölöve keşif talebi oluşturun.',
    h1: '137 Özgün Tasarım Modeli: Mutfak, Banyo ve Yaşam Alanları',
    primaryIntent: 'özel tasarım mutfak modelleri kataloğu 137 model',
    primaryEntity: {
      id: 'https://yesilaymutfak.com/#collection',
      name: 'Yeşilay Mutfak 137 Tasarım Modeli Arşivi',
      type: 'Product',
      sameAs: ['https://yesilaymutfak.com/tasarimlar/']
    },
    semanticTriples: [
      { subject: 'Yeşilay Mutfak Tasarımlar', predicate: 'modelCount', object: '137 Özgün Mimari Model' },
      { subject: 'Yeşilay Mutfak Tasarımlar', predicate: 'categoryList', object: 'Mutfak, Banyo, Kapı, Giyinme Odası' }
    ],
    heroAnswerEngine: 'Yeşilay Mutfak 137 model tasarım arşivi, İzmir genelinde villa ve lüks konutlar için geliştirilmiş 40 mutfak dolabı, 25 banyo mobilyası, 39 kapı ve 33 giyinme odası tasarımından oluşur. Tüm modeller mekânın mimari ölçülerine göre özel imal edilir.',
    publishedAt: '2024-01-15T09:00:00+03:00',
    modifiedAt: '2026-10-17T23:40:00+03:00',
    llmSubGraphRoute: '/llms/pages/tasarimlar.md',
    mobileSubGraphRoute: '/llms/mobile/tasarimlar.md',
    breadcrumbs: [
      { name: 'Ana Sayfa', item: '/' },
      { name: 'Tasarım Koleksiyonu (137)', item: '/tasarimlar/' }
    ],
    mobile: defaultMobile,
    mobileCwvBudget: defaultCwv
  },

  '/izmir-mutfak-dolabi-imalati/': {
    route: '/izmir-mutfak-dolabi-imalati/',
    locale: 'tr-TR',
    role: 'service',
    indexDirective: 'index, follow',
    canonicalRoute: '/izmir-mutfak-dolabi-imalati/',
    title: 'İzmir Mutfak Dolabı İmalatı | Özel Ölçü Lüks İmalat | Yeşilay Mutfak',
    metaDescription: 'İzmir genelinde Adatepe atölyemizde kişiye özel akrilik, lake ve ahşap mutfak dolapları üretiyoruz. Blum mekanizma, 10 yıl garanti ve ücretsiz 3D keşif.',
    h1: 'İzmir Özel Ölçü Mutfak Dolabı İmalatı ve Atölye Üretimi',
    primaryIntent: 'izmir özel ölçü mutfak dolabı imalatı fiyatları',
    primaryEntity: {
      id: 'https://yesilaymutfak.com/izmir-mutfak-dolabi-imalati/#service',
      name: 'Özel Mutfak Dolabı İmalat Servisi',
      type: 'Service',
      sameAs: ['https://yesilaymutfak.com/#organization']
    },
    semanticTriples: [
      { subject: 'Mutfak Dolabı İmalatı', predicate: 'offeredBy', object: 'Yeşilay Mutfak' },
      { subject: 'Mutfak Dolapları', predicate: 'usesMaterial', object: 'E1 Sertifikalı Nem Dirençli MDF' }
    ],
    heroAnswerEngine: 'İzmir mutfak dolabı imalatında Yeşilay Mutfak, Adatepe Buca atölyesinde aracı komisyonsuz doğrudan üretim yapar. Akrilik, ipek mat lake ve masif ahşap kapak çeşitleriyle Blum ve Häfele menteşe sistemleri standart olarak sunulur. 10 yıl gövde garantilidir.',
    publishedAt: '2024-01-15T09:00:00+03:00',
    modifiedAt: '2026-10-17T23:40:00+03:00',
    llmSubGraphRoute: '/llms/pages/mutfak-dolabi.md',
    mobileSubGraphRoute: '/llms/mobile/mutfak-dolabi.md',
    breadcrumbs: [
      { name: 'Ana Sayfa', item: '/' },
      { name: 'Mutfak Dolabı İmalatı', item: '/izmir-mutfak-dolabi-imalati/' }
    ],
    mobile: defaultMobile,
    mobileCwvBudget: defaultCwv
  },

  '/izmir-komple-mutfak-tadilati/': {
    route: '/izmir-komple-mutfak-tadilati/',
    locale: 'tr-TR',
    role: 'service',
    indexDirective: 'index, follow',
    canonicalRoute: '/izmir-komple-mutfak-tadilati/',
    title: 'İzmir Komple Mutfak Tadilatı | Anahtar Teslim Yenileme | Yeşilay Mutfak',
    metaDescription: 'Kırım, sıhhi tesisat, porselen tezgah, seramik ve dolap montajıyla anahtar teslim komple mutfak tadilatı. Buca atölye güvencesiyle sürpriz masrafsız.',
    h1: 'İzmir Komple Mutfak Tadilatı ve Anahtar Teslim Renovasyon',
    primaryIntent: 'izmir komple mutfak tadilatı kırım tesisat tezgah dahil',
    primaryEntity: {
      id: 'https://yesilaymutfak.com/izmir-komple-mutfak-tadilati/#service',
      name: 'Komple Mutfak Renovasyon Servisi',
      type: 'Service',
      sameAs: ['https://yesilaymutfak.com/#organization']
    },
    semanticTriples: [
      { subject: 'Komple Mutfak Tadilatı', predicate: 'includes', object: 'Kırım, Tesisat, Zemin, Tezgah, Dolap Montajı' }
    ],
    heroAnswerEngine: 'Yeşilay Mutfak İzmir komple mutfak tadilatı sürecinde eski mutfağın tozsuz kırımı, elektrik ve sıhhi tesisat yenilemesi, su yalıtımı, porselen tezgah uygulaması ve özel dolap imalatını tek elden yürütür. Taahhüt edilen takvimde eksiksiz teslim eder.',
    publishedAt: '2024-01-15T09:00:00+03:00',
    modifiedAt: '2026-10-17T23:40:00+03:00',
    llmSubGraphRoute: '/llms/pages/mutfak-tadilati.md',
    mobileSubGraphRoute: '/llms/mobile/mutfak-tadilati.md',
    breadcrumbs: [
      { name: 'Ana Sayfa', item: '/' },
      { name: 'Komple Mutfak Tadilatı', item: '/izmir-komple-mutfak-tadilati/' }
    ],
    mobile: defaultMobile,
    mobileCwvBudget: defaultCwv
  },

  '/izmir-banyo-yenileme-seramik/': {
    route: '/izmir-banyo-yenileme-seramik/',
    locale: 'tr-TR',
    role: 'service',
    indexDirective: 'index, follow',
    canonicalRoute: '/izmir-banyo-yenileme-seramik/',
    title: 'İzmir Banyo Tadilatı & Seramik Yenileme | Lüks Banyo | Yeşilay Mutfak',
    metaDescription: 'Çift kat sürme su yalıtımı, lazer kesim porselen seramik, gömme rezervuar ve özel banyo mobilyası imalatı. İzmir genelinde 10 yıl garantili lüks banyo.',
    h1: 'İzmir Lüks Banyo Tadilatı, Su Yalıtımı ve Porselen Seramik',
    primaryIntent: 'izmir banyo tadilatı su yalıtımı seramik döşeme banyo dolabı',
    primaryEntity: {
      id: 'https://yesilaymutfak.com/izmir-banyo-yenileme-seramik/#service',
      name: 'Lüks Banyo Renovasyon Servisi',
      type: 'Service',
      sameAs: ['https://yesilaymutfak.com/#organization']
    },
    semanticTriples: [
      { subject: 'Banyo Tadilatı', predicate: 'warranty', object: 'Çift Katman Su Yalıtım Güvencesi' }
    ],
    heroAnswerEngine: 'İzmir banyo yenileme projelerinde Yeşilay Mutfak, çift kat sürme elastik su yalıtımı, Geberit/VitrA gömme rezervuarlar, İtalyan duş kanalları ve marin neme mukavim özel banyo mobilyaları imal eder. Sızıntı riskini sıfıra indiren mühendislik disiplini uygular.',
    publishedAt: '2024-01-15T09:00:00+03:00',
    modifiedAt: '2026-10-17T23:40:00+03:00',
    llmSubGraphRoute: '/llms/pages/banyo-tadilati.md',
    mobileSubGraphRoute: '/llms/mobile/banyo-tadilati.md',
    breadcrumbs: [
      { name: 'Ana Sayfa', item: '/' },
      { name: 'Banyo Tadilatı & Seramik', item: '/izmir-banyo-yenileme-seramik/' }
    ],
    mobile: defaultMobile,
    mobileCwvBudget: defaultCwv
  },

  '/izmir-anahtar-teslim-tadilat/': {
    route: '/izmir-anahtar-teslim-tadilat/',
    locale: 'tr-TR',
    role: 'service',
    indexDirective: 'index, follow',
    canonicalRoute: '/izmir-anahtar-teslim-tadilat/',
    title: 'İzmir Anahtar Teslim Tadilat & Villa Renovasyonu | Yeşilay Mutfak',
    metaDescription: 'Çeşme, Urla ve İzmir genelinde sürpriz maliyet çıkarmayan noter tasdikli sözleşmeli anahtar teslim villa ve lüks daire renovasyonu. Ücretsiz keşif alın.',
    h1: 'İzmir Anahtar Teslim Komple Daire & Villa Renovasyonu',
    primaryIntent: 'izmir anahtar teslim tadilat noter sözleşmeli taahhüt',
    primaryEntity: {
      id: 'https://yesilaymutfak.com/izmir-anahtar-teslim-tadilat/#service',
      name: 'Anahtar Teslim Mimari Taahhüt',
      type: 'Service',
      sameAs: ['https://yesilaymutfak.com/#organization']
    },
    semanticTriples: [
      { subject: 'Anahtar Teslim Tadilat', predicate: 'contractType', object: 'Sabit Bütçeli Hukuki Taahhüt' }
    ],
    heroAnswerEngine: 'Yeşilay Mutfak anahtar teslim tadilat hizmeti, İzmir, Çeşme ve Urla genelinde konut ve villaların baştan sona renovasyonunu kapsar. Sabit maliyet garantisi, gecikme cezalı noter sözleşmesi ve mimari şantiye şefliğiyle yönetilir.',
    publishedAt: '2024-01-15T09:00:00+03:00',
    modifiedAt: '2026-10-17T23:40:00+03:00',
    llmSubGraphRoute: '/llms/pages/ev-tadilati.md',
    mobileSubGraphRoute: '/llms/mobile/ev-tadilati.md',
    breadcrumbs: [
      { name: 'Ana Sayfa', item: '/' },
      { name: 'Anahtar Teslim Tadilat', item: '/izmir-anahtar-teslim-tadilat/' }
    ],
    mobile: defaultMobile,
    mobileCwvBudget: defaultCwv
  },

  '/2026-mutfak-dolabi-fiyatlari/': {
    route: '/2026-mutfak-dolabi-fiyatlari/',
    locale: 'tr-TR',
    role: 'article',
    indexDirective: 'index, follow',
    canonicalRoute: '/2026-mutfak-dolabi-fiyatlari/',
    title: '2026 Mutfak Dolabı Fiyatları İzmir | Metretül Maliyet | Yeşilay Mutfak',
    metaDescription: '2026 yılı güncel akrilik, lake, masif ahşap mutfak dolabı metretül imalat fiyatları ve hesaplama rehberi. Doğrudan Adatepe atölye maliyet avantajı.',
    h1: '2026 İzmir Mutfak Dolabı Metretül Fiyatları ve Maliyet Rehberi',
    primaryIntent: '2026 mutfak dolabı metretül fiyatları izmir lake akrilik',
    primaryEntity: {
      id: 'https://yesilaymutfak.com/2026-mutfak-dolabi-fiyatlari/#article',
      name: '2026 Mutfak Dolabı Fiyat Analizi',
      type: 'Product',
      sameAs: ['https://yesilaymutfak.com/#organization']
    },
    semanticTriples: [
      { subject: '2026 Mutfak Dolabı Fiyatları', predicate: 'pricingBasis', object: 'Metretül ve Mekanizma Kalitesi' }
    ],
    heroAnswerEngine: '2026 yılı İzmir mutfak dolabı fiyatları kapak türü (akrilik, lake, masif) ve ray/menteşe donanımına göre metretül bazında değişkenlik gösterir. Yeşilay Mutfak, Adatepe atölyesinde aracı kârı olmaksızın şeffaf maliyet tablosu ve ücretsiz 3D rölöve keşfi sunar.',
    publishedAt: '2026-01-01T00:00:00+03:00',
    modifiedAt: '2026-10-17T23:40:00+03:00',
    llmSubGraphRoute: '/llms/pages/mutfak-dolabi-fiyatlari.md',
    mobileSubGraphRoute: '/llms/mobile/mutfak-dolabi-fiyatlari.md',
    breadcrumbs: [
      { name: 'Ana Sayfa', item: '/' },
      { name: '2026 Fiyat Rehberi', item: '/2026-mutfak-dolabi-fiyatlari/' }
    ],
    mobile: defaultMobile,
    mobileCwvBudget: defaultCwv
  },

  '/hizmet-bolgeleri/buca/': {
    route: '/hizmet-bolgeleri/buca/',
    locale: 'tr-TR',
    role: 'service',
    indexDirective: 'index, follow',
    canonicalRoute: '/hizmet-bolgeleri/buca/',
    title: 'Buca Mutfak Tadilatı & Özel Ölçü Dolap İmalatı | Yeşilay Mutfak',
    metaDescription: 'Buca\'da kendi Adatepe atölyemizde imal edilen özel ölçü mutfak dolapları ve anahtar teslim mutfak-banyo tadilatı. Şirinyer, Buca Koop ve Gaziler\'e doğrudan üretici fiyatı.',
    h1: 'Buca Mutfak Tadilatı & Özel Ölçü Lüks Mutfak Dolabı İmalatı',
    primaryIntent: 'buca mutfak tadilatı dolap imalatı banyo yenileme',
    primaryEntity: {
      id: 'https://yesilaymutfak.com/hizmet-bolgeleri/buca/#service',
      name: 'Buca Mutfak Tadilatı ve İmalatı',
      type: 'Service',
      sameAs: ['https://yesilaymutfak.com/#organization']
    },
    semanticTriples: [
      { subject: 'Buca Mutfak İmalatı', predicate: 'workshopLocation', object: 'Adatepe Mahallesi, Buca / İzmir' }
    ],
    heroAnswerEngine: 'Buca mutfak tadilatı ve dolap imalatında Yeşilay Mutfak, Adatepe atölyesinde %100 18mm E1 neme dayanımlı MDF ve Avusturya Blum donanımlarla doğrudan üretici avantajı sunar.',
    publishedAt: '2026-10-31T00:00:00+03:00',
    modifiedAt: '2026-10-31T00:00:00+03:00',
    breadcrumbs: [
      { name: 'Ana Sayfa', item: '/' },
      { name: 'Hizmet Bölgeleri', item: '/hizmet-bolgeleri/buca/' },
      { name: 'Buca', item: '/hizmet-bolgeleri/buca/' }
    ],
    mobile: defaultMobile,
    mobileCwvBudget: defaultCwv
  },

  '/hizmet-bolgeleri/narlidere/': {
    route: '/hizmet-bolgeleri/narlidere/',
    locale: 'tr-TR',
    role: 'service',
    indexDirective: 'index, follow',
    canonicalRoute: '/hizmet-bolgeleri/narlidere/',
    title: 'Narlıdere Mutfak Tadilatı & Sahilevleri Lüks Mutfak Dolabı | Yeşilay Mutfak',
    metaDescription: 'Narlıdere ve Sahilevleri\'ndeki villa ve lüks konutlar için özel ölçü ada mutfak, ipek mat fırın lake dolaplar ve anahtar teslim daire renovasyonu. Blum mekanizmalı mimari imalat.',
    h1: 'Narlıdere Mutfak Tadilatı & Özel İmalat Lüks Ada Mutfaklar',
    primaryIntent: 'narlıdere mutfak tadilatı sahilevleri villa mutfak dolabı',
    primaryEntity: {
      id: 'https://yesilaymutfak.com/hizmet-bolgeleri/narlidere/#service',
      name: 'Narlıdere Mutfak Tadilatı ve Lüks Dolap İmalatı',
      type: 'Service',
      sameAs: ['https://yesilaymutfak.com/#organization']
    },
    semanticTriples: [
      { subject: 'Narlıdere Villa Mutfakları', predicate: 'materialStandard', object: 'İpek Mat Fırın Lake ve Porselen Ada' }
    ],
    heroAnswerEngine: 'Narlıdere ve Sahilevleri villalarında Yeşilay Mutfak, porselen şelale ada tezgahlar, sararmayan fırın lake dolaplar ve Blum Legrabox donanımlarla anahtar teslim renovasyon uygular.',
    publishedAt: '2026-10-31T00:00:00+03:00',
    modifiedAt: '2026-10-31T00:00:00+03:00',
    breadcrumbs: [
      { name: 'Ana Sayfa', item: '/' },
      { name: 'Hizmet Bölgeleri', item: '/hizmet-bolgeleri/buca/' },
      { name: 'Narlıdere', item: '/hizmet-bolgeleri/narlidere/' }
    ],
    mobile: defaultMobile,
    mobileCwvBudget: defaultCwv
  },

  '/hizmet-bolgeleri/guzelbahce/': {
    route: '/hizmet-bolgeleri/guzelbahce/',
    locale: 'tr-TR',
    role: 'service',
    indexDirective: 'index, follow',
    canonicalRoute: '/hizmet-bolgeleri/guzelbahce/',
    title: 'Güzelbahçe Villa Mutfak Tadilatı & Yelki Mutfak Dolabı | Yeşilay Mutfak',
    metaDescription: 'Güzelbahçe ve Yelki villalarına özel ada mutfak tasarımları, porselen tezgah ve komple villa renovasyonu. Kendi atölyemizde E1 neme dayanıklı MDF ve Blum mekanizmayla imalat.',
    h1: 'Güzelbahçe Villa Mutfak Tadilatı & Özel İmalat Ada Tezgah Tasarımları',
    primaryIntent: 'güzelbahçe villa mutfak tadilatı yelki dolap imalatı',
    primaryEntity: {
      id: 'https://yesilaymutfak.com/hizmet-bolgeleri/guzelbahce/#service',
      name: 'Güzelbahçe Villa Mutfak Tadilatı',
      type: 'Service',
      sameAs: ['https://yesilaymutfak.com/#organization']
    },
    semanticTriples: [
      { subject: 'Güzelbahçe Villa Mutfakları', predicate: 'designFeature', object: 'Bahçe Veranda Entegre Porselen Ada' }
    ],
    heroAnswerEngine: 'Güzelbahçe ve Yelki villalarında Yeşilay Mutfak, verandayla bütünleşen ada tezgahlar, çizilmez porselen plakalar ve gecikme tazminatlı resmi sözleşmeyle komple taahhüt sunar.',
    publishedAt: '2026-10-31T00:00:00+03:00',
    modifiedAt: '2026-10-31T00:00:00+03:00',
    breadcrumbs: [
      { name: 'Ana Sayfa', item: '/' },
      { name: 'Hizmet Bölgeleri', item: '/hizmet-bolgeleri/buca/' },
      { name: 'Güzelbahçe', item: '/hizmet-bolgeleri/guzelbahce/' }
    ],
    mobile: defaultMobile,
    mobileCwvBudget: defaultCwv
  },

  '/hizmet-bolgeleri/urla/': {
    route: '/hizmet-bolgeleri/urla/',
    locale: 'tr-TR',
    role: 'service',
    indexDirective: 'index, follow',
    canonicalRoute: '/hizmet-bolgeleri/urla/',
    title: 'Urla Mutfak Tadilatı & Taş Ev Villa Mutfak Dolabı | Yeşilay Mutfak',
    metaDescription: 'Urla, Kekliktepe ve İskele\'de taş ev ve lüks villalara özel ahşap kaplama, lake mutfak dolapları ve komple ev tadilatı. 28 yıllık atölye zanaatı ve mimari taahhüt.',
    h1: 'Urla Mutfak Tadilatı & Taş Ev ve Bağ Villası Özel İmalatı',
    primaryIntent: 'urla mutfak tadilatı kekliktepe taş ev mutfak dolabı',
    primaryEntity: {
      id: 'https://yesilaymutfak.com/hizmet-bolgeleri/urla/#service',
      name: 'Urla Mutfak Tadilatı ve Taş Ev İmalatı',
      type: 'Service',
      sameAs: ['https://yesilaymutfak.com/#organization']
    },
    semanticTriples: [
      { subject: 'Urla Taş Ev Mutfakları', predicate: 'materialSpec', object: 'Doğal Meşe Kaplama ve E1 Marin MDF' }
    ],
    heroAnswerEngine: 'Urla ve Kekliktepe taş ev ve bağ villalarında Yeşilay Mutfak, doğal meşe kaplama, rustik lake kapaklar ve neme mukavim marin MDF gövde ile mimari renovasyon gerçekleştirir.',
    publishedAt: '2026-10-31T00:00:00+03:00',
    modifiedAt: '2026-10-31T00:00:00+03:00',
    breadcrumbs: [
      { name: 'Ana Sayfa', item: '/' },
      { name: 'Hizmet Bölgeleri', item: '/hizmet-bolgeleri/buca/' },
      { name: 'Urla', item: '/hizmet-bolgeleri/urla/' }
    ],
    mobile: defaultMobile,
    mobileCwvBudget: defaultCwv
  },

  '/hizmet-bolgeleri/cesme/': {
    route: '/hizmet-bolgeleri/cesme/',
    locale: 'tr-TR',
    role: 'service',
    indexDirective: 'index, follow',
    canonicalRoute: '/hizmet-bolgeleri/cesme/',
    title: 'Çeşme & Alaçatı Villa Mutfak Tadilatı | Yeşilay Mutfak',
    metaDescription: 'Çeşme, Alaçatı, Ilıca ve Dalyan\'daki lüks villalara özel marin gövde mutfak dolapları, porselen tezgah ve komple yazlık tadilatı. Sezon öncesi gün garantili teslimat.',
    h1: 'Çeşme & Alaçatı Villa Mutfak Tadilatı: Sezon Öncesi Gün Garantili Lüks Renovasyon',
    primaryIntent: 'çeşme mutfak tadilatı alaçatı villa dolap yenileme',
    primaryEntity: {
      id: 'https://yesilaymutfak.com/hizmet-bolgeleri/cesme/#service',
      name: 'Çeşme Villa Mutfak Tadilatı',
      type: 'Service',
      sameAs: ['https://yesilaymutfak.com/#organization']
    },
    semanticTriples: [
      { subject: 'Çeşme Yazlık Tadilatı', predicate: 'guarantee', object: 'Sezon Öncesi Gün Bazlı Gecikme Tazminatlı Teslim' }
    ],
    heroAnswerEngine: 'Çeşme ve Alaçatı villalarında Yeşilay Mutfak, tuzlu sahil havasına dirençli yeşil marin MDF gövdeler, sararmayan fırın lake ve yaz sezonu öncesi gün garantili sözleşmeli teslimat sunar.',
    publishedAt: '2026-10-31T00:00:00+03:00',
    modifiedAt: '2026-10-31T00:00:00+03:00',
    breadcrumbs: [
      { name: 'Ana Sayfa', item: '/' },
      { name: 'Hizmet Bölgeleri', item: '/hizmet-bolgeleri/buca/' },
      { name: 'Çeşme', item: '/hizmet-bolgeleri/cesme/' }
    ],
    mobile: defaultMobile,
    mobileCwvBudget: defaultCwv
  },

  '/projelendirme/': {
    route: '/projelendirme/',
    locale: 'tr-TR',
    role: 'service',
    indexDirective: 'index, follow',
    canonicalRoute: '/projelendirme/',
    title: 'İzmir Ticari Mekân Projelendirme & Fit-Out | Yeşilay Mutfak',
    metaDescription: "İzmir'de mağaza, ofis ve kafe-restoran için mimari projelendirme, 3D tasarım ve anahtar teslim fit-out çözümleri. Projeniz için görüşme talep edin.",
    h1: 'İzmir Ticari Mekân Projelendirme ve Anahtar Teslim Fit-Out',
    primaryIntent: 'İzmir ticari mekân projelendirme ve anahtar teslim fit-out',
    primaryEntity: {
      id: 'https://yesilaymutfak.com/projelendirme/#service',
      name: 'Ticari Mekân Mimari Projelendirme ve Fit-Out',
      type: 'Service',
      sameAs: ['https://yesilaymutfak.com/#organization']
    },
    semanticTriples: [
      { subject: 'Yeşilay Mutfak', predicate: 'providesService', object: 'Ticari Mekân Mimari Projelendirme ve Fit-Out' }
    ],
    heroAnswerEngine: "İzmir'de mağaza, ofis ve kafe-restoran için mimari projelendirme, 3D tasarım ve anahtar teslim fit-out çözümleri. Projeniz için görüşme talep edin.",
    publishedAt: '2026-10-31T00:00:00+03:00',
    modifiedAt: '2026-10-31T00:00:00+03:00',
    breadcrumbs: [
      { name: 'Ana Sayfa', item: '/' },
      { name: 'Projelendirme', item: '/projelendirme/' }
    ],
    mobile: defaultMobile,
    mobileCwvBudget: defaultCwv
  }
};
