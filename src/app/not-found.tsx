import Link from 'next/link'
import Header from '@/components/public/Header'
import Footer from '@/components/public/Footer'

export default function NotFound() {
  return (
    <>
      <Header />
      <main className="flex-1 flex items-center justify-center py-20 px-4">
        <div className="text-center max-w-md">
          <p className="text-[--color-brand-yellow] font-bold text-6xl font-serif mb-4">404</p>
          <h1 className="font-serif font-bold text-2xl sm:text-3xl text-[--color-brand-blue] mb-4">
            Pagina non trovata
          </h1>
          <p className="text-gray-600 mb-8">
            La pagina che stai cercando non esiste o è stata spostata. Continua a esplorare Sempre in Viaggio!
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 bg-[--color-brand-blue] text-white font-semibold px-6 py-3 rounded-lg hover:bg-[--color-brand-blue-light] transition-colors"
            >
              Torna alla home
            </Link>
            <Link
              href="/articoli"
              className="inline-flex items-center justify-center gap-2 border border-gray-200 text-gray-700 font-medium px-6 py-3 rounded-lg hover:border-[--color-brand-blue] hover:text-[--color-brand-blue] transition-colors"
            >
              Vedi tutti gli articoli
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
