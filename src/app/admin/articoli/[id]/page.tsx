import { db } from '@/lib/db'
import { articles, categories, tags, destinations, articleTags } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { notFound } from 'next/navigation'
import ArticleEditor from '@/components/admin/ArticleEditor'

interface Params { id: string }

export default async function EditArticlePage({ params }: { params: Promise<Params> }) {
  const { id } = await params
  const articleId = parseInt(id)

  const [article] = await db.select().from(articles).where(eq(articles.id, articleId)).limit(1).catch(() => [])
  if (!article) notFound()

  const [cats, tgs, dests, atags] = await Promise.all([
    db.select().from(categories).orderBy(categories.name).catch(() => []),
    db.select().from(tags).orderBy(tags.name).catch(() => []),
    db.select().from(destinations).orderBy(destinations.name).catch(() => []),
    db.select({ tagId: articleTags.tagId }).from(articleTags).where(eq(articleTags.articleId, articleId)).catch(() => []),
  ])

  const toStr = (d: Date | null | undefined) => {
    if (!d) return ''
    return new Date(d).toISOString().slice(0, 16)
  }

  const initial = {
    id: article.id,
    title: article.title,
    slug: article.slug,
    excerpt: article.excerpt || '',
    content: article.content,
    coverImage: article.coverImage || '',
    status: article.status,
    publishedAt: toStr(article.publishedAt),
    scheduledAt: toStr(article.scheduledAt),
    categoryId: article.categoryId ? String(article.categoryId) : '',
    destinationId: article.destinationId ? String(article.destinationId) : '',
    articleType: article.articleType,
    seoTitle: article.seoTitle || '',
    metaDescription: article.metaDescription || '',
    ogTitle: article.ogTitle || '',
    ogDescription: article.ogDescription || '',
    ogImage: article.ogImage || '',
    canonicalUrl: article.canonicalUrl || '',
    featured: article.featured ?? false,
    tagIds: atags.map(t => t.tagId),
  }

  return (
    <ArticleEditor
      initial={initial}
      categories={cats}
      tags={tgs}
      destinations={dests}
    />
  )
}
