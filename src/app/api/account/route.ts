import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/session'
import { db } from '@/lib/db'
import { users } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { hashPassword, verifyPassword } from '@/lib/auth'

export async function GET() {
  let session
  try { session = await requireAuth() } catch {
    return NextResponse.json({ error: 'Non autorizzato.' }, { status: 401 })
  }
  const [user] = await db.select({ name: users.name, email: users.email })
    .from(users).where(eq(users.id, session.userId!)).limit(1)
  if (!user) return NextResponse.json({ error: 'Non trovato.' }, { status: 404 })
  return NextResponse.json(user)
}

export async function PATCH(req: NextRequest) {
  let session
  try { session = await requireAuth() } catch {
    return NextResponse.json({ error: 'Non autorizzato.' }, { status: 401 })
  }

  const body = await req.json()

  // Name update
  if (body.name !== undefined) {
    const name = body.name.trim()
    if (!name) return NextResponse.json({ error: 'Nome non valido.' }, { status: 400 })
    await db.update(users).set({ name }).where(eq(users.id, session.userId!))
    return NextResponse.json({ ok: true })
  }

  // Password change
  if (body.newPassword !== undefined) {
    const { currentPassword, newPassword } = body
    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: 'Campi obbligatori mancanti.' }, { status: 400 })
    }
    if (newPassword.length < 10) {
      return NextResponse.json({ error: 'La password deve avere almeno 10 caratteri.' }, { status: 400 })
    }
    const [user] = await db.select().from(users).where(eq(users.id, session.userId!)).limit(1)
    if (!user) return NextResponse.json({ error: 'Utente non trovato.' }, { status: 404 })
    const valid = await verifyPassword(currentPassword, user.password)
    if (!valid) {
      return NextResponse.json({ error: 'Password attuale non corretta.' }, { status: 400 })
    }
    const hash = await hashPassword(newPassword)
    await db.update(users).set({ password: hash }).where(eq(users.id, session.userId!))
    return NextResponse.json({ ok: true })
  }

  return NextResponse.json({ error: 'Nessun campo da aggiornare.' }, { status: 400 })
}
