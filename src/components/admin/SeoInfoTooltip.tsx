'use client'
import { useState } from 'react'

const tooltips: Record<string, string> = {
  seoTitle: 'Il titolo utilizzato dai motori di ricerca per comprendere e presentare la pagina. Mantienilo chiaro, descrittivo e coerente con il contenuto. Ideale: 50-60 caratteri.',
  metaDescription: 'Una breve descrizione della pagina che può essere mostrata nei risultati di ricerca. Deve spiegare rapidamente perché l\'utente dovrebbe aprire questo risultato. Ideale: 130-155 caratteri.',
  canonicalUrl: 'Indica ai motori di ricerca quale URL considerare come versione principale della pagina. Lascia vuoto per usare l\'URL predefinito.',
  ogImage: 'È l\'immagine utilizzata quando la pagina viene condivisa su piattaforme che supportano Open Graph (social media, messaggistica). Dimensione consigliata: 1200×630px.',
  slug: 'La parte finale dell\'URL dell\'articolo. Deve essere breve, leggibile, in minuscolo, con trattini al posto degli spazi.',
}

export default function SeoInfoTooltip({ field }: { field: keyof typeof tooltips }) {
  const [visible, setVisible] = useState(false)
  return (
    <span className="relative inline-block">
      <button
        type="button"
        className="text-gray-400 hover:text-gray-600 transition-colors ml-1 text-xs"
        onMouseEnter={() => setVisible(true)}
        onMouseLeave={() => setVisible(false)}
        onClick={() => setVisible(!visible)}
        aria-label="Informazioni SEO"
      >
        ⓘ
      </button>
      {visible && (
        <span className="absolute left-0 top-6 z-50 w-72 bg-gray-900 text-white text-xs rounded-lg px-3 py-2.5 leading-relaxed shadow-xl">
          {tooltips[field]}
        </span>
      )}
    </span>
  )
}
