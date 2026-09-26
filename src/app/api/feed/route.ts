import { db } from '@/lib/db'
import { articles, categories, users } from '@/lib/db/schema'
import { eq, desc } from 'drizzle-orm'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://sempreinviaggio.info'
const SITE_NAME = 'Sempre in Viaggio'

function escapeXml(str: string) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

export async function GET() {
  let rows: {
    title: string; slug: string; excerpt: string | null
    publishedAt: Date | null; updatedAt: Date; categoryName: string | null; authorName: string | null
  }[] = []

  try {
    rows = await db
      .select({
        title: articles.title,
        slug: articles.slug,
        excerpt: articles.excerpt,
        publishedAt: articles.publishedAt,
        updatedAt: articles.updatedAt,
        categoryName: categories.name,
        authorName: users.name,
      })
      .from(articles)
      .leftJoin(categories, eq(articles.categoryId, categories.id))
      .leftJoin(users, eq(articles.authorId, users.id))
      .where(eq(articles.status, 'published'))
      .orderBy(desc(articles.publishedAt))
      .limit(20)
  } catch {}

  const lastBuildDate = rows[0]?.updatedAt ?? new Date()

  const items = rows.map(a => `
  <item>
    <title>${escapeXml(a.title)}</title>
    <link>${SITE_URL}/articoli/${escapeXml(a.slug)}</link>
    <guid isPermaLink="true">${SITE_URL}/articoli/${escapeXml(a.slug)}</guid>
    ${a.excerpt ? `<description>${escapeXml(a.excerpt)}</description>` : ''}
    ${a.publishedAt ? `<pubDate>${new Date(a.publishedAt).toUTCString()}</pubDate>` : ''}
    ${a.categoryName ? `<category>${escapeXml(a.categoryName)}</category>` : ''}
    ${a.authorName ? `<author>${escapeXml(a.authorName)}</author>` : ''}
  </item>`).join('\n')

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(SITE_NAME)}</title>
    <link>${SITE_URL}</link>
    <description>Il blog di viaggio di Michele Romano: destinazioni, itinerari, cicloviaggi e consigli per viaggiare meglio.</description>
    <language>it</language>
    <lastBuildDate>${new Date(lastBuildDate).toUTCString()}</lastBuildDate>
    <atom:link href="${SITE_URL}/api/feed" rel="self" type="application/rss+xml" />
    ${items}
  </channel>
</rss>`

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  })
}
