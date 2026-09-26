import { NextRequest, NextResponse } from 'next/server'
import { getUserByEmail, verifyPassword, checkBruteForce, recordFailedLogin, clearLoginAttempts } from '@/lib/auth'
import { getSession } from '@/lib/session'

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for') ?? req.headers.get('x-real-ip') ?? 'unknown'

  if (!checkBruteForce(ip)) {
    return NextResponse.json({ error: 'Troppi tentativi. Riprova tra 15 minuti.' }, { status: 429 })
  }

  let body: { email?: string; password?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Richiesta non valida.' }, { status: 400 })
  }

  const { email, password } = body
  if (!email || !password) {
    return NextResponse.json({ error: 'Email e password sono obbligatorie.' }, { status: 400 })
  }

  const user = await getUserByEmail(email)
  if (!user) {
    recordFailedLogin(ip)
    return NextResponse.json({ error: 'Credenziali non valide.' }, { status: 401 })
  }

  const valid = await verifyPassword(password, user.password)
  if (!valid) {
    recordFailedLogin(ip)
    return NextResponse.json({ error: 'Credenziali non valide.' }, { status: 401 })
  }

  clearLoginAttempts(ip)

  const session = await getSession()
  session.userId = user.id
  session.email = user.email
  session.name = user.name
  await session.save()

  return NextResponse.json({ ok: true })
}
