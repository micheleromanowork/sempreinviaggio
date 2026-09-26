import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/session'
import { db } from '@/lib/db'
import { articles, articleTags } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

interface Params { id: string }

export async function GET(_: NextRequest, { params }: { params: Promise<Params> }) {
  try {
    await requireAuth()
  } catch {
    return NextResponse.json({ error: 'Non autorizzato.' }, { status: 401 })
  }

  const { id } = await params
  const [article] = await db.select().from(articles).where(eq(articles.id, parseInt(id))).limit(1)
  if (!article) return NextResponse.json({ error: 'Non trovato.' }, { status: 404 })

  const tags = await db.select({ tagId: articleTags.tagId }).from(articleTags).where(eq(articleTags.articleId, article.id))
  return NextResponse.json({ ...article, tagIds: tags.map(t => t.tagId) })
}

export async function PUT(req: NextRequest, { params }: { params: Promise<Params> }) {
  try {
    await requireAuth()
  } catch {
    return NextResponse.json({ error: 'Non autorizzato.' }, { status: 401 })
  }

  const { id } = await params
  const articleId = parseInt(id)
  const body = await req.json()
  const now = new Date()

  let publishedAt: Date | null = null
  let scheduledAt: Date | null = null
  if (body.status === 'published') publishedAt = body.publishedAt ? new Date(body.publishedAt) : now
  if (body.status === 'scheduled') scheduledAt = body.scheduledAt ? new Date(body.scheduledAt) : null

  const [updated] = await db
    .update(articles)
    .set({
      title: body.title,
      slug: body.slug,
      excerpt: body.excerpt || null,
      content: body.content || '',
      coverImage: body.coverImage || null,
      status: body.status || 'draft',
      publishedAt,
      scheduledAt,
      categoryId: body.categoryId || null,
      destinationId: body.destinationId || null,
      articleType: body.articleType || 'guida',
      seoTitle: body.seoTitle || null,
      metaDescription: body.metaDescription || null,
      ogTitle: body.ogTitle || null,
      ogDescription: body.ogDescription || null,
      ogImage: body.ogImage || null,
      canonicalUrl: body.canonicalUrl || null,
      featured: body.featured ?? false,
      updatedAt: now,
    })
    .where(eq(articles.id, articleId))
    .returning()

  if (!updated) return NextResponse.json({ error: 'Non trovato.' }, { status: 404 })

  // Replace tags
  await db.delete(articleTags).where(eq(articleTags.articleId, articleId))
  if (body.tagIds?.length) {
    await db.insert(articleTags).values(
      body.tagIds.map((tagId: number) => ({ articleId, tagId }))
    )
  }

  return NextResponse.json(updated)
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<Params> }) {
  try {
    await requireAuth()
  } catch {
    return NextResponse.json({ error: 'Non autorizzato.' }, { status: 401 })
  }

  const { id } = await params
  const articleId = parseInt(id)
  await db.delete(articleTags).where(eq(articleTags.articleId, articleId))
  await db.delete(articles).where(eq(articles.id, articleId))
  return NextResponse.json({ ok: true })
}
