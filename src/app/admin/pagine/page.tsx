'use client'
import { useState, useEffect } from 'react'

interface Page { id: number; title: string; slug: string; content: string; seoTitle?: string; metaDescription?: string }

export default function PaginePage() {
  const [pages, setPages] = useState<Page[]>([])
  const [selected, setSelected] = useState<Page | null>(null)
  const [form, setForm] = useState({ title: '', content: '', seoTitle: '', metaDescription: '' })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const load = async () => {
    const res = await fetch('/api/pages')
    if (res.ok) setPages(await res.json())
  }

  useEffect(() => { load() }, [])

  const select = (p: Page) => {
    setSelected(p)
    setForm({ title: p.title, content: p.content, seoTitle: p.seoTitle || '', metaDescription: p.metaDescription || '' })
    setSaved(false)
  }

  const save = async () => {
    if (!selected) return
    setSaving(true); setSaved(false)
    await fetch(`/api/pages/${selected.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    setSaving(false); setSaved(true)
    setTimeout(() => setSaved(false), 3000)
    load()
  }

  const labelClass = "block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5"
  const inputClass = "w-full text-sm border border-gray-200 rounded-lg px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-[--color-brand-blue]"

  return (
    <div className="p-6 lg:p-8 max-w-4xl">
      <h1 className="text-xl font-bold text-gray-900 mb-6">Pagine</h1>

      <div className="flex gap-6">
        {/* Sidebar: page list */}
        <div className="w-48 shrink-0">
          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            {pages.length === 0 && (
              <p className="px-4 py-6 text-gray-400 text-sm">Nessuna pagina.</p>
            )}
            {pages.map(p => (
              <button
                key={p.id}
                onClick={() => select(p)}
                className={`w-full text-left px-4 py-3 text-sm border-b border-gray-50 transition-colors ${
                  selected?.id === p.id ? 'bg-blue-50 text-[--color-brand-blue] font-semibold' : 'hover:bg-gray-50 text-gray-700'
                }`}
              >
                <div className="font-medium">{p.title}</div>
                <div className="text-xs text-gray-400 font-mono">{p.slug}</div>
              </button>
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-3 px-1">
            Le pagine vengono create automaticamente al primo avvio (Chi siamo, Privacy, Cookie).
          </p>
        </div>

        {/* Editor */}
        {selected ? (
          <div className="flex-1 space-y-4">
            <div className="bg-white rounded-xl border border-gray-100 p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-gray-800 text-sm">Modifica: {selected.title}</h2>
                <button
                  onClick={save} disabled={saving}
                  className="text-sm font-semibold bg-[--color-brand-blue] text-white px-4 py-2 rounded-lg hover:bg-[--color-brand-blue-light] transition-colors disabled:opacity-60"
                >
                  {saving ? 'Salvataggio…' : saved ? '✓ Salvato' : 'Salva'}
                </button>
              </div>

              <div>
                <label className={labelClass}>Titolo</label>
                <input
                  value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>Contenuto (HTML)</label>
                <textarea
                  value={form.content}
                  onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
                  rows={14}
                  className="w-full text-sm font-mono border border-gray-200 rounded-lg px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-[--color-brand-blue] resize-y"
                  placeholder="<p>Testo della pagina…</p>"
                />
                <p className="text-xs text-gray-400 mt-1">Puoi usare HTML. Il contenuto viene visualizzato nella pagina pubblica.</p>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-100 p-5 space-y-4">
              <h3 className="font-semibold text-gray-800 text-sm border-b border-gray-100 pb-3">SEO</h3>
              <div>
                <label className={labelClass}>SEO Title</label>
                <input
                  value={form.seoTitle}
                  onChange={e => setForm(f => ({ ...f, seoTitle: e.target.value }))}
                  className={inputClass}
                  placeholder={form.title}
                />
              </div>
              <div>
                <label className={labelClass}>Meta Description</label>
                <textarea
                  value={form.metaDescription}
                  onChange={e => setForm(f => ({ ...f, metaDescription: e.target.value }))}
                  rows={2}
                  className="w-full text-sm border border-gray-200 rounded-lg px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-[--color-brand-blue] resize-none"
                />
                <p className="text-xs text-gray-400 mt-1">{form.metaDescription.length}/155 caratteri</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 bg-white rounded-xl border border-dashed border-gray-200 p-12 text-center text-gray-400">
            <p>Seleziona una pagina dalla lista per modificarla.</p>
          </div>
        )}
      </div>
    </div>
  )
}
