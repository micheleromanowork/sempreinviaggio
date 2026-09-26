'use client'
import Link from 'next/link'
import { useEffect } from 'react'

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex-1 flex items-center justify-center py-20 px-4">
      <div className="text-center max-w-md">
        <p className="text-6xl font-bold text-gray-200 mb-4">!</p>
        <h2 className="font-serif font-bold text-2xl text-[#1a2b4a] mb-4">
          Qualcosa è andato storto
        </h2>
        <p className="text-gray-600 mb-8">
          Si è verificato un errore inatteso. Riprova tra qualche momento.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={reset}
            className="inline-flex items-center justify-center gap-2 bg-[#1a2b4a] text-white font-semibold px-6 py-3 rounded-lg hover:opacity-90 transition-opacity"
          >
            Riprova
          </button>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 border border-gray-200 text-gray-700 font-medium px-6 py-3 rounded-lg hover:border-gray-400 transition-colors"
          >
            Torna alla home
          </Link>
        </div>
      </div>
    </div>
  )
}
