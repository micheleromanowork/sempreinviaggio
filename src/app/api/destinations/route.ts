import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/session'
import { db } from '@/lib/db'
import { destinations } from '@/lib/db/schema'
import { makeSlug } from '@/lib/slug'

export async function GET() {
  const rows = await db.select().from(destinations).orderBy(destinations.name)
  return NextResponse.json(rows)
}

export async function POST(req: NextRequest) {
  try { await requireAuth() } catch { return NextResponse.json({ error: 'Non autorizzato.' }, { status: 401 }) }

  const body = await req.json()
  if (!body.name) return NextResponse.json({ error: 'Nome obbligatorio.' }, { status: 400 })

  const [row] = await db.insert(destinations).values({
    name: body.name,
    slug: body.slug || makeSlug(body.name),
    description: body.description || null,
    image: body.image || null,
    parentId: body.parentId || null,
    seoTitle: body.seoTitle || null,
    metaDescription: body.metaDescription || null,
    createdAt: new Date(),
  }).returning()

  return NextResponse.json(row, { status: 201 })
}
