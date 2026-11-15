export type PageSchemaRole = 'home' | 'contact' | 'collection' | 'service' | 'article' | 'noindex';

export interface CatalogItemInput {
  readonly name: string;
  readonly url: string;
  readonly image: string;
  readonly description?: string;
}

export interface BreadcrumbInput {
  readonly name: string;
  readonly item: string;
}

export interface FaqInput {
  readonly question: string;
  readonly answer: string;
}

export interface SeoPageRecord {
  readonly route: string;
  readonly role: PageSchemaRole;
  readonly title: string;
  readonly metaDescription: string;
  readonly image: string;
  readonly serviceType?: string;
  readonly areaServed?: string | readonly string[];
  readonly publishedAt: string;
  readonly modifiedAt: string;
  readonly breadcrumbs: readonly BreadcrumbInput[];
  readonly catalogItems?: readonly CatalogItemInput[];
}
