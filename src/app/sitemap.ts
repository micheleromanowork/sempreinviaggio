import { MetadataRoute } from 'next'
import { db } from '@/lib/db'
import { articles, destinations } from '@/lib/db/schema'
import { eq, desc } from 'drizzle-orm'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://sempreinviaggio.info'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = [
    { url: SITE_URL, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: `${SITE_URL}/articoli`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${SITE_URL}/destinazioni`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${SITE_URL}/chi-siamo`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
  ]

  let articlePages: MetadataRoute.Sitemap = []
  let destPages: MetadataRoute.Sitemap = []

  try {
    const arts = await db
      .select({ slug: articles.slug, updatedAt: articles.updatedAt })
      .from(articles)
      .where(eq(articles.status, 'published'))
      .orderBy(desc(articles.publishedAt))

    articlePages = arts.map(a => ({
      url: `${SITE_URL}/articoli/${a.slug}`,
      lastModified: a.updatedAt ?? new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }))

    const dests = await db.select({ slug: destinations.slug }).from(destinations)
    destPages = dests.map(d => ({
      url: `${SITE_URL}/destinazioni/${d.slug}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    }))
  } catch {}

  return [...staticPages, ...articlePages, ...destPages]
}
