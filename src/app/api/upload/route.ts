import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/session'
import { db } from '@/lib/db'
import { media } from '@/lib/db/schema'
import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

const MAX_FILE_SIZE = 10 * 1024 * 1024
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']

export async function POST(req: NextRequest) {
  try { await requireAuth() } catch {
    return NextResponse.json({ error: 'Non autorizzato.' }, { status: 401 })
  }

  const formData = await req.formData()
  const file = formData.get('file') as File | null
  if (!file) return NextResponse.json({ error: 'Nessun file.' }, { status: 400 })
  if (!ALLOWED_TYPES.includes(file.type)) return NextResponse.json({ error: 'Tipo di file non consentito.' }, { status: 400 })
  if (file.size > MAX_FILE_SIZE) return NextResponse.json({ error: 'File troppo grande (max 10MB).' }, { status: 400 })

  const buffer = Buffer.from(await file.arrayBuffer())

  type CloudinaryResult = { secure_url: string; public_id: string; width: number; height: number; bytes: number; format: string }

  let result: CloudinaryResult
  try {
    result = await new Promise<CloudinaryResult>((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          folder: 'sempreinviaggio',
          resource_type: 'image',
          format: 'webp',
          transformation: [{ width: 2000, crop: 'limit', quality: 'auto:good' }],
        },
        (err, res) => err ? reject(err) : resolve(res as CloudinaryResult)
      ).end(buffer)
    })
  } catch (err) {
    console.error('Cloudinary upload error:', err)
    return NextResponse.json({ error: 'Errore durante il caricamento.' }, { status: 500 })
  }

  const [row] = await db.insert(media).values({
    filename: result.public_id.split('/').pop() || result.public_id,
    originalName: file.name,
    path: result.public_id,
    url: result.secure_url,
    mimeType: 'image/webp',
    size: result.bytes,
    width: result.width,
    height: result.height,
    altText: '',
    createdAt: new Date(),
  }).returning()

  return NextResponse.json({ id: row.id, url: result.secure_url, filename: row.filename, width: result.width, height: result.height })
}
