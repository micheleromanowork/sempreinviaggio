import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/session'
import { db } from '@/lib/db'
import { media } from '@/lib/db/schema'
import { desc, eq } from 'drizzle-orm'

export async function GET() {
  try { await requireAuth() } catch { return NextResponse.json({ error: 'Non autorizzato.' }, { status: 401 }) }
  const rows = await db.select().from(media).orderBy(desc(media.createdAt))
  return NextResponse.json(rows)
}
