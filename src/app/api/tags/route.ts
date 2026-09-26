import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/session'
import { db } from '@/lib/db'
import { tags } from '@/lib/db/schema'
import { makeSlug } from '@/lib/slug'

export async function GET() {
  const rows = await db.select().from(tags).orderBy(tags.name)
  return NextResponse.json(rows)
}

export async function POST(req: NextRequest) {
  try { await requireAuth() } catch { return NextResponse.json({ error: 'Non autorizzato.' }, { status: 401 }) }

  const { name } = await req.json()
  if (!name) return NextResponse.json({ error: 'Nome obbligatorio.' }, { status: 400 })

  const [row] = await db.insert(tags).values({
    name,
    slug: makeSlug(name),
    createdAt: new Date(),
  }).returning()

  return NextResponse.json(row, { status: 201 })
}
