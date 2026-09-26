'use client'
import { useState, useEffect } from 'react'

interface Destination { id: number; name: string; slug: string; parentId: number | null; description?: string }

export default function DestinationsAdminPage() {
  const [dests, setDests] = useState<Destination[]>([])
  const [form, setForm] = useState({ name: '', slug: '', description: '', parentId: '', image: '', seoTitle: '', metaDescription: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const load = async () => {
    const res = await fetch('/api/destinations')
    if (res.ok) setDests(await res.json())
  }

  useEffect(() => { load() }, [])

  const add = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true); setError('')
    const res = await fetch('/api/destinations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        parentId: form.parentId ? parseInt(form.parentId) : null,
      }),
    })
    if (res.ok) { setForm({ name: '', slug: '', description: '', parentId: '', image: '', seoTitle: '', metaDescription: '' }); load() }
    else { const d = await res.json(); setError(d.error || 'Errore') }
    setLoading(false)
  }

  const topLevel = dests.filter(d => !d.parentId)
  const children = dests.filter(d => d.parentId)

  return (
    <div className="p-6 lg:p-8 max-w-3xl">
      <h1 className="text-xl font-bold text-gray-900 mb-6">Destinazioni</h1>

      <form onSubmit={add} className="bg-white rounded-xl border border-gray-100 p-5 mb-6 space-y-3">
        <h2 className="font-semibold text-gray-800 text-sm">Nuova destinazione</h2>
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <div className="grid grid-cols-2 gap-3">
          <input
            value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            placeholder="Nome *" required
            className="text-sm border border-gray-200 rounded-lg px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-[--color-brand-blue]"
          />
          <input
            value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))}
            placeholder="Slug (auto se vuoto)"
            className="text-sm border border-gray-200 rounded-lg px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-[--color-brand-blue]"
          />
        </div>
        <input
          value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
          placeholder="Descrizione"
          className="w-full text-sm border border-gray-200 rounded-lg px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-[--color-brand-blue]"
        />
        <select
          value={form.parentId} onChange={e => setForm(f => ({ ...f, parentId: e.target.value }))}
          className="w-full text-sm border border-gray-200 rounded-lg px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-[--color-brand-blue]"
        >
          <option value="">Destinazione principale (nessun genitore)</option>
          {dests.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
        </select>
        <button
          type="submit" disabled={loading || !form.name}
          className="text-sm font-semibold bg-[--color-brand-blue] text-white px-4 py-2 rounded-lg hover:bg-[--color-brand-blue-light] transition-colors disabled:opacity-60"
        >
          Aggiungi
        </button>
      </form>

      {/* Tree view */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-wider">
          {dests.length} destinazioni
        </div>
        {topLevel.map(d => (
          <div key={d.id}>
            <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-50 hover:bg-gray-50">
              <span className="font-medium text-gray-800 text-sm">{d.name}</span>
              <span className="text-xs text-gray-400 font-mono">{d.slug}</span>
            </div>
            {children.filter(c => c.parentId === d.id).map(c => (
              <div key={c.id} className="flex items-center gap-3 px-4 py-2.5 border-b border-gray-50 hover:bg-gray-50 bg-gray-50/50">
                <span className="text-gray-300 ml-4 mr-1">└</span>
                <span className="text-sm text-gray-700">{c.name}</span>
                <span className="text-xs text-gray-400 font-mono">{c.slug}</span>
              </div>
            ))}
          </div>
        ))}
        {dests.length === 0 && <p className="px-4 py-6 text-gray-400 text-sm">Nessuna destinazione ancora.</p>}
      </div>
    </div>
  )
}
