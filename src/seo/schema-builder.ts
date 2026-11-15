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

  const graph: Record<string, unknown>[] = [organizationNode, websiteNode];

  // 3. BreadcrumbList (Her alt sayfada eksiksiz mutlak HTTPS item ile)
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

  // 4. Sayfa Rolüne Göre Ana Şema (Home / Contact / CollectionPage+ItemList / ItemPage+Service / Article)
  if (page.role === 'home') {
    graph.push({
      '@type': 'WebPage',
      '@id': `${pageUrl}#webpage`,
      url: pageUrl,
      name: page.title,
      description: page.metaDescription,
      isPartOf: { '@id': `${origin}/#website` },
      about: { '@id': `${origin}/#organization` },
      primaryImageOfPage: {
        '@type': 'ImageObject',
        url: pageImage
      },
      datePublished: page.publishedAt,
      dateModified: page.modifiedAt,
      inLanguage: 'tr-TR'
    });
  } else if (page.role === 'contact') {
    graph.push({
      '@type': 'ContactPage',
      '@id': `${pageUrl}#webpage`,
      url: pageUrl,
      name: page.title,
      description: page.metaDescription,
      isPartOf: { '@id': `${origin}/#website` },
      mainEntity: { '@id': `${origin}/#organization` },
      breadcrumb: { '@id': `${pageUrl}#breadcrumb` },
      primaryImageOfPage: {
        '@type': 'ImageObject',
        url: pageImage
      },
      inLanguage: 'tr-TR'
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
      '@id': `${pageUrl}#webpage`,
      url: pageUrl,
      name: page.title,
      description: page.metaDescription,
      isPartOf: { '@id': `${origin}/#website` },
      breadcrumb: { '@id': `${pageUrl}#breadcrumb` },
      primaryImageOfPage: {
        '@type': 'ImageObject',
        url: pageImage
      },
      mainEntity: { '@id': `${pageUrl}#itemlist` },
      datePublished: page.publishedAt,
      dateModified: page.modifiedAt,
      inLanguage: 'tr-TR'
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
      name: page.serviceType || page.title.split('|')[0].trim(),
      serviceType: page.serviceType || page.title.split('|')[0].trim(),
      description: page.metaDescription,
      provider: { '@id': `${origin}/#organization` },
      areaServed: resolvedArea,
      image: pageImage
    };

    graph.push({
      '@type': 'ItemPage',
      '@id': `${pageUrl}#webpage`,
      url: pageUrl,
      name: page.title,
      description: page.metaDescription,
      isPartOf: { '@id': `${origin}/#website` },
      breadcrumb: { '@id': `${pageUrl}#breadcrumb` },
      primaryImageOfPage: {
        '@type': 'ImageObject',
        url: pageImage
      },
      mainEntity: { '@id': `${pageUrl}#service` },
      datePublished: page.publishedAt,
      dateModified: page.modifiedAt,
      inLanguage: 'tr-TR'
    });
    graph.push(serviceNode);
  } else if (page.role === 'article') {
    graph.push({
      '@type': 'WebPage',
      '@id': `${pageUrl}#webpage`,
      url: pageUrl,
      name: page.title,
      description: page.metaDescription,
      isPartOf: { '@id': `${origin}/#website` },
      breadcrumb: { '@id': `${pageUrl}#breadcrumb` },
      primaryImageOfPage: {
        '@type': 'ImageObject',
        url: pageImage
      },
      datePublished: page.publishedAt,
      dateModified: page.modifiedAt,
      inLanguage: 'tr-TR'
    });

    graph.push({
      '@type': 'Article',
      '@id': `${pageUrl}#article`,
      headline: page.title.split('|')[0].trim(),
      description: page.metaDescription,
      image: [pageImage],
      datePublished: page.publishedAt,
      dateModified: page.modifiedAt,
      author: { '@id': `${origin}/#organization` },
      publisher: { '@id': `${origin}/#organization` },
      mainEntityOfPage: { '@id': `${pageUrl}#webpage` },
      inLanguage: 'tr-TR'
    });
  }

  // 5. Görünür FAQPage (Yalnızca sayfada görünür soru-cevap metni bulunduğunda)
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
