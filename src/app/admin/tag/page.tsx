'use client'
import { useState, useEffect } from 'react'

interface Tag { id: number; name: string; slug: string }

export default function TagsPage() {
  const [tgs, setTgs] = useState<Tag[]>([])
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)

  const load = async () => {
    const res = await fetch('/api/tags')
    if (res.ok) setTgs(await res.json())
  }

  useEffect(() => { load() }, [])

  const add = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    setLoading(true)
    const res = await fetch('/api/tags', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: name.trim() }),
    })
    if (res.ok) { setName(''); load() }
    setLoading(false)
  }

  return (
    <div className="p-6 lg:p-8 max-w-2xl">
      <h1 className="text-xl font-bold text-gray-900 mb-6">Tag</h1>

      <form onSubmit={add} className="bg-white rounded-xl border border-gray-100 p-5 mb-6">
        <h2 className="font-semibold text-gray-800 text-sm mb-3">Nuovo tag</h2>
        <div className="flex gap-2">
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Nome tag"
            className="flex-1 text-sm border border-gray-200 rounded-lg px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-[--color-brand-blue]"
          />
          <button
            type="submit"
            disabled={loading || !name.trim()}
            className="text-sm font-semibold bg-[--color-brand-blue] text-white px-4 py-2 rounded-lg hover:bg-[--color-brand-blue-light] transition-colors disabled:opacity-60"
          >
            Aggiungi
          </button>
        </div>
      </form>

      <div className="flex flex-wrap gap-2">
        {tgs.map(t => (
          <span key={t.id} className="text-sm bg-white border border-gray-200 text-gray-700 px-3 py-1.5 rounded-full">
            #{t.name}
          </span>
        ))}
        {tgs.length === 0 && <p className="text-gray-400 text-sm">Nessun tag ancora.</p>}
      </div>
    </div>
  )
}
