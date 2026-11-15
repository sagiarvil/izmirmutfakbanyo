export interface ServiceItem {
  id: string;
  slug: string;
  title: string;
  navTitle: string;
  description: string;
  shortDesc: string;
  keywords: string[];
  features: string[];
}

export const siteConfig = {
  name: "Yeşilay Mutfak",
  brandShort: "Yeşilay Mutfak",
  legalName: "Yeşilay Mutfak & İç Mekân Tasarımı İmalat Atölyesi",
  foundingYear: 1998,
  experienceYears: 28,
  customerCount: "2.850+",
  domain: "yesilaymutfak.com",
  siteUrl: "https://yesilaymutfak.com",
  phoneRaw: "902324411060",
  phoneE164: "+902324411060",
  phoneFormatted: "0232 441 10 60",
  email: "yesilaymutfak@gmail.com",
  whatsappUrl: "https://wa.me/905324261788",
  googleMapsUrl: "https://share.google/C0WRDJ4gisVAQIAzr",
  isWomenOwned: true,
  address: {
    streetAddress: "Gaziler Mahallesi 1084/2 Sokak No: 1/A (Gazi Osman Paşa Cd. Köşesi)",
    addressLocality: "Buca",
    addressRegion: "İzmir",
    addressCountry: "TR",
    postalCode: "35380"
  },
  geo: {
    latitude: "38.392083",
    longitude: "27.180623"
  },
  openingHours: "Mo-Sa 09:00-19:30",
  socials: {
    instagram: "https://www.instagram.com/yesilaymutfak",
    facebook: "https://www.instagram.com/yesilaymutfak"
  },
  districts: [
    "Buca", "Karşıyaka", "Bostanlı", "Mavişehir", "Alsancak", "Bornova",
    "Çeşme", "Urla", "Güzelbahçe", "Narlıdere", "Balçova", "Bayraklı",
    "Konak", "Gaziemir", "Çiğli", "Seferihisar", "Foça", "Karabağlar", "Bodrum", "Kuşadası", "Manisa", "Ayvalık"
  ],
  services: [
    {
      id: "mutfak-dolabi",
      slug: "izmir-mutfak-dolabi-imalati",
      title: "Özel Ölçü Lüks Mutfak Dolabı & Mimari İmalat",
      navTitle: "Mutfak Dolabı",
      description: "Doğrudan Adatepe atölyemizde kişiye ve mekâna özel projelendirilen akrilik, ipek mat fırın lake ve doğal meşe kaplamalı mutfak dolapları. Blum ve Häfele frenli gizli mekanizmalar.",
      shortDesc: "Özel üretim lake, akrilik ve masif ahşap mutfak dolap sistemleri.",
      keywords: ["yeşilay mutfak", "buca mutfak dolabı imalatı", "lake mutfak dolabı izmir", "akrilik mutfak", "modern mutfak tasarımı"],
      features: ["%100 E1 Sertifikalı Neme Dayanımlı MDF-Lam Gövde", "Blum Entegre Sessiz Frenli Menteşe ve Ray Sistemleri", "Fotogerçekçi 3D İç Mimari Rölöve ve Modelleme", "10 Yıl Bütünleşik Atölye İmalat Garantisi"]
    },
    {
      id: "mutfak-tadilati",
      slug: "izmir-komple-mutfak-tadilati",
      title: "Komple Mutfak Renovasyonu & Mimari Dönüşüm",
      navTitle: "Mutfak Renovasyonu",
      description: "Eski mutfağınızın kırım, sıhhi tesisat ve elektrik altyapısı, porselen tezgah, zemin seramiği ve mimari aydınlatması dahil sıfırdan lüks dönüşümü.",
      shortDesc: "Kırım, altyapı, tezgah ve dolap montajıyla anahtar teslim mutfak.",
      keywords: ["komple mutfak tadilatı", "mutfak yenileme izmir", "porselen mutfak tezgahı", "çimstone tezgah"],
      features: ["Tozsuz Kırım ve Moloz Tahliyesi", "Tesisat ve Kablolama Yenileme", "Porselen ve Kuvars Kompakt Mutfak Tezgahı", "Taahhüt Edilen Günde Eksiksiz Teslim"]
    },
    {
      id: "banyo-tadilati",
      slug: "izmir-banyo-yenileme-seramik",
      title: "Lüks Banyo Tasarımı, Islak Hacim İzolasyonu & Seramik",
      navTitle: "Banyo Yenileme",
      description: "Çift katman elastik su yalıtımı garantili, 60x120 ve 120x240 büyük ebatlı porselen seramik döşeme, gömme armatürler ve özel üretim marin banyo mobilyaları.",
      shortDesc: "İtalyan duş kanalı, su yalıtımı ve lüks seramik banyo dönüşümü.",
      keywords: ["banyo tadilatı izmir", "lüks banyo yenileme", "su yalıtımlı banyo", "banyo dolabı imalatı buca"],
      features: ["Çift Kat Sürme Membran Yalıtım Güvencesi", "Geberit ve VitrA Gizli Rezervuar Sistemleri", "Lazer Kesim Rektifiyeli Porselen Seramik", "Neme Mukavim Marin Gövde Banyo Mobilyası"]
    },
    {
      id: "anahtar-teslim-tadilat",
      slug: "izmir-anahtar-teslim-tadilat",
      title: "Anahtar Teslim Mimari Taahhüt & Villa Renovasyonu",
      navTitle: "Anahtar Teslim",
      description: "Buca, Çeşme, Urla ve İzmir genelinde villa ve lüks konutlar için sürpriz bütçe çıkarmayan, sözleşmeli anahtar teslim mimari renovasyon.",
      shortDesc: "Zaman ve bütçe garantili anahtar teslim prestijli mimari uygulama.",
      keywords: ["anahtar teslim tadilat izmir", "çeşme villa tadilatı", "urla taş ev renovasyonu", "lüks mimari taahhüt"],
      features: ["Sabit Maliyet & Fiyat Artış Muafiyeti Garantisi", "Gecikme Cezalı Hukuki Sözleşme", "Özel Detay İmalat & Şantiye Şefliği", "10 Yıl Bütünleşik Garanti"]
    }
  ]
};
