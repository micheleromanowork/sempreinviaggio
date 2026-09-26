import { db } from '@/lib/db'
import { pages } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { buildMetadata } from '@/lib/seo'
import type { Metadata } from 'next'
import Breadcrumbs from '@/components/public/Breadcrumbs'

export const metadata: Metadata = buildMetadata({
  title: 'Chi siamo',
  description: 'Scopri chi c\'è dietro Sempre in Viaggio, il blog di viaggi di Michele Romano.',
  canonical: '/chi-siamo',
})

export default async function ChiSiamoPage() {
  let page = null
  try {
    const r = await db.select().from(pages).where(eq(pages.slug, 'chi-siamo')).limit(1)
    page = r[0] ?? null
  } catch {}

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <Breadcrumbs items={[{ name: 'Home', href: '/' }, { name: 'Chi siamo' }]} />

      <article className="mt-4">
        <h1 className="font-serif font-bold text-3xl sm:text-4xl text-[--color-brand-blue] mb-8">Chi siamo</h1>
        {page ? (
          <div className="prose" dangerouslySetInnerHTML={{ __html: page.content }} />
        ) : (
          <div className="prose">
            <p>
              <strong>Sempre in Viaggio</strong> è il progetto di Michele Romano, appassionato di viaggi lenti, cicloviaggi e destinazioni autentiche.
            </p>
            <p>
              Questo blog nasce dalla convinzione che i viaggi migliori siano quelli vissuti con calma: percorrere una strada in bicicletta, perdersi in un borgo sconosciuto, scoprire sapori e culture lontani dai circuiti turistici tradizionali.
            </p>
            <p>
              Qui trovi guide pratiche, itinerari, storie di viaggio e consigli pensati per chi vuole viaggiare meglio, non solo di più.
            </p>
            <p>
              Per qualsiasi informazione o collaborazione: <a href="mailto:micheleromano.priv@gmail.com">micheleromano.priv@gmail.com</a>
            </p>
          </div>
        )}
      </article>
    </div>
  )
}
