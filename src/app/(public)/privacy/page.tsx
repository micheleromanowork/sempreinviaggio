import { db } from '@/lib/db'
import { pages } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { buildMetadata } from '@/lib/seo'
import type { Metadata } from 'next'
import Breadcrumbs from '@/components/public/Breadcrumbs'

export const metadata: Metadata = buildMetadata({
  title: 'Privacy Policy',
  description: 'Informativa sulla privacy di Sempre in Viaggio.',
  canonical: '/privacy',
  noIndex: true,
})

export default async function PrivacyPage() {
  let page = null
  try {
    const r = await db.select().from(pages).where(eq(pages.slug, 'privacy')).limit(1)
    page = r[0] ?? null
  } catch {}

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <Breadcrumbs items={[{ name: 'Home', href: '/' }, { name: 'Privacy Policy' }]} />
      <article className="mt-4">
        <h1 className="font-serif font-bold text-3xl text-[--color-brand-blue] mb-8">Privacy Policy</h1>
        {page ? (
          <div className="prose" dangerouslySetInnerHTML={{ __html: page.content }} />
        ) : (
          <div className="prose">
            <p>Questa pagina è gestita dal CMS. Accedi all'area admin per modificarla.</p>
          </div>
        )}
      </article>
    </div>
  )
}
