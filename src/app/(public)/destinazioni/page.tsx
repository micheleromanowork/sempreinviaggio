import { db } from '@/lib/db'
import { destinations } from '@/lib/db/schema'
import { eq, isNull } from 'drizzle-orm'
import Link from 'next/link'
import Image from 'next/image'
import Breadcrumbs from '@/components/public/Breadcrumbs'
import { buildMetadata } from '@/lib/seo'
import type { Metadata } from 'next'

export const metadata: Metadata = buildMetadata({
  title: 'Destinazioni',
  description: 'Esplora tutte le destinazioni di Sempre in Viaggio: Italia, Europa e non solo.',
  canonical: '/destinazioni',
})

export default async function DestinationsPage() {
  let topLevel: typeof destinations.$inferSelect[] = []
  try {
    topLevel = await db.select().from(destinations).where(isNull(destinations.parentId))
  } catch {}

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <Breadcrumbs items={[{ name: 'Home', href: '/' }, { name: 'Destinazioni' }]} />

      <div className="mb-10">
        <h1 className="font-serif font-bold text-3xl sm:text-4xl text-[--color-brand-blue] mb-3">Destinazioni</h1>
        <p className="text-gray-600">Esplora le destinazioni raccontate da Sempre in Viaggio.</p>
      </div>

      {topLevel.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          <p>Nessuna destinazione disponibile ancora. Torna presto!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {topLevel.map(dest => (
            <Link
              key={dest.id}
              href={`/destinazioni/${dest.slug}`}
              className="group relative rounded-xl overflow-hidden aspect-[4/3] bg-[--color-brand-blue] hover:shadow-xl transition-shadow"
            >
              {dest.image ? (
                <Image
                  src={dest.image}
                  alt={dest.name}
                  fill
                  className="object-cover opacity-75 group-hover:opacity-85 transition-opacity"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-[--color-brand-blue] to-[--color-brand-blue-light]" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute inset-0 flex items-end p-6">
                <div>
                  <h2 className="font-serif font-bold text-2xl text-white mb-1">{dest.name}</h2>
                  {dest.description && (
                    <p className="text-white/75 text-sm line-clamp-2">{dest.description}</p>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
