import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/session'
import { db } from '@/lib/db'
import { media } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

interface Params { id: string }

export async function PATCH(req: NextRequest, { params }: { params: Promise<Params> }) {
  try { await requireAuth() } catch { return NextResponse.json({ error: 'Non autorizzato.' }, { status: 401 }) }

  const { id } = await params
  const { altText } = await req.json()
  await db.update(media).set({ altText }).where(eq(media.id, parseInt(id)))
  return NextResponse.json({ ok: true })
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<Params> }) {
  try { await requireAuth() } catch { return NextResponse.json({ error: 'Non autorizzato.' }, { status: 401 }) }

  const { id } = await params
  const [row] = await db.select().from(media).where(eq(media.id, parseInt(id))).limit(1)
  if (!row) return NextResponse.json({ error: 'Non trovato.' }, { status: 404 })

  // Delete from Cloudinary using stored public_id
  try {
    await cloudinary.uploader.destroy(row.path)
  } catch {}

  await db.delete(media).where(eq(media.id, parseInt(id)))
  return NextResponse.json({ ok: true })
}
