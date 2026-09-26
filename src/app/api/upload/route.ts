import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/session'
import { db } from '@/lib/db'
import { media } from '@/lib/db/schema'
import sharp from 'sharp'
import path from 'path'
import fs from 'fs'
import { randomBytes } from 'crypto'

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads')
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']

if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true })
}

export async function POST(req: NextRequest) {
  try {
    await requireAuth()
  } catch {
    return NextResponse.json({ error: 'Non autorizzato.' }, { status: 401 })
  }

  const formData = await req.formData()
  const file = formData.get('file') as File | null

  if (!file) return NextResponse.json({ error: 'Nessun file.' }, { status: 400 })
  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json({ error: 'Tipo di file non consentito.' }, { status: 400 })
  }
  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json({ error: 'File troppo grande (max 10MB).' }, { status: 400 })
  }

  const buffer = Buffer.from(await file.arrayBuffer())
  const id = randomBytes(8).toString('hex')
  const ext = 'webp'
  const filename = `${id}.${ext}`
  const filePath = path.join(UPLOAD_DIR, filename)

  let width: number | undefined
  let height: number | undefined

  try {
    const img = sharp(buffer)
    const meta = await img.metadata()
    width = meta.width
    height = meta.height

    await img
      .resize({ width: 2000, height: 2000, fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 82 })
      .toFile(filePath)
  } catch {
    fs.writeFileSync(filePath, buffer)
  }

  const stat = fs.statSync(filePath)
  const url = `/uploads/${filename}`

  const [row] = await db.insert(media).values({
    filename,
    originalName: file.name,
    path: filePath,
    url,
    mimeType: 'image/webp',
    size: stat.size,
    width,
    height,
    altText: '',
    createdAt: new Date(),
  }).returning()

  return NextResponse.json({ id: row.id, url, filename, width, height })
}
