import { db } from '@/lib/db'
import { articles, categories, users, destinations, articleTags, tags } from '@/lib/db/schema'
import { eq, and, ne } from 'drizzle-orm'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { format } from 'date-fns'
import { it } from 'date-fns/locale'
import Breadcrumbs from '@/components/public/Breadcrumbs'
import ArticleCard from '@/components/public/ArticleCard'
import { buildMetadata, getSchemaArticle, getSchemaBreadcrumb, SITE_URL } from '@/lib/seo'
import type { Metadata } from 'next'

interface Params { slug: string }

async function getArticle(slug: string) {
  try {
    const result = await db
      .select({
        article: articles,
        category: { id: categories.id, name: categories.name, slug: categories.slug },
        destination: { id: destinations.id, name: destinations.name, slug: destinations.slug },
        author: { name: users.name },
      })
      .from(articles)
      .leftJoin(categories, eq(articles.categoryId, categories.id))
      .leftJoin(destinations, eq(articles.destinationId, destinations.id))
      .leftJoin(users, eq(articles.authorId, users.id))
      .where(and(eq(articles.slug, slug), eq(articles.status, 'published')))
      .limit(1)
    return result[0] ?? null
  } catch { return null }
}

async function getArticleTags(articleId: number) {
  try {
    return await db
      .select({ name: tags.name, slug: tags.slug })
      .from(articleTags)
      .innerJoin(tags, eq(articleTags.tagId, tags.id))
      .where(eq(articleTags.articleId, articleId))
  } catch { return [] }
}

async function getRelatedArticles(articleId: number, destinationId: number | null, categoryId: number | null) {
  try {
    if (!destinationId && !categoryId) return []
    const rows = await db
      .select({
        id: articles.id,
        title: articles.title,
        slug: articles.slug,
        excerpt: articles.excerpt,
        coverImage: articles.coverImage,
        publishedAt: articles.publishedAt,
        articleType: articles.articleType,
        featured: articles.featured,
        categoryName: categories.name,
      })
      .from(articles)
      .leftJoin(categories, eq(articles.categoryId, categories.id))
      .where(and(
        eq(articles.status, 'published'),
        ne(articles.id, articleId),
        destinationId ? eq(articles.destinationId, destinationId) : eq(articles.categoryId, categoryId!)
      ))
      .limit(3)
    return rows
  } catch { return [] }
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params
  const data = await getArticle(slug)
  if (!data) return {}
  const { article } = data
  return buildMetadata({
    title: article.seoTitle || article.title,
    description: article.metaDescription || article.excerpt || undefined,
    canonical: `/articoli/${article.slug}`,
    ogImage: article.ogImage || article.coverImage || undefined,
    ogType: 'article',
  })
}

export default async function ArticlePage({ params }: { params: Promise<Params> }) {
  const { slug } = await params
  const data = await getArticle(slug)
  if (!data) notFound()

  const { article, category, destination, author } = data
  const articleTags_ = await getArticleTags(article.id)
  const related = await getRelatedArticles(article.id, article.destinationId, article.categoryId)

  const publishedAt = article.publishedAt ?? null
  const updatedAt = article.updatedAt ?? new Date()
  const articleUrl = `${SITE_URL}/articoli/${article.slug}`

  const breadcrumbItems = [
    { name: 'Home', href: '/' },
    { name: 'Articoli', href: '/articoli' },
    ...(category ? [{ name: category.name, href: `/articoli?categoria=${category.slug}` }] : []),
    { name: article.title },
  ]

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(getSchemaArticle({
            title: article.title,
            description: article.excerpt || undefined,
            url: articleUrl,
            image: article.coverImage || undefined,
            authorName: author?.name || 'Michele Romano',
            publishedAt: publishedAt || new Date(),
            updatedAt,
          }))
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(getSchemaBreadcrumb(
            breadcrumbItems.map(b => ({ name: b.name, url: b.href ? `${SITE_URL}${b.href}` : articleUrl }))
          ))
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <Breadcrumbs items={breadcrumbItems.filter(b => b.href !== undefined) as any} />
      </div>

      <article className="max-w-3xl mx-auto px-4 sm:px-6 pb-16">
        {/* Header */}
        <header className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            {category && (
              <span className="text-xs font-semibold text-[--color-brand-coral] uppercase tracking-wider">
                {category.name}
              </span>
            )}
            {destination && (
              <Link
                href={`/destinazioni/${destination.slug}`}
                className="text-xs text-gray-400 hover:text-[--color-brand-blue] transition-colors"
              >
                {destination.name}
              </Link>
            )}
          </div>

          <h1 className="font-serif font-bold text-3xl sm:text-4xl lg:text-5xl text-[--color-brand-blue] leading-tight mb-6">
            {article.title}
          </h1>

          {article.excerpt && (
            <p className="text-gray-600 text-lg leading-relaxed mb-6 border-l-4 border-[--color-brand-yellow] pl-4">
              {article.excerpt}
            </p>
          )}

          <div className="flex items-center gap-4 text-sm text-gray-400">
            <span>{author?.name || 'Michele Romano'}</span>
            {publishedAt && (
              <time dateTime={publishedAt.toISOString()}>
                {format(publishedAt, 'd MMMM yyyy', { locale: it })}
              </time>
            )}
          </div>
        </header>

        {/* Cover image */}
        {article.coverImage && (
          <div className="relative aspect-[16/9] rounded-xl overflow-hidden mb-10">
            <Image
              src={article.coverImage}
              alt={article.title}
              fill
              className="object-cover"
              priority
              sizes="(max-width: 768px) 100vw, 768px"
            />
          </div>
        )}

        {/* Content */}
        <div
          className="prose max-w-none"
          dangerouslySetInnerHTML={{ __html: article.content }}
        />

        {/* Tags */}
        {articleTags_.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-10 pt-8 border-t border-gray-100">
            {articleTags_.map(t => (
              <span
                key={t.slug}
                className="text-xs px-3 py-1 bg-gray-100 text-gray-600 rounded-full"
              >
                #{t.name}
              </span>
            ))}
          </div>
        )}
      </article>

      {/* Related articles */}
      {related.length > 0 && (
        <section className="bg-[--color-brand-offwhite] py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <h2 className="font-serif font-bold text-2xl text-[--color-brand-blue] mb-6">Articoli correlati</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {related.map(a => (
                <ArticleCard key={a.id} {...a} publishedAt={a.publishedAt ?? null} />
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  )
}
