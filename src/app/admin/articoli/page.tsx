import { db } from '@/lib/db'
import { articles, categories, users } from '@/lib/db/schema'
import { eq, desc } from 'drizzle-orm'
import Link from 'next/link'
import { format } from 'date-fns'
import { it } from 'date-fns/locale'

export default async function AdminArticlesPage() {
  let rows: any[] = []
  try {
    rows = await db
      .select({
        id: articles.id,
        title: articles.title,
        status: articles.status,
        publishedAt: articles.publishedAt,
        updatedAt: articles.updatedAt,
        articleType: articles.articleType,
        slug: articles.slug,
        categoryName: categories.name,
        authorName: users.name,
      })
      .from(articles)
      .leftJoin(categories, eq(articles.categoryId, categories.id))
      .leftJoin(users, eq(articles.authorId, users.id))
      .orderBy(desc(articles.updatedAt))
  } catch {}

  const statusLabel = (s: string) => ({
    published: { label: 'Pubblicato', cls: 'bg-green-100 text-green-700' },
    draft: { label: 'Bozza', cls: 'bg-gray-100 text-gray-600' },
    scheduled: { label: 'Programmato', cls: 'bg-blue-100 text-blue-700' },
  }[s] ?? { label: s, cls: 'bg-gray-100 text-gray-600' })

  return (
    <div className="p-6 lg:p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-gray-900">Articoli</h1>
        <Link
          href="/admin/articoli/nuovo"
          className="inline-flex items-center gap-2 bg-[--color-brand-coral] hover:bg-orange-600 text-white font-semibold px-4 py-2 rounded-lg text-sm transition-colors"
        >
          + Nuovo articolo
        </Link>
      </div>

      {rows.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
          <p className="text-gray-500 mb-4">Nessun articolo ancora.</p>
          <Link href="/admin/articoli/nuovo" className="text-[--color-brand-coral] font-medium hover:underline">
            Crea il primo articolo →
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="border-b border-gray-100">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Titolo</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500 hidden sm:table-cell">Tipo</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500 hidden md:table-cell">Categoria</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Stato</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500 hidden lg:table-cell">Data</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {rows.map(a => {
                const st = statusLabel(a.status)
                return (
                  <tr key={a.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <Link href={`/admin/articoli/${a.id}`} className="font-medium text-gray-900 hover:text-[--color-brand-blue] transition-colors line-clamp-1">
                        {a.title}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-gray-500 capitalize hidden sm:table-cell">{a.articleType}</td>
                    <td className="px-4 py-3 text-gray-500 hidden md:table-cell">{a.categoryName || '—'}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${st.cls}`}>{st.label}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-xs hidden lg:table-cell">
                      {a.updatedAt ? format(a.updatedAt, 'd MMM yyyy', { locale: it }) : '—'}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center gap-2 justify-end">
                        {a.status === 'published' && (
                          <a href={`/articoli/${a.slug}`} target="_blank" className="text-xs text-gray-400 hover:text-gray-600 transition-colors">
                            ↗
                          </a>
                        )}
                        <Link href={`/admin/articoli/${a.id}`} className="text-xs text-[--color-brand-coral] hover:underline">
                          Modifica
                        </Link>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
