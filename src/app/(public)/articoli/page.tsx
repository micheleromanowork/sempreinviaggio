import { db } from '@/lib/db'
import { articles, categories, users } from '@/lib/db/schema'
import { eq, desc, and, count, sql } from 'drizzle-orm'
import ArticleCard from '@/components/public/ArticleCard'
import Breadcrumbs from '@/components/public/Breadcrumbs'
import { buildMetadata } from '@/lib/seo'
import type { Metadata } from 'next'
import Link from 'next/link'

const PAGE_SIZE = 12

export const metadata: Metadata = buildMetadata({
  title: 'Articoli',
  description: 'Tutti gli articoli di Sempre in Viaggio: guide, itinerari, cicloviaggi e consigli di viaggio.',
  canonical: '/articoli',
})

async function getArticles(page: number) {
  const offset = (page - 1) * PAGE_SIZE
  try {
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
      .where(eq(articles.status, 'published'))
      .orderBy(desc(articles.publishedAt))
      .limit(PAGE_SIZE)
      .offset(offset)

    const total = await db
      .select({ count: count() })
      .from(articles)
      .where(eq(articles.status, 'published'))

    return { rows, total: total[0]?.count ?? 0 }
  } catch { return { rows: [], total: 0 } }
}

export default async function ArticlesPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const params = await searchParams
  const page = Math.max(1, parseInt(params.page ?? '1', 10))
  const { rows, total } = await getArticles(page)
  const totalPages = Math.ceil(total / PAGE_SIZE)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <Breadcrumbs items={[{ name: 'Home', href: '/' }, { name: 'Articoli' }]} />

      <div className="mb-10">
        <h1 className="font-serif font-bold text-3xl sm:text-4xl text-[--color-brand-blue] mb-3">Articoli</h1>
        <p className="text-gray-600">Guide di viaggio, itinerari, cicloviaggi e molto altro.</p>
      </div>

      {rows.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          <p className="text-lg mb-4">Nessun articolo pubblicato.</p>
          <p className="text-sm">Torna presto!</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {rows.map(a => (
              <ArticleCard key={a.id} {...a} publishedAt={a.publishedAt ?? null} />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <nav className="flex items-center justify-center gap-2" aria-label="Paginazione">
              {page > 1 && (
                <Link
                  href={`/articoli?page=${page - 1}`}
                  className="px-4 py-2 rounded border border-gray-200 text-sm font-medium text-gray-600 hover:border-[--color-brand-blue] hover:text-[--color-brand-blue] transition-colors"
                >
                  ← Precedente
                </Link>
              )}
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <Link
                  key={p}
                  href={`/articoli?page=${p}`}
                  className={`w-9 h-9 flex items-center justify-center rounded border text-sm font-medium transition-colors ${
                    p === page
                      ? 'bg-[--color-brand-blue] text-white border-[--color-brand-blue]'
                      : 'border-gray-200 text-gray-600 hover:border-[--color-brand-blue] hover:text-[--color-brand-blue]'
                  }`}
                  aria-current={p === page ? 'page' : undefined}
                >
                  {p}
                </Link>
              ))}
              {page < totalPages && (
                <Link
                  href={`/articoli?page=${page + 1}`}
                  className="px-4 py-2 rounded border border-gray-200 text-sm font-medium text-gray-600 hover:border-[--color-brand-blue] hover:text-[--color-brand-blue] transition-colors"
                >
                  Successivo →
                </Link>
              )}
            </nav>
          )}
        </>
      )}
    </div>
  )
}
