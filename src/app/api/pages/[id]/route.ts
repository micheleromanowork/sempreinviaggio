import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/session'
import { db } from '@/lib/db'
import { pages } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try { await requireAuth() } catch { return NextResponse.json({ error: 'Non autorizzato.' }, { status: 401 }) }
  const { id } = await params
  const [page] = await db.select().from(pages).where(eq(pages.id, parseInt(id))).limit(1)
  if (!page) return NextResponse.json({ error: 'Non trovato.' }, { status: 404 })
  return NextResponse.json(page)
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try { await requireAuth() } catch { return NextResponse.json({ error: 'Non autorizzato.' }, { status: 401 }) }
  const { id } = await params
  const body = await req.json()

  const [updated] = await db.update(pages).set({
    title: body.title,
    content: body.content ?? '',
    seoTitle: body.seoTitle || null,
    metaDescription: body.metaDescription || null,
    updatedAt: new Date(),
  }).where(eq(pages.id, parseInt(id))).returning()

  if (!updated) return NextResponse.json({ error: 'Non trovato.' }, { status: 404 })
  return NextResponse.json(updated)
}
