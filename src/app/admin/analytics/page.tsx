import { db } from '@/lib/db'
import { articles } from '@/lib/db/schema'
import { eq, count, and, gte } from 'drizzle-orm'
import { getSetting } from '@/lib/settings'
import Link from 'next/link'

export default async function AnalyticsPage() {
  const [totalPublished] = await db.select({ n: count() }).from(articles).where(eq(articles.status, 'published'))
  const [totalDraft] = await db.select({ n: count() }).from(articles).where(eq(articles.status, 'draft'))
  const [totalScheduled] = await db.select({ n: count() }).from(articles).where(eq(articles.status, 'scheduled'))

  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  const [recentPublished] = await db.select({ n: count() }).from(articles).where(
    and(eq(articles.status, 'published'), gte(articles.publishedAt, thirtyDaysAgo))
  )

  const ga4Id = await getSetting('ga4_id')

  const statBox = (label: string, value: number, sub?: string) => (
    <div className="bg-white rounded-xl border border-gray-100 p-5">
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">{label}</p>
      <p className="text-3xl font-bold text-gray-900">{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  )

  return (
    <div className="p-6 lg:p-8 max-w-4xl">
      <h1 className="text-xl font-bold text-gray-900 mb-2">Analytics</h1>
      <p className="text-sm text-gray-500 mb-8">Statistiche interne del CMS. Per i dati di traffico usa Google Analytics 4.</p>

      {/* CMS Stats */}
      <section className="mb-8">
        <h2 className="text-sm font-semibold text-gray-700 mb-3">Contenuti CMS</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {statBox('Pubblicati', totalPublished.n)}
          {statBox('Bozze', totalDraft.n)}
          {statBox('Programmati', totalScheduled.n)}
          {statBox('Ultimi 30 giorni', recentPublished.n, 'articoli pubblicati')}
        </div>
      </section>

      {/* GA4 link */}
      <section className="bg-white rounded-xl border border-gray-100 p-5 mb-6">
        <h2 className="font-semibold text-gray-800 text-sm mb-3">Google Analytics 4</h2>
        {ga4Id ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm">
              <span className="w-2 h-2 rounded-full bg-green-400 inline-block"></span>
              <span className="text-gray-700">Tracking attivo — Measurement ID: <code className="font-mono text-xs bg-gray-100 px-1.5 py-0.5 rounded">{ga4Id}</code></span>
            </div>
            <p className="text-xs text-gray-500">
              Visualizza traffico, utenti, sessioni e conversioni direttamente nella dashboard di Google Analytics.
            </p>
            <a
              href="https://analytics.google.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-[--color-brand-blue] hover:underline"
            >
              Apri Google Analytics →
            </a>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <span className="w-2 h-2 rounded-full bg-gray-300 inline-block"></span>
              <span className="text-gray-500">GA4 non configurato.</span>
            </div>
            <p className="text-xs text-gray-400">
              Aggiungi il Measurement ID nelle{' '}
              <Link href="/admin/impostazioni" className="underline text-[--color-brand-blue]">Impostazioni → Analytics</Link>{' '}
              per attivare il tracciamento.
            </p>
          </div>
        )}
      </section>

      {/* Tips */}
      <section className="bg-[--color-brand-offwhite] rounded-xl border border-gray-100 p-5">
        <h2 className="font-semibold text-gray-800 text-sm mb-3">Risorse utili</h2>
        <ul className="space-y-2 text-sm text-gray-600">
          <li>
            <a href="https://analytics.google.com/" target="_blank" rel="noopener noreferrer" className="hover:underline text-[--color-brand-blue]">
              Google Analytics 4 →
            </a>
            {' '}— traffico, sessioni, sorgenti, conversioni
          </li>
          <li>
            <a href="https://search.google.com/search-console" target="_blank" rel="noopener noreferrer" className="hover:underline text-[--color-brand-blue]">
              Google Search Console →
            </a>
            {' '}— posizionamento SEO, impressioni, CTR, errori di indicizzazione
          </li>
          <li>
            <a href="https://pagespeed.web.dev/" target="_blank" rel="noopener noreferrer" className="hover:underline text-[--color-brand-blue]">
              PageSpeed Insights →
            </a>
            {' '}— Core Web Vitals, performance mobile e desktop
          </li>
        </ul>
      </section>
    </div>
  )
}
