'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

const nav = [
  { label: 'Dashboard', href: '/admin', icon: '⬡' },
  { label: 'Articoli', href: '/admin/articoli', icon: '✦' },
  { label: 'Destinazioni', href: '/admin/destinazioni', icon: '◈' },
  { label: 'Categorie', href: '/admin/categorie', icon: '◇' },
  { label: 'Tag', href: '/admin/tag', icon: '◇' },
  { label: 'Media', href: '/admin/media', icon: '◻' },
  { label: 'Pagine', href: '/admin/pagine', icon: '▭' },
  { label: 'Analytics', href: '/admin/analytics', icon: '▲' },
  { label: 'Impostazioni', href: '/admin/impostazioni', icon: '◎' },
]

export default function AdminSidebar() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  const isActive = (href: string) => {
    if (href === '/admin') return pathname === '/admin'
    return pathname.startsWith(href)
  }

  return (
    <>
      {/* Mobile toggle */}
      <button
        className="fixed top-4 left-4 z-50 lg:hidden bg-white shadow-md rounded-lg p-2 text-gray-600"
        onClick={() => setOpen(!open)}
        aria-label="Toggle menu"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          {open
            ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          }
        </svg>
      </button>

      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/30 z-40 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 h-full w-64 bg-[--color-brand-blue] text-white z-40 flex flex-col
        transition-transform duration-300 lg:translate-x-0
        ${open ? 'translate-x-0' : '-translate-x-full'}
        lg:static lg:flex
      `}>
        <div className="px-5 py-5 border-b border-white/10">
          <Link href="/" className="font-serif font-bold text-lg text-white hover:text-[--color-brand-yellow] transition-colors">
            Sempre in Viaggio
          </Link>
          <p className="text-white/40 text-xs mt-0.5">CMS Admin</p>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto" aria-label="Navigazione admin">
          {nav.map(item => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className={`
                flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                ${isActive(item.href)
                  ? 'bg-white/15 text-white'
                  : 'text-white/65 hover:bg-white/10 hover:text-white'
                }
              `}
            >
              <span className="text-base w-4 text-center">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="px-3 py-4 border-t border-white/10">
          <Link
            href="/"
            target="_blank"
            className="flex items-center gap-2 px-3 py-2 text-xs text-white/50 hover:text-white transition-colors rounded"
          >
            ↗ Vedi sito
          </Link>
          <form action="/api/auth/logout" method="POST">
            <button
              type="submit"
              className="w-full text-left flex items-center gap-2 px-3 py-2 text-xs text-white/50 hover:text-white transition-colors rounded"
            >
              ← Logout
            </button>
          </form>
        </div>
      </aside>
    </>
  )
}
