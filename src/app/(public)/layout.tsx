import Header from '@/components/public/Header'
import Footer from '@/components/public/Footer'
import { getSetting } from '@/lib/settings'

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const ga4Id = await getSetting('ga4_id').catch(() => null)

  return (
    <>
      {ga4Id && (
        <>
          <script async src={`https://www.googletagmanager.com/gtag/js?id=${ga4Id}`} />
          <script
            dangerouslySetInnerHTML={{
              __html: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${ga4Id}',{anonymize_ip:true});`,
            }}
          />
        </>
      )}
      <Header />
      <main id="main-content" className="flex-1">
        {children}
      </main>
      <Footer />
    </>
  )
}
