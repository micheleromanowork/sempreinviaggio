'use client'
import { useState, useEffect } from 'react'

interface Settings { [key: string]: string }

function Field({ label, id, value, onChange, type = 'text', placeholder = '', hint = '' }: {
  label: string; id: string; value: string; onChange: (v: string) => void
  type?: string; placeholder?: string; hint?: string
}) {
  return (
    <div>
      <label htmlFor={id} className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">{label}</label>
      <input
        id={id} type={type} value={value} onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full text-sm border border-gray-200 rounded-lg px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-[--color-brand-blue]"
      />
      {hint && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
    </div>
  )
}

export default function SettingsPage() {
  const [s, setS] = useState<Settings>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    fetch('/api/settings').then(r => r.json()).then(d => { setS(d); setLoading(false) })
  }, [])

  const set = (k: string, v: string) => setS(prev => ({ ...prev, [k]: v }))

  const save = async () => {
    setSaving(true); setSaved(false)
    await fetch('/api/settings', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(s) })
    setSaving(false); setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  if (loading) return <div className="p-8 text-gray-400">Caricamento…</div>

  return (
    <div className="p-6 lg:p-8 max-w-2xl">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-xl font-bold text-gray-900">Impostazioni</h1>
        <button
          onClick={save} disabled={saving}
          className="text-sm font-semibold bg-[--color-brand-blue] text-white px-4 py-2 rounded-lg hover:bg-[--color-brand-blue-light] transition-colors disabled:opacity-60"
        >
          {saving ? 'Salvataggio…' : saved ? '✓ Salvato' : 'Salva'}
        </button>
      </div>

      <div className="space-y-6">
        {/* General */}
        <section className="bg-white rounded-xl border border-gray-100 p-5 space-y-4">
          <h2 className="font-semibold text-gray-800 text-sm border-b border-gray-100 pb-3">Generali</h2>
          <Field label="Nome sito" id="site_name" value={s.site_name || ''} onChange={v => set('site_name', v)} placeholder="Sempre in Viaggio" />
          <div>
            <label htmlFor="site_desc" className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">Descrizione sito</label>
            <textarea
              id="site_desc" value={s.site_description || ''} onChange={e => set('site_description', e.target.value)}
              rows={2}
              className="w-full text-sm border border-gray-200 rounded-lg px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-[--color-brand-blue] resize-none"
            />
          </div>
          <Field label="Email contatti" id="site_email" value={s.site_email || ''} onChange={v => set('site_email', v)} type="email" />
        </section>

        {/* Analytics */}
        <section className="bg-white rounded-xl border border-gray-100 p-5 space-y-4">
          <h2 className="font-semibold text-gray-800 text-sm border-b border-gray-100 pb-3">Analytics</h2>
          <Field
            label="Google Analytics 4 — Measurement ID" id="ga4_id"
            value={s.ga4_id || ''} onChange={v => set('ga4_id', v)}
            placeholder="G-XXXXXXXXXX"
            hint="Inserisci il tuo Measurement ID di GA4. Lascia vuoto per disattivare."
          />
          <Field
            label="Google Search Console — Codice verifica" id="google_verification"
            value={s.google_verification || ''} onChange={v => set('google_verification', v)}
            placeholder="google1234567890abcdef.html"
            hint="Il nome del file di verifica HTML di Google Search Console (es. google1234.html)."
          />
        </section>

        {/* SEO */}
        <section className="bg-white rounded-xl border border-gray-100 p-5 space-y-4">
          <h2 className="font-semibold text-gray-800 text-sm border-b border-gray-100 pb-3">SEO predefinita</h2>
          <Field
            label="OG Image predefinita" id="default_og_image"
            value={s.default_og_image || ''} onChange={v => set('default_og_image', v)}
            placeholder="/og-default.jpg"
            hint="URL immagine usata di default per i social quando l'articolo non ne ha una."
          />
        </section>

        {/* Email SMTP */}
        <section className="bg-white rounded-xl border border-gray-100 p-5 space-y-4">
          <h2 className="font-semibold text-gray-800 text-sm border-b border-gray-100 pb-3">Email (SMTP Hostinger)</h2>
          <p className="text-xs text-gray-500">Configurazione necessaria per il reset password via email.</p>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Host SMTP" id="smtp_host" value={s.smtp_host || ''} onChange={v => set('smtp_host', v)} placeholder="smtp.hostinger.com" />
            <Field label="Porta" id="smtp_port" value={s.smtp_port || '587'} onChange={v => set('smtp_port', v)} placeholder="587" />
          </div>
          <Field label="Utente SMTP" id="smtp_user" value={s.smtp_user || ''} onChange={v => set('smtp_user', v)} placeholder="noreply@sempreinviaggio.info" type="email" />
          <Field label="Mittente (From)" id="smtp_from" value={s.smtp_from || ''} onChange={v => set('smtp_from', v)} placeholder="noreply@sempreinviaggio.info" type="email" />
          <p className="text-xs text-yellow-600 bg-yellow-50 px-3 py-2 rounded-lg">
            La password SMTP viene configurata tramite variabile d'ambiente <code>SMTP_PASS</code> nel file <code>.env.local</code> per sicurezza.
          </p>
        </section>
      </div>
    </div>
  )
}
