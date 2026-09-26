'use client'
import { useState, useEffect } from 'react'

interface Category { id: number; name: string; slug: string; description?: string }

export default function CategoriesPage() {
  const [cats, setCats] = useState<Category[]>([])
  const [name, setName] = useState('')
  const [desc, setDesc] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const load = async () => {
    const res = await fetch('/api/categories')
    if (res.ok) setCats(await res.json())
  }

  useEffect(() => { load() }, [])

  const add = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    setLoading(true)
    setError('')
    const res = await fetch('/api/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: name.trim(), description: desc.trim() }),
    })
    if (res.ok) { setName(''); setDesc(''); load() }
    else { const d = await res.json(); setError(d.error || 'Errore') }
    setLoading(false)
  }

  return (
    <div className="p-6 lg:p-8 max-w-2xl">
      <h1 className="text-xl font-bold text-gray-900 mb-6">Categorie</h1>

      <form onSubmit={add} className="bg-white rounded-xl border border-gray-100 p-5 mb-6 space-y-3">
        <h2 className="font-semibold text-gray-800 text-sm">Nuova categoria</h2>
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <input
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Nome categoria"
          className="w-full text-sm border border-gray-200 rounded-lg px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-[--color-brand-blue]"
        />
        <input
          value={desc}
          onChange={e => setDesc(e.target.value)}
          placeholder="Descrizione (opzionale)"
          className="w-full text-sm border border-gray-200 rounded-lg px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-[--color-brand-blue]"
        />
        <button
          type="submit"
          disabled={loading || !name.trim()}
          className="text-sm font-semibold bg-[--color-brand-blue] text-white px-4 py-2 rounded-lg hover:bg-[--color-brand-blue-light] transition-colors disabled:opacity-60"
        >
          Aggiungi
        </button>
      </form>

      {cats.length === 0 ? (
        <p className="text-gray-400 text-sm">Nessuna categoria ancora.</p>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="border-b border-gray-100">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Nome</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Slug</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {cats.map(c => (
                <tr key={c.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-800">{c.name}</td>
                  <td className="px-4 py-3 text-gray-400 font-mono text-xs">{c.slug}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
