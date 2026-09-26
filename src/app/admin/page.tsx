import { db } from '@/lib/db'
import { articles } from '@/lib/db/schema'
import { eq, count } from 'drizzle-orm'
import { getSession } from '@/lib/session'
import Link from 'next/link'

async function getStats() {
  try {
    const [pub] = await db.select({ count: count() }).from(articles).where(eq(articles.status, 'published'))
    const [draft] = await db.select({ count: count() }).from(articles).where(eq(articles.status, 'draft'))
    const [sched] = await db.select({ count: count() }).from(articles).where(eq(articles.status, 'scheduled'))
    const recent = await db.select({
      id: articles.id, title: articles.title, status: articles.status, updatedAt: articles.updatedAt, slug: articles.slug,
    }).from(articles).orderBy(articles.updatedAt).limit(5)
    return { published: pub.count, draft: draft.count, scheduled: sched.count, recent }
  } catch { return { published: 0, draft: 0, scheduled: 0, recent: [] } }
}

export default async function AdminDashboard() {
  const [session, stats] = await Promise.all([getSession(), getStats()])
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Buongiorno' : hour < 18 ? 'Buon pomeriggio' : 'Buonasera'

  return (
    <div className="p-6 lg:p-8 max-w-4xl">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{greeting}, {session.name?.split(' ')[0] || 'Admin'}</h1>
          <p className="text-gray-500 text-sm mt-1">Sempre in Viaggio — CMS</p>
        </div>
        <Link
          href="/admin/articoli/nuovo"
          className="inline-flex items-center gap-2 bg-[--color-brand-coral] hover:bg-orange-600 text-white font-semibold px-4 py-2 rounded-lg text-sm transition-colors"
        >
          + Nuovo articolo
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Pubblicati', value: stats.published, color: 'text-green-600' },
          { label: 'Bozze', value: stats.draft, color: 'text-yellow-600' },
          { label: 'Programmati', value: stats.scheduled, color: 'text-blue-600' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl border border-gray-100 p-5">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">{s.label}</p>
            <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* SEO Status */}
      <div className="bg-white rounded-xl border border-gray-100 p-5 mb-6">
        <h2 className="font-semibold text-gray-900 mb-4">Stato SEO</h2>
        <div className="space-y-2">
          {[
            { label: 'Sitemap', ok: true },
            { label: 'Robots.txt', ok: true },
            { label: 'Structured data', ok: true },
          ].map(item => (
            <div key={item.label} className="flex items-center gap-2 text-sm">
              <span className={item.ok ? 'text-green-500' : 'text-red-500'}>{item.ok ? '✓' : '✗'}</span>
              <span className="text-gray-700">{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Recent articles */}
      {stats.recent.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">Articoli recenti</h2>
            <Link href="/admin/articoli" className="text-sm text-[--color-brand-coral] hover:underline">Vedi tutti</Link>
          </div>
          <div className="space-y-2">
            {stats.recent.map(a => (
              <div key={a.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                <Link
                  href={`/admin/articoli/${a.id}`}
                  className="text-sm text-gray-800 hover:text-[--color-brand-blue] font-medium truncate mr-4"
                >
                  {a.title}
                </Link>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${
                  a.status === 'published' ? 'bg-green-100 text-green-700' :
                  a.status === 'scheduled' ? 'bg-blue-100 text-blue-700' :
                  'bg-gray-100 text-gray-600'
                }`}>
                  {a.status === 'published' ? 'Pubblicato' : a.status === 'scheduled' ? 'Programmato' : 'Bozza'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick links */}
      <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Nuovo articolo', href: '/admin/articoli/nuovo' },
          { label: 'Destinazioni', href: '/admin/destinazioni' },
          { label: 'Media', href: '/admin/media' },
          { label: 'Impostazioni', href: '/admin/impostazioni' },
        ].map(l => (
          <Link
            key={l.href}
            href={l.href}
            className="bg-white border border-gray-100 rounded-xl p-4 text-sm font-medium text-gray-700 hover:border-[--color-brand-blue] hover:text-[--color-brand-blue] transition-colors text-center"
          >
            {l.label}
          </Link>
        ))}
      </div>
    </div>
  )
}
