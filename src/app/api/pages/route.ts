import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/session'
import { db } from '@/lib/db'
import { pages } from '@/lib/db/schema'
import { makeSlug } from '@/lib/slug'

export async function GET() {
  try { await requireAuth() } catch { return NextResponse.json({ error: 'Non autorizzato.' }, { status: 401 }) }
  const rows = await db.select().from(pages).orderBy(pages.slug)
  return NextResponse.json(rows)
}

export async function POST(req: NextRequest) {
  try { await requireAuth() } catch { return NextResponse.json({ error: 'Non autorizzato.' }, { status: 401 }) }
  const body = await req.json()
  if (!body.title?.trim()) return NextResponse.json({ error: 'Titolo obbligatorio.' }, { status: 400 })

  const slug = body.slug || makeSlug(body.title)
  const now = new Date()
  const [page] = await db.insert(pages).values({
    title: body.title.trim(),
    slug,
    content: body.content || '',
    seoTitle: body.seoTitle || null,
    metaDescription: body.metaDescription || null,
    createdAt: now,
    updatedAt: now,
  }).returning()

  return NextResponse.json(page, { status: 201 })
}
