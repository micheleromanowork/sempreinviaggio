import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/session'
import { getAllSettings, setSetting } from '@/lib/settings'

export async function GET() {
  try { await requireAuth() } catch { return NextResponse.json({ error: 'Non autorizzato.' }, { status: 401 }) }
  const s = await getAllSettings()
  return NextResponse.json(s)
}

export async function POST(req: NextRequest) {
  try { await requireAuth() } catch { return NextResponse.json({ error: 'Non autorizzato.' }, { status: 401 }) }

  const body = await req.json()
  const allowedKeys = ['site_name', 'site_description', 'site_email', 'ga4_id', 'default_og_image', 'google_verification', 'smtp_host', 'smtp_port', 'smtp_user', 'smtp_from']

  for (const [key, value] of Object.entries(body)) {
    if (allowedKeys.includes(key)) {
      await setSetting(key, String(value))
    }
  }
  return NextResponse.json({ ok: true })
}
