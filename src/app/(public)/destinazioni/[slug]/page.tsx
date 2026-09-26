import { db } from '@/lib/db'
import { destinations, articles, categories } from '@/lib/db/schema'
import { eq, and, desc } from 'drizzle-orm'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import Breadcrumbs from '@/components/public/Breadcrumbs'
import ArticleCard from '@/components/public/ArticleCard'
import { buildMetadata, getSchemaBreadcrumb, SITE_URL } from '@/lib/seo'
import type { Metadata } from 'next'

interface Params { slug: string }

async function getDestination(slug: string) {
  try {
    const result = await db.select().from(destinations).where(eq(destinations.slug, slug)).limit(1)
    return result[0] ?? null
  } catch { return null }
}

async function getDestinationArticles(destId: number) {
  try {
    return await db
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
      .where(and(eq(articles.status, 'published'), eq(articles.destinationId, destId)))
      .orderBy(desc(articles.publishedAt))
  } catch { return [] }
}

async function getChildren(parentId: number) {
  try {
    return await db.select().from(destinations).where(eq(destinations.parentId, parentId))
  } catch { return [] }
}

async function getParent(parentId: number | null) {
  if (!parentId) return null
  try {
    const r = await db.select().from(destinations).where(eq(destinations.id, parentId)).limit(1)
    return r[0] ?? null
  } catch { return null }
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params
  const dest = await getDestination(slug)
  if (!dest) return {}
  return buildMetadata({
    title: dest.seoTitle || dest.name,
    description: dest.metaDescription || dest.description || undefined,
    canonical: `/destinazioni/${dest.slug}`,
    ogImage: dest.image || undefined,
  })
}

export default async function DestinationPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params
  const dest = await getDestination(slug)
  if (!dest) notFound()

  const [destArticles, children, parent] = await Promise.all([
    getDestinationArticles(dest.id),
    getChildren(dest.id),
    getParent(dest.parentId),
  ])

  const breadcrumbItems = [
    { name: 'Home', href: '/' },
    { name: 'Destinazioni', href: '/destinazioni' },
    ...(parent ? [{ name: parent.name, href: `/destinazioni/${parent.slug}` }] : []),
    { name: dest.name },
  ]

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(getSchemaBreadcrumb(
            breadcrumbItems.map(b => ({
              name: b.name,
              url: b.href ? `${SITE_URL}${b.href}` : `${SITE_URL}/destinazioni/${dest.slug}`
            }))
          ))
        }}
      />

      {/* Hero */}
      <div className="relative bg-[--color-brand-blue] overflow-hidden">
        {dest.image && (
          <Image
            src={dest.image}
            alt={dest.name}
            fill
            className="object-cover opacity-40"
            priority
            sizes="100vw"
          />
        )}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-16 lg:py-20">
          <Breadcrumbs items={breadcrumbItems.filter(b => b.href) as any} />
          <h1 className="font-serif font-bold text-4xl sm:text-5xl text-white mt-4 mb-3">{dest.name}</h1>
          {dest.description && (
            <p className="text-white/75 text-lg max-w-xl leading-relaxed">{dest.description}</p>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        {/* Sub-destinations */}
        {children.length > 0 && (
          <section className="mb-12">
            <h2 className="font-serif font-bold text-xl text-[--color-brand-blue] mb-4">Zone e città</h2>
            <div className="flex flex-wrap gap-2">
              {children.map(c => (
                <Link
                  key={c.id}
                  href={`/destinazioni/${c.slug}`}
                  className="px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:border-[--color-brand-blue] hover:text-[--color-brand-blue] transition-colors"
                >
                  {c.name}
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Articles */}
        {destArticles.length > 0 ? (
          <section>
            <h2 className="font-serif font-bold text-2xl text-[--color-brand-blue] mb-6">
              Articoli su {dest.name}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {destArticles.map(a => (
                <ArticleCard key={a.id} {...a} publishedAt={a.publishedAt ?? null} />
              ))}
            </div>
          </section>
        ) : (
          <div className="text-center py-16 text-gray-500">
            <p>Nessun articolo su questa destinazione ancora. Torna presto!</p>
          </div>
        )}
      </div>
    </>
  )
}
