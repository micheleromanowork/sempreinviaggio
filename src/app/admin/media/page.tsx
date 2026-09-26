'use client'
import { useState, useEffect } from 'react'
import Image from 'next/image'

interface MediaItem {
  id: number; url: string; filename: string; originalName: string
  altText: string; size: number; width?: number; height?: number
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export default function MediaPage() {
  const [items, setItems] = useState<MediaItem[]>([])
  const [selected, setSelected] = useState<MediaItem | null>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [altEdit, setAltEdit] = useState('')

  const load = async () => {
    const res = await fetch('/api/media')
    if (res.ok) setItems(await res.json())
  }

  useEffect(() => { load() }, [])

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true); setError('')
    try {
      const fd = new FormData(); fd.append('file', file)
      const res = await fetch('/api/upload', { method: 'POST', body: fd })
      if (!res.ok) { const d = await res.json(); setError(d.error || 'Errore') }
      else load()
    } catch { setError('Errore di rete.') }
    setUploading(false); e.target.value = ''
  }

  const selectItem = (item: MediaItem) => { setSelected(item); setAltEdit(item.altText || '') }

  const saveAlt = async () => {
    if (!selected) return
    await fetch(`/api/media/${selected.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ altText: altEdit }),
    })
    setSelected(s => s ? { ...s, altText: altEdit } : null)
    setItems(items.map(i => i.id === selected.id ? { ...i, altText: altEdit } : i))
  }

  const deleteItem = async () => {
    if (!selected || !window.confirm('Eliminare questa immagine?')) return
    await fetch(`/api/media/${selected.id}`, { method: 'DELETE' })
    setSelected(null); load()
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-gray-900">Media</h1>
        <label className={`cursor-pointer inline-flex items-center gap-2 bg-[--color-brand-coral] hover:bg-orange-600 text-white font-semibold px-4 py-2 rounded-lg text-sm transition-colors ${uploading ? 'opacity-60' : ''}`}>
          {uploading ? 'Caricamento…' : '+ Carica immagine'}
          <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="hidden" onChange={handleUpload} disabled={uploading} />
        </label>
      </div>

      {error && <div className="mb-4 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">{error}</div>}

      <div className="flex gap-6">
        {/* Grid */}
        <div className="flex-1">
          {items.length === 0 ? (
            <div className="bg-white rounded-xl border border-dashed border-gray-200 p-16 text-center text-gray-400">
              <p className="mb-2">Nessuna immagine ancora.</p>
              <p className="text-sm">Carica la prima immagine con il pulsante in alto.</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
              {items.map(item => (
                <button
                  key={item.id}
                  onClick={() => selectItem(item)}
                  className={`relative aspect-square rounded-lg overflow-hidden bg-gray-100 hover:ring-2 transition-all ${
                    selected?.id === item.id ? 'ring-2 ring-[--color-brand-blue]' : 'hover:ring-gray-300'
                  }`}
                >
                  <Image src={item.url} alt={item.altText || item.originalName} fill className="object-cover" sizes="120px" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Detail panel */}
        {selected && (
          <div className="w-64 shrink-0">
            <div className="bg-white rounded-xl border border-gray-100 p-4 sticky top-4">
              <div className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 mb-3">
                <Image src={selected.url} alt={selected.altText || selected.originalName} fill className="object-cover" sizes="256px" />
              </div>
              <p className="text-xs text-gray-500 font-mono truncate mb-1">{selected.originalName}</p>
              <p className="text-xs text-gray-400 mb-4">
                {formatBytes(selected.size)}
                {selected.width && selected.height && ` · ${selected.width}×${selected.height}px`}
              </p>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Alt text</label>
              <input
                value={altEdit}
                onChange={e => setAltEdit(e.target.value)}
                placeholder="Descrizione immagine"
                className="w-full text-xs border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[--color-brand-blue] mb-3"
              />
              <button onClick={saveAlt} className="w-full text-xs bg-[--color-brand-blue] text-white py-2 rounded-lg hover:bg-[--color-brand-blue-light] transition-colors mb-2">
                Salva alt text
              </button>
              <button onClick={deleteItem} className="w-full text-xs text-red-400 hover:text-red-600 py-2 transition-colors">
                Elimina immagine
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
