'use client'
import Link from 'next/link'
import { useState } from 'react'

export default function Header() {
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link
          href="/"
          className="font-serif font-bold text-xl text-[--color-brand-blue] tracking-tight hover:text-[--color-brand-coral] transition-colors"
        >
          Sempre in Viaggio
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-8" aria-label="Navigazione principale">
          <Link href="/articoli" className="text-sm font-medium text-gray-600 hover:text-[--color-brand-blue] transition-colors">
            Articoli
          </Link>
          <Link href="/destinazioni" className="text-sm font-medium text-gray-600 hover:text-[--color-brand-blue] transition-colors">
            Destinazioni
          </Link>
          <Link href="/chi-siamo" className="text-sm font-medium text-gray-600 hover:text-[--color-brand-blue] transition-colors">
            Chi siamo
          </Link>
        </nav>

        {/* Mobile menu button */}
        <button
          className="md:hidden p-2 rounded text-gray-600 hover:text-[--color-brand-blue]"
          onClick={() => setOpen(!open)}
          aria-label="Apri menu"
          aria-expanded={open}
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            {open
              ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            }
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-gray-100 bg-white px-4 py-4 space-y-3">
          <Link href="/articoli" className="block text-sm font-medium text-gray-700 py-1" onClick={() => setOpen(false)}>Articoli</Link>
          <Link href="/destinazioni" className="block text-sm font-medium text-gray-700 py-1" onClick={() => setOpen(false)}>Destinazioni</Link>
          <Link href="/chi-siamo" className="block text-sm font-medium text-gray-700 py-1" onClick={() => setOpen(false)}>Chi siamo</Link>
        </div>
      )}
    </header>
  )
}
