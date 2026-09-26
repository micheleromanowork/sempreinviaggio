import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { users, settings, pages } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import bcrypt from 'bcryptjs'

// One-time setup endpoint — run once after first deploy to seed admin user and defaults.
// Protected by CRON_SECRET. Idempotent: safe to call multiple times.
export async function POST(req: NextRequest) {
  const auth = req.headers.get('authorization')
  if (!process.env.CRON_SECRET || auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Non autorizzato.' }, { status: 401 })
  }

  const results: string[] = []
  const now = new Date()

  // Admin user
  const adminEmail = process.env.ADMIN_EMAIL || 'micheleromano.priv@gmail.com'
  const adminPassword = process.env.ADMIN_PASSWORD
  if (!adminPassword) {
    return NextResponse.json({ error: 'ADMIN_PASSWORD non impostata.' }, { status: 400 })
  }

  const existing = await db.select().from(users).where(eq(users.email, adminEmail)).limit(1)
  if (existing.length === 0) {
    const hash = await bcrypt.hash(adminPassword, 12)
    await db.insert(users).values({ email: adminEmail, password: hash, name: 'Michele Romano', createdAt: now })
    results.push(`Utente admin creato: ${adminEmail}`)
  } else {
    results.push(`Utente admin già esistente: ${adminEmail}`)
  }

  // Default settings
  const defaultSettings: [string, string][] = [
    ['site_name', 'Sempre in Viaggio'],
    ['site_description', 'Il blog di viaggio di Michele Romano — destinazioni, itinerari e consigli di viaggio.'],
    ['site_email', adminEmail],
    ['ga4_id', 'G-8W7JC04QRS'],
    ['default_og_image', ''],
    ['google_verification', ''],
    ['smtp_host', 'smtp.hostinger.com'],
    ['smtp_port', '587'],
    ['smtp_user', ''],
    ['smtp_from', ''],
  ]

  for (const [key, value] of defaultSettings) {
    await db.insert(settings).values({ key, value }).onConflictDoNothing()
  }
  results.push('Impostazioni predefinite inizializzate.')

  // Static pages
  const staticPages = [
    {
      title: 'Chi siamo', slug: 'chi-siamo',
      content: '<p>Sempre in Viaggio è il progetto di Michele Romano, appassionato di viaggi lenti, cicloviaggi e destinazioni autentiche fuori dai circuiti tradizionali.</p>',
      seoTitle: 'Chi siamo — Sempre in Viaggio',
      metaDescription: "Scopri chi c'è dietro Sempre in Viaggio, il blog di viaggi di Michele Romano.",
    },
    {
      title: 'Privacy Policy', slug: 'privacy',
      content: '<h2>Privacy Policy</h2><p>Questa informativa descrive come Sempre in Viaggio raccoglie e utilizza i dati personali degli utenti in conformità al GDPR.</p>',
      seoTitle: 'Privacy Policy — Sempre in Viaggio',
      metaDescription: 'Informativa sulla privacy di Sempre in Viaggio.',
    },
    {
      title: 'Cookie Policy', slug: 'cookie',
      content: '<h2>Cookie Policy</h2><p>Sempre in Viaggio utilizza cookie tecnici e, con il tuo consenso, cookie analitici tramite Google Analytics 4.</p>',
      seoTitle: 'Cookie Policy — Sempre in Viaggio',
      metaDescription: 'Informativa sui cookie di Sempre in Viaggio.',
    },
  ]

  for (const p of staticPages) {
    const exists = await db.select().from(pages).where(eq(pages.slug, p.slug)).limit(1)
    if (exists.length === 0) {
      await db.insert(pages).values({ ...p, createdAt: now, updatedAt: now })
      results.push(`Pagina creata: ${p.slug}`)
    }
  }

  return NextResponse.json({ ok: true, results })
}
