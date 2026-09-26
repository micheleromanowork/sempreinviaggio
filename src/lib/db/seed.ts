import { createClient } from '@libsql/client'
import { drizzle } from 'drizzle-orm/libsql'
import { eq } from 'drizzle-orm'
import bcrypt from 'bcryptjs'
import * as schema from './schema'

const client = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN,
})

const db = drizzle(client, { schema })

async function seed() {
  const adminEmail = process.env.ADMIN_EMAIL || 'micheleromano.priv@gmail.com'
  const adminPassword = process.env.ADMIN_PASSWORD || 'changeme123!'
  const now = new Date()

  const existing = await db.select().from(schema.users).where(eq(schema.users.email, adminEmail)).limit(1)
  if (existing.length === 0) {
    const hash = await bcrypt.hash(adminPassword, 12)
    await db.insert(schema.users).values({ email: adminEmail, password: hash, name: 'Michele Romano', createdAt: now })
    console.log(`Admin user created: ${adminEmail}`)
    console.log(`Password: ${adminPassword} — CHANGE THIS IMMEDIATELY`)
  } else {
    console.log('Admin user already exists.')
  }

  const defaultSettings: [string, string][] = [
    ['site_name', 'Sempre in Viaggio'],
    ['site_description', 'Il blog di viaggio di Michele Romano — destinazioni, itinerari e consigli di viaggio.'],
    ['site_email', adminEmail],
    ['ga4_id', 'G-8W7JC04QRS'],
    ['default_og_image', ''],
    ['google_verification', ''],
    ['smtp_host', ''],
    ['smtp_port', '587'],
    ['smtp_user', ''],
    ['smtp_from', ''],
  ]

  for (const [key, value] of defaultSettings) {
    await db.insert(schema.settings).values({ key, value }).onConflictDoNothing()
  }
  console.log('Default settings initialized.')

  const pages: { title: string; slug: string; content: string; seoTitle: string; metaDescription: string }[] = [
    {
      title: 'Chi siamo',
      slug: 'chi-siamo',
      content: '<p>Sempre in Viaggio è il progetto di Michele Romano, appassionato di viaggi lenti, cicloviaggi e destinazioni autentiche.</p>',
      seoTitle: 'Chi siamo — Sempre in Viaggio',
      metaDescription: "Scopri chi c'è dietro Sempre in Viaggio, il blog di viaggi di Michele Romano.",
    },
    {
      title: 'Privacy Policy',
      slug: 'privacy',
      content: '<h2>Privacy Policy</h2><p>Questa informativa descrive come Sempre in Viaggio raccoglie e utilizza i dati personali degli utenti.</p>',
      seoTitle: 'Privacy Policy — Sempre in Viaggio',
      metaDescription: 'Informativa sulla privacy di Sempre in Viaggio.',
    },
    {
      title: 'Cookie Policy',
      slug: 'cookie',
      content: '<h2>Cookie Policy</h2><p>Sempre in Viaggio utilizza cookie tecnici e, con il tuo consenso, cookie analitici di Google Analytics 4.</p>',
      seoTitle: 'Cookie Policy — Sempre in Viaggio',
      metaDescription: 'Informativa sui cookie di Sempre in Viaggio.',
    },
  ]

  for (const p of pages) {
    const exists = await db.select().from(schema.pages).where(eq(schema.pages.slug, p.slug)).limit(1)
    if (exists.length === 0) {
      await db.insert(schema.pages).values({ ...p, createdAt: now, updatedAt: now })
    }
  }

  console.log('Seed completed.')
  client.close()
}

seed().catch(console.error)
