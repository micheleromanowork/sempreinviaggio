import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/session'
import { db } from '@/lib/db'
import { articles, articleTags } from '@/lib/db/schema'
import { makeSlug } from '@/lib/slug'
import { eq } from 'drizzle-orm'

export async function GET() {
  try {
    await requireAuth()
  } catch {
    return NextResponse.json({ error: 'Non autorizzato.' }, { status: 401 })
  }

  const rows = await db.select().from(articles).orderBy(articles.createdAt)
  return NextResponse.json(rows)
}

export async function POST(req: NextRequest) {
  let session: Awaited<ReturnType<typeof requireAuth>>
  try {
    session = await requireAuth()
  } catch {
    return NextResponse.json({ error: 'Non autorizzato.' }, { status: 401 })
  }

  const body = await req.json()
  const now = new Date()

  const slug = body.slug || makeSlug(body.title || '')
  if (!slug) return NextResponse.json({ error: 'Titolo obbligatorio.' }, { status: 400 })

  // Handle publication status
  let publishedAt: Date | null = null
  let scheduledAt: Date | null = null
  if (body.status === 'published') publishedAt = body.publishedAt ? new Date(body.publishedAt) : now
  if (body.status === 'scheduled') scheduledAt = body.scheduledAt ? new Date(body.scheduledAt) : null

  const [article] = await db.insert(articles).values({
    title: body.title,
    slug,
    excerpt: body.excerpt || null,
    content: body.content || '',
    coverImage: body.coverImage || null,
    status: body.status || 'draft',
    publishedAt,
    scheduledAt,
    categoryId: body.categoryId || null,
    destinationId: body.destinationId || null,
    authorId: session.userId!,
    articleType: body.articleType || 'guida',
    seoTitle: body.seoTitle || null,
    metaDescription: body.metaDescription || null,
    ogTitle: body.ogTitle || null,
    ogDescription: body.ogDescription || null,
    ogImage: body.ogImage || null,
    canonicalUrl: body.canonicalUrl || null,
    featured: body.featured ?? false,
    createdAt: now,
    updatedAt: now,
  }).returning()

  // Insert tags
  if (body.tagIds?.length) {
    await db.insert(articleTags).values(
      body.tagIds.map((tagId: number) => ({ articleId: article.id, tagId }))
    )
  }

  return NextResponse.json(article, { status: 201 })
}
