import Link from 'next/link'
import Image from 'next/image'
import { db } from '@/lib/db'
import { articles, categories, users, destinations } from '@/lib/db/schema'
import { eq, desc, and } from 'drizzle-orm'
import ArticleCard from '@/components/public/ArticleCard'
import { buildMetadata, getSchemaWebsite, getSchemaOrganization } from '@/lib/seo'
import type { Metadata } from 'next'

export const metadata: Metadata = buildMetadata({})

async function getFeaturedArticles() {
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
      .where(and(eq(articles.status, 'published'), eq(articles.featured, true)))
      .orderBy(desc(articles.publishedAt))
      .limit(3)
  } catch { return [] }
}

async function getLatestArticles() {
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
      .where(eq(articles.status, 'published'))
      .orderBy(desc(articles.publishedAt))
      .limit(6)
  } catch { return [] }
}

async function getDestinations() {
  try {
    return await db
      .select()
      .from(destinations)
      .limit(6)
  } catch { return [] }
}

export default async function HomePage() {
  const [featured, latest, dests] = await Promise.all([
    getFeaturedArticles(),
    getLatestArticles(),
    getDestinations(),
  ])

  const displayFeatured = featured.length > 0 ? featured : latest.slice(0, 3)
  const displayLatest = latest.slice(displayFeatured === featured ? 0 : 3)

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(getSchemaWebsite()) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(getSchemaOrganization()) }}
      />

      {/* Hero */}
      <section className="bg-[--color-brand-blue] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-20 lg:py-28">
          <div className="max-w-2xl">
            <p className="text-[--color-brand-yellow] text-sm font-semibold uppercase tracking-widest mb-4">Blog di viaggio</p>
            <h1 className="font-serif font-bold text-4xl sm:text-5xl lg:text-6xl leading-tight mb-6">
              Sempre in Viaggio
            </h1>
            <p className="text-white/75 text-lg sm:text-xl leading-relaxed mb-8 max-w-xl">
              Destinazioni autentiche, cicloviaggi, itinerari lenti. Storie vere dal viaggio.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/articoli"
                className="inline-flex items-center gap-2 bg-[--color-brand-coral] hover:bg-orange-600 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
              >
                Leggi gli articoli
              </Link>
              <Link
                href="/destinazioni"
                className="inline-flex items-center gap-2 border border-white/30 hover:border-white text-white font-medium px-6 py-3 rounded-lg transition-colors"
              >
                Esplora le destinazioni
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured articles */}
      {displayFeatured.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
          <div className="flex items-end justify-between mb-8">
            <div>
              <p className="text-[--color-brand-coral] text-xs font-semibold uppercase tracking-widest mb-2">In evidenza</p>
              <h2 className="font-serif font-bold text-2xl sm:text-3xl text-[--color-brand-blue]">Articoli selezionati</h2>
            </div>
            <Link href="/articoli" className="text-sm font-medium text-gray-500 hover:text-[--color-brand-blue] transition-colors hidden sm:block">
              Tutti gli articoli →
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayFeatured.map(a => (
              <ArticleCard key={a.id} {...a} publishedAt={a.publishedAt ?? null} />
            ))}
          </div>
        </section>
      )}

      {/* Latest articles */}
      {displayLatest.length > 0 && (
        <section className="bg-[--color-brand-offwhite]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
            <div className="flex items-end justify-between mb-8">
              <div>
                <p className="text-[--color-brand-coral] text-xs font-semibold uppercase tracking-widest mb-2">Ultimi</p>
                <h2 className="font-serif font-bold text-2xl sm:text-3xl text-[--color-brand-blue]">Articoli recenti</h2>
              </div>
              <Link href="/articoli" className="text-sm font-medium text-gray-500 hover:text-[--color-brand-blue] transition-colors hidden sm:block">
                Vedi tutti →
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayLatest.map(a => (
                <ArticleCard key={a.id} {...a} publishedAt={a.publishedAt ?? null} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Destinations */}
      {dests.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
          <div className="flex items-end justify-between mb-8">
            <div>
              <p className="text-[--color-brand-coral] text-xs font-semibold uppercase tracking-widest mb-2">Mappa</p>
              <h2 className="font-serif font-bold text-2xl sm:text-3xl text-[--color-brand-blue]">Destinazioni</h2>
            </div>
            <Link href="/destinazioni" className="text-sm font-medium text-gray-500 hover:text-[--color-brand-blue] transition-colors hidden sm:block">
              Tutte le destinazioni →
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {dests.map(d => (
              <Link
                key={d.id}
                href={`/destinazioni/${d.slug}`}
                className="group relative aspect-square rounded-lg overflow-hidden bg-[--color-brand-blue] hover:shadow-lg transition-shadow"
              >
                {d.image ? (
                  <Image
                    src={d.image}
                    alt={d.name}
                    fill
                    className="object-cover opacity-70 group-hover:opacity-80 transition-opacity"
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-[--color-brand-blue] to-[--color-brand-blue-light]" />
                )}
                <div className="absolute inset-0 flex items-end p-3">
                  <span className="text-white font-semibold text-sm leading-tight drop-shadow">{d.name}</span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* About teaser */}
      <section className="bg-[--color-brand-blue]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 lg:py-20 text-center">
          <p className="text-[--color-brand-yellow] text-xs font-semibold uppercase tracking-widest mb-4">Il progetto</p>
          <h2 className="font-serif font-bold text-2xl sm:text-3xl text-white mb-4 max-w-xl mx-auto">
            Storie autentiche dal viaggio
          </h2>
          <p className="text-white/70 max-w-md mx-auto mb-8 leading-relaxed">
            Sempre in Viaggio nasce dalla passione per i viaggi lenti, la bicicletta e le destinazioni fuori dai circuiti turistici.
          </p>
          <Link
            href="/chi-siamo"
            className="inline-flex items-center gap-2 border border-white/30 hover:border-white text-white font-medium px-6 py-3 rounded-lg transition-colors"
          >
            Chi siamo
          </Link>
        </div>
      </section>
    </>
  )
}
