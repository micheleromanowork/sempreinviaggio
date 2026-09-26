import Link from 'next/link'

export default function Footer() {
  const year = new Date().getFullYear()
  return (
    <footer className="bg-[--color-brand-blue] text-white/80 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
          {/* Brand */}
          <div>
            <p className="font-serif font-bold text-xl text-white mb-3">Sempre in Viaggio</p>
            <p className="text-sm leading-relaxed max-w-xs">
              Destinazioni, itinerari, cicloviaggi e consigli di viaggio autentici.
            </p>
          </div>

          {/* Links */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-white/50 mb-4">Esplora</p>
            <nav className="space-y-2" aria-label="Link footer esplora">
              <Link href="/articoli" className="block text-sm hover:text-white transition-colors">Articoli</Link>
              <Link href="/destinazioni" className="block text-sm hover:text-white transition-colors">Destinazioni</Link>
              <Link href="/chi-siamo" className="block text-sm hover:text-white transition-colors">Chi siamo</Link>
            </nav>
          </div>

          {/* Info */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-white/50 mb-4">Info</p>
            <nav className="space-y-2" aria-label="Link footer info">
              <Link href="/privacy" className="block text-sm hover:text-white transition-colors">Privacy Policy</Link>
              <Link href="/cookie" className="block text-sm hover:text-white transition-colors">Cookie Policy</Link>
              <a href="mailto:micheleromano.priv@gmail.com" className="block text-sm hover:text-white transition-colors">
                Contatti
              </a>
            </nav>
          </div>
        </div>

        <div className="border-t border-white/10 pt-6 text-xs text-white/40">
          © {year} Sempre in Viaggio — Michele Romano. Tutti i diritti riservati.
        </div>
      </div>
    </footer>
  )
}
