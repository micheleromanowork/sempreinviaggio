import type { Metadata } from 'next'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://sempreinviaggio.info'
const SITE_NAME = 'Sempre in Viaggio'

export function buildMetadata(opts: {
  title?: string
  description?: string
  canonical?: string
  ogImage?: string
  ogType?: 'website' | 'article'
  noIndex?: boolean
}): Metadata {
  const title = opts.title
    ? `${opts.title} — ${SITE_NAME}`
    : `${SITE_NAME} — Blog di viaggio`
  const description = opts.description ?? 'Il blog di viaggio di Michele Romano: destinazioni, itinerari, cicloviaggI e consigli per viaggiare meglio.'
  const canonical = opts.canonical ? `${SITE_URL}${opts.canonical}` : SITE_URL
  const ogImage = opts.ogImage ?? `${SITE_URL}/og-default.jpg`

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: SITE_NAME,
      type: opts.ogType ?? 'website',
      images: [{ url: ogImage, width: 1200, height: 630 }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage],
    },
    robots: opts.noIndex ? { index: false, follow: false } : { index: true, follow: true },
  }
}

export function getSchemaWebsite() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: SITE_URL,
    description: 'Blog di viaggio italiano',
    potentialAction: {
      '@type': 'SearchAction',
      target: `${SITE_URL}/articoli?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  }
}

export function getSchemaOrganization() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_NAME,
    url: SITE_URL,
  }
}

export function getSchemaArticle(opts: {
  title: string
  description?: string
  url: string
  image?: string
  authorName: string
  publishedAt: Date
  updatedAt: Date
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: opts.title,
    description: opts.description,
    url: opts.url,
    image: opts.image,
    author: { '@type': 'Person', name: opts.authorName },
    datePublished: opts.publishedAt.toISOString(),
    dateModified: opts.updatedAt.toISOString(),
    publisher: { '@type': 'Organization', name: SITE_NAME, url: SITE_URL },
  }
}

export function getSchemaBreadcrumb(items: Array<{ name: string; url: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  }
}

export { SITE_URL, SITE_NAME }
