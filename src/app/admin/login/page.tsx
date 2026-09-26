'use client'
import { useState, useActionState } from 'react'
import { useRouter } from 'next/navigation'

async function loginAction(_: unknown, formData: FormData): Promise<{ error?: string }> {
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({
      email: formData.get('email'),
      password: formData.get('password'),
    }),
    headers: { 'Content-Type': 'application/json' },
  })
  if (!res.ok) {
    const d = await res.json().catch(() => ({}))
    return { error: d.error || 'Credenziali non valide.' }
  }
  return {}
}

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(loginAction, undefined)
  const router = useRouter()

  if (state && !state.error) {
    router.push('/admin')
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-[--color-brand-blue] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <p className="font-serif font-bold text-2xl text-white mb-1">Sempre in Viaggio</p>
          <p className="text-white/50 text-sm">Accedi all'area admin</p>
        </div>

        <form action={formAction} className="bg-white rounded-2xl shadow-xl p-8 space-y-5">
          {state?.error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg" role="alert">
              {state.error}
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[--color-brand-blue] focus:border-transparent transition"
              placeholder="admin@sempreinviaggio.info"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1.5">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
              className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[--color-brand-blue] focus:border-transparent transition"
            />
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full bg-[--color-brand-blue] hover:bg-[--color-brand-blue-light] text-white font-semibold py-2.5 rounded-lg transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isPending ? 'Accesso in corso…' : 'Accedi'}
          </button>
        </form>
      </div>
    </div>
  )
}
