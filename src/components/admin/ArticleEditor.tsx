'use client'
import { useState, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import RichTextEditor from './RichTextEditor'
import SeoChecker from './SeoChecker'
import SeoInfoTooltip from './SeoInfoTooltip'
import MediaPicker from './MediaPicker'
import Image from 'next/image'

const ARTICLE_TYPES = [
  'guida', 'destinazione', 'itinerario', 'dove dormire',
  'cosa fare', 'come arrivare', 'consigli di viaggio', 'cicloviaggio', 'ispirazione'
]

interface Category { id: number; name: string }
interface Tag { id: number; name: string }
interface Destination { id: number; name: string; parentId: number | null }

interface ArticleData {
  id?: number
  title: string; slug: string; excerpt: string; content: string
  coverImage: string; status: string; publishedAt: string; scheduledAt: string
  categoryId: string; destinationId: string; articleType: string
  seoTitle: string; metaDescription: string; ogTitle: string; ogDescription: string
  ogImage: string; canonicalUrl: string; featured: boolean; tagIds: number[]
}

interface Props {
  initial?: Partial<ArticleData>
  categories: Category[]
  tags: Tag[]
  destinations: Destination[]
}

function makeSlugFromTitle(t: string) {
  return t.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-')
}

export default function ArticleEditor({ initial, categories, tags, destinations }: Props) {
  const router = useRouter()
  const [form, setForm] = useState<ArticleData>({
    title: '', slug: '', excerpt: '', content: '', coverImage: '', status: 'draft',
    publishedAt: '', scheduledAt: '', categoryId: '', destinationId: '',
    articleType: 'guida', seoTitle: '', metaDescription: '', ogTitle: '',
    ogDescription: '', ogImage: '', canonicalUrl: '', featured: false, tagIds: [],
    ...initial,
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [showMedia, setShowMedia] = useState(false)
  const [mediaFor, setMediaFor] = useState<'cover' | 'editor' | 'og'>('cover')
  const [activeTab, setActiveTab] = useState<'content' | 'seo'>('content')
  const editorInsertRef = useRef<((url: string) => void) | null>(null)

  const set = (k: keyof ArticleData, v: any) => setForm(f => ({ ...f, [k]: v }))

  const handleTitleChange = (v: string) => {
    set('title', v)
    if (!initial?.id) set('slug', makeSlugFromTitle(v))
  }

  const openMedia = (target: 'cover' | 'editor' | 'og') => {
    setMediaFor(target)
    setShowMedia(true)
  }

  const handleMediaSelect = (url: string) => {
    if (mediaFor === 'cover') set('coverImage', url)
    else if (mediaFor === 'og') set('ogImage', url)
    else if (mediaFor === 'editor' && editorInsertRef.current) editorInsertRef.current(url)
  }

  const handleSave = async (status?: string) => {
    setSaving(true)
    setError('')
    try {
      const payload = { ...form, status: status ?? form.status }
      const url = initial?.id ? `/api/articles/${initial.id}` : '/api/articles'
      const method = initial?.id ? 'PUT' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        const d = await res.json()
        setError(d.error || 'Errore nel salvataggio.')
      } else {
        const data = await res.json()
        router.push(`/admin/articoli/${data.id}`)
        router.refresh()
      }
    } catch { setError('Errore di rete.') }
    setSaving(false)
  }

  const handleDelete = async () => {
    if (!initial?.id) return
    if (!window.confirm('Eliminare questo articolo? L\'azione è irreversibile.')) return
    await fetch(`/api/articles/${initial.id}`, { method: 'DELETE' })
    router.push('/admin/articoli')
    router.refresh()
  }

  return (
    <>
      {showMedia && (
        <MediaPicker
          onSelect={handleMediaSelect}
          onClose={() => setShowMedia(false)}
        />
      )}

      <div className="p-6 lg:p-8 max-w-7xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              {initial?.id ? 'Modifica articolo' : 'Nuovo articolo'}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            {initial?.id && (
              <button onClick={handleDelete} className="text-xs text-red-400 hover:text-red-600 px-3 py-1.5 rounded border border-red-100 hover:border-red-300 transition-colors">
                Elimina
              </button>
            )}
            <button
              onClick={() => handleSave('draft')}
              disabled={saving}
              className="px-4 py-2 text-sm font-medium border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-60"
            >
              Salva bozza
            </button>
            <button
              onClick={() => handleSave('published')}
              disabled={saving}
              className="px-4 py-2 text-sm font-semibold bg-[--color-brand-blue] text-white rounded-lg hover:bg-[--color-brand-blue-light] transition-colors disabled:opacity-60"
            >
              {saving ? 'Salvataggio…' : 'Pubblica'}
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">{error}</div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-5">
            <div>
              <input
                value={form.title}
                onChange={e => handleTitleChange(e.target.value)}
                placeholder="Titolo dell'articolo"
                className="w-full text-2xl font-serif font-bold text-[--color-brand-blue] border-0 border-b-2 border-gray-200 focus:border-[--color-brand-blue] focus:outline-none pb-2 bg-transparent placeholder:text-gray-300"
              />
            </div>

            <div>
              <textarea
                value={form.excerpt}
                onChange={e => set('excerpt', e.target.value)}
                placeholder="Descrizione breve / excerpt…"
                rows={2}
                className="w-full text-sm border border-gray-200 rounded-lg px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-[--color-brand-blue] resize-none"
              />
            </div>

            {/* Tabs */}
            <div className="flex gap-0 border-b border-gray-100">
              {(['content', 'seo'] as const).map(tab => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${
                    activeTab === tab ? 'border-[--color-brand-blue] text-[--color-brand-blue]' : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab === 'content' ? 'Contenuto' : 'SEO'}
                </button>
              ))}
            </div>

            {activeTab === 'content' && (
              <RichTextEditor
                content={form.content}
                onChange={v => set('content', v)}
                onEditorReady={fn => { editorInsertRef.current = fn }}
                onImageRequest={() => openMedia('editor')}
              />
            )}

            {activeTab === 'seo' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wider">
                    SEO Title <SeoInfoTooltip field="seoTitle" />
                  </label>
                  <input
                    value={form.seoTitle}
                    onChange={e => set('seoTitle', e.target.value)}
                    placeholder={form.title ? `${form.title} — Sempre in Viaggio` : 'Titolo SEO…'}
                    className="w-full text-sm border border-gray-200 rounded-lg px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-[--color-brand-blue]"
                  />
                  <p className="text-xs text-gray-400 mt-1">{(form.seoTitle || form.title).length}/60 car.</p>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wider">
                    Meta Description <SeoInfoTooltip field="metaDescription" />
                  </label>
                  <textarea
                    value={form.metaDescription}
                    onChange={e => set('metaDescription', e.target.value)}
                    placeholder="Descrizione per i motori di ricerca…"
                    rows={3}
                    className="w-full text-sm border border-gray-200 rounded-lg px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-[--color-brand-blue] resize-none"
                  />
                  <p className="text-xs text-gray-400 mt-1">{form.metaDescription.length}/155 car.</p>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wider">
                    Slug <SeoInfoTooltip field="slug" />
                  </label>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400">/articoli/</span>
                    <input
                      value={form.slug}
                      onChange={e => set('slug', e.target.value)}
                      className="flex-1 text-sm border border-gray-200 rounded-lg px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-[--color-brand-blue]"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wider">
                    Canonical URL <SeoInfoTooltip field="canonicalUrl" />
                  </label>
                  <input
                    value={form.canonicalUrl}
                    onChange={e => set('canonicalUrl', e.target.value)}
                    placeholder="Lascia vuoto per usare l'URL predefinito"
                    className="w-full text-sm border border-gray-200 rounded-lg px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-[--color-brand-blue]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wider">
                    OG Image <SeoInfoTooltip field="ogImage" />
                  </label>
                  <div className="flex gap-2">
                    <input
                      value={form.ogImage}
                      onChange={e => set('ogImage', e.target.value)}
                      placeholder="URL immagine Open Graph (o usa copertina)"
                      className="flex-1 text-sm border border-gray-200 rounded-lg px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-[--color-brand-blue]"
                    />
                    <button type="button" onClick={() => openMedia('og')} className="text-xs px-3 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600 transition-colors shrink-0" aria-label="Scegli immagine OG">
                      Scegli
                    </button>
                  </div>
                </div>

                {/* SEO Checker */}
                <div className="bg-gray-50 rounded-xl p-4">
                  <h3 className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-3">Controllo SEO</h3>
                  <SeoChecker
                    title={form.seoTitle || form.title}
                    metaDescription={form.metaDescription}
                    slug={form.slug}
                    coverImage={form.coverImage}
                    content={form.content}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Status */}
            <div className="bg-white rounded-xl border border-gray-100 p-4 space-y-3">
              <h3 className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Pubblicazione</h3>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Stato</label>
                <select
                  value={form.status}
                  onChange={e => set('status', e.target.value)}
                  className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[--color-brand-blue]"
                >
                  <option value="draft">Bozza</option>
                  <option value="published">Pubblicato</option>
                  <option value="scheduled">Programmato</option>
                </select>
              </div>
              {form.status === 'scheduled' && (
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Data programmazione</label>
                  <input
                    type="datetime-local"
                    value={form.scheduledAt}
                    onChange={e => set('scheduledAt', e.target.value)}
                    className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[--color-brand-blue]"
                  />
                </div>
              )}
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.featured}
                  onChange={e => set('featured', e.target.checked)}
                  className="rounded"
                />
                <span className="text-sm text-gray-700">In evidenza</span>
              </label>
            </div>

            {/* Cover image */}
            <div className="bg-white rounded-xl border border-gray-100 p-4">
              <h3 className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-3">Immagine di copertina</h3>
              {form.coverImage ? (
                <div className="relative aspect-video rounded-lg overflow-hidden mb-2">
                  <Image src={form.coverImage} alt="Copertina" fill className="object-cover" sizes="280px" />
                </div>
              ) : null}
              <button
                type="button"
                onClick={() => openMedia('cover')}
                className="w-full text-sm border-2 border-dashed border-gray-200 hover:border-[--color-brand-blue] text-gray-500 hover:text-[--color-brand-blue] py-2.5 rounded-lg transition-colors"
              >
                {form.coverImage ? 'Cambia immagine' : '+ Scegli immagine'}
              </button>
              {form.coverImage && (
                <button type="button" onClick={() => set('coverImage', '')} className="w-full text-xs text-red-400 hover:text-red-600 mt-1 transition-colors">
                  Rimuovi
                </button>
              )}
            </div>

            {/* Type & category */}
            <div className="bg-white rounded-xl border border-gray-100 p-4 space-y-3">
              <h3 className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Classificazione</h3>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Tipo articolo</label>
                <select
                  value={form.articleType}
                  onChange={e => set('articleType', e.target.value)}
                  className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[--color-brand-blue]"
                >
                  {ARTICLE_TYPES.map(t => <option key={t} value={t} className="capitalize">{t}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Categoria</label>
                <select
                  value={form.categoryId}
                  onChange={e => set('categoryId', e.target.value)}
                  className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[--color-brand-blue]"
                >
                  <option value="">Nessuna</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Destinazione</label>
                <select
                  value={form.destinationId}
                  onChange={e => set('destinationId', e.target.value)}
                  className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[--color-brand-blue]"
                >
                  <option value="">Nessuna</option>
                  {destinations.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
              </div>
            </div>

            {/* Tags */}
            {tags.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-100 p-4">
                <h3 className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-3">Tag</h3>
                <div className="flex flex-wrap gap-2">
                  {tags.map(t => (
                    <label key={t.id} className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={form.tagIds.includes(t.id)}
                        onChange={e => {
                          if (e.target.checked) set('tagIds', [...form.tagIds, t.id])
                          else set('tagIds', form.tagIds.filter((id: number) => id !== t.id))
                        }}
                        className="rounded"
                      />
                      <span className="text-xs text-gray-700">{t.name}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
