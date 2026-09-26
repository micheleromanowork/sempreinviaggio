import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/session'
import { db } from '@/lib/db'
import { categories } from '@/lib/db/schema'
import { makeSlug } from '@/lib/slug'

export async function GET() {
  const rows = await db.select().from(categories).orderBy(categories.name)
  return NextResponse.json(rows)
}

export async function POST(req: NextRequest) {
  try { await requireAuth() } catch { return NextResponse.json({ error: 'Non autorizzato.' }, { status: 401 }) }

  const { name, description } = await req.json()
  if (!name) return NextResponse.json({ error: 'Nome obbligatorio.' }, { status: 400 })

  const [row] = await db.insert(categories).values({
    name,
    slug: makeSlug(name),
    description: description || null,
    createdAt: new Date(),
  }).returning()

  return NextResponse.json(row, { status: 201 })
}
