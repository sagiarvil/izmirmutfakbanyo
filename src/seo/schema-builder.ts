import type { SeoPageRecord, CatalogItemInput, FaqInput } from './registry.types';
import { siteConfig } from '../data/siteConfig';

function ensureAbsoluteHttps(pathOrUrl: string, origin: string): string {
  if (pathOrUrl.startsWith('https://')) return pathOrUrl;
  if (pathOrUrl.startsWith('http://')) return pathOrUrl.replace(/^http:\/\//, 'https://');
  return `${origin}${pathOrUrl.startsWith('/') ? pathOrUrl : '/' + pathOrUrl}`;
}

export interface BuildGraphOptions {
  readonly faqList?: readonly FaqInput[];
  readonly catalogItemsOverride?: readonly CatalogItemInput[];
}

export function buildCompleteJsonLdGraph(
  page: SeoPageRecord,
  domain: string = 'yesilaymutfak.com',
  options: BuildGraphOptions = {}
): string {
  const origin = `https://${domain}`;
  const pageUrl = page.route === '/' ? `${origin}/` : `${origin}${page.route}`;
  const pageImage = ensureAbsoluteHttps(page.image, origin);
  const datePublished = (page.publishedAt || '2024-01-15').slice(0, 10);
  const dateModified = '2026-11-26';
  const cleanPageName = page.title.split('|')[0].trim();

  const areaServedDefault = [
    { '@type': 'City', name: 'İzmir' },
    { '@type': 'AdministrativeArea', name: 'Buca' },
    { '@type': 'AdministrativeArea', name: 'Narlıdere' },
    { '@type': 'AdministrativeArea', name: 'Güzelbahçe' },
    { '@type': 'AdministrativeArea', name: 'Urla' },
    { '@type': 'AdministrativeArea', name: 'Çeşme' },
    { '@type': 'AdministrativeArea', name: 'Karşıyaka' },
    { '@type': 'AdministrativeArea', name: 'Bornova' }
  ];

  // 1. Organization + LocalBusiness (HomeAndConstructionBusiness & FurnitureStore)
  const organizationNode: Record<string, unknown> = {
    '@type': ['HomeAndConstructionBusiness', 'FurnitureStore'],
    '@id': `${origin}/#organization`,
    name: siteConfig.name,
    legalName: siteConfig.legalName,
    url: `${origin}/`,
    logo: {
      '@type': 'ImageObject',
      '@id': `${origin}/#logo`,
      url: `${origin}/yesilay-mutfak-logo.png`,
      width: 983,
      height: 341,
      caption: 'Yeşilay Mutfak Logo'
    },
    image: `${origin}/media/real/yesilay-showroom-gece-cephe.webp`,
    telephone: siteConfig.phoneE164,
    email: siteConfig.email,
    priceRange: '₺₺ - ₺₺₺₺',
    currenciesAccepted: 'TRY',
    paymentAccepted: 'Nakit, Banka Havalesi, Kredi Kartı',
    foundingDate: '1998',
    description:
      '1998 yılından bu yana İzmir Buca Adatepe imalat atölyesinde %100 18 mm E1 sertifikalı neme dayanımlı MDF-Lam gövde ve Avusturya Blum mekanizmalarla özel ölçü mutfak dolabı, banyo mobilyası ve anahtar teslim konut/villa tadilatı yapan doğrudan üretici mimarlık kuruluşu.',
    address: {
      '@type': 'PostalAddress',
      streetAddress: siteConfig.address.streetAddress,
      addressLocality: siteConfig.address.addressLocality,
      addressRegion: siteConfig.address.addressRegion,
      postalCode: siteConfig.address.postalCode,
      addressCountry: siteConfig.address.addressCountry
    },
    hasMap: siteConfig.googleMapsUrl,
    geo: {
      '@type': 'GeoCoordinates',
      latitude: Number(siteConfig.geo.latitude),
      longitude: Number(siteConfig.geo.longitude)
    },
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
        opens: '09:00',
        closes: '19:30'
      }
    ],
    areaServed: areaServedDefault,
    sameAs: [siteConfig.socials.instagram, siteConfig.googleMapsUrl]
  };

  // 2. WebSite
  const websiteNode: Record<string, unknown> = {
    '@type': 'WebSite',
    '@id': `${origin}/#website`,
    url: `${origin}/`,
    name: siteConfig.name,
    publisher: { '@id': `${origin}/#organization` },
    inLanguage: 'tr-TR'
  };

  // 3. Primary ImageObject (Google Lens & License Metadata)
  const primaryImageNode: Record<string, unknown> = {
    '@type': 'ImageObject',
    '@id': `${pageUrl}#primaryimage`,
    url: pageImage,
    contentUrl: pageImage,
    width: 1200,
    height: 630,
    creator: { '@id': `${origin}/#organization` },
    creditText: siteConfig.name,
    copyrightNotice: `© 2026 ${siteConfig.legalName}`,
    acquireLicensePage: `${origin}/iletisim/`
  };

  // 4. Author Person (E-E-A-T)
  const authorNode: Record<string, unknown> = {
    '@type': 'Person',
    '@id': `${origin}/#author`,
    name: 'Cem Yeşilay',
    jobTitle: 'Kurucu Ortak & Üretim Direktörü',
    knowsAbout: [
      'Özel Ölçü Mutfak Dolabı İmalatı',
      'Komple Mutfak ve Banyo Tadilatı',
      '3D İç Mimari Projelendirme',
      'Anahtar Teslim Villa Renovasyonu'
    ],
    url: `${origin}/hakkimizda/`,
    sameAs: [siteConfig.socials.instagram]
  };

  // 5. Dataset (Veri Arama Mıknatısı)
  const datasetNode: Record<string, unknown> = {
    '@type': 'Dataset',
    '@id': `${pageUrl}#dataset`,
    name: `${cleanPageName} Teknik Spesifikasyon ve Karşılaştırma Veri Kümesi`,
    description: `${cleanPageName} sayfasındaki malzeme standartları, teknik toleranslar, garanti süreleri ve uygulama parametrelerini içeren doğrulanmış atölye veri kümesi.`,
    creator: { '@id': `${origin}/#organization` },
    license: 'https://creativecommons.org/licenses/by/4.0/'
  };

  const graph: Record<string, unknown>[] = [
    organizationNode,
    websiteNode,
    primaryImageNode,
    authorNode,
    datasetNode
  ];

  // 6. BreadcrumbList (Her alt sayfada eksiksiz mutlak HTTPS item ile)
  if (page.route !== '/' && page.breadcrumbs.length > 0) {
    graph.push({
      '@type': 'BreadcrumbList',
      '@id': `${pageUrl}#breadcrumb`,
      itemListElement: page.breadcrumbs.map((b, idx) => ({
        '@type': 'ListItem',
        position: idx + 1,
        name: b.name,
        item: ensureAbsoluteHttps(b.item, origin)
      }))
    });
  }

  const catalogItems = options.catalogItemsOverride?.length
    ? options.catalogItemsOverride
    : page.catalogItems || [];

  const commonWebPageFields = {
    '@id': `${pageUrl}#webpage`,
    url: pageUrl,
    name: page.title,
    description: page.metaDescription,
    isPartOf: { '@id': `${origin}/#website` },
    primaryImageOfPage: { '@id': `${pageUrl}#primaryimage` },
    author: { '@id': `${origin}/#author` },
    about: { '@type': 'Thing', name: page.serviceType || cleanPageName },
    mentions: [
      { '@type': 'Thing', name: 'E1 Sertifikalı Neme Dayanımlı MDF-Lam' },
      { '@type': 'Thing', name: 'Blum Sessiz Frenli Menteşe ve Ray Sistemleri' },
      { '@type': 'Thing', name: '3D Lazer Rölöve ve İç Mimari Projelendirme' }
    ],
    datePublished,
    dateModified,
    inLanguage: 'tr-TR'
  };

  // 7. Sayfa Rolüne Göre Ana Şema
  if (page.role === 'home') {
    graph.push({
      '@type': 'WebPage',
      ...commonWebPageFields
    });
  } else if (page.role === 'contact') {
    graph.push({
      '@type': 'ContactPage',
      ...commonWebPageFields,
      mainEntity: { '@id': `${origin}/#organization` },
      breadcrumb: { '@id': `${pageUrl}#breadcrumb` }
    });
  } else if (page.role === 'collection') {
    const itemListNode: Record<string, unknown> = {
      '@type': 'ItemList',
      '@id': `${pageUrl}#itemlist`,
      name: page.title,
      numberOfItems: catalogItems.length,
      itemListElement: catalogItems.map((item, idx) => ({
        '@type': 'ListItem',
        position: idx + 1,
        name: item.name,
        url: ensureAbsoluteHttps(item.url, origin),
        image: ensureAbsoluteHttps(item.image, origin)
      }))
    };

    graph.push({
      '@type': 'CollectionPage',
      ...commonWebPageFields,
      breadcrumb: { '@id': `${pageUrl}#breadcrumb` },
      mainEntity: { '@id': `${pageUrl}#itemlist` }
    });
    graph.push(itemListNode);
  } else if (page.role === 'service') {
    const resolvedArea =
      typeof page.areaServed === 'string'
        ? { '@type': 'AdministrativeArea', name: page.areaServed }
        : Array.isArray(page.areaServed)
          ? page.areaServed.map(a => ({ '@type': 'AdministrativeArea', name: a }))
          : areaServedDefault;

    const serviceNode: Record<string, unknown> = {
      '@type': 'Service',
      '@id': `${pageUrl}#service`,
      name: page.serviceType || cleanPageName,
      serviceType: page.serviceType || cleanPageName,
      description: page.metaDescription,
      provider: { '@id': `${origin}/#organization` },
      areaServed: resolvedArea,
      image: pageImage
    };

    graph.push({
      '@type': 'ItemPage',
      ...commonWebPageFields,
      breadcrumb: { '@id': `${pageUrl}#breadcrumb` },
      mainEntity: { '@id': `${pageUrl}#service` }
    });
    graph.push(serviceNode);
  } else if (page.role === 'article') {
    graph.push({
      '@type': 'WebPage',
      ...commonWebPageFields,
      breadcrumb: { '@id': `${pageUrl}#breadcrumb` }
    });

    graph.push({
      '@type': 'Article',
      '@id': `${pageUrl}#article`,
      headline: cleanPageName,
      description: page.metaDescription,
      image: [pageImage],
      datePublished,
      dateModified,
      author: { '@id': `${origin}/#author` },
      publisher: { '@id': `${origin}/#organization` },
      mainEntityOfPage: { '@id': `${pageUrl}#webpage` },
      inLanguage: 'tr-TR'
    });
  }

  // 8. Görünür FAQPage
  const faqList = options.faqList || [];
  if (faqList.length > 0) {
    graph.push({
      '@type': 'FAQPage',
      '@id': `${pageUrl}#faq`,
      mainEntity: faqList.map(item => ({
        '@type': 'Question',
        name: item.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: item.answer
        }
      }))
    });
  }

  return JSON.stringify({ '@context': 'https://schema.org', '@graph': graph });
}
