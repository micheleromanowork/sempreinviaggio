'use client'
import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'

interface MediaItem {
  id: number
  url: string
  filename: string
  originalName: string
  altText: string
  size: number
  width?: number
  height?: number
}

interface Props {
  onSelect: (url: string) => void
  onClose: () => void
}

export default function MediaPicker({ onSelect, onClose }: Props) {
  const [items, setItems] = useState<MediaItem[]>([])
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    const res = await fetch('/api/media')
    if (res.ok) setItems(await res.json())
  }, [])

  useEffect(() => { load() }, [load])

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    setError('')
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetch('/api/upload', { method: 'POST', body: fd })
      if (!res.ok) {
        const d = await res.json()
        setError(d.error || 'Errore upload')
      } else {
        await load()
      }
    } catch { setError('Errore di rete.') }
    setUploading(false)
    e.target.value = ''
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[80vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Libreria media</h2>
          <div className="flex items-center gap-3">
            <label className={`cursor-pointer inline-flex items-center gap-1.5 text-sm font-medium text-white bg-[--color-brand-blue] hover:bg-[--color-brand-blue-light] px-3 py-1.5 rounded-lg transition-colors ${uploading ? 'opacity-60' : ''}`}>
              {uploading ? 'Caricamento…' : '+ Carica'}
              <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="hidden" onChange={handleUpload} disabled={uploading} />
            </label>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
          </div>
        </div>

        {error && (
          <div className="mx-5 mt-3 text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</div>
        )}

        <div className="flex-1 overflow-y-auto p-4">
          {items.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <p>Nessuna immagine. Carica la prima!</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
              {items.map(item => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => { onSelect(item.url); onClose() }}
                  className="group relative aspect-square rounded-lg overflow-hidden bg-gray-100 hover:ring-2 hover:ring-[--color-brand-blue] transition-all"
                >
                  <Image
                    src={item.url}
                    alt={item.altText || item.originalName}
                    fill
                    className="object-cover group-hover:opacity-90 transition-opacity"
                    sizes="120px"
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
