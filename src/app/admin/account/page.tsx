'use client'
import { useState, useEffect } from 'react'

interface Me { name: string; email: string }

function Field({ label, id, value, onChange, type = 'text', placeholder = '' }: {
  label: string; id: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string
}) {
  return (
    <div>
      <label htmlFor={id} className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">{label}</label>
      <input
        id={id} type={type} value={value} onChange={e => onChange(e.target.value)}
        placeholder={placeholder} autoComplete="off"
        className="w-full text-sm border border-gray-200 rounded-lg px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-[--color-brand-blue]"
      />
    </div>
  )
}

export default function AccountPage() {
  const [me, setMe] = useState<Me>({ name: '', email: '' })
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(true)
  const [savingProfile, setSavingProfile] = useState(false)
  const [profileMsg, setProfileMsg] = useState('')

  const [currentPw, setCurrentPw] = useState('')
  const [newPw, setNewPw] = useState('')
  const [confirmPw, setConfirmPw] = useState('')
  const [savingPw, setSavingPw] = useState(false)
  const [pwMsg, setPwMsg] = useState('')
  const [pwError, setPwError] = useState('')

  useEffect(() => {
    fetch('/api/account').then(r => r.json()).then(d => {
      setMe(d); setName(d.name); setLoading(false)
    })
  }, [])

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setSavingProfile(true); setProfileMsg('')
    const res = await fetch('/api/account', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: name.trim() }),
    })
    if (res.ok) {
      setMe(m => ({ ...m, name: name.trim() }))
      setProfileMsg('Nome aggiornato.')
    }
    setSavingProfile(false)
    setTimeout(() => setProfileMsg(''), 3000)
  }

  const savePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setPwError(''); setPwMsg('')
    if (newPw.length < 10) { setPwError('La nuova password deve avere almeno 10 caratteri.'); return }
    if (newPw !== confirmPw) { setPwError('Le password non coincidono.'); return }
    setSavingPw(true)
    const res = await fetch('/api/account', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ currentPassword: currentPw, newPassword: newPw }),
    })
    if (res.ok) {
      setPwMsg('Password aggiornata.'); setCurrentPw(''); setNewPw(''); setConfirmPw('')
    } else {
      const d = await res.json(); setPwError(d.error || 'Errore.')
    }
    setSavingPw(false)
    setTimeout(() => setPwMsg(''), 3000)
  }

  if (loading) return <div className="p-8 text-gray-400">Caricamento…</div>

  return (
    <div className="p-6 lg:p-8 max-w-2xl">
      <h1 className="text-xl font-bold text-gray-900 mb-8">Account</h1>

      {/* Profile */}
      <section className="bg-white rounded-xl border border-gray-100 p-5 mb-6">
        <h2 className="font-semibold text-gray-800 text-sm border-b border-gray-100 pb-3 mb-4">Profilo</h2>
        <p className="text-xs text-gray-500 mb-4">
          Email: <span className="font-mono text-gray-700">{me.email}</span>
        </p>
        <form onSubmit={saveProfile} className="space-y-4">
          <Field label="Nome" id="name" value={name} onChange={setName} />
          <div className="flex items-center gap-3">
            <button
              type="submit" disabled={savingProfile || !name.trim()}
              className="text-sm font-semibold bg-[--color-brand-blue] text-white px-4 py-2 rounded-lg hover:bg-[--color-brand-blue-light] transition-colors disabled:opacity-60"
            >
              {savingProfile ? 'Salvataggio…' : 'Salva nome'}
            </button>
            {profileMsg && <span className="text-sm text-green-600">{profileMsg}</span>}
          </div>
        </form>
      </section>

      {/* Password */}
      <section className="bg-white rounded-xl border border-gray-100 p-5">
        <h2 className="font-semibold text-gray-800 text-sm border-b border-gray-100 pb-3 mb-4">Cambia password</h2>
        <form onSubmit={savePassword} className="space-y-4">
          {pwError && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{pwError}</p>}
          <Field label="Password attuale" id="current-pw" type="password" value={currentPw} onChange={setCurrentPw} />
          <Field label="Nuova password (min. 10 caratteri)" id="new-pw" type="password" value={newPw} onChange={setNewPw} />
          <Field label="Conferma nuova password" id="confirm-pw" type="password" value={confirmPw} onChange={setConfirmPw} />
          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={savingPw || !currentPw || !newPw || !confirmPw}
              className="text-sm font-semibold bg-[--color-brand-blue] text-white px-4 py-2 rounded-lg hover:bg-[--color-brand-blue-light] transition-colors disabled:opacity-60"
            >
              {savingPw ? 'Aggiornamento…' : 'Cambia password'}
            </button>
            {pwMsg && <span className="text-sm text-green-600">{pwMsg}</span>}
          </div>
        </form>
      </section>
    </div>
  )
}
